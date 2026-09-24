import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from app.services.rag_service import rag_service
from app.db.session import get_db
from app.db.models import Conversation, ChatMessage

router = APIRouter(prefix="/chat", tags=["Chat"])

class ChatRequest(BaseModel):
    query: str = Field(..., description="Pertanyaan seputar budaya Zapin")
    top_k: Optional[int] = Field(4, description="Jumlah konteks teratas yang diambil")
    threshold: Optional[float] = Field(0.30, description="Ambang batas kemiripan semantik")
    session_id: Optional[str] = Field(None, description="ID sesi percakapan untuk disimpan di database")

class CompareRequest(BaseModel):
    query: str = Field(..., description="Pertanyaan untuk perbandingan RAG vs Baseline")

@router.post("/query")
async def ask_zapin_assistant(req: ChatRequest, db: Session = Depends(get_db)):
    """Endpoint utama dialog AI Cultural Assistant Budaya Zapin berbasis RAG Sentence-BERT."""
    clean_q = req.query.strip()
    if not clean_q:
        raise HTTPException(status_code=400, detail="Pertanyaan tidak boleh kosong.")

    try:
        # 1. Jalankan siklus RAG Sentence-BERT
        response = rag_service.generate_response(
            query=clean_q,
            top_k=req.top_k,
            threshold=req.threshold
        )

        # 2. Jika session_id disediakan dan db aktif, simpan percakapan ke PostgreSQL
        if req.session_id and db:
            try:
                conv = db.query(Conversation).filter(Conversation.id == req.session_id).first()
                if conv:
                    # Simpan pesan pengguna
                    user_msg = ChatMessage(
                        id=str(uuid.uuid4()),
                        conversation_id=conv.id,
                        sender="user",
                        text=clean_q,
                        sources=[],
                        created_at=datetime.utcnow()
                    )
                    db.add(user_msg)

                    # Simpan balasan AI beserta rujukan sumber terverifikasi
                    assistant_msg = ChatMessage(
                        id=str(uuid.uuid4()),
                        conversation_id=conv.id,
                        sender="assistant",
                        text=response.get("answer", ""),
                        sources=response.get("sources", []),
                        created_at=datetime.utcnow()
                    )
                    db.add(assistant_msg)

                    # Update judul percakapan jika masih judul default
                    if conv.title in ["Obrolan Baru", "Percakapan Budaya Zapin"]:
                        # Ringkas judul dari pertanyaan pertama (maksimal 45 karakter)
                        short_title = clean_q[:42] + "..." if len(clean_q) > 42 else clean_q
                        conv.title = short_title

                    conv.updated_at = datetime.utcnow()
                    db.commit()
            except Exception as db_err:
                print(f"[ChatRoute] Peringatan penyimpanan ke database: {db_err}")
                db.rollback()

        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan pemrosesan RAG: {str(e)}")

@router.post("/compare")
async def compare_rag_vs_baseline(req: CompareRequest):
    """Endpoint untuk membandingkan langsung jawaban SBERT RAG vs Raw LLM."""
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Pertanyaan tidak boleh kosong.")

    from app.services.evaluation_service import evaluation_service
    return evaluation_service.run_generation_comparison(req.query.strip())

@router.get("/suggestions")
async def get_quick_prompt_suggestions():
    """Mengembalikan daftar rekomendasi pertanyaan awal seputar Budaya Zapin."""
    return {
        "suggestions": [
            {
                "title": "Filosofi Gerak Tahto",
                "query": "Apa makna filosofis dan fungsi dari gerak Tahto pada tari Zapin Melayu?",
                "category": "Ragam Gerak"
            },
            {
                "title": "Alat Musik Pengiring",
                "query": "Sebutkan alat musik tradisional utama yang mengiringi tari Zapin dan perannya!",
                "category": "Musik & Iringan"
            },
            {
                "title": "Sejarah & Akulturasi",
                "query": "Bagaimana sejarah masuknya tari Zapin dari Hadramaut ke Kepulauan Riau dan Nusantara?",
                "category": "Sejarah"
            },
            {
                "title": "Etika & Tata Busana",
                "query": "Bagaimana etika busana Melayu (seperti Teluk Belanga dan Songket) dalam pementasan Zapin?",
                "category": "Busana & Etika"
            },
            {
                "title": "Gerak Pecah & Sembah",
                "query": "Jelaskan dinamika langkah pada gerak Pecah dan gerak Sembah dalam Zapin Tradisi!",
                "category": "Ragam Gerak"
            }
        ]
    }
