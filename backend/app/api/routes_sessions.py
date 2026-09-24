import uuid
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Conversation, ChatMessage, User
from app.api.routes_auth import get_current_user_optional

router = APIRouter(prefix="/chat/sessions", tags=["Chat Sessions"])

class CreateSessionRequest(BaseModel):
    title: Optional[str] = "Obrolan Baru"

class UpdateSessionRequest(BaseModel):
    title: str

@router.get("")
def list_sessions(
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Mengambil daftar riwayat percakapan milik pengguna aktif dari PostgreSQL."""
    if not db:
        return {"status": "success", "sessions": []}

    query = db.query(Conversation)
    if current_user:
        query = query.filter(Conversation.user_id == current_user.id)
    else:
        # Jika mode tamu (belum login), ambil sesi anonim
        query = query.filter(Conversation.user_id.is_(None))

    sessions = query.order_by(Conversation.updated_at.desc()).limit(50).all()
    return {
        "status": "success",
        "total": len(sessions),
        "sessions": [s.to_dict() for s in sessions]
    }

@router.post("")
def create_session(
    req: CreateSessionRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Membuat thread percakapan baru di database PostgreSQL."""
    if not db:
        raise HTTPException(status_code=500, detail="Database belum terhubung.")

    new_session = Conversation(
        id=str(uuid.uuid4()),
        user_id=current_user.id if current_user else None,
        title=req.title or "Obrolan Baru",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    return {
        "status": "success",
        "message": "Sesi percakapan berhasil dibuat.",
        "session": new_session.to_dict()
    }

@router.get("/{session_id}")
def get_session_detail(
    session_id: str,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Mengambil riwayat lengkap pesan dan sitasi naskah dari sesi percakapan."""
    if not db:
        raise HTTPException(status_code=500, detail="Database belum terhubung.")

    session = db.query(Conversation).filter(Conversation.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Sesi percakapan tidak ditemukan.")

    # Cek hak akses jika sesi berpemilik
    if session.user_id and current_user and session.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Tidak memiliki akses ke sesi ini.")

    return {
        "status": "success",
        "session": session.to_dict(include_messages=True)
    }

@router.put("/{session_id}")
def update_session(
    session_id: str,
    req: UpdateSessionRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Memperbarui judul sesi percakapan."""
    if not db:
        raise HTTPException(status_code=500, detail="Database belum terhubung.")

    session = db.query(Conversation).filter(Conversation.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Sesi percakapan tidak ditemukan.")

    if session.user_id and current_user and session.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Tidak memiliki akses ke sesi ini.")

    session.title = req.title.strip() or session.title
    session.updated_at = datetime.utcnow()
    db.commit()

    return {
        "status": "success",
        "message": "Judul percakapan berhasil diperbarui.",
        "session": session.to_dict()
    }

@router.delete("/{session_id}")
def delete_session(
    session_id: str,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Menghapus sesi percakapan beserta seluruh pesan di dalamnya dari PostgreSQL."""
    if not db:
        raise HTTPException(status_code=500, detail="Database belum terhubung.")

    session = db.query(Conversation).filter(Conversation.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Sesi percakapan tidak ditemukan.")

    if session.user_id and current_user and session.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Tidak memiliki akses ke sesi ini.")

    db.delete(session)
    db.commit()

    return {
        "status": "success",
        "message": "Sesi percakapan berhasil dihapus."
    }
