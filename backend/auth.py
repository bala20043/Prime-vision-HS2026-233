import os
import bcrypt
import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "hackathon-super-secret-key-college-assistant-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

# In-memory rate limiting dictionary: { email_or_ip: {"count": int, "reset_at": datetime} }
login_attempts: Dict[str, dict] = {}
MAX_FAILED_ATTEMPTS = 5
LOCKOUT_MINUTES = 5

def hash_password(password: str) -> str:
    # Use bcrypt with cost factor 12
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: Optional[str]) -> bool:
    if not hashed_password:
        return False
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def create_access_token(user_id: int) -> str:
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode = {"sub": str(user_id), "exp": expire}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[int]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str = payload.get("sub")
        if user_id_str is None:
            return None
        return int(user_id_str)
    except Exception:
        return None

def is_rate_limited(identifier: str) -> bool:
    now = datetime.utcnow()
    record = login_attempts.get(identifier)
    if not record:
        return False
    if now > record["reset_at"]:
        # Reset lock
        login_attempts.pop(identifier, None)
        return False
    return record["count"] >= MAX_FAILED_ATTEMPTS

def record_failed_attempt(identifier: str):
    now = datetime.utcnow()
    record = login_attempts.get(identifier)
    if not record or now > record["reset_at"]:
        login_attempts[identifier] = {
            "count": 1,
            "reset_at": now + timedelta(minutes=LOCKOUT_MINUTES)
        }
    else:
        record["count"] += 1

def clear_failed_attempts(identifier: str):
    login_attempts.pop(identifier, None)
