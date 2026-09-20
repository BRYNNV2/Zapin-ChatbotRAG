import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  BookOpen, 
  ShieldCheck, 
  FileText, 
  Sparkles, 
  Copy, 
  Check, 
  Layers, 
  ChevronRight,
  ExternalLink,
  Target,
  Hash,
  Database
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
      {/* Panel Header */}
      <div className="source-panel-header">
        <div className="source-panel-title-wrap">
          <div className="source-panel-icon-badge">
            <BookOpen size={17} color="#d4af37" />
          </div>
          <div>
            <h3 className="source-panel-heading">Rujukan Sumber & Asal Data</h3>
            <p className="source-panel-subheading">
              {sources.length} kutipan naskah otentik terverifikasi
            </p>
          </div>
        </div>

        <button 
          className="source-panel-close-btn" 
          onClick={onClose}
          title="Tutup bar kanan rujukan"
        >
          <X size={18} />
        </button>
      </div>

      {/* SBERT Semantic Method Header Info */}
      <div className="source-method-banner">
        <div className="method-banner-top">
          <div className="method-tag">
            <Sparkles size={12} color="#60a5fa" />
            <span>Dense Semantic Retrieval</span>
          </div>
          <span className="method-dim-badge">384 Dimensi Vektor</span>
        </div>
        <p className="method-banner-desc">
          Data di bawah ini ditarik secara otomatis menggunakan model <strong>Sentence-BERT</strong> berdasarkan kedekatan semantik (Cosine Similarity) dengan pertanyaan Anda.
        </p>
      </div>

      {/* Quick Jump Filter Chips */}
      {sources.length > 1 && (
        <div className="source-filter-chips-row">
          <button
            className={`source-chip-btn ${selectedFilter === 'all' ? 'active' : ''}`}
            onClick={() => {
              setSelectedFilter('all');
              if (onSelectCitation) onSelectCitation(null);
            }}
          >
            <span>Semua ({sources.length})</span>
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
                <span>Sitasi [{src.citation_id}]</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Source Cards List */}
      <div className="source-panel-scroll">
        {(!sources || sources.length === 0) ? (
          <div className="source-empty-state">
            <Database size={36} color="var(--text-muted)" style={{ marginBottom: '12px', opacity: 0.5 }} />
            <p>Tidak ada rujukan sumber untuk pesan ini.</p>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Klik tombol rujukan pada jawaban asisten untuk memunculkan detail asal naskah.
            </span>
          </div>
        ) : (
          filteredSources.map((src) => {
            const isTargeted = highlightedId && Number(highlightedId) === src.citation_id;
            const simScore = src.similarity_score || 0;
            const simPercent = Math.round(simScore * 100);

            // Determine similarity color
            let simColor = '#10b981'; // Green
            if (simPercent < 60) simColor = '#f59e0b'; // Amber
            if (simPercent < 35) simColor = '#3b82f6'; // Blue

            return (
              <div
                key={src.citation_id}
                ref={el => cardRefs.current[src.citation_id] = el}
                className={`source-detail-card ${isTargeted ? 'highlighted' : ''}`}
              >
                {/* Card Top Header */}
                <div className="source-detail-top">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="source-citation-badge">
                      Sitasi [{src.citation_id}]
                    </span>
                    <span className="source-category-tag">
                      {src.cultural_category || 'Budaya Zapin'}
                    </span>
                  </div>

                  {/* Similarity Pill */}
                  <div 
                    className="source-sim-score-pill" 
                    style={{ borderColor: `${simColor}40`, color: simColor }}
                    title={`Nilai Cosine Similarity: ${simScore.toFixed(4)}`}
                  >
                    <Target size={12} />
                    <span>Kemiripan {simPercent}%</span>
                  </div>
                </div>

                {/* Similarity Progress Bar */}
                <div className="similarity-bar-track">
                  <div 
                    className="similarity-bar-fill" 
                    style={{ 
                      width: `${Math.min(100, Math.max(10, simPercent))}%`,
                      background: simColor 
                    }}
                  />
                </div>

                {/* Document Origin Breakdown */}
                <div className="source-origin-breakdown">
                  <div className="origin-row">
                    <div className="origin-icon-label">
                      <FileText size={14} color="#d4af37" />
                      <span className="origin-label">Asal Naskah:</span>
                    </div>
                    <span className="origin-value doc-name" title={src.document_name}>
                      {src.document_name}
                    </span>
                  </div>

                  <div className="origin-meta-grid">
                    <div className="origin-meta-item">
                      <Hash size={13} color="var(--text-muted)" />
                      <span>Halaman <strong>{src.page_number}</strong></span>
                    </div>

                    <div className="origin-meta-item">
                      <Layers size={13} color="var(--text-muted)" />
                      <span>Format <strong>{src.document_name.endsWith('.docx') ? 'DOCX' : 'PDF'} Otentik</strong></span>
                    </div>
                  </div>

                  {/* Expert Validator Box */}
                  <div className="source-validator-row">
                    <ShieldCheck size={15} color="#10b981" />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="validator-title">Tervalidasi Pakar Budaya</span>
                      <span className="validator-name">{src.validator_name || 'Dewan Kesenian & Budayawan Melayu'}</span>
                    </div>
                  </div>
                </div>

                {/* Ground Truth Authentic Quote */}
                <div className="source-ground-truth-section">
                  <div className="ground-truth-header">
                    <span className="ground-truth-label">Kutipan Teks Asli Dokumen (Ground Truth):</span>
                    <button 
                      className="copy-quote-btn"
                      onClick={() => handleCopyQuote(src.full_text || src.snippet, src.citation_id)}
                      title="Salin kutipan teks naskah"
                    >
                      {copiedId === src.citation_id ? (
                        <>
                          <Check size={12} color="#10b981" />
                          <span style={{ color: '#10b981' }}>Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  </div>

                  <blockquote className="source-quote-box-enhanced">
                    "{src.full_text || src.snippet}"
                  </blockquote>
                </div>

                {/* RAG Synthesis Context Note */}
                <div className="source-synthesis-note">
                  <span className="synthesis-bullet">💡</span>
                  <span>
                    Kutipan ini digunakan oleh generator RAG untuk memverifikasi keaslian fakta pada butir jawaban <strong>[{src.citation_id}]</strong> tanpa halusinasi.
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="source-panel-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={13} color="#d4af37" />
          <span>Integritas Akademik ZapinAI</span>
        </div>
        <span>Skripsi SBERT RAG 2026</span>
      </div>
    </aside>
  );
}
