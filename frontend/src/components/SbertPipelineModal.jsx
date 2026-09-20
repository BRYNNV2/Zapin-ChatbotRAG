import React from 'react';
import { X, Cpu, Sparkles, CheckCircle2, Sliders, Layers, Network } from 'lucide-react';

export default function SbertPipelineModal({ isOpen, onClose, ragParams, setRagParams }) {
  if (!isOpen) return null;

  return (
    <div className="source-drawer-overlay" onClick={onClose}>
      <div 
        className="source-drawer animate-slide-right" 
        style={{ width: '480px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="drawer-header">
          <div className="drawer-title">
            <Cpu size={20} color="#60a5fa" />
            <span>Spesifikasi Pipeline Sentence-BERT</span>
          </div>

          <button className="drawer-close-btn" onClick={onClose} title="Tutup">
            <X size={18} />
          </button>
        </div>

        <div className="drawer-content">
          <div style={{
            padding: '14px 16px',
            borderRadius: '12px',
            background: 'rgba(37, 99, 235, 0.12)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            color: '#93c5fd',
            fontSize: '0.82rem',
            lineHeight: 1.5
          }}>
            <strong style={{ color: '#ffffff' }}>Metode Usulan Skripsi:</strong> Dense Semantic Retrieval menggunakan arsitektur Sentence-BERT untuk mengubah kueri pengguna dan naskah Zapin menjadi representasi vektor makna 384 dimensi.
          </div>

          {/* Kartu Parameter Teknis */}
          <div className="source-card">
            <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#ffffff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Network size={16} color="#d4af37" />
              <span>Parameter Model & Vektor</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Model Pretrained</span>
                <span style={{ color: 'var(--text-main)', fontWeight: 600, fontFamily: 'monospace' }}>paraphrase-multilingual-MiniLM-L12-v2</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Dimensi Embedding</span>
                <span style={{ color: '#60a5fa', fontWeight: 600 }}>384 Dimensi (Dense)</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Fungsi Kesamaan</span>
                <span style={{ color: '#34d399', fontWeight: 600 }}>Cosine Similarity (L2 Normalized)</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Strategi Chunking</span>
                <span style={{ color: 'var(--text-main)' }}>450 Karakter (Overlap 80)</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Bahasa Didukung</span>
                <span style={{ color: 'var(--text-main)' }}>Bahasa Indonesia, Melayu, Multilingual</span>
              </div>
            </div>
          </div>

          {/* Pengaturan Live Parameter Retrieval */}
          <div className="source-card">
            <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#ffffff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={16} color="#34d399" />
              <span>Kalibrasi Eksperimen Retrieval</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.82rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Top-K Context Chunks:</span>
                  <span style={{ fontWeight: 700, color: '#60a5fa' }}>K = {ragParams.top_k}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="6"
                  value={ragParams.top_k}
                  onChange={(e) => setRagParams({ ...ragParams, top_k: parseInt(e.target.value) })}
                  style={{ width: '100%' }}
                />
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Jumlah dokumen teratas yang dilampirkan ke prompt LLM.
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Ambang Batas Semantik (Threshold):</span>
                  <span style={{ fontWeight: 700, color: '#d4af37' }}>{ragParams.threshold}</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.60"
                  step="0.05"
                  value={ragParams.threshold}
                  onChange={(e) => setRagParams({ ...ragParams, threshold: parseFloat(e.target.value) })}
                  style={{ width: '100%' }}
                />
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Nilai minimum Cosine Similarity agar rujukan dianggap relevan.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
