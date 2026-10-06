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
  BarChart2,
  Folder,
  Code,
  ChevronRight,
  Presentation,
  Palette
} from 'lucide-react';

import cardTahto from '../assets/card_tahto.jpg';
import cardMusic from '../assets/card_music.jpg';
import cardHistory from '../assets/card_history.jpg';
import MarkdownMessage from './MarkdownMessage';

export default function ChatContainer({
  messages,
  onSendMessage,
  isLoading,
  onOpenSources,
  onSwitchToDocs,
  onOpenSbertModal,
  ragParams,
  setRagParams,
  currentUser,
  onOpenAuthModal
}) {
  const [inputQuery, setInputQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [speedMode, setSpeedMode] = useState('instan'); // 'instan' | 'tinggi'
  const [showInspirations, setShowInspirations] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Helper gating interaksi untuk tamu belum login (Gambar 2)
  const handleActionGated = (callback) => {
    if (!currentUser) {
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }
    if (callback) callback();
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!currentUser) {
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }
    if (!inputQuery.trim() || isLoading) return;
    onSendMessage(inputQuery.trim());
    setInputQuery('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (!currentUser) {
      e.preventDefault();
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputResize = (e) => {
    if (!currentUser) {
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }
    setInputQuery(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  // Quick categories persis Gambar 1
  const quickCategories = [
    { 
      label: 'Slide', 
      icon: <Presentation size={14} />, 
      query: 'Buatkan kerangka slide presentasi interaktif tentang ragam gerak Tahto, Pecah, dan Tahtim pada tari Zapin!' 
    },
    { 
      label: 'Riset Mendalam', 
      icon: <Sparkles size={14} />, 
      query: 'Jelaskan riset komparatif mendalam akulturasi nilai Melayu dan Hadramaut dalam tradisi tari Zapin Nusantara!' 
    },
    { 
      label: 'Buat aplikasi', 
      icon: <Code size={14} />, 
      query: 'Bagaimana arsitektur implementasi Sentence-BERT dan RAG untuk pelestarian ensiklopedia tari Zapin Melayu?' 
    },
    { 
      label: 'Dokumen', 
      icon: <FileText size={14} />, 
      query: 'Rangkum dokumen naskah tari Zapin terkait busana Teluk Belanga, Cekak Musang, dan filosofi kain Songket!' 
    },
    { 
      label: 'Sheets', 
      icon: <BarChart2 size={14} />, 
      query: 'Sajikan tabel komparasi ritme sinkopasi gendang Marwas dan langkah kaki penari Zapin Melayu!' 
    },
    { 
      label: 'Desain', 
      icon: <Palette size={14} />, 
      query: 'Jelaskan estetika desain pola lantai dan koreografi gerak tari Zapin tradisional Melayu Siak!' 
    },
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
        /* KIMI HOME STATE (Persis Gambar 1) */
        <div className="kimi-home-container">
          {/* Big Minimalist Typography: KIMI (Persis Gambar 1) */}
          <h1 className="kimi-giant-title">KIMI</h1>

          {/* Curved Kimi Input Box */}
          <div 
            className="kimi-input-box"
            onClick={() => {
              if (!currentUser) handleActionGated();
            }}
          >
            <textarea
              ref={textareaRef}
              className="kimi-textarea"
              rows={2}
              placeholder='Tanya Apa Saja....'
              value={currentUser ? inputQuery : ''}
              onChange={handleInputResize}
              onKeyDown={handleKeyDown}
              onFocus={(e) => {
                if (!currentUser) {
                  e.target.blur();
                  handleActionGated();
                }
              }}
              readOnly={!currentUser}
              disabled={isLoading}
            />

            <div className="kimi-box-bottom">
              <div className="kimi-box-left">
                {/* Plus (+) Button */}
                <button
                  type="button"
                  className="kimi-tool-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleActionGated(() => onSwitchToDocs());
                  }}
                  title="Lampirkan berkas atau konteks"
                >
                  <Plus size={16} />
                </button>

                {/* Pilih proyek pill */}
                <div 
                  className="kimi-pill-action"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleActionGated(() => onSwitchToDocs());
                  }}
                  title="Pilih proyek ruang kerja"
                >
                  <Folder size={13} color="#9ca3af" />
                  <span>Pilih proyek</span>
                </div>

                {/* Plugin pill */}
                <div 
                  className="kimi-pill-action"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleActionGated(() => onOpenSbertModal());
                  }}
                  title="Pilih Plugin atau Sentence-BERT"
                >
                  <Sparkles size={13} color="#9ca3af" />
                  <span>Plugin</span>
                </div>
              </div>

              <div className="kimi-box-right">
                {/* Segmented Toggle: Instan | Tinggi */}
                <div 
                  className="kimi-mode-toggle"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleActionGated(() => setSpeedMode(speedMode === 'instan' ? 'tinggi' : 'instan'));
                  }}
                  title="Pilih mode komputasi respon"
                >
                  <span className={`kimi-toggle-option ${speedMode === 'instan' ? 'active' : ''}`}>
                    Instan
                  </span>
                  <span className={`kimi-toggle-option ${speedMode === 'tinggi' ? 'active' : ''}`}>
                    Tinggi
                  </span>
                </div>

                {/* Tombol Kirim Up-Arrow (↑) */}
                <button
                  type="button"
                  className={`kimi-send-btn ${inputQuery.trim() && currentUser ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!currentUser) {
                      handleActionGated();
                    } else {
                      handleSubmit();
                    }
                  }}
                  disabled={isLoading}
                  title="Kirim pesan"
                >
                  <ArrowUp size={18} strokeWidth={2.4} />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Category Chips Under Input Box (Persis Gambar 1) */}
          <div className="kimi-pills-row">
            {quickCategories.map((cat, idx) => (
              <button
                key={idx}
                type="button"
                className="category-chip"
                onClick={() => handleActionGated(() => onSendMessage(cat.query))}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Jelajahi Inspirasi (Persis Gambar 1 di bagian bawah) */}
          <div 
            className="kimi-explore-link"
            onClick={() => handleActionGated(() => setShowInspirations(!showInspirations))}
          >
            <Lightbulb size={14} color="#9ca3af" />
            <span>Jelajahi inspirasi &gt;&gt;</span>
          </div>

          {/* Inspirasi Panel (Expanded saat diklik oleh user login) */}
          {showInspirations && (
            <div className="inspiration-section animate-fade-in" style={{ marginTop: '24px' }}>
              <div className="inspiration-grid">
                {inspirationCards.map((card, idx) => (
                  <div
                    key={idx}
                    className="inspiration-card"
                    style={{ backgroundImage: `url(${card.image})` }}
                    onClick={() => handleActionGated(() => onSendMessage(card.query))}
                  >
                    <div className="inspiration-overlay">
                      <div className="inspiration-card-title">{card.title}</div>
                      <div className="inspiration-card-sub">{card.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
                        />

                        {/* Action Bar Below Response */}
                        <div className="assistant-actions-bar">
                          {(() => {
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
                                <BookOpen size={13} color="#9ca3af" />
                                <span>{srcList.length} Sumber Tervalidasi</span>
                              </button>
                            );
                          })()}

                          <button
                            className="action-btn-small"
                            onClick={() => handleCopy(msg.text, idx)}
                            title="Salin jawaban"
                          >
                            {copiedIdx === idx ? <Check size={13} color="#ffffff" /> : <Copy size={13} />}
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
          </div>

          {/* Floating Bottom Dock for Active Chat */}
          <div className="chat-bottom-dock">
            <div className="chat-dock-inner">
              <div 
                className="kimi-input-box" 
                style={{ padding: '12px 18px 10px 18px' }}
                onClick={() => {
                  if (!currentUser) handleActionGated();
                }}
              >
                <textarea
                  ref={textareaRef}
                  className="kimi-textarea"
                  rows={1}
                  placeholder='Kirim pesan balasan...'
                  value={currentUser ? inputQuery : ''}
                  onChange={handleInputResize}
                  onKeyDown={handleKeyDown}
                  onFocus={(e) => {
                    if (!currentUser) {
                      e.target.blur();
                      handleActionGated();
                    }
                  }}
                  readOnly={!currentUser}
                  disabled={isLoading}
                  style={{ minHeight: '30px' }}
                />

                <div className="kimi-box-bottom" style={{ marginTop: '4px', paddingTop: '4px' }}>
                  <div className="kimi-box-left">
                    <div 
                      className="kimi-select-pill" 
                      onClick={() => handleActionGated(() => onSwitchToDocs())} 
                      title="Lihat katalog pustaka"
                    >
                      <BookOpen size={12} color="#d4af37" />
                      <span>Katalog Pustaka</span>
                    </div>

                    <div 
                      className="kimi-select-pill" 
                      onClick={() => handleActionGated(() => onOpenSbertModal())} 
                      title="Lihat spesifikasi SBERT"
                    >
                      <Sparkles size={12} color="#60a5fa" />
                      <span>Dense SBERT</span>
                    </div>
                  </div>

                  <div className="kimi-box-right">
                    <button
                      type="button"
                      className="kimi-send-btn"
                      onClick={() => {
                        if (!currentUser) handleActionGated();
                        else handleSubmit();
                      }}
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
