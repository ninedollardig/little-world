from pydantic import BaseModel
from typing import Optional


# ── Auth ──

class LoginRequest(BaseModel):
    username: str
    password: str


class RegisterRequest(BaseModel):
    username: str
    password: str
    display_name: str = ""


class UserOut(BaseModel):
    id: int
    username: str
    display_name: str
    created_at: str


# ── Audio ──

class AudioOut(BaseModel):
    id: int
    title: str
    description: str = ""
    original_name: str
    file_size: int = 0
    mime_type: str = "audio/mpeg"
    duration_sec: float = 0
    user_id: int = 1
    username: str = ""
    created_at: str


# ── Posts ──

class PostCreate(BaseModel):
    title: str = ""
    content: str
    emotion: str = ""


class PostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    emotion: Optional[str] = None


class PostOut(BaseModel):
    id: int
    title: str
    content: str
    image: str = ""
    emotion: str = ""
    user_id: int = 1
    username: str = ""
    created_at: str
    updated_at: str


# ── Generic ──

class PaginatedResponse(BaseModel):
    items: list
    total: int
    page: int
    limit: int
