import re
import hashlib
from typing import List, Dict, Any
from app.core.config import settings

class ChunkingService:
    """Service untuk memecah teks dokumen menjadi chunk-chunk semantik
    dengan sliding window dan overlap, serta menyematkan metadata validasi pakar.
    """

    def __init__(self, chunk_size: int = None, chunk_overlap: int = None):
        self.chunk_size = chunk_size or settings.CHUNK_SIZE
        self.chunk_overlap = chunk_overlap or settings.CHUNK_OVERLAP

    def _split_text_into_chunks(self, text: str) -> List[str]:
        """Memecah teks menjadi potongan berdasarkan batas kalimat/paragraf dengan overlap."""
        # Normalisasi spasi dan baris baru
        text = re.sub(r'\s+', ' ', text).strip()
        if not text:
            return []

        if len(text) <= self.chunk_size:
            return [text]

        chunks = []
        start = 0
        text_length = len(text)

        while start < text_length:
            end = start + self.chunk_size

            # Jika end belum di akhir teks, cari pemisah kalimat (titik, tanda seru, tanya)
            if end < text_length:
                # Cari batas kalimat terdekat dalam rentang 80 karakter terakhir dari chunk
                search_sub = text[max(start, end - 80):end]
                match = list(re.finditer(r'([.!?]\s+)', search_sub))
                if match:
                    last_punct = match[-1].end()
                    end = max(start, end - 80) + last_punct
                else:
                    # Jika tidak ada tanda baca, cari spasi terdekat agar tidak memotong kata
                    last_space = text.rfind(' ', start, end)
                    if last_space > start:
                        end = last_space

            chunk_content = text[start:end].strip()
            if chunk_content:
                chunks.append(chunk_content)

            # Geser window dengan mempertimbangkan overlap
            step = (end - start) - self.chunk_overlap
            if step <= 0:
                step = self.chunk_size // 2
            start += step

        return chunks

    def process_pages(self, pages: List[Dict[str, Any]], validator_name: str = None, default_category: str = "Umum Budaya Zapin") -> List[Dict[str, Any]]:
        """Mengonversi daftar halaman menjadi sekumpulan chunk siap-embed dengan metadata kaya."""
        all_chunks = []
        validator = validator_name or settings.DEFAULT_VALIDATOR

        for page in pages:
            raw_text = page.get("text", "")
            page_no = page.get("page_number", 1)
            file_name = page.get("file_name", "dokumen_zapin")
            total_pages = page.get("total_pages", 1)

            text_chunks = self._split_text_into_chunks(raw_text)

            for idx, chunk_text in enumerate(text_chunks):
                # Buat unique ID berdasarkan hash nama file, halaman, dan index chunk
                id_raw = f"{file_name}_p{page_no}_c{idx}_{chunk_text[:30]}"
                chunk_id = hashlib.md5(id_raw.encode("utf-8")).hexdigest()[:12]

                # Deteksi kategori budaya otomatis berdasarkan kata kunci jika memungkinkan
                category = self._detect_cultural_category(chunk_text, default_category)

                chunk_obj = {
                    "chunk_id": chunk_id,
                    "text": chunk_text,
                    "document_name": file_name,
                    "page_number": page_no,
                    "total_pages": total_pages,
                    "validator_name": validator,
                    "cultural_category": category,
                    "char_count": len(chunk_text)
                }
                all_chunks.append(chunk_obj)

        return all_chunks

    @staticmethod
    def _detect_cultural_category(text: str, default_cat: str) -> str:
        """Heuristik penentuan kategori budaya Zapin berdasarkan leksikon."""
        t = text.lower()
        if any(k in t for k in ["tahto", "pecah", "sembah", "langkah", "ragam", "gerak", "bunga"]):
            return "Ragam & Struktur Gerak Zapin"
        elif any(k in t for k in ["marwas", "gambus", "gendang", "lagu", "iringan", "tabuhan", "tempo"]):
            return "Musik & Iringan Tradisi"
        elif any(k in t for k in ["sejarah", "hadramaut", "asal usul", "penyebaran", "filosofi", "nilai", "akulturasi", "siak"]):
            return "Sejarah & Nilai Filosofis"
        elif any(k in t for k in ["busana", "kostum", "teluk belanga", "songket", "tanjak", "etika", "sopan"]):
            return "Busana, Etika & Adat"
        return default_cat

chunking_service = ChunkingService()
