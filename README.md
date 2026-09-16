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

## 📂 Struktur Repositori

```
ChatbotRAG/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes_chat.py         # Endpoint kueri RAG, saran, dan dialog
│   │   │   ├── routes_dataset.py      # Endpoint upload & ingestion PDF/DOCX
│   │   │   └── routes_evaluation.py   # Endpoint benchmark & evaluasi skripsi
│   │   ├── core/
│   │   │   ├── config.py              # Konfigurasi parameter SBERT, RAG, path
│   │   │   └── prompts.py             # Prompt persona budaya & sitasi ketat
│   │   ├── services/
│   │   │   ├── document_loader.py     # Parser multi-format (PDF, DOCX, TXT)
│   │   │   ├── chunking_service.py    # Recursive chunking & metadata pakar
│   │   │   ├── embedding_service.py   # Sentence-BERT dense encoder
│   │   │   ├── vector_store.py        # Persistent vector store Cosine Similarity
│   │   │   ├── rag_service.py         # Pipeline retrieval-augmented generator
│   │   │   ├── baseline_service.py    # Baseline BM25 Okapi & No-RAG
│   │   │   └── evaluation_service.py  # Kalkulasi Hit@K, MRR, dan ekspor CSV
│   │   └── main.py                    # Server FastAPI entrypoint
│   ├── data/
│   │   ├── raw_documents/             # File sumber PDF/DOCX
│   │   ├── processed/                 # Indeks vektor & metadata persisten
│   │   └── benchmark_queries.json     # Dataset pertanyaan uji ground truth
│   ├── .env.example                   # Contoh konfigurasi environment
│   ├── requirements.txt               # Dependensi Python
│   └── test_pipeline.py               # Skrip verifikasi pipeline backend
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatContainer.jsx          # Area dialog & rendering sitasi
│   │   │   ├── ChatHistorySidebar.jsx     # Sidebar sesi percakapan lokal
│   │   │   ├── SourceReferenceDrawer.jsx # Panel samping kutipan asli & pakar
│   │   │   ├── DocumentManager.jsx        # Tab upload PDF/DOCX & validator
│   │   │   ├── EvaluationDashboard.jsx    # Dashboard metrik riset Bab IV
│   │   │   └── CulturalThemeHeader.jsx    # Header bertema Zapin Melayu
│   │   ├── styles/
│   │   │   └── index.css                  # Custom design system Melayu modern
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── evaluation_results/                    # Hasil ekspor evaluasi skripsi (CSV/JSON)
```

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

---

## 📊 Hasil Evaluasi Riset Skripsi

Berdasarkan pengujian dataset kueri uji budaya Zapin (*ground truth evaluation*):

| Metode Pengujian | Hit Rate@3 | Mean Reciprocal Rank (MRR) | Rata-rata Latensi | Keterlacakan Sumber |
| :--- | :---: | :---: | :---: | :---: |
| **Sentence-BERT Dense RAG (Usulan)** | **100% (1.000)** | **1.0000** | **~0.12 dtk** | **100% (Tervalidasi Pakar)** |
| **BM25 Sparse Retrieval (Baseline)** | 100% (1.000) | 1.0000 | ~0.001 dtk | 100% |
| **Raw LLM Parametrik (Baseline)** | N/A | N/A | ~0.01 dtk | **0% (Tidak Terlacak)** |

---

## 👥 Kontributor
- **Pengembang & Peneliti**: BRYNNV2
- **Tujuan**: Skripsi Sarjana Komputer / Teknologi Informasi
