import hashlib
import secrets
from datetime import datetime, timedelta, timezone
import jwt
from functools import wraps
from flask import Blueprint, request, jsonify, current_app, g
from database import get_db

bp = Blueprint("auth", __name__)


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
        "exp": datetime.now(timezone.utc) + timedelta(hours=72),
    }
    return jwt.encode(payload, current_app.config["JWT_SECRET"], algorithm="HS256")


def parse_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(token, current_app.config["JWT_SECRET"], algorithms=["HS256"])
        return {"id": int(payload["sub"]), "username": payload["usr"]}
    except Exception:
        return None


def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            return jsonify({"detail": "请先登录"}), 401
        user = parse_token(auth[7:])
        if not user:
            return jsonify({"detail": "登录已过期，请重新登录"}), 401
        g.user = user
        return f(*args, **kwargs)
    return decorated


@bp.route("/auth/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    username = data.get("username", "").strip()
    password = data.get("password", "")
    if not username or not password:
        return jsonify({"detail": "请输入用户名和密码"}), 400

    conn = get_db()
    row = conn.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
    conn.close()
    if not row or not verify_password(password, row["password_hash"]):
        return jsonify({"detail": "用户名或密码错误"}), 401

    token = create_token(row["id"], row["username"])
    return jsonify({
        "token": token,
        "user": {
            "id": row["id"],
            "username": row["username"],
            "display_name": row["display_name"],
            "created_at": row["created_at"],
        },
    })


@bp.route("/auth/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    username = data.get("username", "").strip()
    password = data.get("password", "")
    display_name = data.get("display_name", "").strip() or username
    if not username or not password:
        return jsonify({"detail": "请输入用户名和密码"}), 400
    if len(username) < 2 or len(password) < 3:
        return jsonify({"detail": "用户名至少2位，密码至少3位"}), 400

    conn = get_db()
    existing = conn.execute("SELECT id FROM users WHERE username = ?", (username,)).fetchone()
    if existing:
        conn.close()
        return jsonify({"detail": "用户名已存在"}), 400

    h = hash_password(password)
    cur = conn.execute(
        "INSERT INTO users (username, password_hash, display_name) VALUES (?, ?, ?)",
        (username, h, display_name),
    )
    conn.commit()
    row = conn.execute("SELECT * FROM users WHERE id = ?", (cur.lastrowid,)).fetchone()
    conn.close()

    token = create_token(row["id"], row["username"])
    return jsonify({
        "token": token,
        "user": {
            "id": row["id"],
            "username": row["username"],
            "display_name": row["display_name"],
            "created_at": row["created_at"],
        },
    }), 201


@bp.route("/auth/me", methods=["GET"])
@login_required
def me():
    conn = get_db()
    row = conn.execute("SELECT * FROM users WHERE id = ?", (g.user["id"],)).fetchone()
    conn.close()
    if not row:
        return jsonify({"detail": "用户不存在"}), 404
    return jsonify({
        "id": row["id"],
        "username": row["username"],
        "display_name": row["display_name"],
        "created_at": row["created_at"],
    })
