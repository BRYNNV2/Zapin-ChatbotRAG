from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Optional
from app.services.evaluation_service import evaluation_service

router = APIRouter(prefix="/evaluation", tags=["Skripsi Evaluation & Research"])

class RetrievalBenchRequest(BaseModel):
    top_k: Optional[int] = Field(4, description="Nilai K untuk Hit Rate@K")

class QueryCompareRequest(BaseModel):
    query: str = Field(..., description="Kueri pengujian untuk komparasi RAG vs Baseline")

@router.get("/benchmarks")
async def get_benchmark_questions():
    """Mengambil daftar kueri evaluasi ground truth untuk pengujian skripsi."""
    queries = evaluation_service.load_benchmark_queries()
    return {"total_benchmarks": len(queries), "benchmarks": queries}

@router.post("/run_retrieval")
async def run_retrieval_benchmark(req: RetrievalBenchRequest):
    """Menjalankan pengujian komparatif kuantitatif: Hit Rate@K dan MRR antara
    Sentence-BERT (Dense Semantic Retrieval) vs BM25 (Sparse Lexical Retrieval).
    """
    try:
        results = evaluation_service.run_retrieval_comparison(top_k=req.top_k)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal menjalankan benchmark retrieval: {str(e)}")

@router.post("/run_generation_compare")
async def run_generation_comparison(req: QueryCompareRequest):
    """Menjalankan pengujian kualitatif komparatif antara usulan SBERT RAG dan baseline Raw LLM."""
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Kueri tidak boleh kosong.")
    try:
        results = evaluation_service.run_generation_comparison(req.query.strip())
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal membandingkan respon: {str(e)}")
