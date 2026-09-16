import json
import time
from pathlib import Path
from typing import List, Dict, Any
from app.core.config import settings
from app.services.rag_service import rag_service
from app.services.baseline_service import baseline_service
from app.services.vector_store import vector_store

class EvaluationService:
    """Service pengujian dan eksperimen akademis untuk Skripsi:
    1. Evaluasi Retrieval (Hit@K, MRR, Skor Similaritas)
    2. Perbandingan Komparatif: SBERT Dense RAG vs BM25 Sparse vs Raw LLM
    3. Evaluasi Keterlacakan Sumber (Source Traceability)
    """

    @staticmethod
    def load_benchmark_queries() -> List[Dict[str, Any]]:
        """Memuat dataset pertanyaan uji beserta kata kunci/topik validasi ground-truth."""
        if not settings.BENCHMARK_PATH.exists():
            # Inisialisasi dataset benchmark default tentang budaya Zapin
            default_benchmarks = [
                {
                    "query_id": "Q1",
                    "query": "Apa fungsi dan makna dari gerak Tahto dalam tari Zapin?",
                    "ground_truth_topics": ["tahto", "rendah hati", "pembuka", "kesopanan"],
                    "category": "Ragam & Struktur Gerak Zapin"
                },
                {
                    "query_id": "Q2",
                    "query": "Sebutkan alat musik utama yang digunakan untuk mengiringi tari Zapin Melayu!",
                    "ground_truth_topics": ["gambus", "marwas", "alat musik", "gendang"],
                    "category": "Musik & Iringan Tradisi"
                },
                {
                    "query_id": "Q3",
                    "query": "Bagaimana sejarah asal usul tari Zapin dan pengaruh budaya Hadramaut?",
                    "ground_truth_topics": ["hadramaut", "yaman", "arab", "sejarah", "akulturasi"],
                    "category": "Sejarah & Nilai Filosofis"
                },
                {
                    "query_id": "Q4",
                    "query": "Apa perbedaan karakter gerak Zapin antara penari pria dan penari wanita?",
                    "ground_truth_topics": ["pria", "wanita", "etika", "langkah", "santun", "lemah lembut"],
                    "category": "Busana, Etika & Adat"
                },
                {
                    "query_id": "Q5",
                    "query": "Apa yang dimaksud dengan gerak Pecah dan gerak Sembah dalam Zapin?",
                    "ground_truth_topics": ["pecah", "sembah", "ragam", "penghormatan"],
                    "category": "Ragam & Struktur Gerak Zapin"
                }
            ]
            settings.BENCHMARK_PATH.parent.mkdir(parents=True, exist_ok=True)
            with open(settings.BENCHMARK_PATH, "w", encoding="utf-8") as f:
                json.dump(default_benchmarks, f, ensure_ascii=False, indent=2)
            return default_benchmarks

        try:
            with open(settings.BENCHMARK_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"[EvaluationService] Error reading benchmark queries: {e}")
            return []

    @classmethod
    def run_retrieval_comparison(cls, top_k: int = 4) -> Dict[str, Any]:
        """Menjalankan eksperimen komparasi Retrieval: Sentence-BERT Dense vs BM25 Sparse."""
        queries = cls.load_benchmark_queries()
        if not queries:
            return {"error": "Dataset benchmark tidak ditemukan."}

        sbert_hits = 0
        sbert_rr_sum = 0.0
        sbert_times = []

        bm25_hits = 0
        bm25_rr_sum = 0.0
        bm25_times = []

        detailed_results = []

        for item in queries:
            qid = item["query_id"]
            q = item["query"]
            targets = [t.lower() for t in item.get("ground_truth_topics", [])]

            # 1. Evaluasi Sentence-BERT (Dense)
            t0 = time.time()
            sbert_res = rag_service.retrieve_context(q, top_k=top_k, threshold=0.2)
            sbert_time = time.time() - t0
            sbert_times.append(sbert_time)

            sbert_rank = 0
            for rank_idx, doc in enumerate(sbert_res):
                doc_text = doc["text"].lower()
                if any(target in doc_text for target in targets):
                    sbert_rank = rank_idx + 1
                    break

            if sbert_rank > 0:
                sbert_hits += 1
                sbert_rr_sum += (1.0 / sbert_rank)

            # 2. Evaluasi BM25 (Sparse)
            t0 = time.time()
            bm25_res = baseline_service.bm25_search(q, top_k=top_k)
            bm25_time = time.time() - t0
            bm25_times.append(bm25_time)

            bm25_rank = 0
            for rank_idx, doc in enumerate(bm25_res):
                doc_text = doc["text"].lower()
                if any(target in doc_text for target in targets):
                    bm25_rank = rank_idx + 1
                    break

            if bm25_rank > 0:
                bm25_hits += 1
                bm25_rr_sum += (1.0 / bm25_rank)

            detailed_results.append({
                "query_id": qid,
                "query": q,
                "sbert_rank": sbert_rank,
                "sbert_hit": sbert_rank > 0,
                "sbert_time_sec": round(sbert_time, 4),
                "bm25_rank": bm25_rank,
                "bm25_hit": bm25_rank > 0,
                "bm25_time_sec": round(bm25_time, 4)
            })

        num_q = max(1, len(queries))
        summary = {
            "total_test_queries": num_q,
            "top_k_tested": top_k,
            "sbert_metrics": {
                "hit_rate": round(sbert_hits / num_q, 4),
                "mrr": round(sbert_rr_sum / num_q, 4),
                "avg_latency_sec": round(sum(sbert_times) / num_q, 4)
            },
            "bm25_metrics": {
                "hit_rate": round(bm25_hits / num_q, 4),
                "mrr": round(bm25_rr_sum / num_q, 4),
                "avg_latency_sec": round(sum(bm25_times) / num_q, 4)
            },
            "detailed_query_results": detailed_results
        }

        # Simpan laporan hasil ke disk untuk Bab IV skripsi
        cls._export_results(summary)
        return summary

    @classmethod
    def run_generation_comparison(cls, query: str) -> Dict[str, Any]:
        """Membandingkan jawaban langsung untuk satu pertanyaan antara RAG SBERT dan Baseline Raw LLM."""
        rag_res = rag_service.generate_response(query)
        baseline_res = rag_service.generate_baseline_no_rag(query)

        return {
            "query": query,
            "proposed_sbert_rag": {
                "answer": rag_res["answer"],
                "sources_count": len(rag_res["sources"]),
                "sources": rag_res["sources"],
                "traceability_rate": rag_res["source_traceability_rate"],
                "retrieval_method": "Dense Semantic SBERT"
            },
            "baseline_raw_llm": {
                "answer": baseline_res["answer"],
                "sources_count": 0,
                "traceability_rate": 0.0,
                "retrieval_method": "No Retrieval (Parametric Only)"
            }
        }

    @classmethod
    def _export_results(cls, summary: Dict[str, Any]):
        """Mengekspor ringkasan hasil evaluasi ke format JSON dan CSV untuk pelaporan skripsi."""
        try:
            settings.EVALUATION_RESULTS_DIR.mkdir(parents=True, exist_ok=True)
            export_json = settings.EVALUATION_RESULTS_DIR / "evaluation_summary.json"
            export_csv = settings.EVALUATION_RESULTS_DIR / "evaluation_summary.csv"

            with open(export_json, "w", encoding="utf-8") as f:
                json.dump(summary, f, ensure_ascii=False, indent=2)

            # Buat CSV sederhana
            with open(export_csv, "w", encoding="utf-8") as f:
                f.write("Metode,Hit Rate@K,MRR,Rata-rata Waktu (detik)\n")
                sb = summary["sbert_metrics"]
                bm = summary["bm25_metrics"]
                f.write(f"Sentence-BERT (Dense),{sb['hit_rate']},{sb['mrr']},{sb['avg_latency_sec']}\n")
                f.write(f"BM25 (Sparse),{bm['hit_rate']},{bm['mrr']},{bm['avg_latency_sec']}\n")
            print(f"[EvaluationService] Hasil berhasil diekspor ke {export_json} dan {export_csv}")
        except Exception as e:
            print(f"[EvaluationService] Gagal mengekspor hasil evaluasi: {e}")

evaluation_service = EvaluationService()
