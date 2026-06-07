import os
import hashlib
import secrets
from datetime import datetime, timedelta, timezone
import jwt
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from database import get_db
from models import LoginRequest, RegisterRequest, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer(auto_error=False)

JWT_SECRET = os.getenv("JWT_SECRET", "murmur-nights-dev-secret-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = 72


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    h = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 200_000)
    return f"pbkdf2:{salt}:{h.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        _, salt, h_hex = stored.split(":")
        h = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 200_000)
        return h.hex() == h_hex
    except Exception:
        return False


def create_token(user_id: int, username: str) -> str:
    payload = {
        "sub": str(user_id),
        "usr": username,
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRE_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def get_current_user(credentials: HTTPAuthorizationCredentials | None = Depends(security)) -> dict | None:
    """Returns user dict {id, username} or raises 401 if no valid token."""
    if not credentials:
        raise HTTPException(401, "请先登录")
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return {"id": int(payload["sub"]), "username": payload["usr"]}
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "登录已过期，请重新登录")
    except Exception:
        raise HTTPException(401, "无效的登录凭证")


def get_optional_user(credentials: HTTPAuthorizationCredentials | None = Depends(security)) -> dict | None:
    """Returns user dict or None if no token provided."""
    if not credentials:
        return None
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return {"id": int(payload["sub"]), "username": payload["usr"]}
    except Exception:
        return None


@router.post("/login")
def login(data: LoginRequest):
    conn = get_db()
    row = conn.execute("SELECT * FROM users WHERE username = ?", (data.username,)).fetchone()
    conn.close()
    if not row or not verify_password(data.password, row["password_hash"]):
        raise HTTPException(401, "用户名或密码错误")
    token = create_token(row["id"], row["username"])
    return {
        "token": token,
        "user": {
            "id": row["id"],
            "username": row["username"],
            "display_name": row["display_name"],
            "created_at": row["created_at"],
        },
    }


@router.post("/register")
def register(data: RegisterRequest):
    conn = get_db()
    existing = conn.execute("SELECT id FROM users WHERE username = ?", (data.username,)).fetchone()
    if existing:
        conn.close()
        raise HTTPException(400, "用户名已存在")
    h = hash_password(data.password)
    cur = conn.execute(
        "INSERT INTO users (username, password_hash, display_name) VALUES (?, ?, ?)",
        (data.username, h, data.display_name.strip() or data.username),
    )
    conn.commit()
    row = conn.execute("SELECT * FROM users WHERE id = ?", (cur.lastrowid,)).fetchone()
    conn.close()
    token = create_token(row["id"], row["username"])
    return {
        "token": token,
        "user": {
            "id": row["id"],
            "username": row["username"],
            "display_name": row["display_name"],
            "created_at": row["created_at"],
        },
    }


@router.get("/me")
def me(user: dict = Depends(get_current_user)):
    conn = get_db()
    row = conn.execute("SELECT * FROM users WHERE id = ?", (user["id"],)).fetchone()
    conn.close()
    if not row:
        raise HTTPException(404, "用户不存在")
    return {
        "id": row["id"],
        "username": row["username"],
        "display_name": row["display_name"],
        "created_at": row["created_at"],
    }
