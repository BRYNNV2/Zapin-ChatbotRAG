import React from 'react';
import { X, Cpu, Sliders, Layers, Network, CheckCircle2 } from 'lucide-react';

export default function SbertPipelineModal({ isOpen, onClose, ragParams, setRagParams }) {
  if (!isOpen) return null;

  return (
    <div className="sbert-modal-overlay" onClick={onClose}>
      <aside 
        className="sbert-modal-drawer animate-slide-in-right" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sbert-modal-header">
          <div className="sbert-header-title-wrap">
            <div className="sbert-header-icon">
              <Cpu size={17} color="#d1d5db" />
            </div>
            <div>
              <h3 className="sbert-modal-heading">Pipeline Sentence-BERT</h3>
              <p className="sbert-modal-subheading">
                Spesifikasi Dense Semantic Retrieval & Kalibrasi Skripsi
              </p>
            </div>
          </div>

          <button 
            className="sbert-modal-close-btn" 
            onClick={onClose} 
            title="Tutup panel"
          >
            <X size={17} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="sbert-modal-content">
          {/* Deskripsi Arsitektur RAG */}
          <div className="sbert-info-card">
            <span className="sbert-info-title">Arsitektur Dense Retrieval</span>
            <p className="sbert-info-text">
              Sistem menggunakan representasi vektor padat (dense embedding) dari model <strong>Sentence-BERT</strong> untuk memetakan pertanyaan pengguna dan naskah budaya Zapin ke dalam ruang semantik 384 dimensi, memungkinkan pencarian berbasis makna dan konteks sejarah.
            </p>
          </div>

          {/* Tabel Parameter Teknis */}
          <div className="sbert-section-card">
            <div className="sbert-section-header">
              <Network size={15} color="#9ca3af" />
              <span>Parameter Model & Ruang Vektor</span>
            </div>

            <div className="sbert-param-list">
              <div className="sbert-param-row">
                <span className="sbert-param-label">Model Pretrained</span>
                <span className="sbert-param-value mono">paraphrase-multilingual-MiniLM-L12-v2</span>
              </div>

              <div className="sbert-param-row">
                <span className="sbert-param-label">Dimensi Embedding</span>
                <span className="sbert-param-value">384 Dimensi (Dense)</span>
              </div>

              <div className="sbert-param-row">
                <span className="sbert-param-label">Fungsi Kesamaan</span>
                <span className="sbert-param-value">Cosine Similarity (L2 Normalized)</span>
              </div>

              <div className="sbert-param-row">
                <span className="sbert-param-label">Strategi Chunking</span>
                <span className="sbert-param-value">450 Karakter (Overlap 80)</span>
              </div>

              <div className="sbert-param-row">
                <span className="sbert-param-label">Bahasa Didukung</span>
                <span className="sbert-param-value">Bahasa Indonesia, Melayu, Multilingual</span>
              </div>

              <div className="sbert-param-row">
                <span className="sbert-param-label">Format Dokumen</span>
                <span className="sbert-param-value">PDF & DOCX Terindeks</span>
              </div>
            </div>
          </div>

          {/* Pengaturan Live Parameter Retrieval */}
          <div className="sbert-section-card">
            <div className="sbert-section-header">
              <Sliders size={15} color="#9ca3af" />
              <span>Kalibrasi Eksperimen Retrieval</span>
            </div>

            <div className="sbert-calibration-wrap">
              {/* Slider Top-K */}
              <div className="sbert-slider-group">
                <div className="sbert-slider-top">
                  <span className="sbert-slider-label">Top-K Context Chunks (k):</span>
                  <span className="sbert-slider-badge">K = {ragParams.top_k}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="6"
                  value={ragParams.top_k}
                  onChange={(e) => setRagParams({ ...ragParams, top_k: parseInt(e.target.value) })}
                  className="sbert-range-input"
                />
                <div className="sbert-slider-hint">
                  Jumlah kutipan naskah teratas yang dilampirkan ke LLM untuk sintesis jawaban.
                </div>
              </div>

              {/* Slider Threshold */}
              <div className="sbert-slider-group">
                <div className="sbert-slider-top">
                  <span className="sbert-slider-label">Ambang Batas Semantik (Threshold):</span>
                  <span className="sbert-slider-badge">{ragParams.threshold}</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.60"
                  step="0.05"
                  value={ragParams.threshold}
                  onChange={(e) => setRagParams({ ...ragParams, threshold: parseFloat(e.target.value) })}
                  className="sbert-range-input"
                />
                <div className="sbert-slider-hint">
                  Batas minimum nilai Cosine Similarity agar dokumen dianggap relevan dengan kueri.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sbert-modal-footer">
          <span className="sbert-footer-note">ZapinAI • SBERT Dense Retrieval</span>
          <button className="sbert-apply-btn" onClick={onClose}>
            Selesai
          </button>
        </div>
      </aside>
    </div>
  );
}
