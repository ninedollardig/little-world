import uuid
import shutil
from pathlib import Path
from fastapi import APIRouter, HTTPException, File, UploadFile, Form, Depends
from database import get_db
from routes.auth import get_current_user, get_optional_user

router = APIRouter(prefix="/posts", tags=["posts"])

IMAGES_DIR = Path(__file__).parent.parent / "uploads" / "images"
IMAGES_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"}


def _save_image(file: UploadFile) -> str | None:
    if not file or not file.filename:
        return None
    if file.content_type and file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(400, f"Unsupported image type: {file.content_type}")
    ext = Path(file.filename).suffix or ".jpg"
    name = f"{uuid.uuid4()}{ext}"
    dest = IMAGES_DIR / name
    with dest.open("wb") as f:
        shutil.copyfileobj(file.file, f)
    return name


def _delete_image(filename: str):
    if not filename:
        return
    path = IMAGES_DIR / filename
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


@router.get("")
def list_posts(page: int = 1, limit: int = 20):
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
    return {"items": items, "total": total, "page": page, "limit": limit}


@router.get("/{post_id}")
def get_post(post_id: int):
    conn = get_db()
    row = conn.execute(
        """SELECT p.*, u.username FROM posts p
           LEFT JOIN users u ON p.user_id = u.id
           WHERE p.id = ?""", (post_id,),
    ).fetchone()
    conn.close()
    if not row:
        raise HTTPException(404, "Post not found")
    return _row_to_dict(row)


@router.post("", status_code=201)
def create_post(
    title: str = Form(""),
    content: str = Form(...),
    emotion: str = Form(""),
    image: UploadFile = File(None),
    user: dict = Depends(get_current_user),
):
    image_name = _save_image(image) if image else ""
    conn = get_db()
    cur = conn.execute(
        "INSERT INTO posts (title, content, image, emotion, user_id) VALUES (?, ?, ?, ?, ?)",
        (title.strip(), content.strip(), image_name, emotion.strip(), user["id"]),
    )
    conn.commit()
    row = conn.execute(
        """SELECT p.*, u.username FROM posts p
           LEFT JOIN users u ON p.user_id = u.id
           WHERE p.id = ?""", (cur.lastrowid,),
    ).fetchone()
    conn.close()
    return _row_to_dict(row)


@router.put("/{post_id}")
def update_post(
    post_id: int,
    title: str = Form(None),
    content: str = Form(None),
    emotion: str = Form(None),
    image: UploadFile = File(None),
    user: dict = Depends(get_current_user),
):
    conn = get_db()
    existing = conn.execute("SELECT * FROM posts WHERE id = ?", (post_id,)).fetchone()
    if not existing:
        conn.close()
        raise HTTPException(404, "Post not found")
    if existing["user_id"] != user["id"]:
        conn.close()
        raise HTTPException(403, "只能编辑自己的碎碎念")

    title = title.strip() if title else existing["title"]
    content = content.strip() if content else existing["content"]
    emotion = emotion.strip() if emotion else existing["emotion"]

    image_name = existing["image"]
    if image and image.filename:
        _delete_image(existing["image"])
        image_name = _save_image(image)

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
    return _row_to_dict(row)


@router.delete("/{post_id}")
def delete_post(post_id: int, user: dict = Depends(get_current_user)):
    conn = get_db()
    existing = conn.execute("SELECT id, image, user_id FROM posts WHERE id = ?", (post_id,)).fetchone()
    if not existing:
        conn.close()
        raise HTTPException(404, "Post not found")
    if existing["user_id"] != user["id"]:
        conn.close()
        raise HTTPException(403, "只能删除自己的碎碎念")
    _delete_image(existing["image"])
    conn.execute("DELETE FROM posts WHERE id = ?", (post_id,))
    conn.commit()
    conn.close()
    return {"message": "deleted"}
