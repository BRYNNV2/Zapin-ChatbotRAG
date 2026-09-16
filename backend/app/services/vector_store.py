import json
import os
from pathlib import Path
from typing import List, Dict, Any, Tuple
import numpy as np
from app.core.config import settings

class PersistentVectorStore:
    """Vector Store persisten berbasis numpy Cosine Similarity dengan manajemen metadata kaya.
    Cocok untuk skripsi karena transparan, cepat, dapat diinspeksi langsung oleh peneliti,
    dan tidak rentan masalah kompatibilitas library C++ eksternal di Windows.
    """

    def __init__(self):
        self.index_path = settings.PROCESSED_DIR / "metadata_index.json"
        self.vectors_path = settings.PROCESSED_DIR / "vectors.npy"
        
        self.documents: List[Dict[str, Any]] = []
        self.vectors: np.ndarray = np.empty((0, settings.EMBEDDING_DIMENSION), dtype=np.float32)
        
        # Buat direktori jika belum ada
        settings.PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
        self.load()

    def load(self):
        """Memuat index dokumen dan matriks vektor dari disk."""
        if self.index_path.exists() and self.vectors_path.exists():
            try:
                with open(self.index_path, "r", encoding="utf-8") as f:
                    self.documents = json.load(f)
                self.vectors = np.load(str(self.vectors_path))
                print(f"[VectorStore] Berhasil memuat {len(self.documents)} chunks dari {self.index_path}")
            except Exception as e:
                print(f"[VectorStore] Gagal memuat index yang ada: {e}")
                self.documents = []
                self.vectors = np.empty((0, settings.EMBEDDING_DIMENSION), dtype=np.float32)

    def save(self):
        """Menyimpan index dokumen dan matriks vektor ke disk."""
        try:
            with open(self.index_path, "w", encoding="utf-8") as f:
                json.dump(self.documents, f, ensure_ascii=False, indent=2)
            np.save(str(self.vectors_path), self.vectors)
            print(f"[VectorStore] Menyimpan {len(self.documents)} chunks ke disk.")
        except Exception as e:
            print(f"[VectorStore] Gagal menyimpan ke disk: {e}")

    def add_documents(self, chunks: List[Dict[str, Any]], embeddings: np.ndarray):
        """Menambahkan chunks baru beserta vektor embedding-nya ke index."""
        if not chunks:
            return

        if len(chunks) != len(embeddings):
            raise ValueError("Jumlah chunks dan embeddings harus sama!")

        # Gabungkan vektor
        if len(self.vectors) == 0:
            self.vectors = embeddings.astype(np.float32)
        else:
            self.vectors = np.vstack([self.vectors, embeddings.astype(np.float32)])

        self.documents.extend(chunks)
        self.save()

    def similarity_search(self, query_embedding: np.ndarray, top_k: int = None, threshold: float = None) -> List[Dict[str, Any]]:
        """Mencari Top-K chunks dengan Cosine Similarity tertinggi di atas threshold."""
        k = top_k or settings.DEFAULT_TOP_K
        thresh = threshold if threshold is not None else settings.SIMILARITY_THRESHOLD

        if len(self.documents) == 0 or len(self.vectors) == 0:
            return []

        # Karena vektor sudah di-L2-normalize, cosine similarity adalah dot product
        # query_embedding: shape (D,), self.vectors: shape (N, D)
        scores = np.dot(self.vectors, query_embedding)

        # Ambil indeks dengan skor tertinggi
        sorted_indices = np.argsort(scores)[::-1]

        results = []
        for idx in sorted_indices:
            score = float(scores[idx])
            # Filter berdasarkan threshold relevansi semantik
            if score >= thresh:
                doc = dict(self.documents[idx])
                doc["similarity_score"] = round(score, 4)
                results.append(doc)
                if len(results) >= k:
                    break

        return results

    def get_indexed_files(self) -> List[Dict[str, Any]]:
        """Mendapatkan rekap file dokumen yang sudah terindeks di pangkalan data."""
        files_summary = {}
        for doc in self.documents:
            fname = doc.get("document_name", "unknown")
            if fname not in files_summary:
                files_summary[fname] = {
                    "document_name": fname,
                    "total_chunks": 0,
                    "validator_name": doc.get("validator_name", settings.DEFAULT_VALIDATOR),
                    "cultural_categories": set(),
                    "pages": set()
                }
            files_summary[fname]["total_chunks"] += 1
            files_summary[fname]["cultural_categories"].add(doc.get("cultural_category", "Umum"))
            files_summary[fname]["pages"].add(doc.get("page_number", 1))

        # Format output
        res = []
        for fname, data in files_summary.items():
            res.append({
                "document_name": fname,
                "total_chunks": data["total_chunks"],
                "validator_name": data["validator_name"],
                "cultural_categories": list(data["cultural_categories"]),
                "total_pages": len(data["pages"])
            })
        return res

    def clear(self):
        """Menghapus seluruh index dokumen dan vektor."""
        self.documents = []
        self.vectors = np.empty((0, settings.EMBEDDING_DIMENSION), dtype=np.float32)
        if self.index_path.exists():
            self.index_path.unlink()
        if self.vectors_path.exists():
            self.vectors_path.unlink()
        print("[VectorStore] Seluruh index berhasil dikosongkan.")

vector_store = PersistentVectorStore()
