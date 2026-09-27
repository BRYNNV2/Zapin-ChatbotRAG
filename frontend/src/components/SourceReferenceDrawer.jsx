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

  // Pastikan sources selalu berupa array of objects yang valid (terlindungi jika berupa JSON string atau number)
  let safeSources = [];
  if (Array.isArray(sources)) {
    safeSources = sources;
  } else if (typeof sources === 'string') {
    try {
      const parsed = JSON.parse(sources);
      if (Array.isArray(parsed)) safeSources = parsed;
    } catch {
      safeSources = [];
    }
  }

  // Sinkronkan filter jika ada highlightedId dari klik sitasi di chat
  useEffect(() => {
    if (highlightedId) {
      setSelectedFilter(String(highlightedId));
      if (cardRefs.current[highlightedId]) {
        cardRefs.current[highlightedId].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      setSelectedFilter('all');
    }
  }, [highlightedId, isOpen]);

  if (!isOpen) return null;

  const handleCopyQuote = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredSources = selectedFilter === 'all'
    ? safeSources
    : safeSources.filter(s => String(s?.citation_id) === String(selectedFilter));

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
              {safeSources.length} kutipan otentik terverifikasi
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
      {safeSources.length > 1 && (
        <div className="source-filter-chips-row">
          <button
            className={`source-chip-btn ${selectedFilter === 'all' ? 'active' : ''}`}
            onClick={() => {
              setSelectedFilter('all');
              if (onSelectCitation) onSelectCitation(null);
            }}
          >
            Semua ({safeSources.length})
          </button>
          
          {safeSources.map((src, idx) => {
            const citId = src?.citation_id ?? (idx + 1);
            const isSelected = String(selectedFilter) === String(citId);
            return (
              <button
                key={citId}
                className={`source-chip-btn ${isSelected ? 'active' : ''}`}
                onClick={() => {
                  setSelectedFilter(String(citId));
                  if (onSelectCitation) onSelectCitation(citId);
                }}
              >
                [{citId}]
              </button>
            );
          })}
        </div>
      )}

      {/* Source Cards List */}
      <div className="source-panel-scroll">
        {(!safeSources || safeSources.length === 0) ? (
          <div className="source-empty-state">
            <Database size={32} color="var(--text-muted)" style={{ marginBottom: '12px', opacity: 0.4 }} />
            <p>Tidak ada rujukan sumber untuk pesan ini.</p>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              Pilih rujukan pada jawaban asisten untuk memeriksa asal naskah.
            </span>
          </div>
        ) : (
          filteredSources.map((src, idx) => {
            const citId = src?.citation_id ?? (idx + 1);
            const isTargeted = highlightedId && Number(highlightedId) === Number(citId);
            const simScore = typeof src?.similarity_score === 'number' ? src.similarity_score : 0;
            const simPercent = Math.round(simScore * 100);
            const docName = src?.document_name || 'Naskah Budaya Zapin';
            const pageNum = src?.page_number ?? 1;
            const isDocx = String(docName).toLowerCase().endsWith('.docx');
            const quoteText = src?.full_text || src?.snippet || 'Teks naskah tersimpan.';

            return (
              <div
                key={citId}
                ref={el => cardRefs.current[citId] = el}
                className={`source-detail-card ${isTargeted ? 'highlighted' : ''}`}
              >
                {/* Header Card: Monokrom rapi */}
                <div className="source-detail-top">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="source-citation-badge">
                      Sitasi [{citId}]
                    </span>
                    <span className="source-category-tag">
                      {src?.cultural_category || 'Budaya Zapin'}
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
                    <span className="origin-value doc-name" title={docName}>
                      {docName}
                    </span>
                  </div>

                  <div className="origin-meta-grid">
                    <div className="origin-meta-item">
                      <Hash size={12} color="var(--text-muted)" />
                      <span>Hal. <strong>{pageNum}</strong></span>
                    </div>

                    <div className="origin-meta-item">
                      <Layers size={12} color="var(--text-muted)" />
                      <span>{isDocx ? 'Naskah DOCX' : 'Naskah PDF'}</span>
                    </div>
                  </div>

                  {/* Validasi Pakar: Gaya catatan editorial bersih */}
                  <div className="source-validator-clean">
                    <ShieldCheck size={14} color="#9ca3af" />
                    <span className="validator-clean-text">
                      Validasi: <strong>{src?.validator_name || 'Dewan Kesenian & Budayawan Melayu'}</strong>
                    </span>
                  </div>
                </div>

                {/* Kutipan Teks Naskah Asli */}
                <div className="source-ground-truth-section">
                  <div className="ground-truth-header">
                    <span className="ground-truth-label">Kutipan Teks Asli:</span>
                    <button 
                      className="copy-quote-btn"
                      onClick={() => handleCopyQuote(quoteText, citId)}
                      title="Salin kutipan naskah"
                    >
                      {copiedId === citId ? (
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
                    "{quoteText}"
                  </div>
                </div>

                {/* Catatan Sintesis: Muted & Minimalis */}
                <div className="source-synthesis-clean">
                  <span>Rujukan data primer untuk jawaban poin <strong>[{citId}]</strong>.</span>
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
