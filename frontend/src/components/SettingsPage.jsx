import React, { useState } from 'react';
import {
  ChevronLeft,
  User,
  Bell,
  Sun,
  Command,
  LayoutGrid,
  Music,
  Receipt,
  Gift,
  Sparkles,
  MessageSquare,
  Box,
  Smartphone,
  ChevronRight,
  LogOut,
  Shield,
  Sliders,
  Check,
  AlertTriangle,
  Monitor,
  Search,
  SlidersHorizontal
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

export default function SettingsPage({
  onBack,
  currentUser,
  onLogout,
  onOpenAuthModal,
  ragParams,
  setRagParams,
  onOpenSbertModal,
  initialSubTab = 'account'
}) {
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab);
  const [phoneLinked, setPhoneLinked] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneNumberInput, setPhoneNumberInput] = useState('');
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notifKimi, setNotifKimi] = useState(true);
  const [notifRealtime, setNotifRealtime] = useState(false);
  const [notifBrowser, setNotifBrowser] = useState(false);

  // Fallback data profil pengguna sesuai tangkapan layar Kimi AI
  const username = currentUser ? currentUser.username : 'mhmddfebry';
  const googleEmail = currentUser ? (currentUser.email || currentUser.username) : 'mhmddfebry';
  const avatarUrl = currentUser?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';

  const handleLinkPhone = () => {
    if (phoneNumberInput.trim()) {
      setPhoneLinked(true);
      setShowPhoneModal(false);
    }
  };

  return (
    <div className="kimi-settings-screen animate-fade-in">
      {/* Sidebar Navigasi Pengaturan Kimi AI */}
      <aside className="kimi-settings-sidebar">
        {/* Tombol < Kembali */}
        <button id="settings-back-btn" className="settings-back-btn" onClick={onBack} title="Kembali ke Obrolan">
          <ChevronLeft size={18} />
          <span>Kembali</span>
        </button>

        <div className="settings-nav-scroll">
          {/* Kelompok 1: Utama & Akun */}
          <div className="settings-nav-group">
            <button
              id="settings-nav-account"
              className={`settings-nav-item ${activeSubTab === 'account' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('account')}
            >
              <User size={17} />
              <span>Akun & Keamanan</span>
            </button>

            <button
              id="settings-nav-notifications"
              className={`settings-nav-item ${activeSubTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('notifications')}
            >
              <Bell size={17} />
              <span>Notifikasi</span>
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

            <button
              className={`settings-nav-item ${activeSubTab === 'features' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('features')}
            >
              <LayoutGrid size={17} />
              <span>Pengelolaan fitur</span>
            </button>
          </div>

          {/* Kelompok 2: Langganan */}
          <div className="settings-section-heading">Langganan</div>
          <div className="settings-nav-group">
            <button
              className={`settings-nav-item ${activeSubTab === 'subscription' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('subscription')}
            >
              <Music size={17} />
              <span>Langganan Saya</span>
            </button>

            <button
              className={`settings-nav-item ${activeSubTab === 'billing' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('billing')}
            >
              <Receipt size={17} />
              <span>Tagihan & Faktur</span>
            </button>

            <button
              className={`settings-nav-item ${activeSubTab === 'giftcards' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('giftcards')}
            >
              <Gift size={17} />
              <span>Kartu Hadiah</span>
            </button>
          </div>

          {/* Kelompok 3: Personalisasi */}
          <div className="settings-section-heading">Personalisasi</div>
          <div className="settings-nav-group">
            <button
              className={`settings-nav-item ${activeSubTab === 'memory' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('memory')}
            >
              <Sparkles size={17} />
              <span>Memori Chat</span>
            </button>

            <button
              className={`settings-nav-item ${activeSubTab === 'chatsettings' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('chatsettings')}
            >
              <MessageSquare size={17} />
              <span>Pengaturan obrolan</span>
            </button>

            <button
              className={`settings-nav-item ${activeSubTab === 'presets' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('presets')}
            >
              <Box size={17} />
              <span>Preset</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Area Konten Utama Pengaturan */}
      <main className="kimi-settings-main">
        {/* SUBTAB 1: Akun & Keamanan (Sesuai Persis Tangkapan Layar Kimi AI) */}
        {activeSubTab === 'account' && (
          <div className="settings-content-wrapper">
            <div className="settings-account-content">
              {/* Foto Profil & Username */}
              <div className="settings-profile-header">
                <div className="settings-avatar-circle">
                  <img
                    src={avatarUrl}
                    alt="Foto Profil"
                    className="settings-avatar-img"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
                <h2 className="settings-username">{username}</h2>
              </div>

              {/* Seksi 1: Tautan Akun */}
              <div className="settings-card-section">
                <span className="settings-group-label">Tautan Akun</span>
                <div className="settings-card-box">
                  {/* Baris Nomor Telepon */}
                  <div className="settings-card-row">
                    <div className="settings-row-left">
                      <Smartphone size={18} color="#9ca3af" />
                      <span>Nomor telepon</span>
                    </div>
                    <div className="settings-row-right">
                      {phoneLinked ? (
                        <span style={{ color: '#10b981', fontSize: '0.86rem' }}>
                          +62 812-3456-7890
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="settings-link-action-btn"
                          onClick={() => setShowPhoneModal(true)}
                        >
                          Tautkan
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="settings-row-divider" />

                  {/* Baris Google */}
                  <div className="settings-card-row">
                    <div className="settings-row-left">
                      <GoogleIcon />
                      <span>Google</span>
                    </div>
                    <div className="settings-row-right">
                      <span className="settings-row-value">{googleEmail}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seksi 2: Keamanan Akun */}
              <div className="settings-card-section">
                <span className="settings-group-label">Keamanan Akun</span>
                <div className="settings-card-box">
                  <div
                    className="settings-card-row clickable"
                    onClick={() => setShowDeviceModal(true)}
                  >
                    <div className="settings-row-left">
                      <span>Kelola Perangkat</span>
                    </div>
                    <div className="settings-row-right" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className="settings-row-value">1 perangkat</span>
                      <ChevronRight size={15} color="#71717a" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tombol Keluar (Pill Lebar) */}
              <button
                type="button"
                className="settings-logout-btn"
                onClick={() => {
                  if (onLogout) onLogout();
                  onBack();
                }}
              >
                <LogOut size={16} />
                <span>Keluar</span>
              </button>

              {/* Link Hapus Akun di Bagian Bawah */}
              <div className="settings-delete-account-wrap">
                <button
                  type="button"
                  className="settings-delete-account-btn"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Hapus Akun
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 2: Notifikasi (Persis Kimi AI) */}
        {activeSubTab === 'notifications' && (
          <div className="settings-content-wrapper">
            <div className="settings-notif-container">
              <h2 className="settings-page-title">Notifikasi</h2>

              <div className="settings-card-box notif-card-box">
                {/* 1. Notifikasi Kimi */}
                <div className="settings-notif-row">
                  <div className="settings-notif-text-group">
                    <div className="settings-notif-item-title">Notifikasi Kimi</div>
                    <div className="settings-notif-item-desc">
                      Dapatkan notifikasi saat tugas Anda diperbarui atau memerlukan tanggapan Anda.
                    </div>
                  </div>
                  <label className="kimi-switch">
                    <input
                      type="checkbox"
                      checked={notifKimi}
                      onChange={(e) => setNotifKimi(e.target.checked)}
                    />
                    <span className="kimi-switch-slider" />
                  </label>
                </div>

                <div className="settings-row-divider" />

                {/* 2. Pengingat real-time beranda */}
                <div className="settings-notif-row">
                  <div className="settings-notif-text-group">
                    <div className="settings-notif-item-title">Pengingat real-time beranda</div>
                    <div className="settings-notif-item-desc">
                      Jika diaktifkan, notifikasi Kimi akan ditampilkan secara real-time di bawah kotak input di beranda.
                    </div>
                  </div>
                  <label className="kimi-switch">
                    <input
                      type="checkbox"
                      checked={notifRealtime}
                      onChange={(e) => setNotifRealtime(e.target.checked)}
                    />
                    <span className="kimi-switch-slider" />
                  </label>
                </div>

                <div className="settings-row-divider" />

                {/* 3. Notifikasi browser */}
                <div className="settings-notif-row notif-browser-row">
                  <div className="settings-notif-text-group">
                    <div className="settings-notif-item-title">Notifikasi browser</div>
                    <div className="settings-notif-item-desc">
                      Dapatkan notifikasi browser saat Anda tidak berada di Kimi.
                    </div>

                    {/* Ilustrasi Preview Mockup Notifikasi Desktop Kimi AI */}
                    <div className="notif-preview-canvas">
                      <div className="notif-preview-header-icons">
                        <Search size={11} color="#1e3a8a" />
                        <SlidersHorizontal size={11} color="#1e3a8a" />
                      </div>
                      <div className="notif-toast-mockup">
                        <div className="notif-toast-logo">K</div>
                        <div className="notif-toast-content">
                          <div className="notif-toast-title">Brand upgrade planning</div>
                          <div className="notif-toast-site">kimi.com</div>
                          <div className="notif-toast-status">Task complete. View results</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <label className="kimi-switch">
                    <input
                      type="checkbox"
                      checked={notifBrowser}
                      onChange={(e) => setNotifBrowser(e.target.checked)}
                    />
                    <span className="kimi-switch-slider" />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 3: Tampilan */}
        {activeSubTab === 'appearance' && (
          <div className="settings-content-wrapper">
            <div className="settings-generic-content">
              <h3>Tampilan & Antarmuka</h3>
              <p className="settings-subtitle">Sesuaikan visual pengalaman riset budaya Anda.</p>
              
              <div className="settings-card-box" style={{ marginTop: '16px' }}>
                <div className="settings-card-row">
                  <span>Tema Aplikasi</span>
                  <span style={{ color: '#d4af37', fontWeight: 500 }}>Kimi Obsidian Dark (Aktif)</span>
                </div>
                <div className="settings-row-divider" />
                <div className="settings-card-row">
                  <span>Nuansa Warna Aksen</span>
                  <span style={{ color: '#9ca3af' }}>Melayu Gold & Slate</span>
                </div>
                <div className="settings-row-divider" />
                <div className="settings-card-row">
                  <span>Animasi & Efek Halus</span>
                  <input type="checkbox" defaultChecked style={{ accentColor: '#3b82f6', width: 18, height: 18 }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 4: Pintasan Keyboard */}
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
                <div className="settings-row-divider" />
                <div className="settings-card-row">
                  <span>Buka / Tutup Bar Kanan Rujukan</span>
                  <kbd className="settings-kbd">Ctrl + /</kbd>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 5: Pengelolaan Fitur (SBERT RAG) */}
        {activeSubTab === 'features' && (
          <div className="settings-content-wrapper">
            <div className="settings-generic-content">
              <h3>Pengelolaan Fitur & Pipeline SBERT</h3>
              <p className="settings-subtitle">Konfigurasi retrieval vector Sentence-BERT untuk akurasi jawaban.</p>
              
              <div className="settings-card-box" style={{ marginTop: '16px' }}>
                <div className="settings-card-row">
                  <div>
                    <div style={{ fontWeight: 500, color: '#f3f4f6' }}>Model Semantik</div>
                    <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>paraphrase-multilingual-MiniLM-L12-v2 (384-dim)</div>
                  </div>
                  <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 600 }}>Tervalidasi</span>
                </div>
                <div className="settings-row-divider" />
                <div className="settings-card-row">
                  <span>Parameter Top-K Chunks</span>
                  <span style={{ color: '#f3f4f6', fontWeight: 600 }}>{ragParams?.top_k || 4} Chunks</span>
                </div>
                <div className="settings-row-divider" />
                <div className="settings-card-row">
                  <span>Threshold Kosinus Kemiripan</span>
                  <span style={{ color: '#f3f4f6', fontWeight: 600 }}>{ragParams?.threshold || 0.30}</span>
                </div>
              </div>

              {onOpenSbertModal && (
                <button
                  type="button"
                  className="settings-action-pill-btn"
                  onClick={onOpenSbertModal}
                  style={{ marginTop: '16px' }}
                >
                  <Sliders size={16} />
                  <span>Buka Kalibrasi Lengkap Sentence-BERT</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* SUBTAB 6: Langganan Saya */}
        {activeSubTab === 'subscription' && (
          <div className="settings-content-wrapper">
            <div className="settings-generic-content">
              <h3>Paket Keanggotaan & Riset</h3>
              <p className="settings-subtitle">Status paket akses basis data seni dan budaya Zapin Melayu.</p>

              <div className="settings-card-box" style={{ marginTop: '16px', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
                <div className="settings-card-row">
                  <div>
                    <div style={{ color: '#facc15', fontWeight: 600, fontSize: '1rem' }}>Peneliti Skripsi (Researcher Tier)</div>
                    <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '2px' }}>Akses terbuka penuh ke seluruh naskah primer, ground truth, dan metrik RAG.</div>
                  </div>
                  <span className="settings-badge-gold">Aktif</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 7: Tagihan & Faktur */}
        {activeSubTab === 'billing' && (
          <div className="settings-content-wrapper">
            <div className="settings-generic-content">
              <h3>Tagihan & Faktur</h3>
              <p className="settings-subtitle">Riwayat transaksi dan status akun akademik.</p>

              <div className="settings-card-box" style={{ marginTop: '16px' }}>
                <div className="settings-card-row">
                  <span>Status Pembiayaan</span>
                  <span style={{ color: '#10b981', fontWeight: 500 }}>Gratis untuk Keperluan Akademik</span>
                </div>
                <div className="settings-row-divider" />
                <div className="settings-card-row">
                  <span>Kredit Embedding & API</span>
                  <span style={{ color: '#9ca3af' }}>Tak Terbatas (Local SBERT + Google Gemini)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 8: Kartu Hadiah */}
        {activeSubTab === 'giftcards' && (
          <div className="settings-content-wrapper">
            <div className="settings-generic-content">
              <h3>Kartu Hadiah & Voucher</h3>
              <p className="settings-subtitle">Tukarkan kode akses khusus naskah budaya langka.</p>

              <div className="settings-card-box" style={{ marginTop: '16px' }}>
                <div className="settings-card-row">
                  <input
                    type="text"
                    placeholder="Masukkan kode voucher atau hibah..."
                    className="settings-text-input"
                  />
                  <button type="button" className="settings-link-action-btn">
                    Tukarkan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 9: Memori Chat */}
        {activeSubTab === 'memory' && (
          <div className="settings-content-wrapper">
            <div className="settings-generic-content">
              <h3>Memori Chat & Riwayat Percakapan</h3>
              <p className="settings-subtitle">Pengelolaan persistensi percakapan pada basis data PostgreSQL Neon Cloud.</p>

              <div className="settings-card-box" style={{ marginTop: '16px' }}>
                <div className="settings-card-row">
                  <div>
                    <div style={{ fontWeight: 500, color: '#f3f4f6' }}>Sinkronisasi Database Cloud</div>
                    <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>Tersimpan aman di instance cloud Neon PostgreSQL.</div>
                  </div>
                  <span style={{ color: '#10b981', fontSize: '0.82rem', fontWeight: 600 }}>Tersambung</span>
                </div>
                <div className="settings-row-divider" />
                <div className="settings-card-row">
                  <span>Retensi Percakapan</span>
                  <span style={{ color: '#9ca3af' }}>Selamanya</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 10: Pengaturan Obrolan */}
        {activeSubTab === 'chatsettings' && (
          <div className="settings-content-wrapper">
            <div className="settings-generic-content">
              <h3>Pengaturan Obrolan</h3>
              <p className="settings-subtitle">Gaya bahasa dan persona respons Zapin Cultural Assistant.</p>

              <div className="settings-card-box" style={{ marginTop: '16px' }}>
                <div className="settings-card-row">
                  <div>
                    <div style={{ fontWeight: 500, color: '#f3f4f6' }}>Mode Jawaban</div>
                    <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>Bahasa Indonesia berakar Melayu santun & ilmiah.</div>
                  </div>
                  <span style={{ color: '#3b82f6', fontWeight: 500 }}>Standar Budaya</span>
                </div>
                <div className="settings-row-divider" />
                <div className="settings-card-row">
                  <span>Kutipan Otomatis [1][2]</span>
                  <input type="checkbox" defaultChecked style={{ accentColor: '#3b82f6', width: 18, height: 18 }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 11: Preset */}
        {activeSubTab === 'presets' && (
          <div className="settings-content-wrapper">
            <div className="settings-generic-content">
              <h3>Preset Konfigurasi</h3>
              <p className="settings-subtitle">Pilih mode optimalisasi pencarian naskah tari.</p>

              <div className="settings-card-box" style={{ marginTop: '16px' }}>
                <div className="settings-card-row">
                  <div>
                    <div style={{ fontWeight: 500, color: '#f3f4f6' }}>Preset Riset Akademik (Default)</div>
                    <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>Sangat presisi dengan rujukan potongan teks verbatim.</div>
                  </div>
                  <Check size={18} color="#10b981" />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal Tautkan Nomor Telepon */}
      {showPhoneModal && (
        <div className="simple-modal-overlay" onClick={() => setShowPhoneModal(false)}>
          <div className="simple-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="simple-modal-header">
              <h3>Tautkan Nomor Telepon</h3>
              <button className="simple-modal-close" onClick={() => setShowPhoneModal(false)}>
                ×
              </button>
            </div>
            <div className="simple-modal-body">
              <p style={{ fontSize: '0.86rem', color: '#9ca3af', marginBottom: '12px' }}>
                Masukkan nomor telepon aktif untuk menerima verifikasi keamanan akun.
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ padding: '8px 12px', background: '#222226', borderRadius: '8px', color: '#ededed' }}>
                  +62
                </span>
                <input
                  type="tel"
                  placeholder="812-3456-7890"
                  value={phoneNumberInput}
                  onChange={(e) => setPhoneNumberInput(e.target.value)}
                  className="settings-text-input"
                  style={{ flex: 1 }}
                  autoFocus
                />
              </div>
            </div>
            <div className="simple-modal-footer">
              <button className="btn-secondary" onClick={() => setShowPhoneModal(false)}>
                Batal
              </button>
              <button className="btn-primary" onClick={handleLinkPhone}>
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

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
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#202024', borderRadius: '10px' }}>
                <Monitor size={24} color="#3b82f6" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#f3f4f6', fontSize: '0.9rem' }}>
                    Windows PC • Chrome Browser
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#10b981', marginTop: '2px' }}>
                    Sesi Aktif Ini (Pekanbaru, Indonesia)
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

      {/* Modal Konfirmasi Hapus Akun */}
      {showDeleteConfirm && (
        <div className="simple-modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="simple-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="simple-modal-header">
              <h3 style={{ color: '#ef4444' }}>Konfirmasi Hapus Akun</h3>
              <button className="simple-modal-close" onClick={() => setShowDeleteConfirm(false)}>
                ×
              </button>
            </div>
            <div className="simple-modal-body">
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <AlertTriangle size={24} color="#ef4444" style={{ flexShrink: 0 }} />
                <p style={{ fontSize: '0.86rem', color: '#d1d5db', lineHeight: 1.5 }}>
                  Tindakan ini permanen. Semua data akun dan riwayat percakapan riset di database Neon Cloud akan dihapus secara berkala.
                </p>
              </div>
            </div>
            <div className="simple-modal-footer">
              <button className="btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
                Batal
              </button>
              <button
                className="btn-danger"
                style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer' }}
                onClick={() => {
                  alert("Permintaan penghapusan akun berhasil dicatat.");
                  setShowDeleteConfirm(false);
                  if (onLogout) onLogout();
                  onBack();
                }}
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
