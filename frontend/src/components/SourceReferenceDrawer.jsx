import React from 'react';
import { X, BookOpen, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

export default function SourceReferenceDrawer({ isOpen, onClose, sources, highlightedId }) {
  if (!isOpen) return null;

  return (
    <div className="source-drawer-overlay" onClick={onClose}>
      <div className="source-drawer animate-slide-right" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-title">
            <BookOpen size={19} color="#d4af37" />
            <span>Referensi Sumber Tervalidasi</span>
          </div>

          <button 
            className="drawer-close-btn" 
            onClick={onClose}
            title="Tutup panel referensi"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="drawer-content">
          <div style={{
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            padding: '10px 14px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            Kutipan naskah otentik yang ditemukan oleh <strong>Sentence-BERT Dense Semantic Retrieval</strong> dan digunakan oleh LLM untuk menyusun jawaban.
          </div>

          {(!sources || sources.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              Tidak ada rujukan sumber untuk pesan ini.
            </div>
          ) : (
            sources.map((src) => {
              const isTargeted = highlightedId && Number(highlightedId) === src.citation_id;
              const simPercent = Math.round((src.similarity_score || 0) * 100);

              return (
                <div
                  key={src.citation_id}
                  className="source-card"
                  style={{
                    borderColor: isTargeted ? '#d4af37' : undefined,
                    boxShadow: isTargeted ? '0 0 18px rgba(212, 175, 55, 0.25)' : undefined
                  }}
                >
                  <div className="source-card-header">
                    <div>
                      <div className="source-card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FileText size={15} color="#d4af37" />
                        <span>{src.document_name}</span>
                      </div>

                      <div className="source-card-meta">
                        <span>Halaman {src.page_number}</span>
                        <span>•</span>
                        <span>{src.cultural_category || 'Budaya Zapin'}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <span className="source-card-badge">
                        Sitasi [{src.citation_id}]
                      </span>

                      {src.similarity_score && (
                        <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 600 }}>
                          Kemiripan {simPercent}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="source-quote-box">
                    "{src.full_text || src.snippet}"
                  </div>

                  <div className="validator-pill">
                    <ShieldCheck size={14} />
                    <span>Divalidasi oleh: {src.validator_name}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
