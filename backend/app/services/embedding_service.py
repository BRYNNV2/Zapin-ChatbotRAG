import numpy as np
from typing import List, Union
from app.core.config import settings

class EmbeddingService:
    """Service untuk menghasilkan Dense Embeddings menggunakan model Sentence-BERT.
    Embeddings dinormalisasi (L2 norm) agar perkalian skalar (dot product) setara dengan Cosine Similarity.
    """

    _model = None

    @classmethod
    def get_model(cls):
        """Lazy loader model Sentence-BERT agar hanya di-load sekali di memory."""
        if cls._model is None:
            print(f"[EmbeddingService] Memuat model Sentence-BERT: {settings.SBERT_MODEL_NAME}...")
            try:
                from sentence_transformers import SentenceTransformer
                cls._model = SentenceTransformer(settings.SBERT_MODEL_NAME)
                print(f"[EmbeddingService] Model berhasil dimuat. Dimensi: {settings.EMBEDDING_DIMENSION}")
            except Exception as e:
                print(f"[EmbeddingService] Gagal memuat Sentence-BERT: {e}")
                raise e
        return cls._model

    @classmethod
    def encode_texts(cls, texts: List[str], batch_size: int = 32) -> np.ndarray:
        """Menghasilkan representasi vektor untuk sekumpulan teks (dokumen/chunks)."""
        if not texts:
            return np.empty((0, settings.EMBEDDING_DIMENSION), dtype=np.float32)

        model = cls.get_model()
        # normalize_embeddings=True memastikan panjang vektor bernilai 1.0 (L2 unit vector)
        embeddings = model.encode(
            texts,
            batch_size=batch_size,
            show_progress_bar=False,
            normalize_embeddings=True,
            convert_to_numpy=True
        )
        return embeddings.astype(np.float32)

    @classmethod
    def encode_query(cls, query: str) -> np.ndarray:
        """Menghasilkan representasi vektor untuk satu kueri pertanyaan pengguna."""
        model = cls.get_model()
        embedding = model.encode(
            query,
            show_progress_bar=False,
            normalize_embeddings=True,
            convert_to_numpy=True
        )
        return embedding.astype(np.float32)

embedding_service = EmbeddingService()
