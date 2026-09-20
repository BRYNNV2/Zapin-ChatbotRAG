import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  BookOpen, 
  ShieldCheck, 
  FileText, 
  Copy, 
  Check, 
  Layers, 
  Hash, 
  Database,
  ArrowUpRight
} from 'lucide-react';

export default function SourceReferenceDrawer({ 
  isOpen, 
  onClose, 
  sources = [], 
  highlightedId = null,
  onSelectCitation
}) {
  const [copiedId, setCopiedId] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all'); // 'all' or citation_id
  const cardRefs = useRef({});

  // Sinkronkan filter jika ada highlightedId dari klik sitasi di chat
  useEffect(() => {
    if (highlightedId) {
      setSelectedFilter(highlightedId.toString());
      if (cardRefs.current[highlightedId]) {
        cardRefs.current[highlightedId].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      setSelectedFilter('all');
    }
  }, [highlightedId, isOpen]);

  if (!isOpen) return null;

  const handleCopyQuote = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredSources = selectedFilter === 'all'
    ? sources
    : sources.filter(s => s.citation_id.toString() === selectedFilter);

  return (
    <aside className="source-side-panel animate-slide-in-right">
      {/* Header: Bersih, Minimalis & Monokrom */}
      <div className="source-panel-header">
        <div className="source-panel-title-wrap">
          <div className="source-panel-icon-badge">
            <BookOpen size={16} color="#d1d5db" />
          </div>
          <div>
            <h3 className="source-panel-heading">Rujukan Sumber Naskah</h3>
            <p className="source-panel-subheading">
              {sources.length} kutipan otentik terverifikasi
            </p>
          </div>
        </div>

        <button 
          className="source-panel-close-btn" 
          onClick={onClose}
          title="Tutup bar kanan rujukan"
        >
          <X size={17} />
        </button>
      </div>

      {/* Method Info: Netral & Muted, Tidak Warna-Warni */}
      <div className="source-method-banner">
        <div className="method-banner-top">
          <span className="method-tag">Sentence-BERT Semantic Retrieval</span>
          <span className="method-dim-badge">384-dim</span>
        </div>
        <p className="method-banner-desc">
          Kutipan diekstrak dari pangkalan naskah berdasarkan skor kemiripan semantik terhadap kueri Anda.
        </p>
      </div>

      {/* Filter Chips: Monokromatis Minimalis */}
      {sources.length > 1 && (
        <div className="source-filter-chips-row">
          <button
            className={`source-chip-btn ${selectedFilter === 'all' ? 'active' : ''}`}
            onClick={() => {
              setSelectedFilter('all');
              if (onSelectCitation) onSelectCitation(null);
            }}
          >
            Semua ({sources.length})
          </button>
          
          {sources.map((src) => {
            const isSelected = selectedFilter === src.citation_id.toString();
            return (
              <button
                key={src.citation_id}
                className={`source-chip-btn ${isSelected ? 'active' : ''}`}
                onClick={() => {
                  setSelectedFilter(src.citation_id.toString());
                  if (onSelectCitation) onSelectCitation(src.citation_id);
                }}
              >
                [{src.citation_id}]
              </button>
            );
          })}
        </div>
      )}

      {/* Source Cards List */}
      <div className="source-panel-scroll">
        {(!sources || sources.length === 0) ? (
          <div className="source-empty-state">
            <Database size={32} color="var(--text-muted)" style={{ marginBottom: '12px', opacity: 0.4 }} />
            <p>Tidak ada rujukan sumber untuk pesan ini.</p>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              Pilih rujukan pada jawaban asisten untuk memeriksa asal naskah.
            </span>
          </div>
        ) : (
          filteredSources.map((src) => {
            const isTargeted = highlightedId && Number(highlightedId) === src.citation_id;
            const simScore = src.similarity_score || 0;
            const simPercent = Math.round(simScore * 100);

            return (
              <div
                key={src.citation_id}
                ref={el => cardRefs.current[src.citation_id] = el}
                className={`source-detail-card ${isTargeted ? 'highlighted' : ''}`}
              >
                {/* Header Card: Monokrom rapi */}
                <div className="source-detail-top">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="source-citation-badge">
                      Sitasi [{src.citation_id}]
                    </span>
                    <span className="source-category-tag">
                      {src.cultural_category || 'Budaya Zapin'}
                    </span>
                  </div>

                  <span className="source-sim-score-clean" title={`Cosine Similarity: ${simScore.toFixed(4)}`}>
                    {simPercent}% Relevansi
                  </span>
                </div>

                {/* Detail Asal Dokumen */}
                <div className="source-origin-breakdown">
                  <div className="origin-row">
                    <span className="origin-label">Dokumen Sumber</span>
                    <span className="origin-value doc-name" title={src.document_name}>
                      {src.document_name}
                    </span>
                  </div>

                  <div className="origin-meta-grid">
                    <div className="origin-meta-item">
                      <Hash size={12} color="var(--text-muted)" />
                      <span>Hal. <strong>{src.page_number}</strong></span>
                    </div>

                    <div className="origin-meta-item">
                      <Layers size={12} color="var(--text-muted)" />
                      <span>{src.document_name.endsWith('.docx') ? 'Naskah DOCX' : 'Naskah PDF'}</span>
                    </div>
                  </div>

                  {/* Validasi Pakar: Gaya catatan editorial bersih */}
                  <div className="source-validator-clean">
                    <ShieldCheck size={14} color="#9ca3af" />
                    <span className="validator-clean-text">
                      Validasi: <strong>{src.validator_name || 'Dewan Kesenian & Budayawan Melayu'}</strong>
                    </span>
                  </div>
                </div>

                {/* Kutipan Teks Naskah Asli */}
                <div className="source-ground-truth-section">
                  <div className="ground-truth-header">
                    <span className="ground-truth-label">Kutipan Teks Asli:</span>
                    <button 
                      className="copy-quote-btn"
                      onClick={() => handleCopyQuote(src.full_text || src.snippet, src.citation_id)}
                      title="Salin kutipan naskah"
                    >
                      {copiedId === src.citation_id ? (
                        <>
                          <Check size={11} color="#ffffff" />
                          <span>Disalin</span>
                        </>
                      ) : (
                        <>
                          <Copy size={11} />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="source-quote-box-clean">
                    "{src.full_text || src.snippet}"
                  </div>
                </div>

                {/* Catatan Sintesis: Muted & Minimalis */}
                <div className="source-synthesis-clean">
                  <span>Rujukan data primer untuk jawaban poin <strong>[{src.citation_id}]</strong>.</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Minimalis */}
      <div className="source-panel-footer">
        <span>Arsip Budaya Zapin Tervalidasi</span>
        <span>Sentence-BERT RAG</span>
      </div>
    </aside>
  );
}
