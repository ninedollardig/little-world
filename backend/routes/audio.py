import os
import uuid
import mimetypes
from pathlib import Path
from flask import Blueprint, request, jsonify, current_app, Response, g
from database import get_db
from routes.auth import login_required

bp = Blueprint("audio", __name__)

ALLOWED_TYPES = {
    "audio/mpeg", "audio/mp3", "audio/wav", "audio/wave",
    "audio/ogg", "audio/flac", "audio/x-m4a", "audio/mp4",
    "audio/aac", "audio/webm",
}


def _upload_dir():
    d = current_app.config["UPLOAD_DIR"]
    d.mkdir(parents=True, exist_ok=True)
    return d


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


@bp.route("/audio", methods=["GET"])
def list_audios():
    page = request.args.get("page", 1, type=int)
    limit = request.args.get("limit", 20, type=int)
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
    return jsonify({"items": items, "total": total, "page": page, "limit": limit})


@bp.route("/audio/<int:audio_id>", methods=["GET"])
def get_audio(audio_id):
    conn = get_db()
    row = conn.execute(
        """SELECT a.*, u.username FROM audios a
           LEFT JOIN users u ON a.user_id = u.id
           WHERE a.id = ?""", (audio_id,),
    ).fetchone()
    conn.close()
    if not row:
        return jsonify({"detail": "Audio not found"}), 404
    return jsonify(_row_to_dict(row))


@bp.route("/audio", methods=["POST"])
@login_required
def upload_audio():
    file = request.files.get("file")
    if not file or not file.filename:
        return jsonify({"detail": "请选择音频文件"}), 400

    mime_type = file.content_type or mimetypes.guess_type(file.filename)[0] or "audio/mpeg"
    if mime_type not in ALLOWED_TYPES:
        return jsonify({"detail": f"不支持的格式: {mime_type}"}), 400

    ext = Path(file.filename).suffix or ".mp3"
    safe_filename = f"{uuid.uuid4()}{ext}"
    file_path = _upload_dir() / safe_filename
    file.save(str(file_path))
    file_size = file_path.stat().st_size

    title = request.form.get("title", "").strip()
    description = request.form.get("description", "").strip()

    conn = get_db()
    cur = conn.execute(
        """INSERT INTO audios (title, description, filename, original_name, file_size, mime_type, user_id)
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (title, description, safe_filename, file.filename, file_size, mime_type, g.user["id"]),
    )
    conn.commit()
    row = conn.execute(
        """SELECT a.*, u.username FROM audios a
           LEFT JOIN users u ON a.user_id = u.id
           WHERE a.id = ?""", (cur.lastrowid,),
    ).fetchone()
    conn.close()
    return jsonify(_row_to_dict(row)), 201


@bp.route("/audio/<int:audio_id>", methods=["DELETE"])
@login_required
def delete_audio(audio_id):
    conn = get_db()
    row = conn.execute("SELECT filename, user_id FROM audios WHERE id = ?", (audio_id,)).fetchone()
    if not row:
        conn.close()
        return jsonify({"detail": "Audio not found"}), 404
    if row["user_id"] != g.user["id"]:
        conn.close()
        return jsonify({"detail": "只能删除自己的音频"}), 403

    file_path = _upload_dir() / row["filename"]
    conn.execute("DELETE FROM audios WHERE id = ?", (audio_id,))
    conn.commit()
    conn.close()

    try:
        if file_path.exists():
            os.remove(file_path)
    except OSError:
        pass

    return jsonify({"message": "deleted"})


@bp.route("/audio/<int:audio_id>/stream", methods=["GET"])
def stream_audio(audio_id):
    conn = get_db()
    row = conn.execute("SELECT filename, mime_type, file_size FROM audios WHERE id = ?", (audio_id,)).fetchone()
    conn.close()
    if not row:
        return jsonify({"detail": "Audio not found"}), 404

    file_path = _upload_dir() / row["filename"]
    if not file_path.exists():
        return jsonify({"detail": "Audio file not found on disk"}), 404

    file_size = file_path.stat().st_size
    mime_type = row["mime_type"] or "audio/mpeg"

    range_header = request.headers.get("Range")
    start = 0
    end = file_size - 1

    if range_header:
        range_str = range_header.replace("bytes=", "")
        parts = range_str.split("-")
        start = int(parts[0]) if parts[0] else 0
        end = int(parts[1]) if len(parts) > 1 and parts[1] else file_size - 1

    content_length = end - start + 1

    def generate():
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

    headers = {
        "Content-Length": str(content_length),
        "Accept-Ranges": "bytes",
        "Content-Type": mime_type,
    }
    status = 200
    if range_header:
        headers["Content-Range"] = f"bytes {start}-{end}/{file_size}"
        status = 206

    return Response(generate(), status=status, headers=headers)
