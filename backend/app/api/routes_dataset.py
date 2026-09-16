import shutil
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.core.config import settings
from app.services.document_loader import document_loader
from app.services.chunking_service import chunking_service
from app.services.embedding_service import embedding_service
from app.services.vector_store import vector_store

router = APIRouter(prefix="/dataset", tags=["Dataset & Ingestion"])

@router.get("/documents")
async def get_indexed_documents():
    """Mendapatkan daftar dokumen dan status metadata yang telah tersimpan di Vector Store."""
    indexed_files = vector_store.get_indexed_files()
    return {
        "total_documents": len(indexed_files),
        "total_chunks": len(vector_store.documents),
        "documents": indexed_files
    }

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    validator_name: Optional[str] = Form(None),
    category: Optional[str] = Form("Umum Budaya Zapin")
):
    """Mengunggah file (PDF, DOCX, TXT) dokumen Zapin, mengekstrak teks,
    memecah menjadi chunk semantik, menghasilkan embedding Sentence-BERT, dan menyimpannya di Vector DB.
    """
    allowed_exts = [".pdf", ".docx", ".doc", ".txt", ".md"]
    file_ext = Path(file.filename).suffix.lower()

    if file_ext not in allowed_exts:
        raise HTTPException(
            status_code=400,
            detail=f"Format file '{file_ext}' tidak didukung. Harap unggah format {', '.join(allowed_exts)}."
        )

    # Simpan file ke folder raw_documents
    settings.RAW_DOCS_DIR.mkdir(parents=True, exist_ok=True)
    saved_file_path = settings.RAW_DOCS_DIR / file.filename

    try:
        with open(saved_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal menyimpan file: {e}")

    # 1. Ekstraksi dokumen per halaman
    try:
        pages = document_loader.load_document(saved_file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal mengekstrak teks dokumen: {e}")

    if not pages:
        raise HTTPException(status_code=400, detail="Tidak ada teks yang dapat diekstrak dari dokumen tersebut.")

    # 2. Chunking teks
    validator = validator_name.strip() if (validator_name and validator_name.strip()) else settings.DEFAULT_VALIDATOR
    chunks = chunking_service.process_pages(pages, validator_name=validator, default_category=category)

    if not chunks:
        raise HTTPException(status_code=400, detail="Gagal membagi dokumen menjadi potongan semantik.")

    # 3. Dense Embedding Sentence-BERT
    chunk_texts = [c["text"] for c in chunks]
    embeddings = embedding_service.encode_texts(chunk_texts)

    # 4. Simpan ke Vector Store
    vector_store.add_documents(chunks, embeddings)

    return {
        "status": "success",
        "message": f"Dokumen '{file.filename}' berhasil diindeks ke pangkalan data pengetahuan Zapin.",
        "file_name": file.filename,
        "total_pages": len(pages),
        "total_chunks_created": len(chunks),
        "validator": validator
    }

@router.post("/seed_starter")
async def seed_starter_zapin_knowledge():
    """Mengisi pangkalan data awal dengan materi referensi Budaya Zapin yang tervalidasi pakar."""
    sample_data = [
        {
            "text": (
                "Tari Zapin merupakan salah satu tarian rumpun Melayu yang sarat akan nilai Islam dan filosofi adab. "
                "Secara etimologi, kata 'Zapin' berakar dari bahasa Arab 'Zaffan' yang bermakna derap atau gerak langkah kaki yang cepat "
                "mengikuti ketukan tempo musik pengiring. Awal mulanya, kesenian ini dibawa oleh para pedagang dan da'i dari wilayah Hadramaut, "
                "Yaman, sekitar abad ke-16 menuju pesisir Selat Malaka dan Kepulauan Riau."
            ),
            "document_name": "Ensiklopedia_Tradisi_Zapin_Melayu.pdf",
            "page_number": 12,
            "total_pages": 150,
            "validator_name": "Prof. Dr. Budayawan Melayu & Pakar Zapin Riau",
            "cultural_category": "Sejarah & Nilai Filosofis"
        },
        {
            "text": (
                "Struktur ragam gerak Tari Zapin umumnya dimulai dengan gerak Tahto (atau Langkah Tahto). "
                "Gerak Tahto berfungsi sebagai ragam pembuka yang dilakukan dengan posisi tubuh merendah, langkah tenang, dan tatapan bersahaja. "
                "Makna filosofis dari gerak Tahto adalah perwujudan sikap rendah hati (tawadhu'), penghormatan kepada para penonton dan tetua, "
                "serta kepatuhan seorang hamba kepada Sang Pencipta sebelum melangkah ke dinamika kehidupan."
            ),
            "document_name": "Ragam_Koreografi_Zapin_Tradisional.pdf",
            "page_number": 34,
            "total_pages": 88,
            "validator_name": "Maestro Tari Tradisi Zapin Siak",
            "cultural_category": "Ragam & Struktur Gerak Zapin"
        },
        {
            "text": (
                "Setelah ragam Tahto, terdapat ragam gerak Pecah yang menandai perubahan tempo menjadi lebih dinamis dan lincah. "
                "Gerak Pecah melambangkan kelincahan akal, ketangkasan fisik, dan daya adaptasi masyarakat Melayu dalam menghadapi tantangan zaman. "
                "Di akhir tarian, penari melakukan ragam gerak Tahtim (atau Penutup) yang ditandai dengan gerak sujud sembah atau salam takzim, "
                "menegaskan bahwa segala perbuatan manusia harus ditutup dengan rasa syukur dan doa."
            ),
            "document_name": "Ragam_Koreografi_Zapin_Tradisional.pdf",
            "page_number": 48,
            "total_pages": 88,
            "validator_name": "Maestro Tari Tradisi Zapin Siak",
            "cultural_category": "Ragam & Struktur Gerak Zapin"
        },
        {
            "text": (
                "Musik pengiring utama tari Zapin terdiri atas instrumen Gambus dan Marwas. "
                "Gambus berfungsi sebagai pembawa melodi lagu-lagu Melayu bernuansa padang pasir dan syair nasehat, "
                "sedangkan Marwas adalah gendang kecil berkepala dua (double-headed drum) berjumlah 3 hingga 4 buah yang dipukul "
                "dengan pola ritmis sinkopasi yang sangat rapat dan bersemangat untuk memandu ketukan langkah kaki penari."
            ),
            "document_name": "Organologi_Instrumen_Musik_Melayu.pdf",
            "page_number": 21,
            "total_pages": 75,
            "validator_name": "Pakar Etnomusikologi Melayu",
            "cultural_category": "Musik & Iringan Tradisi"
        },
        {
            "text": (
                "Tata busana penari Zapin berpegang teguh pada etika kesopanan adat Melayu. "
                "Bagi penari pria, busana yang dikenakan adalah Baju Kurung Cekak Musang atau Teluk Belanga, "
                "dipadukan dengan celana panjang, kain Samping berbahan Songket tenun khas Melayu yang dilipat setinggi lutut, "
                "serta penutup kepala berupa Tanjak atau Songkok hitam yang melambangkan marwah dan kehormatan diri."
            ),
            "document_name": "Adat_dan_Tata_Busana_Melayu_Riau.pdf",
            "page_number": 56,
            "total_pages": 110,
            "validator_name": "Lembaga Adat Melayu (LAM) Riau",
            "cultural_category": "Busana, Etika & Adat"
        }
    ]

    import hashlib
    chunks = []
    for idx, item in enumerate(sample_data):
        id_raw = f"{item['document_name']}_p{item['page_number']}_seed_{idx}"
        chunk_id = hashlib.md5(id_raw.encode("utf-8")).hexdigest()[:12]
        chunks.append({
            "chunk_id": chunk_id,
            "text": item["text"],
            "document_name": item["document_name"],
            "page_number": item["page_number"],
            "total_pages": item["total_pages"],
            "validator_name": item["validator_name"],
            "cultural_category": item["cultural_category"],
            "char_count": len(item["text"])
        })

    chunk_texts = [c["text"] for c in chunks]
    embeddings = embedding_service.encode_texts(chunk_texts)
    vector_store.add_documents(chunks, embeddings)

    return {
        "status": "success",
        "message": f"Berhasil memasukkan {len(chunks)} modul pengetahuan dasar Budaya Zapin tervalidasi pakar.",
        "total_chunks": len(vector_store.documents)
    }

@router.post("/clear")
async def clear_all_documents():
    """Mengosongkan seluruh pangkalan data vektor dan riwayat dokumen."""
    vector_store.clear()
    return {"status": "success", "message": "Pangkalan data pengetahuan berhasil dikosongkan."}
