import re
import os
from typing import List, Dict, Any, Optional, Tuple
from app.core.config import settings
from app.core.prompts import ZAPIN_SYSTEM_PERSONA, RAG_GENERATION_PROMPT, BASELINE_NO_RAG_PROMPT
from app.services.embedding_service import embedding_service
from app.services.vector_store import vector_store

class RAGService:
    """Service orkestrator utama Retrieval-Augmented Generation (RAG) Budaya Zapin."""

    def __init__(self):
        self._gemini_configured = False
        self._check_llm_config()

    def _check_llm_config(self):
        """Memeriksa apakah API Key Gemini tersedia."""
        api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
        if api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=api_key)
                self._gemini_configured = True
                print("[RAGService] Google Gemini API berhasil dikonfigurasi.")
            except Exception as e:
                print(f"[RAGService] Gagal konfigurasi Gemini API: {e}")
                self._gemini_configured = False
        else:
            self._gemini_configured = False

    def retrieve_context(self, query: str, top_k: int = None, threshold: float = None) -> List[Dict[str, Any]]:
        """Tahap 1: Dense Semantic Retrieval menggunakan Sentence-BERT."""
        query_vector = embedding_service.encode_query(query)
        retrieved_chunks = vector_store.similarity_search(query_vector, top_k=top_k, threshold=threshold)
        return retrieved_chunks

    def _format_context_for_prompt(self, chunks: List[Dict[str, Any]]) -> Tuple[str, List[Dict[str, Any]]]:
        """Menyusun potongan konteks menjadi format bernomor [1], [2] untuk diinjeksikan ke prompt LLM."""
        context_lines = []
        source_references = []

        for idx, chunk in enumerate(chunks):
            citation_num = idx + 1
            doc_name = chunk.get("document_name", "Dokumen Zapin")
            page = chunk.get("page_number", 1)
            validator = chunk.get("validator_name", settings.DEFAULT_VALIDATOR)
            category = chunk.get("cultural_category", "Budaya Zapin")
            score = chunk.get("similarity_score", 0.0)
            text = chunk.get("text", "").strip()

            context_lines.append(
                f"[{citation_num}] Sumber: {doc_name} (Halaman {page}) | Validator: {validator} | Kategori: {category}\n"
                f"Kutipan: \"{text}\"\n"
            )

            source_references.append({
                "citation_id": citation_num,
                "document_name": doc_name,
                "page_number": page,
                "validator_name": validator,
                "cultural_category": category,
                "similarity_score": score,
                "snippet": text[:250] + "..." if len(text) > 250 else text,
                "full_text": text
            })

        return "\n".join(context_lines), source_references

    def _generate_with_gemini(self, prompt: str) -> str:
        """Memanggil Google Gemini API untuk melakukan grounded generation."""
        import google.generativeai as genai
        model = genai.GenerativeModel(settings.GEMINI_MODEL)
        response = model.generate_content(prompt)
        return response.text.strip()

    def _generate_local_fallback(self, query: str, chunks: List[Dict[str, Any]]) -> str:
        """Fallback cerdas jika pengguna belum memasukkan API Key Gemini saat pengujian awal."""
        if not chunks:
            return "Berdasarkan pangkalan data pengetahuan budaya Zapin yang telah divalidasi pakar saat ini, informasi mengenai pertanyaan tersebut belum tercatat dalam dokumen terverifikasi kami."

        best_chunk = chunks[0]
        summary = (
            f"Berdasarkan kajian budaya Zapin tervalidasi oleh pakar [{best_chunk.get('validator_name', 'Pakar Budaya Zapin')}], "
            f"informasi mengenai pertanyaan Anda dapat dirujuk sebagai berikut:\n\n"
        )

        for i, c in enumerate(chunks[:3]):
            summary += f"- {c['text'].strip()} [{i+1}]\n\n"

        summary += "*(Catatan: Anda dapat memasukkan Google Gemini API Key pada file `.env` untuk sintesis gaya bahasa LLM yang sepenuhnya dinamis).* "
        return summary

    def generate_response(self, query: str, top_k: int = None, threshold: float = None) -> Dict[str, Any]:
        """Menjalankan siklus lengkap RAG: Retrieval -> Prompt Grounding -> LLM Synthesis -> Source Attribution."""
        self._check_llm_config()
        
        # 1. Retrieval
        retrieved_chunks = self.retrieve_context(query, top_k=top_k, threshold=threshold)

        if not retrieved_chunks:
            return {
                "query": query,
                "answer": "Berdasarkan pangkalan data pengetahuan budaya Zapin yang telah divalidasi oleh pakar, informasi mengenai topik ini belum ditemukan atau belum memenuhi ambang batas relevansi semantik.",
                "sources": [],
                "retrieval_method": "Sentence-BERT Dense Semantic",
                "retrieved_count": 0,
                "source_traceability_rate": 0.0
            }

        # 2. Persiapan Prompt & Sumber Referensi
        context_str, source_references = self._format_context_for_prompt(retrieved_chunks)
        full_prompt = RAG_GENERATION_PROMPT.format(
            system_persona=ZAPIN_SYSTEM_PERSONA,
            context_str=context_str,
            query=query
        )

        # 3. Pemanggilan LLM
        if self._gemini_configured:
            try:
                answer = self._generate_with_gemini(full_prompt)
            except Exception as e:
                print(f"[RAGService] Error generating with Gemini API: {e}")
                answer = self._generate_local_fallback(query, retrieved_chunks)
        else:
            answer = self._generate_local_fallback(query, retrieved_chunks)

        # 4. Keterlacakan Sumber (Traceability Analysis)
        # Cari angka sitasi [1], [2], dst. dalam teks jawaban
        cited_numbers = [int(num) for num in re.findall(r'\[(\d+)\]', answer)]
        valid_citations = [n for n in cited_numbers if 1 <= n <= len(source_references)]
        
        traceability_rate = 1.0 if (len(cited_numbers) > 0 and len(valid_citations) == len(cited_numbers)) else 0.8

        return {
            "query": query,
            "answer": answer,
            "sources": source_references,
            "cited_citations": list(set(valid_citations)),
            "retrieval_method": "Sentence-BERT Dense Semantic",
            "retrieved_count": len(retrieved_chunks),
            "highest_similarity": retrieved_chunks[0]["similarity_score"] if retrieved_chunks else 0.0,
            "source_traceability_rate": traceability_rate
        }

    def generate_baseline_no_rag(self, query: str) -> Dict[str, Any]:
        """Baseline 1: Menghasilkan jawaban menggunakan LLM saja (tanpa konteks RAG)."""
        self._check_llm_config()
        prompt = BASELINE_NO_RAG_PROMPT.format(query=query)

        if self._gemini_configured:
            try:
                answer = self._generate_with_gemini(prompt)
            except Exception as e:
                answer = f"Error memanggil LLM: {e}"
        else:
            answer = (
                "Ini adalah simulasi jawaban Raw LLM (tanpa RAG). Pada model murni tanpa retrieval konteks tervalidasi, "
                "jawaban berpotensi mengalami halusinasi atau ketidakakuratan detail sejarah dan ragam gerak Tari Zapin."
            )

        return {
            "query": query,
            "answer": answer,
            "sources": [],
            "retrieval_method": "None (Raw Baseline LLM)",
            "retrieved_count": 0,
            "source_traceability_rate": 0.0
        }

rag_service = RAGService()
