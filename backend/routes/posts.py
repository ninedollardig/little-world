import uuid
import shutil
from pathlib import Path
from flask import Blueprint, request, jsonify, current_app, g
from database import get_db
from routes.auth import login_required

bp = Blueprint("posts", __name__)

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"}


def _images_dir():
    d = current_app.config["IMAGES_DIR"]
    d.mkdir(parents=True, exist_ok=True)
    return d


def _save_image(file) -> str | None:
    if not file or not file.filename:
        return None
    if file.content_type and file.content_type not in ALLOWED_IMAGE_TYPES:
        return None
    ext = Path(file.filename).suffix or ".jpg"
    name = f"{uuid.uuid4()}{ext}"
    dest = _images_dir() / name
    file.save(str(dest))
    return name


def _delete_image(filename: str):
    if not filename:
        return
    path = _images_dir() / filename
    if path.exists():
        path.unlink()


def _row_to_dict(row):
    return {
        "id": row["id"],
        "title": row["title"],
        "content": row["content"],
        "image": row["image"],
        "emotion": row["emotion"],
        "user_id": row["user_id"],
        "username": row["username"] if "username" in row.keys() else "",
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
    }


@bp.route("/posts", methods=["GET"])
def list_posts():
    page = request.args.get("page", 1, type=int)
    limit = request.args.get("limit", 20, type=int)
    offset = (page - 1) * limit
    conn = get_db()
    total = conn.execute("SELECT COUNT(*) FROM posts").fetchone()[0]
    rows = conn.execute(
        """SELECT p.*, u.username FROM posts p
           LEFT JOIN users u ON p.user_id = u.id
           ORDER BY p.created_at DESC LIMIT ? OFFSET ?""",
        (limit, offset),
    ).fetchall()
    conn.close()
    items = [_row_to_dict(r) for r in rows]
    return jsonify({"items": items, "total": total, "page": page, "limit": limit})


@bp.route("/posts/<int:post_id>", methods=["GET"])
def get_post(post_id):
    conn = get_db()
    row = conn.execute(
        """SELECT p.*, u.username FROM posts p
           LEFT JOIN users u ON p.user_id = u.id
           WHERE p.id = ?""", (post_id,),
    ).fetchone()
    conn.close()
    if not row:
        return jsonify({"detail": "Post not found"}), 404
    return jsonify(_row_to_dict(row))


@bp.route("/posts", methods=["POST"])
@login_required
def create_post():
    title = request.form.get("title", "").strip()
    content = request.form.get("content", "").strip()
    emotion = request.form.get("emotion", "").strip()
    if not content:
        return jsonify({"detail": "内容不能为空"}), 400

    image_file = request.files.get("image")
    image_name = _save_image(image_file) if image_file else ""

    conn = get_db()
    cur = conn.execute(
        "INSERT INTO posts (title, content, image, emotion, user_id) VALUES (?, ?, ?, ?, ?)",
        (title, content, image_name, emotion, g.user["id"]),
    )
    conn.commit()
    row = conn.execute(
        """SELECT p.*, u.username FROM posts p
           LEFT JOIN users u ON p.user_id = u.id
           WHERE p.id = ?""", (cur.lastrowid,),
    ).fetchone()
    conn.close()
    return jsonify(_row_to_dict(row)), 201


@bp.route("/posts/<int:post_id>", methods=["PUT"])
@login_required
def update_post(post_id):
    conn = get_db()
    existing = conn.execute("SELECT * FROM posts WHERE id = ?", (post_id,)).fetchone()
    if not existing:
        conn.close()
        return jsonify({"detail": "Post not found"}), 404
    if existing["user_id"] != g.user["id"]:
        conn.close()
        return jsonify({"detail": "只能编辑自己的碎碎念"}), 403

    title = request.form.get("title", "").strip() or existing["title"]
    content = request.form.get("content", "").strip() or existing["content"]
    emotion = request.form.get("emotion", "").strip() or existing["emotion"]

    image_name = existing["image"]
    image_file = request.files.get("image")
    if image_file and image_file.filename:
        _delete_image(existing["image"])
        image_name = _save_image(image_file)

    conn.execute(
        """UPDATE posts SET title=?, content=?, emotion=?, image=?,
           updated_at=datetime('now','localtime') WHERE id=?""",
        (title, content, emotion, image_name, post_id),
    )
    conn.commit()
    row = conn.execute(
        """SELECT p.*, u.username FROM posts p
           LEFT JOIN users u ON p.user_id = u.id
           WHERE p.id = ?""", (post_id,),
    ).fetchone()
    conn.close()
    return jsonify(_row_to_dict(row))


@bp.route("/posts/<int:post_id>", methods=["DELETE"])
@login_required
def delete_post(post_id):
    conn = get_db()
    existing = conn.execute("SELECT id, image, user_id FROM posts WHERE id = ?", (post_id,)).fetchone()
    if not existing:
        conn.close()
        return jsonify({"detail": "Post not found"}), 404
    if existing["user_id"] != g.user["id"]:
        conn.close()
        return jsonify({"detail": "只能删除自己的碎碎念"}), 403
    _delete_image(existing["image"])
    conn.execute("DELETE FROM posts WHERE id = ?", (post_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "deleted"})
