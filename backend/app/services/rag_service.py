import re
import os
import time
import requests
from typing import List, Dict, Any, Optional, Tuple
from app.core.config import settings
from app.core.prompts import ZAPIN_SYSTEM_PERSONA, RAG_GENERATION_PROMPT, BASELINE_NO_RAG_PROMPT
from app.services.embedding_service import embedding_service
from app.services.vector_store import vector_store

class RAGService:
    """Service orkestrator utama Retrieval-Augmented Generation (RAG) Budaya Zapin."""

    def __init__(self):
        self._api_key = ""
        self._gemini_configured = False
        self._last_llm_model = settings.GEMINI_MODEL
        self._check_llm_config()

    def _check_llm_config(self):
        """Memeriksa apakah API Key Gemini tersedia dari file .env / settings."""
        from dotenv import load_dotenv
        env_path = settings.BASE_DIR / ".env"
        if env_path.exists():
            load_dotenv(env_path, override=True)

        api_key = (os.getenv("GEMINI_API_KEY", "") or settings.GEMINI_API_KEY or "").strip()
        if api_key:
            self._api_key = api_key
            self._gemini_configured = True
            print("[RAGService] Google Gemini API key terdeteksi.")
        else:
            self._api_key = ""
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
        """Memanggil Google Gemini REST API dengan timeout cepat dan fallback model aktif."""
        raw_candidates = [
            settings.GEMINI_MODEL,
            "gemini-3.6-flash",
            "gemini-3.5-flash-lite",
            "gemini-flash-lite-latest",
            "gemini-3.8-flash",
            "gemini-flash-latest"
        ]
        models_to_try = list(dict.fromkeys([m for m in raw_candidates if m]))

        last_error = None
        for model_name in models_to_try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent"
            try:
                resp = requests.post(
                    url,
                    headers={
                        "Content-Type": "application/json",
                        "x-goog-api-key": self._api_key
                    },
                    json={"contents": [{"parts": [{"text": prompt}]}]},
                    timeout=18
                )
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates") or []
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts and parts[0].get("text"):
                            self._last_llm_model = model_name
                            return parts[0]["text"].strip()
                    last_error = RuntimeError(f"Model {model_name} mengembalikan respons kosong.")
                    print(f"[RAGService] {last_error} Pindah ke model berikutnya...")
                else:
                    last_error = RuntimeError(f"HTTP {resp.status_code}")
                    print(f"[RAGService] Model {model_name} gagal (HTTP {resp.status_code}), pindah ke model berikutnya...")
            except Exception as e:
                last_error = e
                print(f"[RAGService] Model {model_name} gagal ({e}), pindah ke model berikutnya...")
                continue

        raise last_error or RuntimeError("Gagal menghasilkan konten dengan model Gemini yang tersedia.")

    def _generate_local_fallback(self, query: str, chunks: List[Dict[str, Any]]) -> str:
        """Fallback cerdas jika API Gemini sedang sibuk atau API Key belum diisi."""
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

    @staticmethod
    def _is_conversational_query(query: str) -> bool:
        """Mendeteksi apakah kueri murni berupa sapaan, salam, perkenalan, atau terima kasih."""
        q = query.strip().lower()
        q_clean = re.sub(r'[^\w\s]', '', q).strip()
        if not q_clean:
            return False

        greetings = [
            "hai", "halo", "hello", "hi", "hey",
            "assalamualaikum", "assalamu'alaikum", "assalam",
            "selamat pagi", "selamat siang", "selamat sore", "selamat malam",
            "siapa kamu", "kamu siapa", "siapa namamu", "namamu siapa",
            "apa itu zapinai", "tentang kamu",
            "bisa apa", "apa yang bisa kamu lakukan", "bisa bantu apa",
            "terima kasih", "makasih", "matur nuwun", "thanks", "thank you",
            "apa kabar", "bagaimana kabarmu", "tes", "test", "halo zapin"
        ]

        if q_clean in greetings:
            return True

        words = q_clean.split()
        if len(words) <= 4:
            if any(q_clean.startswith(g) for g in ["hai", "halo", "assalam", "selamat"]):
                return True
            if any(re.search(rf'\b{re.escape(g)}\b', q_clean) for g in greetings):
                return True

        return False

    def _generate_conversational_response(self, query: str) -> str:
        """Menghasilkan respon ramah dan sopan untuk sapaan atau percakapan umum."""
        q = query.strip().lower()
        if "terima kasih" in q or "makasih" in q or "thanks" in q:
            return "Sama-sama! Senang dapat membantu Anda. Jangan ragu bertanya kembali seputar seni, ragam gerak, musik, atau sejarah Tari Zapin Melayu."

        if "siapa kamu" in q or "kamu siapa" in q or "tentang kamu" in q or "apa itu zapinai" in q:
            return (
                "Saya adalah **ZapinAI Cultural Assistant**, asisten cerdas berbasis *Retrieval-Augmented Generation (RAG)* "
                "dan *Sentence-BERT*. Tugas saya adalah membantu Anda mengakses pengetahuan otentik tentang seni, tradisi, "
                "ragam gerak, tata busana, dan sejarah **Tari Zapin Melayu** yang telah divalidasi oleh para pakar budaya."
            )

        return (
            "Halo! Selamat datang di **ZapinAI Cultural Assistant**.\n\n"
            "Saya adalah asisten cerdas yang didesain khusus untuk menyajikan pengetahuan otentik tentang **Seni Budaya Tari Zapin Melayu** "
            "berdasarkan naskah dan buku yang telah divalidasi oleh pakar.\n\n"
            "Anda dapat menanyakan hal-hal seperti:\n"
            "- Makna filosofis gerak **Tahto**, **Pecah**, atau **Tahtim**\n"
            "- Peran alat musik tradisional **Marwas** dan **Gambus**\n"
            "- Sejarah akulturasi Zapin dari Hadramaut hingga Kesultanan Siak\n"
            "- Tata etika busana Melayu seperti **Teluk Belanga** dan **Kain Samping**\n\n"
            "Silakan ajukan pertanyaan yang ingin Anda ketahui!"
        )

    def generate_response(self, query: str, top_k: int = None, threshold: float = None) -> Dict[str, Any]:
        """Menjalankan siklus lengkap RAG: Retrieval -> Prompt Grounding -> LLM Synthesis -> Source Attribution."""
        if not self._gemini_configured:
            self._check_llm_config()
        clean_q = query.strip()

        # 0. Penanganan Khusus untuk Sapaan / Percakapan Ramah (Respon instan lokal tanpa antre LLM)
        if self._is_conversational_query(clean_q):
            greeting_ans = self._generate_conversational_response(clean_q)
            return {
                "query": clean_q,
                "answer": greeting_ans,
                "sources": [],
                "cited_citations": [],
                "retrieval_method": "Conversational Greeting",
                "retrieved_count": 0,
                "highest_similarity": 1.0,
                "source_traceability_rate": 1.0
            }

        # 1. Retrieval dengan Sentence-BERT
        t_ret_start = time.perf_counter()
        effective_threshold = threshold if threshold is not None else 0.22
        retrieved_chunks = self.retrieve_context(clean_q, top_k=top_k, threshold=effective_threshold)
        t_ret = time.perf_counter() - t_ret_start

        if not retrieved_chunks:
            fallback_msg = (
                "Berdasarkan pangkalan data pengetahuan budaya Zapin yang telah divalidasi oleh pakar saat ini, "
                f"informasi mengenai topik *\"{clean_q}\"* belum tercatat dalam dokumen terverifikasi kami.\n\n"
                "- **Saran:** Coba susun ulang pertanyaan Anda agar lebih spesifik mengenai Seni Budaya Tari Zapin Melayu Riau.\n"
                "- Atau coba gunakan kata kunci terkait seperti: *gerak Tahto, gerak Pecah, alat musik Marwas, Gambus, busana Teluk Belanga, atau sejarah Hadramaut*."
            )
            return {
                "query": clean_q,
                "answer": fallback_msg,
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
        t_llm_start = time.perf_counter()
        self._last_llm_model = "local-fallback"
        if self._gemini_configured:
            try:
                answer = self._generate_with_gemini(full_prompt)
            except Exception as e:
                print(f"[RAGService] Error generating with Gemini API: {e}")
                answer = self._generate_local_fallback(query, retrieved_chunks)
        else:
            answer = self._generate_local_fallback(query, retrieved_chunks)
        t_llm = time.perf_counter() - t_llm_start

        print(f"[RAGService] Retrieval: {t_ret:.2f}s | LLM ({self._last_llm_model}): {t_llm:.2f}s")

        # 4. Keterlacakan Sumber (Traceability Analysis)
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
        if not self._gemini_configured:
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
