import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  UserCircle,
  ShieldCheck,
  Settings,
  Sun,
  Smile,
  ChevronDown,
  LogOut,
  ArrowUpRight
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

export default function SettingsModal({
  isOpen,
  onClose,
  initialTab = 'account',
  currentUser,
  sessionsCount = 0,
  onLogout,
  userPrefs = {
    theme: 'light',
    language: 'auto',
    showCitations: true,
    enterToSend: true,
    autoOpenSources: false
  },
  setUserPrefs
}) {
  const [activeTab, setActiveTab] = useState(initialTab || 'account');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab || 'account');
      setSearchQuery('');
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !currentUser) return null;

  const updatePref = (key, value) => {
    if (!setUserPrefs) return;
    setUserPrefs((prev) => ({ ...prev, [key]: value }));
  };

  const initials = getInitials(currentUser);
  const displayName = currentUser.full_name || currentUser.username || 'Pengguna';
  const usernameHandle = currentUser.username ? `@${currentUser.username}` : '-';
  const userEmail = currentUser.email || '-';
  const userRole = currentUser.role || 'Peneliti / Mahasiswa Budaya';

  const accountItems = [
    {
      id: 'account',
      label: 'Akun',
      keywords: 'akun profil nama username email peran',
      icon: <UserCircle size={16} />
    },
    {
      id: 'security',
      label: 'Keamanan',
      keywords: 'keamanan sesi login sinkronisasi keluar',
      icon: <ShieldCheck size={16} />
    }
  ];

  const appItems = [
    {
      id: 'general',
      label: 'Umum',
      keywords: 'umum bahasa indonesia melayu sistem pencarian',
      icon: <Settings size={16} />
    },
    {
      id: 'appearance',
      label: 'Tampilan',
      keywords: 'tampilan tema terang gelap sistem',
      icon: <Sun size={16} />
    },
    {
      id: 'personalization',
      label: 'Personalisasi',
      keywords: 'personalisasi sitasi enter panel rujukan obrolan',
      icon: <Smile size={16} />
    }
  ];

  const q = searchQuery.trim().toLowerCase();
  const filterItems = (items) =>
    !q
      ? items
      : items.filter(
          (item) =>
            item.label.toLowerCase().includes(q) || item.keywords.toLowerCase().includes(q)
        );

  const visibleAccountItems = filterItems(accountItems);
  const visibleAppItems = filterItems(appItems);
  const showProfileRow =
    !q ||
    displayName.toLowerCase().includes(q) ||
    'profil'.includes(q);

  return (
    <div className="settings-modal-backdrop animate-fade-in" onClick={onClose}>
      <div
        className="settings-modal-card animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Pengaturan Akun"
      >
        {/* Sidebar Kiri Modal Pengaturan */}
        <aside className="settings-modal-sidebar">
          <div className="settings-modal-title">Pengaturan</div>

          <div className="settings-modal-search">
            <Search size={15} className="settings-modal-search-icon" />
            <input
              type="text"
              placeholder="Cari"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="settings-modal-nav-scroll">
            {showProfileRow && (
              <div className="settings-modal-group">
                <div className="settings-modal-group-label">Profil</div>
                <button
                  type="button"
                  className="settings-modal-profile-row"
                  onClick={() => setActiveTab('account')}
                >
                  <div className="settings-modal-profile-avatar">{initials}</div>
                  <span className="settings-modal-profile-name">{displayName}</span>
                  <ArrowUpRight size={14} className="settings-modal-profile-arrow" />
                </button>
              </div>
            )}

            {visibleAccountItems.length > 0 && (
              <div className="settings-modal-group">
                <div className="settings-modal-group-label">Akun</div>
                {visibleAccountItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`settings-modal-nav-item ${activeTab === item.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}

            {visibleAppItems.length > 0 && (
              <div className="settings-modal-group">
                <div className="settings-modal-group-label">Aplikasi</div>
                {visibleAppItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`settings-modal-nav-item ${activeTab === item.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}

            {!showProfileRow && visibleAccountItems.length === 0 && visibleAppItems.length === 0 && (
              <div className="settings-modal-empty">Menu tidak ditemukan.</div>
            )}
          </div>
        </aside>

        {/* Area Konten Kanan Modal Pengaturan */}
        <section className="settings-modal-body">
          <button
            type="button"
            className="settings-modal-close-btn"
            onClick={onClose}
            title="Tutup Pengaturan"
            aria-label="Tutup Pengaturan"
          >
            <X size={17} />
          </button>

          <div className="settings-modal-body-scroll">
            {activeTab === 'account' && (
              <div className="settings-modal-pane">
                <h2 className="settings-modal-heading">Akun</h2>
                <p className="settings-modal-subheading">Tinjau detail akun Anda</p>

                <div className="settings-modal-section-label">Detail</div>

                <div className="settings-modal-detail-list">
                  <div className="settings-modal-detail-row">
                    <div className="settings-modal-row-left">
                      <div className="settings-modal-row-title">Nama</div>
                      <div className="settings-modal-row-desc">Nama yang terhubung dengan akun Anda</div>
                    </div>
                    <div className="settings-modal-row-value">{displayName}</div>
                  </div>

                  <div className="settings-modal-detail-row">
                    <div className="settings-modal-row-left">
                      <div className="settings-modal-row-title">Nama pengguna</div>
                      <div className="settings-modal-row-desc">Identitas unik Anda di ZAPIN</div>
                    </div>
                    <div className="settings-modal-row-value">{usernameHandle}</div>
                  </div>

                  <div className="settings-modal-detail-row">
                    <div className="settings-modal-row-left">
                      <div className="settings-modal-row-title">Email</div>
                      <div className="settings-modal-row-desc">Alamat email yang tertaut pada akun</div>
                    </div>
                    <div className="settings-modal-row-value">{userEmail}</div>
                  </div>

                  <div className="settings-modal-detail-row">
                    <div className="settings-modal-row-left">
                      <div className="settings-modal-row-title">Peran</div>
                      <div className="settings-modal-row-desc">Status pengguna pada sistem ZAPIN</div>
                    </div>
                    <div className="settings-modal-row-value">{userRole}</div>
                  </div>

                  <div className="settings-modal-detail-row">
                    <div className="settings-modal-row-left">
                      <div className="settings-modal-row-title">Riwayat Tersimpan</div>
                      <div className="settings-modal-row-desc">Jumlah percakapan tersinkron di cloud</div>
                    </div>
                    <div className="settings-modal-row-value">{sessionsCount} sesi</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="settings-modal-pane">
                <h2 className="settings-modal-heading">Keamanan</h2>
                <p className="settings-modal-subheading">
                  Kelola status sesi aktif dan sinkronisasi akun Anda
                </p>

                <div className="settings-modal-section-label">Autentikasi</div>

                <div className="settings-modal-detail-list">
                  <div className="settings-modal-detail-row">
                    <div className="settings-modal-row-left">
                      <div className="settings-modal-row-title">Status Sesi</div>
                      <div className="settings-modal-row-desc">Status token autentikasi akun saat ini</div>
                    </div>
                    <div className="settings-modal-row-value status-active">
                      Aktif • Terautentikasi
                    </div>
                  </div>

                  <div className="settings-modal-detail-row">
                    <div className="settings-modal-row-left">
                      <div className="settings-modal-row-title">Sinkronisasi Riwayat</div>
                      <div className="settings-modal-row-desc">
                        Penyimpanan otomatis seluruh riwayat percakapan
                      </div>
                    </div>
                    <div className="settings-modal-row-value">PostgreSQL Cloud</div>
                  </div>

                  <div className="settings-modal-detail-row">
                    <div className="settings-modal-row-left">
                      <div className="settings-modal-row-title">Keluar dari perangkat ini</div>
                      <div className="settings-modal-row-desc">
                        Akhiri sesi masuk Anda pada browser saat ini
                      </div>
                    </div>
                    <button
                      type="button"
                      className="settings-clean-logout-btn"
                      onClick={() => {
                        onClose();
                        if (onLogout) onLogout();
                      }}
                    >
                      <LogOut size={14} />
                      <span>Keluar</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'general' && (
              <div className="settings-modal-pane">
                <h2 className="settings-modal-heading">Umum</h2>
                <p className="settings-modal-subheading">
                  Pengaturan bahasa dasar dan informasi sistem ZAPIN
                </p>

                <div className="settings-modal-section-label">Konfigurasi</div>

                <div className="settings-modal-detail-list">
                  <div className="settings-modal-detail-row">
                    <div className="settings-modal-row-left">
                      <div className="settings-modal-row-title">Bahasa</div>
                      <div className="settings-modal-row-desc">
                        Bahasa utama untuk respons dan antarmuka
                      </div>
                    </div>
                    <div className="settings-clean-select-wrap">
                      <select
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

                  <div className="settings-modal-detail-row">
                    <div className="settings-modal-row-left">
                      <div className="settings-modal-row-title">Sistem Pencarian</div>
                      <div className="settings-modal-row-desc">
                        Arsitektur pencocokan naskah Tari Zapin Riau
                      </div>
                    </div>
                    <div className="settings-modal-row-value">
                      Sentence-BERT Multilingual • 384-dim
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="settings-modal-pane">
                <h2 className="settings-modal-heading">Tampilan</h2>
                <p className="settings-modal-subheading">
                  Atur tema visual aplikasi sesuai kenyamanan Anda
                </p>

                <div className="settings-modal-section-label">Tema Antarmuka</div>

                <div className="settings-modal-detail-list">
                  <div className="settings-modal-detail-row">
                    <div className="settings-modal-row-left">
                      <div className="settings-modal-row-title">Tema</div>
                      <div className="settings-modal-row-desc">
                        Pilih tampilan terang, gelap, atau mengikuti perangkat
                      </div>
                    </div>
                    <div className="settings-clean-select-wrap">
                      <select
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
                </div>
              </div>
            )}

            {activeTab === 'personalization' && (
              <div className="settings-modal-pane">
                <h2 className="settings-modal-heading">Personalisasi</h2>
                <p className="settings-modal-subheading">
                  Sesuaikan perilaku obrolan dan penyajian sitasi sumber
                </p>

                <div className="settings-modal-section-label">Preferensi Obrolan</div>

                <div className="settings-modal-detail-list">
                  <div className="settings-modal-detail-row">
                    <div className="settings-modal-row-left">
                      <div className="settings-modal-row-title">
                        Tampilkan sitasi sumber [1][2]
                      </div>
                      <div className="settings-modal-row-desc">
                        Menampilkan lencana nomor kutipan dan tombol sumber tervalidasi
                      </div>
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

                  <div className="settings-modal-detail-row">
                    <div className="settings-modal-row-left">
                      <div className="settings-modal-row-title">
                        Kirim pesan dengan tombol Enter
                      </div>
                      <div className="settings-modal-row-desc">
                        Tekan Enter untuk mengirim, atau Shift + Enter untuk baris baru
                      </div>
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

                  <div className="settings-modal-detail-row">
                    <div className="settings-modal-row-left">
                      <div className="settings-modal-row-title">
                        Buka panel rujukan secara otomatis
                      </div>
                      <div className="settings-modal-row-desc">
                        Menampilkan panel Bar Rujukan di sisi kanan saat jawaban memiliki sitasi
                      </div>
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
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
