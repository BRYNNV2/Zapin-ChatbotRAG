import React from 'react';
import { MessageSquare, BookOpen, BarChart3, Sparkles, CheckCircle2 } from 'lucide-react';

export default function CulturalThemeHeader({ activeTab, setActiveTab, stats }) {
  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="brand-icon-wrapper">
          <Sparkles size={22} color="#FBBF24" />
        </div>
        <div>
          <h1 className="brand-title">ZapinAI Cultural Assistant</h1>
          <div className="brand-subtitle">
            <span>Dense Semantic RAG</span>
            <span>•</span>
            <span style={{ color: 'var(--gold-400)' }}>Sentence-BERT</span>
          </div>
        </div>
      </div>

      <nav className="header-nav">
        <button
          className={`nav-tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          <MessageSquare size={16} />
          <span>Dialog Assistant</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          <BookOpen size={16} />
          <span>Pangkalan Dokumen</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'evaluation' ? 'active' : ''}`}
          onClick={() => setActiveTab('evaluation')}
        >
          <BarChart3 size={16} />
          <span>Riset & Evaluasi Skripsi</span>
        </button>
      </nav>

      <div className="header-stats">
        <div className="status-badge">
          <span className="status-dot"></span>
          <span>{stats.totalChunks || 0} Chunks Tervalidasi</span>
        </div>
        <div className="status-badge" style={{ background: 'rgba(212, 175, 55, 0.1)', borderColor: 'var(--border-gold)', color: 'var(--gold-300)' }}>
          <CheckCircle2 size={13} color="#FBBF24" />
          <span>Pakar Terverifikasi</span>
        </div>
      </div>
    </header>
  );
}
