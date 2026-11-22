import React from 'react';
import { ArrowLeft, ChevronDown, LogOut, PanelLeftOpen } from 'lucide-react';

export default function SettingsPage({
  onBack,
  currentUser,
  onLogout,
  userPrefs = {
    theme: 'light',
    language: 'auto',
    showCitations: true,
    enterToSend: true,
    autoOpenSources: false
  },
  setUserPrefs,
  sidebarCollapsed = false,
  onExpandSidebar
}) {
  const updatePref = (key, value) => {
    if (!setUserPrefs) return;
    setUserPrefs((prev) => ({ ...prev, [key]: value }));
  };

  const displayName = currentUser?.full_name || currentUser?.username || '';
  const userEmail = currentUser?.email || '';
  const avatarInitial = (displayName || 'U')[0].toUpperCase();

  return (
    <div className="settings-clean-view animate-fade-in">
      {/* Header Pengaturan: Tombol Kembali Bulat di Kiri, Judul Pengaturan di Tengah */}
      <header className="settings-clean-header">
        <div className="settings-clean-header-left">
          {sidebarCollapsed && onExpandSidebar && (
            <button
              type="button"
              className="sidebar-uncollapse-btn"
              onClick={onExpandSidebar}
              title="Buka bilah samping"
            >
              <PanelLeftOpen size={18} />
            </button>
          )}
          <button
            id="settings-back-btn"
            type="button"
            className="settings-circle-back-btn"
            onClick={onBack}
            title="Kembali ke Obrolan"
            aria-label="Kembali ke Obrolan"
          >
            <ArrowLeft size={16} />
          </button>
        </div>

        <h1 className="settings-clean-title">Pengaturan</h1>

        <div className="settings-clean-header-right" />
      </header>

      {/* Konten Single-Column Terpusat */}
      <div className="settings-clean-scroll">
        <div className="settings-clean-container">
          {/* Seksi 1: Umum */}
          <section className="settings-clean-section">
            <h2 className="settings-clean-section-title">Umum</h2>
            <div className="settings-clean-card">
              <div className="settings-clean-row">
                <label htmlFor="pref-theme" className="settings-clean-label">
                  Tampilan
                </label>
                <div className="settings-clean-select-wrap">
                  <select
                    id="pref-theme"
                    className="settings-clean-select"
                    value={userPrefs.theme}
                    onChange={(e) => updatePref('theme', e.target.value)}
                  >
                    <option value="light">Terang</option>
                    <option value="dark">Gelap</option>
                    <option value="system">Sistem</option>
                  </select>
                  <ChevronDown size={15} className="settings-clean-select-icon" />
                </div>
              </div>

              <div className="settings-clean-row-divider" />

              <div className="settings-clean-row">
                <label htmlFor="pref-language" className="settings-clean-label">
                  Bahasa
                </label>
                <div className="settings-clean-select-wrap">
                  <select
                    id="pref-language"
                    className="settings-clean-select"
                    value={userPrefs.language}
                    onChange={(e) => updatePref('language', e.target.value)}
                  >
                    <option value="auto">Deteksi otomatis</option>
                    <option value="id">Bahasa Indonesia</option>
                    <option value="ms">Melayu Riau</option>
                  </select>
                  <ChevronDown size={15} className="settings-clean-select-icon" />
                </div>
              </div>
            </div>
          </section>

          {/* Seksi 2: Preferensi Obrolan (Disesuaikan dengan Sistem ZAPIN) */}
          <section className="settings-clean-section">
            <h2 className="settings-clean-section-title">Preferensi Obrolan</h2>
            <div className="settings-clean-card">
              <div className="settings-clean-row settings-clean-row-toggle">
                <div className="settings-clean-text-col">
                  <div className="settings-clean-item-title">Tampilkan sitasi sumber [1][2]</div>
                  <p className="settings-clean-item-desc">
                    Menampilkan nomor kutipan dan tombol sumber rujukan tervalidasi pada setiap
                    jawaban mengenai Tari Zapin Riau.
                  </p>
                </div>
                <label className="clean-toggle-switch" aria-label="Tampilkan sitasi sumber">
                  <input
                    type="checkbox"
                    checked={userPrefs.showCitations}
                    onChange={(e) => updatePref('showCitations', e.target.checked)}
                  />
                  <span className="clean-toggle-slider" />
                </label>
              </div>

              <div className="settings-clean-row-divider" />

              <div className="settings-clean-row settings-clean-row-toggle">
                <div className="settings-clean-text-col">
                  <div className="settings-clean-item-title">Kirim pesan dengan tombol Enter</div>
                  <p className="settings-clean-item-desc">
                    Tekan Enter untuk mengirim pertanyaan secara langsung, atau gunakan Shift + Enter
                    untuk menambahkan baris baru.
                  </p>
                </div>
                <label className="clean-toggle-switch" aria-label="Kirim pesan dengan tombol Enter">
                  <input
                    type="checkbox"
                    checked={userPrefs.enterToSend}
                    onChange={(e) => updatePref('enterToSend', e.target.checked)}
                  />
                  <span className="clean-toggle-slider" />
                </label>
              </div>

              <div className="settings-clean-row-divider" />

              <div className="settings-clean-row settings-clean-row-toggle">
                <div className="settings-clean-text-col">
                  <div className="settings-clean-item-title">Buka panel rujukan secara otomatis</div>
                  <p className="settings-clean-item-desc">
                    Membuka panel Bar Rujukan naskah di sisi kanan secara otomatis setiap kali
                    jawaban baru memiliki kutipan sumber.
                  </p>
                </div>
                <label className="clean-toggle-switch" aria-label="Buka panel rujukan secara otomatis">
                  <input
                    type="checkbox"
                    checked={userPrefs.autoOpenSources}
                    onChange={(e) => updatePref('autoOpenSources', e.target.checked)}
                  />
                  <span className="clean-toggle-slider" />
                </label>
              </div>
            </div>
          </section>

          {/* Seksi 3: Akun (Hanya tampil bila pengguna sudah login) */}
          {currentUser && (
            <section className="settings-clean-section">
              <h2 className="settings-clean-section-title">Akun</h2>
              <div className="settings-clean-card">
                <div className="settings-clean-row">
                  <div className="settings-clean-account-info">
                    <div className="settings-clean-account-avatar">{avatarInitial}</div>
                    <div>
                      <div className="settings-clean-item-title">{displayName}</div>
                      <div className="settings-clean-item-desc" style={{ marginTop: '2px' }}>
                        {userEmail || currentUser.username}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="settings-clean-logout-btn"
                    onClick={() => {
                      if (onLogout) onLogout();
                      onBack();
                    }}
                  >
                    <LogOut size={14} />
                    <span>Keluar</span>
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
