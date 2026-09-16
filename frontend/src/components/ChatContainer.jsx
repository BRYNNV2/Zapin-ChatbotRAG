import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, ExternalLink, Sliders, CheckCircle, Compass } from 'lucide-react';

export default function ChatContainer({
  messages,
  onSendMessage,
  isLoading,
  suggestions,
  onOpenSources,
  ragParams,
  setRagParams
}) {
  const [inputQuery, setInputQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputQuery.trim() || isLoading) return;
    onSendMessage(inputQuery.trim());
    setInputQuery('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Fungsi untuk mem-parse teks dan merender nomor sitasi [1], [2] sebagai tombol interaktif
  const renderMessageContent = (text, sources) => {
    if (!text) return null;
    
    // Pisahkan teks berdasarkan pola [1], [2], dst.
    const parts = text.split(/(\[\d+\])/g);

    return parts.map((part, index) => {
      const match = part.match(/\[(\d+)\]/);
      if (match) {
        const citationId = parseInt(match[1], 10);
        return (
          <button
            key={index}
            className="citation-badge"
            title={`Lihat referensi sumber [${citationId}]`}
            onClick={() => onOpenSources(sources, citationId)}
          >
            [{citationId}]
          </button>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="chat-main-area">
      <div className="chat-messages-container">
        {messages.length === 0 ? (
          <div className="welcome-hero animate-fade-in">
            <div className="hero-crest">
              <Compass size={32} color="#D4AF37" />
            </div>
            <h2 className="hero-title">Eksplorasi Budaya Zapin Tervalidasi</h2>
            <p className="hero-desc">
              Sistem kecerdasan buatan berbasis <strong>Dense Semantic Retrieval (Sentence-BERT)</strong> yang menyajikan pengetahuan otentik Tari Zapin Melayu langsung dari pangkalan data yang telah divalidasi oleh pakar budaya.
            </p>

            <div className="suggestion-chips">
              {suggestions.map((item, idx) => (
                <div
                  key={idx}
                  className="suggestion-card"
                  onClick={() => onSendMessage(item.query)}
                >
                  <div className="suggestion-tag">{item.category}</div>
                  <div className="suggestion-text">{item.query}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`message-row ${msg.sender} animate-fade-in`}>
              <div className={`message-avatar ${msg.sender}`}>
                {msg.sender === 'assistant' ? <Bot size={20} /> : <User size={20} />}
              </div>

              <div className="message-body">
                <div className="message-bubble">
                  {msg.sender === 'assistant' ? (
                    <div>
                      <div style={{ whiteSpace: 'pre-wrap' }}>
                        {renderMessageContent(msg.text, msg.sources)}
                      </div>

                      {msg.sources && msg.sources.length > 0 && (
                        <div className="assistant-meta-bar">
                          <div className="meta-tags">
                            <span className="meta-tag gold">
                              <Sparkles size={11} />
                              <span>SBERT Dense Retrieval</span>
                            </span>
                            {msg.highestSimilarity && (
                              <span className="meta-tag">
                                Kemiripan: {Math.round(msg.highestSimilarity * 100)}%
                              </span>
                            )}
                            <span className="meta-tag" style={{ color: 'var(--emerald-400)' }}>
                              <CheckCircle size={11} />
                              <span>Keterlacakan: {Math.round((msg.traceabilityRate || 1.0) * 100)}%</span>
                            </span>
                          </div>

                          <button
                            className="sources-trigger-btn"
                            onClick={() => onOpenSources(msg.sources, null)}
                          >
                            <ExternalLink size={12} />
                            <span>{msg.sources.length} Sumber Tervalidasi</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>{msg.text}</div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="message-row assistant animate-fade-in">
            <div className="message-avatar assistant">
              <Bot size={20} />
            </div>
            <div className="message-body">
              <div className="message-bubble" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sparkles size={16} color="#FBBF24" className="animate-spin-slow" />
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Mencari konteks semantik Sentence-BERT & menyintesis rujukan pakar...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Panel Parameter Riset (Collapsible) */}
      {showSettings && (
        <div style={{
          padding: '12px 36px',
          background: 'rgba(13, 21, 39, 0.95)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: '24px',
          alignItems: 'center',
          fontSize: '0.8125rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--gold-300)', fontWeight: 600 }}>Top-K Context:</span>
            <input
              type="range"
              min="1"
              max="8"
              value={ragParams.top_k}
              onChange={(e) => setRagParams({ ...ragParams, top_k: parseInt(e.target.value) })}
            />
            <span>{ragParams.top_k}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--gold-300)', fontWeight: 600 }}>Similarity Threshold:</span>
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

      {/* Chat Input Bar */}
      <div className="chat-input-wrapper">
        <form className="chat-input-box" onSubmit={handleSubmit}>
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            style={{
              background: 'transparent',
              border: 'none',
              color: showSettings ? 'var(--gold-400)' : 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Pengaturan Parameter Eksperimen RAG"
          >
            <Sliders size={18} />
          </button>

          <textarea
            className="chat-textarea"
            rows="1"
            placeholder="Tanyakan ragam gerak, sejarah, busana, atau musik tari Zapin..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />

          <button
            type="submit"
            className="send-btn"
            disabled={!inputQuery.trim() || isLoading}
            title="Kirim Pertanyaan"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
