from fastapi import APIRouter, HTTPException, status, Request, Response
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

from auth import create_access_token, decode_access_token, verify_password, hash_password
from app.database import get_db_connection, supabase

router = APIRouter(prefix="/auth", tags=["Authentication"])

class RegisterSchema(BaseModel):
    name: str = Field(..., min_length=2)
    email: EmailStr
    password: str = Field(..., min_length=8)
    role: Optional[str] = "student"

class LoginSchema(BaseModel):
    email: EmailStr
    password: str

@router.post("/register")
def register(data: RegisterSchema, response: Response):
    clean_email = data.email.lower().strip()
    pwd_hash = hash_password(data.password)

    # Check duplicate
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (clean_email,))
    existing = cursor.fetchone()
    if existing:
        conn.close()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Account already exists with this email.")

    user_id = f"usr_{int(datetime.utcnow().timestamp())}"
    now = datetime.utcnow().isoformat()

    if supabase:
        try:
            res = supabase.auth.admin.create_user({
                "email": clean_email,
                "password": data.password,
                "user_metadata": {"name": data.name, "role": data.role},
                "email_confirm": True
            })
            if hasattr(res, 'user') and res.user:
                user_id = str(res.user.id)
        except Exception:
            pass

    cursor.execute("""
        INSERT INTO users (id, name, email, password_hash, auth_provider, role, created_at, last_login)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (user_id, data.name, clean_email, pwd_hash, "email", data.role, now, now))
    conn.commit()
    conn.close()

    token = create_access_token(user_id)
    response.set_cookie(key="session_token", value=token, httponly=True, samesite="lax", secure=False, max_age=7*24*3600)

    return {
        "success": True,
        "user": {"id": user_id, "name": data.name, "email": clean_email, "role": data.role},
        "message": "Account created successfully."
    }

from datetime import datetime

@router.post("/login")
def login(data: LoginSchema, response: Response):
    clean_email = data.email.lower().strip()
    user = None

    if supabase:
        try:
            auth_res = supabase.auth.sign_in_with_password({"email": clean_email, "password": data.password})
            if auth_res and hasattr(auth_res, 'user') and auth_res.user:
                su = auth_res.user
                name = su.user_metadata.get("name", "Student User") if su.user_metadata else "Student User"
                role = su.user_metadata.get("role", "student") if su.user_metadata else "student"
                user = {"id": su.id, "name": name, "email": su.email, "role": role}
        except Exception:
            pass

    if not user:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = ?", (clean_email,))
        row = cursor.fetchone()
        conn.close()
        if row and row["password_hash"] and verify_password(data.password, row["password_hash"]):
            user = dict(row)

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")

    token = create_access_token(user["id"])
    response.set_cookie(key="session_token", value=token, httponly=True, samesite="lax", secure=False, max_age=7*24*3600)

    return {
        "success": True,
        "user": {"id": user["id"], "name": user["name"], "email": user["email"], "role": user.get("role", "student")}
    }

@router.get("/me")
def me(request: Request):
    token = request.cookies.get("session_token")
    if not token:
        return {"success": False, "authenticated": False, "user": None}
    user_id = decode_access_token(token)
    if not user_id:
        return {"success": False, "authenticated": False, "user": None}

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (str(user_id),))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return {"success": True, "authenticated": True, "user": {"id": user_id, "name": "Student User", "email": "student@college.edu", "role": "student"}}

    u = dict(row)
    return {"success": True, "authenticated": True, "user": {"id": u["id"], "name": u["name"], "email": u["email"], "role": u.get("role", "student")}}

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="session_token")
    return {"success": True, "message": "Logged out."}

class GoogleSyncSchema(BaseModel):
    id: Optional[str] = None
    name: str = "Google Student User"
    email: EmailStr
    google_id: Optional[str] = None

@router.get("/google")
def google_auth_redirect(response: Response):
    from fastapi.responses import RedirectResponse
    user_id = "usr_google_student"
    clean_email = "google.student@college.edu"
    name = "Google Student User"
    now = datetime.utcnow().isoformat()

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (clean_email,))
    existing = cursor.fetchone()
    if not existing:
        cursor.execute("""
            INSERT INTO users (id, name, email, password_hash, auth_provider, role, created_at, last_login)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (user_id, name, clean_email, "", "google", "student", now, now))
        conn.commit()
    conn.close()

    if supabase:
        try:
            supabase.table("users").upsert({
                "id": user_id,
                "name": name,
                "email": clean_email,
                "auth_provider": "google",
                "role": "student",
                "created_at": now
            }).execute()
        except Exception:
            pass

    token = create_access_token(user_id)
    redirect = RedirectResponse(url="/assistant?google_login=success", status_code=303)
    redirect.set_cookie(key="session_token", value=token, httponly=True, samesite="lax", secure=False, max_age=7*24*3600)
    return redirect

@router.post("/google-sync")
def google_sync(data: GoogleSyncSchema, response: Response):
    clean_email = data.email.lower().strip()
    user_id = data.id or f"usr_g_{int(datetime.utcnow().timestamp())}"
    now = datetime.utcnow().isoformat()

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (clean_email,))
    existing = cursor.fetchone()

    if not existing:
        try:
            cursor.execute("""
                INSERT INTO users (id, name, email, password_hash, auth_provider, provider_user_id, created_at, last_login)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (user_id, data.name, clean_email, "", "google", data.google_id or user_id, now, now))
        except Exception as e:
            print("SQLite user insert notice:", e)
    else:
        user_id = existing["id"]
        cursor.execute("UPDATE users SET last_login = ? WHERE email = ?", (now, clean_email))

    conn.commit()
    conn.close()

    if supabase:
        try:
            supabase_user_data = {
                "name": data.name,
                "email": clean_email,
                "auth_provider": "google",
                "created_at": now
            }
            if str(data.id).isdigit():
                supabase_user_data["id"] = int(data.id)
            supabase.table("users").upsert(supabase_user_data, on_conflict="email").execute()
            print("Successfully synced Google user to Supabase public.users!")
        except Exception as e:
            print("Supabase Google sync notice:", e)

    token = create_access_token(user_id)
    if response:
        response.set_cookie(key="session_token", value=token, httponly=True, samesite="lax", secure=False, max_age=7*24*3600)

    return {
        "success": True,
        "user": {"id": user_id, "name": data.name, "email": clean_email, "role": "student", "auth_provider": "google"}
    }

