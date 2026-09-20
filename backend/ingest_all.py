import os
import sys
from pathlib import Path

# Tambahkan direktori root backend ke sys.path
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

from app.core.config import settings
from app.services.document_loader import document_loader
from app.services.chunking_service import chunking_service
from app.services.embedding_service import embedding_service
from app.services.vector_store import vector_store

def ingest_all_raw_documents(validator_name: str = None, clear_existing: bool = False):
    """Memproses semua file PDF, DOCX, dan TXT yang ada di folder data/raw_documents/
    secara otomatis di belakang layar dan menyimpannya ke pangkalan data vektor permanen.
    """
    raw_dir = settings.RAW_DOCS_DIR
    raw_dir.mkdir(parents=True, exist_ok=True)
    
    supported_exts = [".pdf", ".docx", ".doc", ".txt", ".md"]
    files = [f for f in raw_dir.iterdir() if f.is_file() and f.suffix.lower() in supported_exts]

    print("================================================================")
    print("   INGESTION KNOWLEDGE BASE BUDAYA ZAPIN (BEHIND THE SCENES)    ")
    print("================================================================")
    print(f"Direktori Dokumen : {raw_dir}")
    print(f"Jumlah File Ditemukan : {len(files)}")

    if not files:
        print("\n[!] Belum ada file di backend/data/raw_documents/.")
        print("    Silakan taruh file PDF atau DOCX Anda di folder tersebut, lalu jalankan script ini kembali.")
        return

    if clear_existing:
        print("\n[*] Mengosongkan pangkalan data vektor lama...")
        vector_store.clear()

    total_new_chunks = 0
    validator = validator_name or settings.DEFAULT_VALIDATOR

    for file_path in files:
        print(f"\n[+] Memproses: {file_path.name}")
        try:
            pages = document_loader.load_document(file_path)
            print(f"    - Ekstraksi: {len(pages)} halaman/bagian.")

            chunks = chunking_service.process_pages(pages, validator_name=validator)
            print(f"    - Pemotongan: {len(chunks)} chunks semantik dibuat.")

            if chunks:
                texts = [c["text"] for c in chunks]
                embeddings = embedding_service.encode_texts(texts)
                vector_store.add_documents(chunks, embeddings)
                total_new_chunks += len(chunks)
                print(f"    - Embedding: {len(embeddings)} vektor Sentence-BERT berhasil diindeks.")
        except Exception as e:
            print(f"    [X] Gagal memproses {file_path.name}: {e}")

    print("\n================================================================")
    print(f"   SELESAI! Total Chunks Terdaftar di Sistem: {len(vector_store.documents)}")
    print(f"   Vektor tersimpan permanen di: {settings.PROCESSED_DIR}")
    print("   Siap untuk dideploy/hosting ke publik tanpa perlu upload lagi!")
    print("================================================================")

if __name__ == "__main__":
    clear = "--clear" in sys.argv
    ingest_all_raw_documents(clear_existing=clear)
