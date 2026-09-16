import re
from typing import List, Dict, Any
from rank_bm25 import BM25Okapi
from app.services.vector_store import vector_store

class BaselineService:
    """Service untuk menyediakan metode pembanding (Baseline) untuk penelitian skripsi:
    1. Sparse Lexical Retrieval menggunakan BM25 Okapi
    2. Raw LLM (Generasi tanpa injeksi konteks RAG)
    """

    @staticmethod
    def _tokenize(text: str) -> List[str]:
        """Tokenisasi sederhana bahasa Indonesia untuk BM25."""
        clean = re.sub(r'[^\w\s]', ' ', text.lower())
        return [w for w in clean.split() if len(w) > 1]

    @classmethod
    def bm25_search(cls, query: str, top_k: int = 4) -> List[Dict[str, Any]]:
        """Melakukan pencarian leksikal (keyword-based) menggunakan algoritma BM25."""
        docs = vector_store.documents
        if not docs:
            return []

        # Tokenisasi korpus dokumen
        corpus = [cls._tokenize(doc["text"]) for doc in docs]
        bm25 = BM25Okapi(corpus)

        tokenized_query = cls._tokenize(query)
        if not tokenized_query:
            return []

        scores = bm25.get_scores(tokenized_query)
        top_indices = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)[:top_k]

        results = []
        for idx in top_indices:
            score = float(scores[idx])
            if score > 0.0:  # Hanya ambil jika ada kecocokan term
                doc = dict(docs[idx])
                doc["bm25_score"] = round(score, 4)
                results.append(doc)

        return results

baseline_service = BaselineService()
