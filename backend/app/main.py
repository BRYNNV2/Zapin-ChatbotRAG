from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes_chat import router as chat_router
from app.api.routes_dataset import router as dataset_router
from app.api.routes_evaluation import router as evaluation_router
from app.api.routes_auth import router as auth_router
from app.api.routes_sessions import router as sessions_router
from app.services.vector_store import vector_store

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan handler: Menginisialisasi data dasar saat server dijalankan."""
    print("================================================================")
    print("   AI Cultural Assistant Budaya Zapin (RAG + Sentence-BERT)     ")
    print("================================================================")
    print(f"Model SBERT        : {settings.SBERT_MODEL_NAME}")
    print(f"Total Chunks Aktif : {len(vector_store.documents)}")
    
    # Inisialisasi tabel database PostgreSQL (Neon)
    try:
        from app.db.session import init_db
        init_db()
    except Exception as db_e:
        print(f"[Startup] Peringatan koneksi database: {db_e}")

    # Jika vector store masih kosong, otomatis seed materi dasar agar langsung bisa dipakai demo
    if len(vector_store.documents) == 0:
        print("[Startup] Pangkalan data kosong, melakukan inisialisasi starter dataset Zapin...")
        from app.api.routes_dataset import seed_starter_zapin_knowledge
        await seed_starter_zapin_knowledge()

    yield
    print("[Shutdown] Mematikan layanan AI Cultural Assistant.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API Sistem AI Cultural Assistant Budaya Zapin berbasis RAG Dense Semantic Retrieval (Sentence-BERT) untuk Skripsi.",
    version="1.0.0",
    lifespan=lifespan
)

# Konfigurasi CORS agar frontend React dapat berkomunikasi dengan lancar
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Daftarkan Router
app.include_router(chat_router, prefix=settings.API_V1_STR)
app.include_router(dataset_router, prefix=settings.API_V1_STR)
app.include_router(evaluation_router, prefix=settings.API_V1_STR)
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(sessions_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "active_chunks": len(vector_store.documents),
        "docs_url": "/docs",
        "message": "AI Cultural Assistant Zapin API siap melayani kueri dan eksperimen skripsi."
    }
