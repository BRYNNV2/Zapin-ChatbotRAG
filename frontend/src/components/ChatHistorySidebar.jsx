import React, { useEffect } from 'react';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  PanelLeftClose, 
  Compass, 
  Cpu, 
  BookOpen, 
  BarChart3, 
  MoreHorizontal, 
  FolderPlus,
  ArrowDownToLine
} from 'lucide-react';

export default function ChatHistorySidebar({
  isCollapsed,
  onToggleCollapse,
  activeTab,
  setActiveTab,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  stats,
  onOpenSbertModal
}) {
  // Listen for Ctrl+K shortcut to create new chat
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onNewChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNewChat]);

  return (
    <aside className={`kimi-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="kimi-logo-badge">Z</div>
        </div>

        <button 
          className="sidebar-toggle-btn" 
          onClick={onToggleCollapse} 
          title="Tutup bilah samping"
        >
          <PanelLeftClose size={18} />
        </button>
      </div>

      {/* Obrolan Baru Button (Kimi Pill) */}
      <div className="sidebar-action-wrap">
        <button className="btn-new-chat" onClick={onNewChat}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={16} />
            <span>Obrolan baru</span>
          </div>
          <span className="shortcut-badge">Ctrl K</span>
        </button>
      </div>

      {/* Quick Navigation Items */}
      <nav className="sidebar-nav-list">
        <button
          className={`sidebar-nav-item ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          <Compass size={16} />
          <span>Zapin Assistant</span>
        </button>

        <button
          className={`sidebar-nav-item ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          <BookOpen size={16} />
          <span style={{ flex: 1 }}>Katalog Pustaka</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            {stats.totalDocuments || 4} Naskah
          </span>
        </button>

        <button
          className={`sidebar-nav-item ${activeTab === 'evaluation' ? 'active' : ''}`}
          onClick={() => setActiveTab('evaluation')}
        >
          <BarChart3 size={16} />
          <span>Riset & Evaluasi</span>
        </button>

        <button
          className="sidebar-nav-item"
          onClick={onOpenSbertModal}
          title="Lihat spesifikasi & kalibrasi Sentence-BERT"
        >
          <Cpu size={16} color="#60a5fa" />
          <span>Pipeline SBERT</span>
        </button>
      </nav>

      <div className="sidebar-divider" />

      {/* Basis Data Pengetahuan Section */}
      <div className="sidebar-section-title">Basis Data Pengetahuan</div>
      <div style={{ padding: '0 8px', marginBottom: '8px' }}>
        <button
          className="sidebar-nav-item"
          style={{ color: 'var(--text-secondary)' }}
          onClick={() => setActiveTab('documents')}
        >
          <BookOpen size={15} color="#d4af37" />
          <span>Naskah Zapin Tervalidasi</span>
        </button>
      </div>

      {/* Chat History Section */}
      <div className="sidebar-section-title">Chat</div>
      <div className="sidebar-history-scroll">
        {sessions.length === 0 ? (
          <div style={{ padding: '12px 14px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Belum ada riwayat percakapan.
          </div>
        ) : (
          sessions.map((sess) => (
            <div
              key={sess.id}
              className={`history-row ${sess.id === activeSessionId && activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('chat');
                onSelectSession(sess.id);
              }}
            >
              <span className="history-text">
                {sess.title || 'Percakapan Budaya Zapin'}
              </span>

              <button
                className="history-delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(sess.id);
                }}
                title="Hapus percakapan"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* User Profile Footer */}
      <div className="sidebar-footer">
        <div className="user-profile-pill">
          <div className="user-avatar-circle">M</div>
          <span className="user-name-text">mh...</span>
          <span className="upgrade-badge">Skripsi</span>
        </div>

        <button
          className="action-btn-small"
          style={{ padding: '4px' }}
          title="Unduh laporan"
          onClick={() => setActiveTab('evaluation')}
        >
          <ArrowDownToLine size={15} />
        </button>
      </div>
    </aside>
  );
}
