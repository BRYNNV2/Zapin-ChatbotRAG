import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

def get_database_url() -> str:
    """Mengambil dan memformat DATABASE_URL untuk SQLAlchemy."""
    url = os.getenv("DATABASE_URL", "") or settings.DATABASE_URL
    if not url:
        # Fallback lokal jika tidak ada
        url = "postgresql://neondb_owner:npg_rANOoGg2l8EI@ep-wild-tooth-b35qatrt-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
    
    # SQLAlchemy memerlukan driver prefix 'postgresql+psycopg2://'
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+psycopg2://", 1)
    elif url.startswith("postgresql://") and not url.startswith("postgresql+psycopg2://"):
        url = url.replace("postgresql://", "postgresql+psycopg2://", 1)
        
    return url

# Inisialisasi engine dengan pool_pre_ping untuk stabilitas serverless Neon
try:
    DATABASE_URL = get_database_url()
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=300,
        pool_size=5,
        max_overflow=10
    )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    print("[Database] SQLAlchemy Engine berhasil dikonfigurasi dengan PostgreSQL (Neon).")
except Exception as e:
    print(f"[Database] Peringatan konfigurasi database: {e}")
    engine = None
    SessionLocal = None

Base = declarative_base()

def get_db():
    """Dependency generator untuk injeksi sesi database FastAPI."""
    if SessionLocal is None:
        yield None
        return
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Membuat semua tabel database jika belum ada."""
    if engine is None:
        print("[Database] Engine belum siap, melewati init_db.")
        return
    try:
        import app.db.models  # Pastikan semua model ter-import
        Base.metadata.create_all(bind=engine)
        print("[Database] Seluruh tabel database PostgreSQL (Neon) berhasil diverifikasi/dibuat.")
    except Exception as e:
        print(f"[Database] Gagal menginisialisasi tabel database: {e}")
