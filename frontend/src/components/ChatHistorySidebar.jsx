import React, { useState, useEffect, useRef } from 'react';
import {
  SquarePen,
  Trash2,
  PanelLeftClose,
  HelpCircle,
  Settings,
  LogOut,
  Smile,
  UserCircle,
  LifeBuoy,
  ChevronRight
} from 'lucide-react';

const getInitials = (user) => {
  if (!user) return 'U';
  const name = (user.full_name || '').trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  const uname = (user.username || '').trim();
  if (uname) return uname.slice(0, 2).toUpperCase();
  return 'U';
};

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
  onOpenSettings,
  onLogout,
  setSettingsSubTab
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'about' | 'profile' | 'help' | null
  const popoverRef = useRef(null);
  const profileButtonRef = useRef(null);

  const initials = getInitials(currentUser);
  const displayName = currentUser?.full_name || currentUser?.username || 'Pengguna';
  const userSub = currentUser?.email || currentUser?.role || 'Pengguna';

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

    if (currentUser && onOpenSettings) {
      if (type === 'settings' || type === 'profile') {
        onOpenSettings('account');
        return;
      } else if (type === 'personalization') {
        onOpenSettings('personalization');
        return;
      }
    }

    if (type === 'settings') {
      if (setSettingsSubTab) setSettingsSubTab('account');
      setActiveTab('settings');
    } else if (type === 'help') {
      setActiveModal('help');
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

        {!currentUser && (
          <button
            className={`sidebar-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => handleMenuItemClick('settings')}
          >
            <Settings size={16} />
            <span>Pengaturan</span>
          </button>
        )}
      </nav>

      {/* Area Tengah Sidebar: Riwayat Percakapan */}
      <div className="sidebar-history-scroll">
        {(currentUser || sessions.length > 0) && (
          <>
            <div className="sidebar-divider" />
            <div className="sidebar-section-title">
              Terbaru
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
                {/* Header Profil (Klik untuk membuka detail profil) */}
                <div
                  className="popover-user-profile-card clickable"
                  onClick={() => handleMenuItemClick('profile')}
                >
                  <div className="popover-user-avatar">{initials}</div>
                  <div className="popover-user-meta">
                    <div className="popover-user-name">{displayName}</div>
                    <div className="popover-user-sub">{userSub}</div>
                  </div>
                  <ChevronRight size={15} className="popover-chevron" />
                </div>

                <div className="popover-menu-divider" />

                {/* Kelompok 1: Personalisasi, Profil, Pengaturan */}
                <div
                  className="popover-menu-item"
                  onClick={() => handleMenuItemClick('personalization')}
                >
                  <div className="popover-menu-left">
                    <Smile size={16} />
                    <span>Personalisasi</span>
                  </div>
                </div>

                <div
                  className="popover-menu-item"
                  onClick={() => handleMenuItemClick('profile')}
                >
                  <div className="popover-menu-left">
                    <UserCircle size={16} />
                    <span>Profil</span>
                  </div>
                </div>

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

                <div className="popover-menu-divider" />

                {/* Kelompok 2: Bantuan & Keluar */}
                <div
                  className="popover-menu-item"
                  onClick={() => handleMenuItemClick('help')}
                >
                  <div className="popover-menu-left">
                    <LifeBuoy size={16} />
                    <span>Bantuan</span>
                  </div>
                  <ChevronRight size={15} className="popover-chevron" />
                </div>

                <div
                  className="popover-menu-item logout"
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onLogout) onLogout();
                  }}
                >
                  <div className="popover-menu-left">
                    <LogOut size={16} />
                    <span>Keluar</span>
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
                <div className="user-avatar-circle">{initials}</div>

                <div className="user-pill-info">
                  <span className="user-name-text">{displayName}</span>
                  <span className="user-sub-text">{userSub}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal Informasi (Tentang ZapinAI, Profil, Bantuan) */}
      {activeModal && (
        <div className="simple-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="simple-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="simple-modal-header">
              <h3>
                {activeModal === 'about' && 'Tentang ZapinAI'}
                {activeModal === 'profile' && 'Profil Akun'}
                {activeModal === 'help' && 'Bantuan Penggunaan ZAPIN'}
              </h3>
              <button className="simple-modal-close" onClick={() => setActiveModal(null)}>
                ×
              </button>
            </div>

            <div className="simple-modal-body">
              {activeModal === 'about' && (
                <p>
                  <strong>ZapinAI Cultural Assistant</strong> adalah sistem kecerdasan buatan berbasis{' '}
                  <em>Retrieval-Augmented Generation (RAG)</em> dengan model embedding{' '}
                  <strong>Sentence-BERT (paraphrase-multilingual-MiniLM-L12-v2)</strong> untuk
                  pelestarian dan akses pengetahuan otentik Tari Zapin Melayu Riau dari korpus
                  tervalidasi pakar budaya.
                </p>
              )}

              {activeModal === 'profile' && currentUser && (
                <div>
                  <div className="profile-modal-top">
                    <div className="popover-user-avatar" style={{ width: '48px', height: '48px', fontSize: '1.05rem' }}>
                      {initials}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.98rem' }}>{displayName}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {currentUser.role || 'Peneliti / Mahasiswa Budaya'}
                      </div>
                    </div>
                  </div>

                  <div className="profile-detail-list">
                    <div className="profile-detail-row">
                      <span className="profile-detail-label">Nama Lengkap</span>
                      <span className="profile-detail-value">{currentUser.full_name || '-'}</span>
                    </div>
                    <div className="profile-detail-row">
                      <span className="profile-detail-label">Username</span>
                      <span className="profile-detail-value">{currentUser.username || '-'}</span>
                    </div>
                    <div className="profile-detail-row">
                      <span className="profile-detail-label">Email</span>
                      <span className="profile-detail-value">{currentUser.email || '-'}</span>
                    </div>
                    <div className="profile-detail-row">
                      <span className="profile-detail-label">Percakapan Tersimpan</span>
                      <span className="profile-detail-value">{sessions.length} sesi</span>
                    </div>
                  </div>
                </div>
              )}

              {activeModal === 'help' && (
                <div className="help-guide-list">
                  <div className="help-guide-item">
                    <strong>1. Ajukan Pertanyaan Budaya Zapin</strong>
                    <p>
                      Ketik pertanyaan seputar sejarah, ragam gerak (Tahto, Pecah, Tahtim), musik
                      pengiring (Gambus &amp; Marwas), atau busana Tari Zapin Melayu Riau.
                    </p>
                  </div>
                  <div className="help-guide-item">
                    <strong>2. Periksa Sumber Sitasi [1][2]</strong>
                    <p>
                      Klik angka sitasi pada jawaban atau tombol <em>Bar Rujukan</em> untuk melihat
                      kutipan naskah asli beserta halaman dokumennya.
                    </p>
                  </div>
                  <div className="help-guide-item">
                    <strong>3. Pintasan Keyboard</strong>
                    <p>
                      <code>Ctrl + K</code> untuk obrolan baru, <code>Enter</code> untuk mengirim
                      pesan, dan <code>Shift + Enter</code> untuk baris baru.
                    </p>
                  </div>
                </div>
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
