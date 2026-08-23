import os
import httpx
from fastapi import FastAPI, HTTPException, Request, Response, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

from database import init_db, get_user_by_email, get_user_by_id, create_user_in_supabase, update_last_login
from auth import (
    hash_password, verify_password, create_access_token, decode_access_token,
    is_rate_limited, record_failed_attempt, clear_failed_attempts
)
from supabase_client import supabase

app = FastAPI(title="College Knowledge Assistant Auth Backend (Supabase Integrated)")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://127.0.0.1:8000/auth/google/callback")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    init_db()

# Pydantic Schemas
class RegisterSchema(BaseModel):
    name: str = Field(..., min_length=2)
    email: EmailStr
    password: str = Field(..., min_length=8)

class LoginSchema(BaseModel):
    email: EmailStr
    password: str

# Helper to get current user from session token
def get_current_user_from_cookie(request: Request) -> Optional[dict]:
    token = request.cookies.get("session_token")
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
    if not token:
        return None
    user_id = decode_access_token(token)
    if not user_id:
        return None
    return get_user_by_id(user_id)

@app.post("/auth/register", status_code=status.HTTP_201_CREATED)
def register(data: RegisterSchema, response: Response):
    email_clean = data.email.lower().strip()
    
    # Check if user already exists
    existing = get_user_by_email(email_clean)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists. Please log in."
        )
    
    try:
        # Create user directly in Supabase
        user = create_user_in_supabase(
            name=data.name.strip(),
            email=email_clean,
            password=data.password,
            auth_provider="email"
        )
    except Exception as e:
        if "already" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email already exists. Please log in."
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    # Issue session token & httpOnly cookie
    token = create_access_token(user["id"])
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=7 * 24 * 60 * 60
    )
    
    return {
        "success": True,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "auth_provider": user["auth_provider"]
        },
        "message": "Account created successfully. Welcome!"
    }

@app.post("/auth/login")
def login(data: LoginSchema, request: Request, response: Response):
    email_clean = data.email.lower().strip()
    client_ip = request.client.host if request.client else "unknown"
    rate_limit_id = f"{email_clean}:{client_ip}"
    
    # Check rate limiting
    if is_rate_limited(rate_limit_id):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many failed login attempts. Please try again later."
        )
    
    generic_error = "Invalid email or password."
    user = None

    # Authenticate via Supabase Auth API
    if supabase:
        try:
            auth_res = supabase.auth.sign_in_with_password({
                "email": email_clean,
                "password": data.password
            })
            if auth_res and hasattr(auth_res, 'user') and auth_res.user:
                su = auth_res.user
                name = su.user_metadata.get("name", "Student User") if su.user_metadata else "Student User"
                user = {
                    "id": su.id,
                    "name": name,
                    "email": su.email,
                    "auth_provider": "email"
                }
        except Exception:
            pass

    # Fallback lookup if Supabase password verification failed
    if not user:
        local_user = get_user_by_email(email_clean)
        if local_user and local_user.get("password_hash") and verify_password(data.password, local_user["password_hash"]):
            user = local_user
            # Auto-provision into Supabase Auth for future sign ins
            if supabase:
                try:
                    supabase.auth.admin.create_user({
                        "email": email_clean,
                        "password": data.password,
                        "user_metadata": {"name": local_user.get("name", "Student User")},
                        "email_confirm": True
                    })
                except Exception:
                    pass

    if not user:
        record_failed_attempt(rate_limit_id)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=generic_error)
    
    # Success: clear failed attempts & update last login
    clear_failed_attempts(rate_limit_id)
    update_last_login(user["id"])
    
    # Set session cookie
    token = create_access_token(user["id"])
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=7 * 24 * 60 * 60
    )
    
    return {
        "success": True,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "auth_provider": user["auth_provider"]
        }
    }

@app.get("/auth/me")
def get_me(request: Request):
    user = get_current_user_from_cookie(request)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Your session has expired. Please log in again."
        )
    return {
        "success": True,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "auth_provider": user["auth_provider"]
        }
    }

@app.post("/auth/logout")
def logout(response: Response):
    response.delete_cookie(key="session_token")
    return {"success": True, "message": "You have been logged out."}

@app.get("/auth/google")
def google_auth():
    if GOOGLE_CLIENT_ID and not GOOGLE_CLIENT_ID.startswith("mock"):
        google_url = (
            f"https://accounts.google.com/o/oauth2/v2/auth?"
            f"client_id={GOOGLE_CLIENT_ID}&"
            f"redirect_uri={GOOGLE_REDIRECT_URI}&"
            f"response_type=code&"
            f"scope=openid%20email%20profile&"
            f"access_type=offline&prompt=consent"
        )
        return RedirectResponse(url=google_url)
    else:
        mock_callback_url = f"{GOOGLE_REDIRECT_URI}?code=mock_google_code_sample"
        return RedirectResponse(url=mock_callback_url)

@app.get("/auth/google/callback")
async def google_callback(code: Optional[str] = None, error: Optional[str] = None):
    if error or not code:
        redirect_fail = f"{FRONTEND_URL}/login?error=Google+sign-in+could+not+be+completed.+Please+try+again."
        return RedirectResponse(url=redirect_fail)

    google_email = "student.demo@google.com"
    google_name = "Google Student"
    google_sub = "google_sub_1092837465"

    if GOOGLE_CLIENT_ID and not GOOGLE_CLIENT_ID.startswith("mock"):
        try:
            async with httpx.AsyncClient() as client:
                token_resp = await client.post(
                    "https://oauth2.googleapis.com/token",
                    data={
                        "code": code,
                        "client_id": GOOGLE_CLIENT_ID,
                        "client_secret": GOOGLE_CLIENT_SECRET,
                        "redirect_uri": GOOGLE_REDIRECT_URI,
                        "grant_type": "authorization_code",
                    }
                )
                token_data = token_resp.json()
                access_token = token_data.get("access_token")

                userinfo_resp = await client.get(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    headers={"Authorization": f"Bearer {access_token}"}
                )
                user_info = userinfo_resp.json()
                google_email = user_info.get("email", google_email).lower().strip()
                google_name = user_info.get("name", google_name)
                google_sub = str(user_info.get("sub", google_sub))
        except Exception:
            redirect_fail = f"{FRONTEND_URL}/login?error=Google+sign-in+could+not+be+completed.+Please+try+again."
            return RedirectResponse(url=redirect_fail)

    # Store/find Google User directly in Supabase
    existing_user = get_user_by_email(google_email)
    if existing_user:
        user = existing_user
        update_last_login(user["id"])
    else:
        user = create_user_in_supabase(
            name=google_name,
            email=google_email,
            password=None,
            auth_provider="google",
            provider_user_id=google_sub
        )

    token = create_access_token(user["id"])
    response = RedirectResponse(url=f"{FRONTEND_URL}/assistant")
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=7 * 24 * 60 * 60
    )
    return response

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)
