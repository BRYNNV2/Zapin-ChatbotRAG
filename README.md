# ZapinAI Cultural Assistant (RAG + Sentence-BERT)

[![Python](https://img.shields.io/badge/Python-3.11%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev/)
[![Sentence-BERT](https://img.shields.io/badge/Sentence--BERT-MiniLM--L12-FF9900.svg)](https://www.sbert.net/)
[![License](https://img.shields.io/badge/License-Academic-lightgrey.svg)]()

> **Proyek Skripsi**: *"Pengembangan AI Cultural Assistant Berbasis Retrieval-Augmented Generation dengan Dense Semantic Retrieval Menggunakan Sentence-BERT untuk Akses Pengetahuan Budaya Zapin Tervalidasi"*

Aplikasi web AI Cultural Assistant yang menggabungkan metode **Dense Semantic Retrieval (Sentence-BERT)** dan **Retrieval-Augmented Generation (RAG)** untuk menyajikan informasi dan pengetahuan otentik mengenai seni dan budaya **Tari Zapin Melayu** yang telah divalidasi oleh pakar budaya, dilengkapi pelacakan sitasi (*source traceability*) dan modul komparasi riset skripsi.

---

## 🏛️ Fitur Utama

1. **Dense Semantic Retrieval (Sentence-BERT)**
   - Menggunakan model `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` (384 dimensi) dengan normalisasi L2.
   - Mengukur kedekatan semantik kueri dengan representasi vektor korpus dokumen budaya Zapin menggunakan *Cosine Similarity*.
2. **Keterlacakan Sumber Terverifikasi (Source Traceability)**
   - Setiap respon memetakan fakta ke lencana sitasi interaktif `[1]`, `[2]`.
   - Mengklik sitasi membuka *Source Reference Drawer* yang menampilkan potongan teks kutipan asli, nomor halaman buku, skor kemiripan semantik, dan identitas pakar validator (misal: *Maestro Tari Tradisi Zapin Siak*).
3. **Pangkalan Dokumen & Ingestion Multi-Format**
   - Mendukung pembacaan naskah/dokumen berformat **PDF** (`pypdf`), **DOCX** (`python-docx`), serta **TXT**.
   - Dilengkapi *sliding window text chunking* dengan *overlap* dan pelabelan pakar validator.
4. **Dashboard Evaluasi & Riset Skripsi (Bab IV)**
   - Pengujian kuantitatif otomatis: **Hit Rate@K**, **Mean Reciprocal Rank (MRR)**, dan **Latensi Komputasi**.
   - Perbandingan komparatif 3 metode:
     - **Metode Usulan**: Dense Semantic RAG (Sentence-BERT)
     - **Baseline 1**: Sparse Lexical Retrieval (BM25 Okapi)
     - **Baseline 2**: Raw LLM (Generasi Parametrik Tanpa RAG)
   - Fitur **Uji Komparasi Langsung Berdampingan (*Side-by-Side*)** dan ekspor hasil pengujian ke CSV/JSON di folder `evaluation_results/`.
5. **Antarmuka Modern Melayu Kontemporer**
   - Dibangun dengan React + Vite bertema *Royal Obsidian* (`#070B14`), *Melayu Songket Gold* (`#D4AF37`), dan *Riau Emerald* (`#10B981`) dengan efek *Glassmorphism*.

---

## 🚀 Panduan Instalasi & Menjalankan

### 1. Kloning Repositori
```bash
git clone https://github.com/BRYNNV2/Zapin-ChatbotRAG.git
cd Zapin-ChatbotRAG
```

### 2. Penyiapan Backend (FastAPI)
```bash
# Masuk ke direktori root dan buat virtual environment
python -m venv backend/venv

# Aktivasi virtual environment (Windows PowerShell):
.\backend\venv\Scripts\Activate.ps1
# Atau di Linux/macOS:
# source backend/venv/bin/activate

# Instal dependensi Python
pip install -r backend/requirements.txt

# (Opsional) Salin konfigurasi environment
cp backend/.env.example backend/.env

# Jalankan server backend
python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000
```
Backend akan aktif di `http://127.0.0.1:8000`. Dokumentasi interaktif Swagger API dapat diakses di `http://127.0.0.1:8000/docs`.

### 3. Penyiapan Frontend (React + Vite)
Buka terminal baru:
```bash
cd frontend

# Instal dependensi Node.js
npm install

# Jalankan server development Vite
npx vite --port 5173 --host 127.0.0.1
```
Aplikasi frontend akan aktif di `http://127.0.0.1:5173`.
