import os
from pathlib import Path
from typing import List, Dict, Any
from datetime import datetime

class DocumentLoaderService:
    """Service untuk memuat dokumen dari berbagai format (PDF, DOCX, TXT, MD)
    dan mengekstrak teks beserta metadata halaman dan sumber.
    """

    @staticmethod
    def load_pdf(file_path: Path) -> List[Dict[str, Any]]:
        """Membaca dokumen PDF per halaman."""
        import pypdf
        pages_content = []
        try:
            reader = pypdf.PdfReader(str(file_path))
            total_pages = len(reader.pages)
            for page_idx, page in enumerate(reader.pages):
                text = page.extract_text() or ""
                clean_text = text.strip()
                if clean_text:
                    pages_content.append({
                        "text": clean_text,
                        "page_number": page_idx + 1,
                        "total_pages": total_pages,
                        "file_name": file_path.name,
                        "file_path": str(file_path),
                        "file_type": "pdf"
                    })
        except Exception as e:
            print(f"[DocumentLoader] Error reading PDF {file_path}: {e}")
            raise e
        return pages_content

    @staticmethod
    def load_docx(file_path: Path) -> List[Dict[str, Any]]:
        """Membaca dokumen DOCX per paragraf atau blok naskah."""
        import docx
        pages_content = []
        try:
            doc = docx.Document(str(file_path))
            full_text = []
            for p in doc.paragraphs:
                if p.text.strip():
                    full_text.append(p.text.strip())
            
            # Estimasi pembagian per 400 kata sebagai representasi halaman virtual
            words_per_virtual_page = 400
            current_page_words = []
            virtual_pages = []
            
            for para in full_text:
                words = para.split()
                current_page_words.extend(words)
                if len(current_page_words) >= words_per_virtual_page:
                    virtual_pages.append(" ".join(current_page_words))
                    current_page_words = []
            
            if current_page_words:
                virtual_pages.append(" ".join(current_page_words))
            
            total_pages = max(1, len(virtual_pages))
            for idx, text in enumerate(virtual_pages):
                pages_content.append({
                    "text": text,
                    "page_number": idx + 1,
                    "total_pages": total_pages,
                    "file_name": file_path.name,
                    "file_path": str(file_path),
                    "file_type": "docx"
                })
        except Exception as e:
            print(f"[DocumentLoader] Error reading DOCX {file_path}: {e}")
            raise e
        return pages_content

    @staticmethod
    def load_txt(file_path: Path) -> List[Dict[str, Any]]:
        """Membaca file teks biasa / markdown."""
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read().strip()
            
            # Pisahkan per bab / section atau halaman virtual jika panjang
            paragraphs = [p.strip() for p in content.split("\n\n") if p.strip()]
            
            return [{
                "text": content,
                "page_number": 1,
                "total_pages": 1,
                "file_name": file_path.name,
                "file_path": str(file_path),
                "file_type": file_path.suffix.replace(".", "")
            }]
        except Exception as e:
            print(f"[DocumentLoader] Error reading TXT {file_path}: {e}")
            raise e

    @classmethod
    def load_document(cls, file_path: Path) -> List[Dict[str, Any]]:
        """Dispatcher umum untuk berbagai format dokumen."""
        suffix = file_path.suffix.lower()
        if suffix == ".pdf":
            return cls.load_pdf(file_path)
        elif suffix in [".docx", ".doc"]:
            return cls.load_docx(file_path)
        elif suffix in [".txt", ".md"]:
            return cls.load_txt(file_path)
        else:
            raise ValueError(f"Format file '{suffix}' tidak didukung. Format yang didukung: PDF, DOCX, TXT, MD.")

document_loader = DocumentLoaderService()
