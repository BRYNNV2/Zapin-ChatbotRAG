from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.services.rag_service import rag_service

router = APIRouter(prefix="/chat", tags=["Chat"])

class ChatRequest(BaseModel):
    query: str = Field(..., description="Pertanyaan seputar budaya Zapin")
    top_k: Optional[int] = Field(4, description="Jumlah konteks teratas yang diambil")
    threshold: Optional[float] = Field(0.30, description="Ambang batas kemiripan semantik")

class CompareRequest(BaseModel):
    query: str = Field(..., description="Pertanyaan untuk perbandingan RAG vs Baseline")

@router.post("/query")
async def ask_zapin_assistant(req: ChatRequest):
    """Endpoint utama dialog AI Cultural Assistant Budaya Zapin berbasis RAG Sentence-BERT."""
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Pertanyaan tidak boleh kosong.")

    try:
        response = rag_service.generate_response(
            query=req.query.strip(),
            top_k=req.top_k,
            threshold=req.threshold
        )
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
