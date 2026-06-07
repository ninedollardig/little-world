import os
import secrets
from pathlib import Path
from flask import Flask, send_from_directory
from flask_cors import CORS
from database import init_db

UPLOAD_DIR = Path(__file__).parent / "uploads" / "audio"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

IMAGES_DIR = Path(__file__).parent / "uploads" / "images"
IMAGES_DIR.mkdir(parents=True, exist_ok=True)

FRONTEND_DIR = Path(__file__).parent / "frontend-dist"

def create_app():
    app = Flask(__name__, static_folder=None)
    CORS(app, origins="*", supports_credentials=True)

    app.config["JWT_SECRET"] = os.getenv("JWT_SECRET") or secrets.token_hex(32)
    app.config["UPLOAD_DIR"] = UPLOAD_DIR
    app.config["IMAGES_DIR"] = IMAGES_DIR
    app.config["FRONTEND_DIR"] = FRONTEND_DIR

    init_db()

    from routes.audio import bp as audio_bp
    from routes.posts import bp as posts_bp
    from routes.auth import bp as auth_bp

    app.register_blueprint(audio_bp, url_prefix="/api")
    app.register_blueprint(posts_bp, url_prefix="/api")
    app.register_blueprint(auth_bp, url_prefix="/api")

    @app.route("/api/health")
    def health():
        return {"status": "ok", "db": "connected"}

    # Serve uploaded images
    @app.route("/uploads/images/<path:filename>")
    def serve_image(filename):
        return send_from_directory(str(IMAGES_DIR), filename)

    # Serve frontend static files in production
    if FRONTEND_DIR.exists():
        @app.route("/assets/<path:filename>")
        def serve_assets(filename):
            return send_from_directory(str(FRONTEND_DIR / "assets"), filename)

        @app.route("/", defaults={"path": ""})
        @app.route("/<path:path>")
        def serve_frontend(path):
            if path and (FRONTEND_DIR / path).exists():
                return send_from_directory(str(FRONTEND_DIR), path)
            return send_from_directory(str(FRONTEND_DIR), "index.html")

    return app


if __name__ == "__main__":
    app = create_app()
    port = int(os.getenv("BACKEND_PORT", "8765"))
    app.run(host="0.0.0.0", port=port, debug=True)
