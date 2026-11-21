import React, { useState } from 'react';
import {
  ChevronLeft,
  User,
  Sun,
  Command,
  MessageSquare,
  ChevronRight,
  LogOut,
  LogIn,
  Shield,
  Monitor
} from 'lucide-react';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const VALID_TABS = new Set(['account', 'chatsettings', 'appearance', 'shortcuts']);

export default function SettingsPage({
  onBack,
  currentUser,
  onLogout,
  onOpenAuthModal,
  initialSubTab = 'account'
}) {
  const [activeSubTab, setActiveSubTab] = useState(
    VALID_TABS.has(initialSubTab) ? initialSubTab : 'account'
  );
  const [showDeviceModal, setShowDeviceModal] = useState(false);

  const username = currentUser?.username || '';
  const displayName = currentUser?.full_name || currentUser?.username || '';
  const userEmail = currentUser?.email || '';
  const userRole = currentUser?.role || 'Peneliti / Mahasiswa Budaya';
  const avatarInitial = (displayName || username || 'U')[0].toUpperCase();

  return (
    <div className="kimi-settings-screen animate-fade-in">
      {/* Sidebar Navigasi Pengaturan */}
      <aside className="kimi-settings-sidebar">
        <button
          id="settings-back-btn"
          className="settings-back-btn"
          onClick={onBack}
          title="Kembali ke Obrolan"
        >
          <ChevronLeft size={18} />
          <span>Kembali</span>
        </button>

        <div className="settings-nav-scroll">
          <div className="settings-section-heading">Pengaturan</div>
          <div className="settings-nav-group">
            <button
              id="settings-nav-account"
              className={`settings-nav-item ${activeSubTab === 'account' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('account')}
            >
              <User size={17} />
              <span>Akun &amp; Keamanan</span>
            </button>

            <button
              className={`settings-nav-item ${activeSubTab === 'chatsettings' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('chatsettings')}
            >
              <MessageSquare size={17} />
              <span>Pengaturan Obrolan</span>
            </button>

            <button
              className={`settings-nav-item ${activeSubTab === 'appearance' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('appearance')}
            >
              <Sun size={17} />
              <span>Tampilan</span>
            </button>

            <button
              className={`settings-nav-item ${activeSubTab === 'shortcuts' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('shortcuts')}
            >
              <Command size={17} />
              <span>Pintasan</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Area Konten Utama Pengaturan */}
      <main className="kimi-settings-main">
        {/* SUBTAB 1: Akun & Keamanan */}
        {activeSubTab === 'account' && (
          <div className="settings-content-wrapper">
            <div className="settings-account-content">
              {currentUser ? (
                <>
                  <div className="settings-profile-header">
                    <div className="settings-avatar-circle">
                      {avatarInitial}
                    </div>
                    <div className="settings-profile-info-group">
                      <h2 className="settings-username">{displayName}</h2>
                      <span className="settings-user-role-pill">{userRole}</span>
                    </div>
                  </div>

                  <div className="settings-card-section">
                    <span className="settings-group-label">Informasi Akun</span>
                    <div className="settings-card-box">
                      <div className="settings-card-row">
                        <div className="settings-row-left">
                          <GoogleIcon />
                          <span>Email Terdaftar</span>
                        </div>
                        <div className="settings-row-right">
                          <span className="settings-row-value">{userEmail || '-'}</span>
                        </div>
                      </div>

                      <div className="settings-row-divider" />

                      <div className="settings-card-row">
                        <div className="settings-row-left">
                          <User size={18} color="#5d5d5d" />
                          <span>Username</span>
                        </div>
                        <div className="settings-row-right">
                          <span className="settings-row-value">{username || '-'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="settings-card-section">
                    <span className="settings-group-label">Keamanan Akun</span>
                    <div className="settings-card-box">
                      <div
                        className="settings-card-row clickable"
                        onClick={() => setShowDeviceModal(true)}
                      >
                        <div className="settings-row-left">
                          <Shield size={18} color="#5d5d5d" />
                          <span>Kelola Perangkat &amp; Sesi</span>
                        </div>
                        <div className="settings-row-right" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span className="settings-row-value">Sesi Aktif</span>
                          <ChevronRight size={15} color="#8e8ea0" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="settings-logout-btn"
                    onClick={() => {
                      if (onLogout) onLogout();
                      onBack();
                    }}
                  >
                    <LogOut size={16} />
                    <span>Keluar ({username})</span>
                  </button>
                </>
              ) : (
                <div className="settings-unauth-container">
                  <div className="settings-unauth-card">
                    <div className="settings-unauth-avatar">
                      <User size={34} color="#5d5d5d" />
                    </div>
                    <h2 className="settings-unauth-title">Anda Sedang dalam Mode Tamu</h2>
                    <p className="settings-unauth-desc">
                      Anda tetap dapat menggunakan percakapan sementara dan menjelajahi fitur sistem. Masuk ke akun untuk menyimpan riwayat percakapan Zapin secara permanen di cloud PostgreSQL.
                    </p>
                    <button
                      type="button"
                      className="settings-unauth-login-btn"
                      onClick={() => {
                        onBack();
                        if (onOpenAuthModal) onOpenAuthModal('login');
                      }}
                    >
                      <LogIn size={16} />
                      <span>Masuk atau Daftar Akun</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUBTAB 2: Pengaturan Obrolan */}
        {activeSubTab === 'chatsettings' && (
          <div className="settings-content-wrapper">
            <div className="settings-generic-content">
              <h3>Pengaturan Obrolan</h3>
              <p className="settings-subtitle">Gaya bahasa, sitasi, dan penyimpanan sesi obrolan.</p>

              <div className="settings-card-box" style={{ marginTop: '16px' }}>
                <div className="settings-card-row">
                  <div>
                    <div style={{ fontWeight: 500, color: '#0d0d0d' }}>Mode Penyimpanan Saat Ini</div>
                    <div style={{ fontSize: '0.78rem', color: '#5d5d5d' }}>
                      {currentUser
                        ? 'Riwayat percakapan tersinkronisasi ke database cloud PostgreSQL.'
                        : 'Mode Tamu — percakapan hanya disimpan sementara di memori hingga halaman di-refresh.'}
                    </div>
                  </div>
                  <span style={{ color: currentUser ? '#047857' : '#b45309', fontWeight: 600, fontSize: '0.82rem' }}>
                    {currentUser ? 'Cloud Akun' : 'Sementara'}
                  </span>
                </div>
                <div className="settings-row-divider" />
                <div className="settings-card-row">
                  <div>
                    <div style={{ fontWeight: 500, color: '#0d0d0d' }}>Gaya Respons</div>
                    <div style={{ fontSize: '0.78rem', color: '#5d5d5d' }}>
                      Bahasa Indonesia santun berakar budaya Melayu &amp; terikat dokumen.
                    </div>
                  </div>
                  <span style={{ color: '#5d5d5d', fontWeight: 500 }}>Grounded RAG</span>
                </div>
                <div className="settings-row-divider" />
                <div className="settings-card-row">
                  <span>Sitasi Sumber Otomatis [1][2]</span>
                  <span style={{ color: '#047857', fontWeight: 600, fontSize: '0.82rem' }}>Aktif</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 4: Tampilan */}
        {activeSubTab === 'appearance' && (
          <div className="settings-content-wrapper">
            <div className="settings-generic-content">
              <h3>Tampilan &amp; Antarmuka</h3>
              <p className="settings-subtitle">Informasi tema visual aplikasi chatbot ZAPIN.</p>

              <div className="settings-card-box" style={{ marginTop: '16px' }}>
                <div className="settings-card-row">
                  <span>Tema Aplikasi</span>
                  <span style={{ color: '#0d0d0d', fontWeight: 600 }}>Zapin Clean Light (Aktif)</span>
                </div>
                <div className="settings-row-divider" />
                <div className="settings-card-row">
                  <span>Nuansa Warna Aksen</span>
                  <span style={{ color: '#5d5d5d' }}>Monokrom Bersih &amp; Aksen Emas</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 5: Pintasan Keyboard */}
        {activeSubTab === 'shortcuts' && (
          <div className="settings-content-wrapper">
            <div className="settings-generic-content">
              <h3>Pintasan Keyboard</h3>
              <p className="settings-subtitle">Navigasi lebih cepat dengan tombol pintas.</p>

              <div className="settings-card-box" style={{ marginTop: '16px' }}>
                <div className="settings-card-row">
                  <span>Obrolan Baru</span>
                  <kbd className="settings-kbd">Ctrl + K</kbd>
                </div>
                <div className="settings-row-divider" />
                <div className="settings-card-row">
                  <span>Kirim Pesan</span>
                  <kbd className="settings-kbd">Enter</kbd>
                </div>
                <div className="settings-row-divider" />
                <div className="settings-card-row">
                  <span>Baris Baru</span>
                  <kbd className="settings-kbd">Shift + Enter</kbd>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal Kelola Perangkat */}
      {showDeviceModal && (
        <div className="simple-modal-overlay" onClick={() => setShowDeviceModal(false)}>
          <div className="simple-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="simple-modal-header">
              <h3>Perangkat Terhubung</h3>
              <button className="simple-modal-close" onClick={() => setShowDeviceModal(false)}>
                ×
              </button>
            </div>
            <div className="simple-modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f4f4f6', borderRadius: '10px', border: '1px solid #e5e5e5' }}>
                <Monitor size={24} color="#2563eb" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#0d0d0d', fontSize: '0.9rem' }}>
                    Browser Sesi Saat Ini
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#047857', marginTop: '2px' }}>
                    Terautentikasi (JWT Bearer Token)
                  </div>
                </div>
              </div>
            </div>
            <div className="simple-modal-footer">
              <button className="btn-secondary" onClick={() => setShowDeviceModal(false)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
