import React, { useState, useEffect, useRef } from 'react';
import {
  SquarePen,
  MoreHorizontal,
  Pin,
  PanelLeftClose,
  HelpCircle,
  Settings,
  LogOut,
  Smile,
  UserCircle,
  LifeBuoy,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import HelpSubmenu from './HelpSubmenu';
import HelpInfoModal from './HelpInfoModal';
import ChatItemMenu from './ChatItemMenu';
import DeleteChatModal from './DeleteChatModal';

const readStorageMap = (storageKey) => {
  try {
    const raw = localStorage.getItem(storageKey);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const writeStorageMap = (storageKey, value) => {
  try {
    localStorage.setItem(storageKey, JSON.stringify(value));
  } catch {}
};

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
  onRenameSession,
  onShareSession,
  currentUser,
  onOpenAuthModal,
  onOpenSettings,
  onLogout,
  setSettingsSubTab
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showHelpSubmenu, setShowHelpSubmenu] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'about' | 'profile' | null
  const [helpModalSection, setHelpModalSection] = useState(null);
  const [menuState, setMenuState] = useState(null); // { sessionId, rect }
  const [renamingSessionId, setRenamingSessionId] = useState(null);
  const [renameDraft, setRenameDraft] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [pinnedByUser, setPinnedByUser] = useState(() => readStorageMap('zapin_pinned_sessions'));
  const [archivedByUser, setArchivedByUser] = useState(() => readStorageMap('zapin_archived_sessions'));
  const [pendingDeleteSession, setPendingDeleteSession] = useState(null);
  const [actionToast, setActionToast] = useState('');
  const popoverRef = useRef(null);
  const profileButtonRef = useRef(null);
  const helpHoverTimeoutRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  const userKey = currentUser?.id || 'guest';
  const pinnedIds = pinnedByUser[userKey] || [];
  const archivedIds = archivedByUser[userKey] || [];
  const initials = getInitials(currentUser);
  const displayName = currentUser?.full_name || currentUser?.username || 'Pengguna';
  const userSub = currentUser?.email || currentUser?.role || 'Pengguna';

  const clearHelpHoverTimeout = () => {
    if (helpHoverTimeoutRef.current) {
      clearTimeout(helpHoverTimeoutRef.current);
      helpHoverTimeoutRef.current = null;
    }
  };

  const openHelpSubmenu = () => {
    clearHelpHoverTimeout();
    setShowHelpSubmenu(true);
  };

  const scheduleCloseHelpSubmenu = () => {
    clearHelpHoverTimeout();
    helpHoverTimeoutRef.current = setTimeout(() => {
      setShowHelpSubmenu(false);
    }, 120);
  };

  useEffect(() => {
    return () => {
      clearHelpHoverTimeout();
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const showToast = (msg) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setActionToast(msg);
    toastTimeoutRef.current = setTimeout(() => setActionToast(''), 2200);
  };

  const handleTogglePin = (sessionId) => {
    const isCurrentlyPinned = pinnedIds.includes(sessionId);
    const nextList = isCurrentlyPinned
      ? pinnedIds.filter((id) => id !== sessionId)
      : [sessionId, ...pinnedIds];
    const nextMap = { ...pinnedByUser, [userKey]: nextList };
    setPinnedByUser(nextMap);
    writeStorageMap('zapin_pinned_sessions', nextMap);
  };

  const handleToggleArchive = (sessionId) => {
    const isCurrentlyArchived = archivedIds.includes(sessionId);
    const nextList = isCurrentlyArchived
      ? archivedIds.filter((id) => id !== sessionId)
      : [sessionId, ...archivedIds];
    const nextMap = { ...archivedByUser, [userKey]: nextList };
    setArchivedByUser(nextMap);
    writeStorageMap('zapin_archived_sessions', nextMap);
    showToast(isCurrentlyArchived ? 'Percakapan dipulihkan dari arsip' : 'Percakapan diarsipkan');
  };

  const handleStartRename = (sess) => {
    setRenamingSessionId(sess.id);
    setRenameDraft(sess.title || 'Percakapan Budaya Zapin');
  };

  const handleCommitRename = async (sessionId) => {
    const trimmed = renameDraft.trim();
    setRenamingSessionId(null);
    if (trimmed && onRenameSession) {
      await onRenameSession(sessionId, trimmed);
    }
  };

  const handleShareClick = async (sessionId) => {
    if (!onShareSession) return;
    const copied = await onShareClickResult(sessionId);
    showToast(copied ? 'Percakapan disalin ke clipboard' : 'Gagal menyalin percakapan');
  };

  const onShareClickResult = async (sessionId) => {
    return Boolean(await onShareSession(sessionId));
  };

  const handleDeleteWithCleanup = (sessionId) => {
    if (pinnedIds.includes(sessionId)) {
      const nextPinned = { ...pinnedByUser, [userKey]: pinnedIds.filter((id) => id !== sessionId) };
      setPinnedByUser(nextPinned);
      writeStorageMap('zapin_pinned_sessions', nextPinned);
    }
    if (archivedIds.includes(sessionId)) {
      const nextArchived = { ...archivedByUser, [userKey]: archivedIds.filter((id) => id !== sessionId) };
      setArchivedByUser(nextArchived);
      writeStorageMap('zapin_archived_sessions', nextArchived);
    }
    if (onDeleteSession) onDeleteSession(sessionId);
  };

  const activeMenuSession = menuState
    ? sessions.find((s) => s.id === menuState.sessionId) || null
    : null;

  const visibleSessions = sessions
    .filter((s) => !archivedIds.includes(s.id))
    .sort((a, b) => {
      const aPinned = pinnedIds.includes(a.id) ? 1 : 0;
      const bPinned = pinnedIds.includes(b.id) ? 1 : 0;
      return bPinned - aPinned;
    });

  const archivedSessions = sessions.filter((s) => archivedIds.includes(s.id));

  // Shortcut Ctrl+K untuk Obrolan Baru & Ctrl+/ untuk Pintasan Keyboard
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onNewChat();
      } else if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setShowProfileMenu(false);
        setShowHelpSubmenu(false);
        setHelpModalSection('shortcuts');
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
        setShowHelpSubmenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  const handleMenuItemClick = (type) => {
    setShowProfileMenu(false);
    setShowHelpSubmenu(false);

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
    } else if (type === 'about') {
      setActiveModal('about');
    }
  };

  const handleSelectHelpSection = (sectionKey) => {
    clearHelpHoverTimeout();
    setShowHelpSubmenu(false);
    setShowProfileMenu(false);
    setHelpModalSection(sectionKey);
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
        {actionToast && (
          <div className="sidebar-action-toast animate-fade-in">{actionToast}</div>
        )}

        {(currentUser || sessions.length > 0) && (
          <>
            <div className="sidebar-divider" />
            <div className="sidebar-section-title">
              Terbaru
            </div>

            {visibleSessions.length === 0 ? (
              <div className="sidebar-empty-history">
                {archivedSessions.length > 0
                  ? 'Semua percakapan berada di arsip.'
                  : 'Belum ada riwayat percakapan.'}
              </div>
            ) : (
              visibleSessions.map((sess) => {
                const isPinned = pinnedIds.includes(sess.id);
                const isMenuOpen = menuState?.sessionId === sess.id;
                const isRenaming = renamingSessionId === sess.id;

                return (
                  <div
                    key={sess.id}
                    className={`history-row ${sess.id === activeSessionId && activeTab === 'chat' ? 'active' : ''}`}
                    onClick={() => {
                      if (isRenaming) return;
                      setActiveTab('chat');
                      onSelectSession(sess.id);
                    }}
                  >
                    {isRenaming ? (
                      <input
                        type="text"
                        className="history-rename-input"
                        value={renameDraft}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setRenameDraft(e.target.value)}
                        onBlur={() => handleCommitRename(sess.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleCommitRename(sess.id);
                          } else if (e.key === 'Escape') {
                            e.preventDefault();
                            setRenamingSessionId(null);
                          }
                        }}
                      />
                    ) : (
                      <>
                        <span className="history-text">
                          {sess.title || 'Percakapan Budaya Zapin'}
                        </span>

                        <div className="history-row-actions">
                          {isPinned && (
                            <span className="history-pin-indicator" title="Disematkan">
                              <Pin size={13} />
                            </span>
                          )}
                          <button
                            type="button"
                            className={`history-more-btn ${isMenuOpen ? 'menu-open' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              const rect = e.currentTarget.getBoundingClientRect();
                              setMenuState((prev) =>
                                prev?.sessionId === sess.id ? null : { sessionId: sess.id, rect }
                              );
                            }}
                            title="Opsi percakapan"
                            aria-label="Opsi percakapan"
                            aria-haspopup="menu"
                            aria-expanded={isMenuOpen}
                          >
                            <MoreHorizontal size={15} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            )}

            {archivedSessions.length > 0 && (
              <div className="sidebar-archived-wrap">
                <button
                  type="button"
                  className="sidebar-archived-toggle"
                  onClick={() => setShowArchived((prev) => !prev)}
                >
                  <span>Diarsipkan ({archivedSessions.length})</span>
                  <ChevronDown
                    size={14}
                    className={`sidebar-archived-chevron ${showArchived ? 'open' : ''}`}
                  />
                </button>

                {showArchived &&
                  archivedSessions.map((sess) => {
                    const isMenuOpen = menuState?.sessionId === sess.id;
                    const isRenaming = renamingSessionId === sess.id;

                    return (
                      <div
                        key={sess.id}
                        className={`history-row ${sess.id === activeSessionId && activeTab === 'chat' ? 'active' : ''}`}
                        onClick={() => {
                          if (isRenaming) return;
                          setActiveTab('chat');
                          onSelectSession(sess.id);
                        }}
                      >
                        {isRenaming ? (
                          <input
                            type="text"
                            className="history-rename-input"
                            value={renameDraft}
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => setRenameDraft(e.target.value)}
                            onBlur={() => handleCommitRename(sess.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleCommitRename(sess.id);
                              } else if (e.key === 'Escape') {
                                e.preventDefault();
                                setRenamingSessionId(null);
                              }
                            }}
                          />
                        ) : (
                          <>
                            <span className="history-text">
                              {sess.title || 'Percakapan Budaya Zapin'}
                            </span>

                            <div className="history-row-actions">
                              <button
                                type="button"
                                className={`history-more-btn ${isMenuOpen ? 'menu-open' : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setMenuState((prev) =>
                                    prev?.sessionId === sess.id
                                      ? null
                                      : { sessionId: sess.id, rect }
                                  );
                                }}
                                title="Opsi percakapan"
                                aria-label="Opsi percakapan"
                                aria-haspopup="menu"
                                aria-expanded={isMenuOpen}
                              >
                                <MoreHorizontal size={15} />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Menu Aksi Mengambang (...) Percakapan Sidebar */}
      <ChatItemMenu
        session={activeMenuSession}
        anchorRect={menuState?.rect}
        isPinned={activeMenuSession ? pinnedIds.includes(activeMenuSession.id) : false}
        isArchived={activeMenuSession ? archivedIds.includes(activeMenuSession.id) : false}
        onClose={() => setMenuState(null)}
        onTogglePin={handleTogglePin}
        onRename={handleStartRename}
        onShare={handleShareClick}
        onToggleArchive={handleToggleArchive}
        onDelete={(sessionId) => {
          const target = sessions.find((s) => s.id === sessionId);
          if (target) setPendingDeleteSession(target);
        }}
      />

      {/* Popup Konfirmasi Hapus Percakapan */}
      <DeleteChatModal
        session={pendingDeleteSession}
        onCancel={() => setPendingDeleteSession(null)}
        onConfirm={(sessionId) => {
          handleDeleteWithCleanup(sessionId);
          setPendingDeleteSession(null);
          showToast('Percakapan dihapus');
        }}
      />

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

                {/* Kelompok 2: Bantuan (dengan submenu samping) & Keluar */}
                <div
                  className="popover-help-wrapper"
                  onMouseEnter={openHelpSubmenu}
                  onMouseLeave={scheduleCloseHelpSubmenu}
                >
                  <div
                    id="profile-popover-help"
                    className={`popover-menu-item ${showHelpSubmenu ? 'submenu-open' : ''}`}
                    onClick={() => {
                      clearHelpHoverTimeout();
                      setShowHelpSubmenu((prev) => !prev);
                    }}
                    aria-haspopup="menu"
                    aria-expanded={showHelpSubmenu}
                  >
                    <div className="popover-menu-left">
                      <LifeBuoy size={16} />
                      <span>Bantuan</span>
                    </div>
                    <ChevronRight size={15} className="popover-chevron" />
                  </div>

                  {showHelpSubmenu && (
                    <HelpSubmenu
                      onSelect={handleSelectHelpSection}
                      onMouseEnter={openHelpSubmenu}
                      onMouseLeave={scheduleCloseHelpSubmenu}
                    />
                  )}
                </div>

                <div
                  className="popover-menu-item logout"
                  onClick={() => {
                    clearHelpHoverTimeout();
                    setShowHelpSubmenu(false);
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
                onClick={() => {
                  clearHelpHoverTimeout();
                  setShowHelpSubmenu(false);
                  setShowProfileMenu((prev) => !prev);
                }}
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

      {/* Modal Informasi (Tentang ZapinAI, Profil) */}
      {activeModal && (
        <div className="simple-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="simple-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="simple-modal-header">
              <h3>
                {activeModal === 'about' && 'Tentang ZapinAI'}
                {activeModal === 'profile' && 'Profil Akun'}
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
            </div>

            <div className="simple-modal-footer">
              <button className="btn-secondary" onClick={() => setActiveModal(null)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail Menu Bantuan (Pusat bantuan, Pintasan, Legal, Bug) */}
      <HelpInfoModal
        section={helpModalSection}
        onClose={() => setHelpModalSection(null)}
      />
    </aside>
  );
}
