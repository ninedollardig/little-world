import sqlite3
import os

DB_DIR = os.path.join(os.path.dirname(__file__), "data")
DB_PATH = os.path.join(DB_DIR, "murmur.db")


def get_db():
    os.makedirs(DB_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db():
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            username      TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            display_name  TEXT NOT NULL DEFAULT '',
            created_at    TEXT NOT NULL DEFAULT (datetime('now','localtime'))
        );

        CREATE TABLE IF NOT EXISTS audios (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            title         TEXT NOT NULL,
            description   TEXT DEFAULT '',
            filename      TEXT NOT NULL,
            original_name TEXT NOT NULL,
            file_size     INTEGER DEFAULT 0,
            mime_type     TEXT DEFAULT 'audio/mpeg',
            duration_sec  REAL DEFAULT 0,
            user_id       INTEGER DEFAULT 1 REFERENCES users(id),
            created_at    TEXT NOT NULL DEFAULT (datetime('now','localtime'))
        );

        CREATE TABLE IF NOT EXISTS posts (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            title      TEXT NOT NULL DEFAULT '',
            content    TEXT NOT NULL,
            image      TEXT DEFAULT '',
            emotion    TEXT DEFAULT '',
            user_id    INTEGER DEFAULT 1 REFERENCES users(id),
            created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
        );
    """)
    conn.commit()

    # Migrations for upgrading older schemas
    migrations = [
        "ALTER TABLE posts ADD COLUMN image TEXT DEFAULT ''",
        "ALTER TABLE audios ADD COLUMN user_id INTEGER DEFAULT 1 REFERENCES users(id)",
        "ALTER TABLE posts ADD COLUMN user_id INTEGER DEFAULT 1 REFERENCES users(id)",
    ]
    for sql in migrations:
        try:
            conn.execute(sql)
            conn.commit()
        except Exception:
            pass

    # Ensure at least a default user exists for migration compatibility
    existing = conn.execute("SELECT id FROM users LIMIT 1").fetchone()
    if not existing:
        conn.execute(
            "INSERT INTO users (username, password_hash, display_name) VALUES (?, ?, ?)",
            ("default", "", "默认用户"),
        )
        conn.commit()

    conn.close()
