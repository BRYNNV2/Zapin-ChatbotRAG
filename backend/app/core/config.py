import os
from pydantic_settings import BaseSettings
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "Zapin AI Cultural Assistant"
    API_V1_STR: str = "/api"
    BASE_DIR: Path = BASE_DIR
    
    # Model Configurations
    SBERT_MODEL_NAME: str = "paraphrase-multilingual-MiniLM-L12-v2"
    EMBEDDING_DIMENSION: int = 384
    
    # RAG Parameters
    DEFAULT_TOP_K: int = 4
    SIMILARITY_THRESHOLD: float = 0.35  # Cosine similarity minimum
    CHUNK_SIZE: int = 450  # Characters per chunk
    CHUNK_OVERLAP: int = 80  # Overlap between chunks
    
    # LLM Settings
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"
    
    # Storage Paths
    DATA_DIR: Path = BASE_DIR / "data"
    RAW_DOCS_DIR: Path = DATA_DIR / "raw_documents"
    PROCESSED_DIR: Path = DATA_DIR / "processed"
    VECTOR_DB_PATH: Path = PROCESSED_DIR / "vector_index.json"
    BENCHMARK_PATH: Path = DATA_DIR / "benchmark_queries.json"
    EVALUATION_RESULTS_DIR: Path = BASE_DIR.parent / "evaluation_results"
    
    # Default Expert Validator Profile
    DEFAULT_VALIDATOR: str = "Pakar & Peneliti Seni Tari Zapin Melayu"
    
    class Config:
        env_file = BASE_DIR / ".env"
        extra = "ignore"

settings = Settings()
