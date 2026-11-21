import React, { useState, useEffect, useRef } from 'react';
import {
  SquarePen,
  Trash2,
  PanelLeftClose,
  HelpCircle,
  Settings,
  Info,
  LogOut,
  MoreHorizontal
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
  currentUser,
  onOpenAuthModal,
  onLogout,
  setSettingsSubTab
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'about' | null
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

  // Click outside listener untuk menutup popover menu akun
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

  const handleMenuItemClick = (type) => {
    setShowProfileMenu(false);

    if (type === 'settings') {
      if (setSettingsSubTab) setSettingsSubTab('account');
      setActiveTab('settings');
    } else if (type === 'about') {
      setActiveModal('about');
    }
  };

  return (
    <aside className={`kimi-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Sidebar Header: Teks Brand ZAPIN + Tombol Lipat */}
      <div className="sidebar-header">
        <span
          className="sidebar-brand-logo"
          onClick={() => setActiveTab('chat')}
          title="Beranda ZAPIN"
        >
          ZAPIN
        </span>

        <button
          className="sidebar-toggle-btn"
          onClick={onToggleCollapse}
          title="Tutup bilah samping"
        >
          <PanelLeftClose size={18} />
        </button>
      </div>

      {/* Daftar Menu Vertikal Bersih untuk Pengguna Akhir */}
      <nav className="sidebar-nav-list">
        <button
          className={`sidebar-nav-item ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={onNewChat}
          title="Mulai obrolan baru (Ctrl+K)"
        >
          <SquarePen size={16} />
          <span>Obrolan baru</span>
        </button>

        <button
          className="sidebar-nav-item"
          onClick={() => setActiveModal('about')}
        >
          <HelpCircle size={16} />
          <span>Tentang ZapinAI</span>
        </button>

        <button
          className={`sidebar-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => handleMenuItemClick('settings')}
        >
          <Settings size={16} />
          <span>Pengaturan</span>
        </button>
      </nav>

      {/* Area Tengah Sidebar: Riwayat Cloud (Login) / Sementara (Tamu bila sudah chat) / Lapang jika belum ada */}
      <div className="sidebar-history-scroll">
        {(currentUser || sessions.length > 0) && (
          <>
            <div className="sidebar-divider" />
            <div className="sidebar-section-title">
              {currentUser ? 'Terbaru' : 'Sementara'}
            </div>

            {sessions.length === 0 ? (
              <div className="sidebar-empty-history">
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

                  {sess.isTemporary && (
                    <span className="history-temp-badge" title="Disimpan sementara sebelum halaman dimuat ulang">
                      Sementara
                    </span>
                  )}

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
          </>
        )}
      </div>

      {/* Footer Sidebar */}
      <div className="sidebar-footer">
        {!currentUser ? (
          <div className="sidebar-guest-card">
            <div className="sidebar-guest-card-title">
              Simpan riwayat percakapan Anda
            </div>
            <p className="sidebar-guest-card-desc">
              Masuk untuk menyimpan riwayat obrolan budaya Zapin di cloud dan mengaksesnya kembali kapan saja.
            </p>
            <button
              type="button"
              className="sidebar-guest-card-btn"
              onClick={() => onOpenAuthModal && onOpenAuthModal('login')}
            >
              Masuk
            </button>
          </div>
        ) : (
          <>
            {showProfileMenu && (
              <div className="kimi-profile-popover animate-fade-in" ref={popoverRef}>
                <div className="popover-user-profile-card">
                  <div className="popover-user-avatar">
                    {currentUser.full_name
                      ? currentUser.full_name[0].toUpperCase()
                      : currentUser.username
                      ? currentUser.username[0].toUpperCase()
                      : 'U'}
                  </div>
                  <div className="popover-user-meta">
                    <div className="popover-user-name">{currentUser.full_name || currentUser.username}</div>
                    <div className="popover-user-sub">{currentUser.email || currentUser.role || 'Pengguna'}</div>
                  </div>
                </div>

                <div className="popover-menu-divider" />

                <div
                  id="profile-popover-settings"
                  className="popover-menu-item"
                  onClick={() => handleMenuItemClick('settings')}
                >
                  <div className="popover-menu-left">
                    <Settings size={16} />
                    <span>Pengaturan</span>
                  </div>
                </div>

                <div
                  className="popover-menu-item"
                  onClick={() => handleMenuItemClick('about')}
                >
                  <div className="popover-menu-left">
                    <Info size={16} />
                    <span>Tentang ZapinAI</span>
                  </div>
                </div>

                <div className="popover-menu-divider" />

                <div
                  className="popover-menu-item logout"
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onLogout) onLogout();
                  }}
                >
                  <div className="popover-menu-left">
                    <LogOut size={16} color="#dc2626" />
                    <span style={{ color: '#dc2626' }}>Keluar ({currentUser.username})</span>
                  </div>
                </div>
              </div>
            )}

            <div className="sidebar-footer-row">
              <div
                id="user-profile-pill-btn"
                ref={profileButtonRef}
                className={`user-profile-pill ${showProfileMenu ? 'active' : ''}`}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                title="Klik untuk membuka menu akun & pengaturan"
              >
                <div className="user-avatar-circle">
                  {currentUser.full_name
                    ? currentUser.full_name[0].toUpperCase()
                    : currentUser.username
                    ? currentUser.username[0].toUpperCase()
                    : 'U'}
                </div>

                <span className="user-name-text" style={{ maxWidth: '140px' }}>
                  {currentUser.full_name || currentUser.username}
                </span>

                <MoreHorizontal size={15} color="#5d5d5d" style={{ marginLeft: 'auto', marginRight: '4px' }} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal Tentang ZapinAI */}
      {activeModal === 'about' && (
        <div className="simple-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="simple-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="simple-modal-header">
              <h3>Tentang ZapinAI</h3>
              <button className="simple-modal-close" onClick={() => setActiveModal(null)}>
                ×
              </button>
            </div>

            <div className="simple-modal-body">
              <p>
                <strong>ZapinAI Cultural Assistant</strong> adalah sistem kecerdasan buatan berbasis{' '}
                <em>Retrieval-Augmented Generation (RAG)</em> dengan model embedding{' '}
                <strong>Sentence-BERT (paraphrase-multilingual-MiniLM-L12-v2)</strong> untuk
                pelestarian dan akses pengetahuan otentik Tari Zapin Melayu Riau dari korpus
                tervalidasi pakar budaya.
              </p>
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
