import React from 'react';
import { X, BookOpen, UserCheck, Percent, FileText } from 'lucide-react';

export default function SourceReferenceDrawer({ isOpen, onClose, sources, highlightedId }) {
  if (!isOpen) return null;

  return (
    <div className="source-drawer-overlay" onClick={onClose}>
      <div className="source-drawer animate-slide-right" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-title">
            <BookOpen size={20} />
            <span>Referensi Sumber Tervalidasi</span>
          </div>
          <button className="drawer-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="drawer-content">
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Seluruh fakta yang disampaikan diasosiasikan secara langsung dengan dokumen sumber dan telah diverifikasi oleh pakar seni budaya Zapin.
          </p>

          {(!sources || sources.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              Tidak ada sumber kutipan untuk pesan ini.
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
                    borderColor: isTargeted ? 'var(--gold-400)' : undefined,
                    boxShadow: isTargeted ? '0 0 16px var(--gold-glow)' : undefined
                  }}
                >
                  <div className="source-card-header">
                    <div>
                      <div className="source-card-title">{src.document_name}</div>
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
                        <span style={{ fontSize: '0.6875rem', color: 'var(--emerald-400)', fontWeight: 600 }}>
                          Kemiripan {simPercent}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="source-quote-box">
                    "{src.full_text || src.snippet}"
                  </div>

                  <div className="validator-pill">
                    <UserCheck size={12} />
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
