import os
import uuid
import mimetypes
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request, Depends
from fastapi.responses import StreamingResponse
from database import get_db
from routes.auth import get_current_user, get_optional_user

router = APIRouter(prefix="/audio", tags=["audio"])

UPLOAD_DIR = Path(__file__).parent.parent / "uploads" / "audio"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_TYPES = {
    "audio/mpeg", "audio/mp3", "audio/wav", "audio/wave",
    "audio/ogg", "audio/flac", "audio/x-m4a", "audio/mp4",
    "audio/aac", "audio/webm",
}


def _row_to_dict(row):
    return {
        "id": row["id"],
        "title": row["title"],
        "description": row["description"],
        "original_name": row["original_name"],
        "file_size": row["file_size"],
        "mime_type": row["mime_type"],
        "duration_sec": row["duration_sec"],
        "user_id": row["user_id"],
        "username": row["username"] if "username" in row.keys() else "",
        "created_at": row["created_at"],
    }


@router.get("")
def list_audios(page: int = 1, limit: int = 20):
    offset = (page - 1) * limit
    conn = get_db()
    total = conn.execute("SELECT COUNT(*) FROM audios").fetchone()[0]
    rows = conn.execute(
        """SELECT a.*, u.username FROM audios a
           LEFT JOIN users u ON a.user_id = u.id
           ORDER BY a.created_at DESC LIMIT ? OFFSET ?""",
        (limit, offset),
    ).fetchall()
    conn.close()
    items = [_row_to_dict(r) for r in rows]
    return {"items": items, "total": total, "page": page, "limit": limit}


@router.get("/{audio_id}")
def get_audio(audio_id: int):
    conn = get_db()
    row = conn.execute(
        """SELECT a.*, u.username FROM audios a
           LEFT JOIN users u ON a.user_id = u.id
           WHERE a.id = ?""", (audio_id,),
    ).fetchone()
    conn.close()
    if not row:
        raise HTTPException(404, "Audio not found")
    return _row_to_dict(row)


@router.post("", status_code=201)
async def upload_audio(
    file: UploadFile = File(...),
    title: str = Form(""),
    description: str = Form(""),
    user: dict = Depends(get_current_user),
):
    mime_type = file.content_type or mimetypes.guess_type(file.filename or "")[0] or "audio/mpeg"
    if mime_type not in ALLOWED_TYPES:
        raise HTTPException(400, f"Unsupported audio format: {mime_type}")

    ext = Path(file.filename).suffix if file.filename else ".mp3"
    safe_filename = f"{uuid.uuid4()}{ext}"
    file_path = UPLOAD_DIR / safe_filename

    content = await file.read()
    file_size = len(content)

    with open(file_path, "wb") as f:
        f.write(content)

    conn = get_db()
    cur = conn.execute(
        """INSERT INTO audios (title, description, filename, original_name, file_size, mime_type, user_id)
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (title.strip(), description.strip(), safe_filename, file.filename or "unknown", file_size, mime_type, user["id"]),
    )
    conn.commit()
    row = conn.execute(
        """SELECT a.*, u.username FROM audios a
           LEFT JOIN users u ON a.user_id = u.id
           WHERE a.id = ?""", (cur.lastrowid,),
    ).fetchone()
    conn.close()
    return _row_to_dict(row)


@router.delete("/{audio_id}")
def delete_audio(audio_id: int, user: dict = Depends(get_current_user)):
    conn = get_db()
    row = conn.execute("SELECT filename, user_id FROM audios WHERE id = ?", (audio_id,)).fetchone()
    if not row:
        conn.close()
        raise HTTPException(404, "Audio not found")
    if row["user_id"] != user["id"]:
        conn.close()
        raise HTTPException(403, "只能删除自己的音频")

    file_path = UPLOAD_DIR / row["filename"]
    conn.execute("DELETE FROM audios WHERE id = ?", (audio_id,))
    conn.commit()
    conn.close()

    try:
        if file_path.exists():
            os.remove(file_path)
    except OSError:
        pass

    return {"message": "deleted"}


@router.get("/{audio_id}/stream")
def stream_audio(audio_id: int, request: Request):
    conn = get_db()
    row = conn.execute("SELECT filename, mime_type, file_size FROM audios WHERE id = ?", (audio_id,)).fetchone()
    conn.close()
    if not row:
        raise HTTPException(404, "Audio not found")

    file_path = UPLOAD_DIR / row["filename"]
    if not file_path.exists():
        raise HTTPException(404, "Audio file not found on disk")

    file_size = file_path.stat().st_size
    mime_type = row["mime_type"] or "audio/mpeg"

    range_header = request.headers.get("range")
    start = 0
    end = file_size - 1

    if range_header:
        range_str = range_header.replace("bytes=", "")
        parts = range_str.split("-")
        start = int(parts[0]) if parts[0] else 0
        end = int(parts[1]) if len(parts) > 1 and parts[1] else file_size - 1
    else:
        def full_generator():
            with open(file_path, "rb") as f:
                while chunk := f.read(64 * 1024):
                    yield chunk

        return StreamingResponse(
            full_generator(),
            media_type=mime_type,
            headers={
                "Content-Length": str(file_size),
                "Accept-Ranges": "bytes",
            },
        )

    content_length = end - start + 1

    def ranged_generator():
        with open(file_path, "rb") as f:
            f.seek(start)
            remaining = content_length
            while remaining > 0:
                chunk_size = min(64 * 1024, remaining)
                data = f.read(chunk_size)
                if not data:
                    break
                remaining -= len(data)
                yield data

    return StreamingResponse(
        ranged_generator(),
        status_code=206,
        media_type=mime_type,
        headers={
            "Content-Range": f"bytes {start}-{end}/{file_size}",
            "Content-Length": str(content_length),
            "Accept-Ranges": "bytes",
        },
    )
