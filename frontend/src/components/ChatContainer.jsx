import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowUp,
  Sparkles,
  Copy,
  Check,
  BookOpen,
  Compass,
  Music,
  History,
  Palette
} from 'lucide-react';

import MarkdownMessage from './MarkdownMessage';

export default function ChatContainer({
  messages,
  onSendMessage,
  isLoading,
  onOpenSources,
  currentUser,
  onOpenAuthModal,
  userPrefs
}) {
  const [inputQuery, setInputQuery] = useState('');
  const [showCapabilities, setShowCapabilities] = useState(false);
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
    const enterToSend = userPrefs?.enterToSend !== false;
    if (enterToSend && e.key === 'Enter' && !e.shiftKey) {
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

  const capabilityPrompts = [
    {
      label: 'Konsep estetika budaya Tari Zapin Riau',
      icon: <Palette size={14} />,
      query: 'Bagaimana konsep estetika budaya dalam tari Zapin Riau?'
    },
    {
      label: 'Filosofi gerak Tahto & Pecah',
      icon: <Compass size={14} />,
      query: 'Apa makna filosofis dan fungsi dari gerak Tahto dan Pecah pada tari Zapin Melayu?'
    },
    {
      label: 'Musik Gambus & Marwas pengiring',
      icon: <Music size={14} />,
      query: 'Sebutkan alat musik utama pengiring tari Zapin dan bagaimana Marwas memandu tempo gerak penari?'
    },
    {
      label: 'Sejarah & akulturasi Zapin Riau',
      icon: <History size={14} />,
      query: 'Bagaimana sejarah masuknya tari Zapin dari Hadramaut hingga berkembang di Riau?'
    }
  ];

  const isHomeView = messages.length === 0;
  const userName = currentUser ? (currentUser.full_name || currentUser.username) : '';

  return (
    <div className="kimi-chat-stream">
      {isHomeView ? (
        /* CLEAN LIGHT HOME VIEW (PERSIS REFERENSI) */
        <div className="clean-home-shell">
          <div className="clean-home-center">
            <h1 className="clean-home-heading">
              {currentUser ? (
                <>
                  <span className="clean-home-greet-sub">Halo, {userName}</span>
                  <br />
                  Dari mana kita harus mulai?
                </>
              ) : (
                <>
                  Dari mana kita
                  <br />
                  harus mulai?
                </>
              )}
            </h1>

            {/* Single Clean Pill Input */}
            <div className="clean-input-pill">
              <textarea
                ref={textareaRef}
                className="clean-textarea"
                rows={1}
                placeholder="Tanya ZAPIN seputar Tari Zapin Riau..."
                value={inputQuery}
                onChange={handleInputResize}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
              />

              <button
                type="button"
                className={`clean-send-btn ${inputQuery.trim() && !isLoading ? 'active' : ''}`}
                onClick={handleSubmit}
                disabled={!inputQuery.trim() || isLoading}
                title="Kirim pertanyaan"
              >
                <ArrowUp size={17} strokeWidth={2.3} />
              </button>
            </div>

            {/* Single Centered Capability Pill Button */}
            <button
              type="button"
              className={`clean-capability-btn ${showCapabilities ? 'active' : ''}`}
              onClick={() => setShowCapabilities((prev) => !prev)}
            >
              Apa yang bisa Anda lakukan?
            </button>

            {showCapabilities && (
              <div className="clean-capability-panel animate-fade-in">
                {capabilityPrompts.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="clean-capability-chip"
                    onClick={() => onSendMessage(item.query)}
                    disabled={isLoading}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Minimal Bottom Footer */}
          <footer className="clean-home-footer">
            <span>
              ZAPIN adalah asisten AI budaya berbasis Sentence-BERT RAG menggunakan korpus Tari
              Zapin Riau tervalidasi.
            </span>
          </footer>
        </div>
      ) : (
        /* ACTIVE CHAT STATE */
        <>
          <div className="chat-scroll-area">
            <div className="chat-messages-inner">
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
                        <MarkdownMessage
                          text={msg.text}
                          sources={msg.sources}
                          onOpenSources={onOpenSources}
                          showCitations={userPrefs?.showCitations !== false}
                        />

                        {/* Action Bar Below Response */}
                        <div className="assistant-actions-bar">
                          {(() => {
                            if (userPrefs?.showCitations === false) return null;
                            let srcList = [];
                            if (Array.isArray(msg.sources)) {
                              srcList = msg.sources;
                            } else if (typeof msg.sources === 'string') {
                              try {
                                const p = JSON.parse(msg.sources);
                                if (Array.isArray(p)) srcList = p;
                              } catch {}
                            }
                            if (srcList.length === 0) return null;

                            return (
                              <button
                                className="source-pill-btn"
                                onClick={() => onOpenSources(srcList, null)}
                              >
                                <BookOpen size={13} color="#5d5d5d" />
                                <span>{srcList.length} Sumber Tervalidasi</span>
                              </button>
                            );
                          })()}

                          <button
                            className="action-btn-small"
                            onClick={() => handleCopy(msg.text, idx)}
                            title="Salin jawaban"
                          >
                            {copiedIdx === idx ? <Check size={13} color="#10a37f" /> : <Copy size={13} />}
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
                      <Sparkles size={15} color="#b45309" className="animate-spin-slow" />
                      <span style={{ fontSize: '0.88rem' }}>Mencocokkan dense embeddings Sentence-BERT &amp; rujukan pakar...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Floating Bottom Dock for Active Chat */}
          <div className="chat-bottom-dock">
            <div className="chat-dock-inner">
              <div className="clean-input-pill clean-input-pill-dock">
                <textarea
                  ref={textareaRef}
                  className="clean-textarea"
                  rows={1}
                  placeholder="Tanyakan lanjutan seputar Tari Zapin Riau..."
                  value={inputQuery}
                  onChange={handleInputResize}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                />

                <button
                  type="button"
                  className={`clean-send-btn ${inputQuery.trim() && !isLoading ? 'active' : ''}`}
                  onClick={handleSubmit}
                  disabled={!inputQuery.trim() || isLoading}
                  title="Kirim pesan"
                >
                  <ArrowUp size={17} strokeWidth={2.3} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
