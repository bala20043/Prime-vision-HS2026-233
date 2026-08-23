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
