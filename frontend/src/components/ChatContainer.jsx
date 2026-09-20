import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowUp, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  Copy, 
  Check, 
  SlidersHorizontal,
  ChevronDown,
  Layers,
  FileText,
  BookOpen,
  Lightbulb,
  Music,
  History,
  Shirt,
  BarChart2
} from 'lucide-react';

import cardTahto from '../assets/card_tahto.jpg';
import cardMusic from '../assets/card_music.jpg';
import cardHistory from '../assets/card_history.jpg';

export default function ChatContainer({
  messages,
  onSendMessage,
  isLoading,
  onOpenSources,
  onSwitchToDocs,
  onOpenSbertModal,
  ragParams,
  setRagParams
}) {
  const [inputQuery, setInputQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim() || isLoading) return;
    onSendMessage(inputQuery.trim());
    setInputQuery('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputResize = (e) => {
    setInputQuery(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  // Render message text with clickable [1], [2] badges
  const renderMessageContent = (text, sources) => {
    if (!text) return null;
    const parts = text.split(/(\[\d+\])/g);

    return parts.map((part, index) => {
      const match = part.match(/\[(\d+)\]/);
      if (match) {
        const citationId = parseInt(match[1], 10);
        return (
          <button
            key={index}
            className="citation-badge"
            title={`Lihat rujukan sumber [${citationId}]`}
            onClick={() => onOpenSources(sources, citationId)}
          >
            [{citationId}]
          </button>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const quickCategories = [
    { label: 'Ragam Gerak', icon: <Layers size={13} />, query: 'Jelaskan ragam gerak Tahto, Pecah, dan Tahtim pada tari Zapin!' },
    { label: 'Musik & Marwas', icon: <Music size={13} />, query: 'Apa peran alat musik Gambus dan Marwas dalam iringan tari Zapin?' },
    { label: 'Sejarah & Nilai', icon: <History size={13} />, query: 'Bagaimana sejarah asal usul tari Zapin dari Hadramaut ke Melayu Siak?' },
    { label: 'Busana & Adat', icon: <Shirt size={13} />, query: 'Bagaimana etika tata busana Baju Kurung Cekak Musang dan Songket dalam Zapin?' },
    { label: 'Evaluasi Skripsi', icon: <BarChart2 size={13} />, query: 'Bagaimana perbandingan akurasi Sentence-BERT vs BM25 untuk riset Zapin?' },
  ];

  const inspirationCards = [
    {
      title: 'Ragam Tahto & Pecah',
      sub: "Makna filosofis langkah pembuka tawadhu' dan kelincahan penari Zapin",
      image: cardTahto,
      query: 'Apa makna filosofis dan fungsi dari gerak Tahto dan Pecah pada tari Zapin Melayu?'
    },
    {
      title: 'Harmonisasi Gambus & Marwas',
      sub: 'Sinkopasi ritmis gendang berkepala dua pemandu langkah kaki penari',
      image: cardMusic,
      query: 'Sebutkan alat musik utama pengiring tari Zapin dan bagaimana Marwas memandu tempo gerak penari?'
    },
    {
      title: 'Sejarah Zapin Melayu Siak',
      sub: 'Akulturasi budaya dari Hadramaut hingga Istana Kesultanan Siak Sri Indrapura',
      image: cardHistory,
      query: 'Bagaimana sejarah masuknya tari Zapin dari Hadramaut hingga berkembang di Kesultanan Siak Sri Indrapura?'
    }
  ];

  const isHomeView = messages.length === 0;

  return (
    <div className="kimi-chat-stream">
      {isHomeView ? (
        /* KIMI HOME STATE */
        <div className="kimi-home-container">
          {/* Big Minimalist Typography: ZAPIN */}
          <h1 className="kimi-giant-title">ZAPIN</h1>

          {/* Curved Kimi Input Box */}
          <div className="kimi-input-box">
            <textarea
              ref={textareaRef}
              className="kimi-textarea"
              rows={2}
              placeholder='Ketik untuk bertanya tentang budaya, gerak, sejarah, atau musik Zapin...'
              value={inputQuery}
              onChange={handleInputResize}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />

            <div className="kimi-box-bottom">
              <div className="kimi-box-left">
                <div 
                  className="kimi-select-pill"
                  onClick={onSwitchToDocs}
                  title="Lihat katalog naskah Zapin tervalidasi"
                >
                  <BookOpen size={13} color="#d4af37" />
                  <span>Katalog Pustaka</span>
                  <ChevronDown size={12} />
                </div>

                <div 
                  className="kimi-select-pill"
                  onClick={onOpenSbertModal}
                  title="Lihat spesifikasi & kalibrasi Sentence-BERT"
                >
                  <Sparkles size={13} color="#60a5fa" />
                  <span>Dense SBERT</span>
                  <ChevronDown size={12} />
                </div>
              </div>

              <div className="kimi-box-right">
                <div 
                  className="kimi-select-pill"
                  onClick={() => setShowSettings(!showSettings)}
                  style={{ color: 'var(--text-muted)' }}
                >
                  <span>Top-K: {ragParams.top_k}</span>
                  <ChevronDown size={12} />
                </div>

                <button
                  className="kimi-send-btn"
                  onClick={() => handleSubmit()}
                  disabled={!inputQuery.trim() || isLoading}
                  title="Kirim pesan"
                >
                  <ArrowUp size={18} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Quick parameter settings dropdown */}
            {showSettings && (
              <div style={{
                marginTop: '12px',
                paddingTop: '12px',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                gap: '20px',
                fontSize: '0.78rem',
                color: 'var(--text-secondary)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Top-K:</span>
                  <input
                    type="range"
                    min="1"
                    max="6"
                    value={ragParams.top_k}
                    onChange={(e) => setRagParams({ ...ragParams, top_k: parseInt(e.target.value) })}
                  />
                  <span>{ragParams.top_k}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Threshold Semantik:</span>
                  <input
                    type="range"
                    min="0.1"
                    max="0.8"
                    step="0.05"
                    value={ragParams.threshold}
                    onChange={(e) => setRagParams({ ...ragParams, threshold: parseFloat(e.target.value) })}
                  />
                  <span>{ragParams.threshold}</span>
                </div>
              </div>
            )}
          </div>

          <div className="kimi-sub-label">
            <span>Tervalidasi Pakar Seni Budaya Melayu</span>
          </div>

          {/* Category Chips Under Input Box */}
          <div className="kimi-pills-row">
            {quickCategories.map((cat, idx) => (
              <button
                key={idx}
                className="category-chip"
                onClick={() => onSendMessage(cat.query)}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* "Jelajahi Inspirasi" Section */}
          <div className="inspiration-section">
            <div className="inspiration-header">
              <Lightbulb size={16} color="#d4af37" />
              <span>Jelajahi inspirasi</span>
            </div>

            <div className="inspiration-grid">
              {inspirationCards.map((card, idx) => (
                <div
                  key={idx}
                  className="inspiration-card"
                  style={{ backgroundImage: `url(${card.image})` }}
                  onClick={() => onSendMessage(card.query)}
                >
                  <div className="inspiration-overlay">
                    <div className="inspiration-card-title">{card.title}</div>
                    <div className="inspiration-card-sub">{card.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ACTIVE CHAT STATE */
        <>
          <div className="chat-scroll-area">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`kimi-message-row ${msg.sender === 'user' ? 'user' : 'assistant'}`}
              >
                {msg.sender === 'user' ? (
                  <div className="kimi-user-bubble">
                    {msg.text}
                  </div>
                ) : (
                  <div className="kimi-assistant-wrap">
                    <div className="kimi-assistant-avatar">Z</div>

                    <div className="kimi-assistant-content">
                      <div style={{ whiteSpace: 'pre-wrap' }}>
                        {renderMessageContent(msg.text, msg.sources)}
                      </div>

                      {/* Action Bar Below Response */}
                      <div className="assistant-actions-bar">
                        {msg.sources && msg.sources.length > 0 && (
                          <button
                            className="source-pill-btn"
                            onClick={() => onOpenSources(msg.sources, null)}
                          >
                            <CheckCircle2 size={13} color="#10b981" />
                            <span>{msg.sources.length} Sumber Tervalidasi</span>
                          </button>
                        )}

                        <button
                          className="action-btn-small"
                          onClick={() => handleCopy(msg.text, idx)}
                          title="Salin jawaban"
                        >
                          {copiedIdx === idx ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                          <span>{copiedIdx === idx ? 'Disalin' : 'Salin'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="kimi-message-row assistant">
                <div className="kimi-assistant-wrap">
                  <div className="kimi-assistant-avatar">Z</div>
                  <div className="kimi-assistant-content" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                    <Sparkles size={15} color="#d4af37" className="animate-spin-slow" />
                    <span style={{ fontSize: '0.88rem' }}>Mencocokkan dense embeddings Sentence-BERT & rujukan pakar...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Floating Bottom Dock for Active Chat */}
          <div className="chat-bottom-dock">
            <div className="chat-dock-inner">
              <div className="kimi-input-box" style={{ padding: '12px 18px 10px 18px' }}>
                <textarea
                  ref={textareaRef}
                  className="kimi-textarea"
                  rows={1}
                  placeholder='Kirim pesan balasan...'
                  value={inputQuery}
                  onChange={handleInputResize}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  style={{ minHeight: '30px' }}
                />

                <div className="kimi-box-bottom" style={{ marginTop: '4px', paddingTop: '4px' }}>
                  <div className="kimi-box-left">
                    <div className="kimi-select-pill" onClick={onSwitchToDocs} title="Lihat katalog pustaka">
                      <BookOpen size={12} color="#d4af37" />
                      <span>Katalog Pustaka</span>
                    </div>

                    <div className="kimi-select-pill" onClick={onOpenSbertModal} title="Lihat spesifikasi SBERT">
                      <Sparkles size={12} color="#60a5fa" />
                      <span>Dense SBERT</span>
                    </div>
                  </div>

                  <div className="kimi-box-right">
                    <button
                      className="kimi-send-btn"
                      onClick={() => handleSubmit()}
                      disabled={!inputQuery.trim() || isLoading}
                    >
                      <ArrowUp size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
