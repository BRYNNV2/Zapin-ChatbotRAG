import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  PanelLeftClose, 
  Compass, 
  Cpu, 
  BookOpen, 
  BarChart3, 
  ArrowDownToLine,
  Download,
  Sparkles,
  Gift,
  Info,
  Globe,
  HelpCircle,
  Settings,
  ChevronRight,
  FolderPlus,
  Check,
  User as UserIcon,
  LogIn,
  LogOut
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
  onOpenSbertModal,
  currentUser,
  onOpenAuthModal,
  onLogout
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'about', 'app', 'lang', null
  const popoverRef = useRef(null);
  const profileButtonRef = useRef(null);

  // Shortcut Ctrl+K untuk Obrolan Baru
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

  // Click outside listener untuk menutup popover menu profil
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        showProfileMenu &&
        popoverRef.current &&
        !popoverRef.current.contains(e.target) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(e.target)
      ) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  // Handler menu item profil
  const handleMenuItemClick = (type) => {
    setShowProfileMenu(false);

    if (type === 'settings') {
      onOpenSbertModal();
    } else if (type === 'about') {
      setActiveModal('about');
    } else if (type === 'app') {
      // Ekspor percakapan aktif sebagai berkas teks
      const current = sessions.find(s => s.id === activeSessionId);
      if (current && current.messages && current.messages.length > 0) {
        const textContent = current.messages
          .map(m => `[${m.sender.toUpperCase()}]: ${m.text}`)
          .join('\n\n-------------------------\n\n');
        const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ZapinAI_${current.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        alert("Pilih percakapan aktif yang memiliki pesan untuk diekspor.");
      }
    } else if (type === 'membership') {
      setActiveModal('membership');
    } else if (type === 'gift') {
      setActiveModal('gift');
    } else if (type === 'language') {
      setActiveModal('language');
    } else if (type === 'help') {
      setActiveTab('documents');
    }
  };

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

      {/* Quick Navigation Items: Monochromatic & Elegant */}
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
          <Cpu size={16} />
          <span>Pipeline SBERT</span>
        </button>
      </nav>

      <div className="sidebar-divider" />

      {/* Ruang Kerja Section */}
      <div className="sidebar-section-title">Ruang kerja</div>
      <div style={{ padding: '0 8px', marginBottom: '8px' }}>
        <button
          className="sidebar-nav-item"
          onClick={() => setActiveTab('documents')}
        >
          <FolderPlus size={16} />
          <span>Naskah & Literatur</span>
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

      {/* User Profile Footer with Popup Class Bar */}
      <div className="sidebar-footer">
        {/* Profile Popover Menu (Seperti Kimi AI) */}
        {showProfileMenu && currentUser && (
          <div className="kimi-profile-popover animate-fade-in" ref={popoverRef}>
            {/* User Account Info Card */}
            <div className="popover-user-card">
              <div className="popover-user-avatar">
                {currentUser.full_name ? currentUser.full_name[0].toUpperCase() : currentUser.username[0].toUpperCase()}
              </div>
              <div className="popover-user-details">
                <div className="popover-user-name">{currentUser.full_name || currentUser.username}</div>
                <div className="popover-user-email">{currentUser.email}</div>
                <div className="popover-user-role-badge">{currentUser.role}</div>
              </div>
            </div>

            <div className="popover-menu-divider" />

            <div className="popover-menu-item" onClick={() => handleMenuItemClick('app')}>
              <div className="popover-menu-left">
                <Download size={15} />
                <span>Dapatkan Aplikasi / Ekspor</span>
              </div>
              <ChevronRight size={14} color="var(--text-muted)" />
            </div>

            <div className="popover-menu-item" onClick={() => handleMenuItemClick('about')}>
              <div className="popover-menu-left">
                <Info size={15} />
                <span>Tentang ZapinAI</span>
              </div>
              <ChevronRight size={14} color="var(--text-muted)" />
            </div>

            <div className="popover-menu-item" onClick={() => handleMenuItemClick('settings')}>
              <div className="popover-menu-left">
                <Settings size={15} />
                <span>Pengaturan Pipeline SBERT</span>
              </div>
            </div>

            <div className="popover-menu-divider" />

            <div 
              className="popover-menu-item" 
              onClick={() => {
                setShowProfileMenu(false);
                if (onLogout) onLogout();
              }}
              style={{ color: '#ef4444' }}
            >
              <div className="popover-menu-left">
                <LogOut size={15} color="#ef4444" />
                <span style={{ color: '#ef4444', fontWeight: 500 }}>Keluar (Logout)</span>
              </div>
            </div>
          </div>
        )}

        {/* Profile Button / Login Button */}
        {currentUser ? (
          <div 
            ref={profileButtonRef}
            className={`user-profile-pill ${showProfileMenu ? 'active' : ''}`}
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            title="Klik untuk melihat menu akun & profil"
          >
            <div className="user-avatar-circle">
              {currentUser.full_name ? currentUser.full_name[0].toUpperCase() : currentUser.username[0].toUpperCase()}
            </div>
            <span className="user-name-text">
              {currentUser.full_name 
                ? (currentUser.full_name.length > 10 ? currentUser.full_name.slice(0, 9) + '...' : currentUser.full_name) 
                : currentUser.username}
            </span>
            <span className="upgrade-badge">
              {currentUser.role.includes('Pakar') ? 'Pakar' : currentUser.role.includes('Peneliti') ? 'Peneliti' : 'Aktif'}
            </span>
          </div>
        ) : (
          <div 
            className="user-profile-pill not-logged-in"
            onClick={onOpenAuthModal}
            title="Masuk atau Daftar akun untuk menyimpan riwayat di cloud"
          >
            <div className="user-avatar-circle" style={{ background: '#27272e', color: '#d1d5db' }}>
              <LogIn size={13} />
            </div>
            <span className="user-name-text">Masuk / Daftar</span>
            <span className="upgrade-badge" style={{ background: 'rgba(255,255,255,0.08)', color: '#d1d5db' }}>
              Cloud
            </span>
          </div>
        )}

        <button
          className="sidebar-download-btn"
          title="Unduh / Ekspor Percakapan"
          onClick={() => handleMenuItemClick('app')}
        >
          <ArrowDownToLine size={15} />
        </button>
      </div>

      {/* Mini Modal Informasional dari Popover */}
      {activeModal && (
        <div className="simple-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="simple-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="simple-modal-header">
              <h3>
                {activeModal === 'about' && 'Tentang ZapinAI'}
                {activeModal === 'membership' && 'Paket Riset Budaya'}
                {activeModal === 'gift' && 'Akses Literatur Terverifikasi'}
                {activeModal === 'language' && 'Pengaturan Bahasa'}
              </h3>
              <button className="simple-modal-close" onClick={() => setActiveModal(null)}>
                ×
              </button>
            </div>

            <div className="simple-modal-body">
              {activeModal === 'about' && (
                <p>
                  <strong>ZapinAI Cultural Assistant</strong> adalah sistem kecerdasan buatan berbasis <em>Retrieval-Augmented Generation (RAG)</em> dengan model embedding <strong>Sentence-BERT (paraphrase-multilingual-MiniLM-L12-v2)</strong> untuk preservasi dan akses pengetahuan otentik Tari Zapin Melayu tervalidasi pakar seni budaya.
                </p>
              )}

              {activeModal === 'membership' && (
                <p>
                  Status Anda saat ini adalah <strong>Peneliti Skripsi (Researcher Tier)</strong> dengan akses tak terbatas ke seluruh basis data naskah Tari Zapin, instrumen musik, dan ragam gerak.
                </p>
              )}

              {activeModal === 'gift' && (
                <p>
                  Semua naskah primer di dalam katalog telah divalidasi oleh pakar tari tradisi dan budayawan Melayu Riau untuk menjamin integritas ground truth data.
                </p>
              )}

              {activeModal === 'language' && (
                <p>
                  Bahasa aktif sistem: <strong>Bahasa Indonesia & Melayu Multilingual</strong> (didukung oleh arsitektur multilingual Sentence-BERT).
                </p>
              )}
            </div>

            <div className="simple-modal-footer">
              <button className="btn-secondary" onClick={() => setActiveModal(null)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
