import React, { useEffect, useState } from 'react';
import {
  HelpCircle,
  Zap,
  FileText,
  Info,
  Bug,
  X,
  Check,
  Copy
} from 'lucide-react';
import '../styles/help-menu.css';

const SECTION_META = {
  'help-center': { title: 'Pusat Bantuan ZAPIN', icon: HelpCircle },
  shortcuts: { title: 'Pintasan Keyboard', icon: Zap },
  terms: { title: 'Ketentuan Layanan', icon: FileText },
  privacy: { title: 'Kebijakan Privasi', icon: Info },
  'report-bug': { title: 'Laporkan Bug', icon: Bug }
};

const SHORTCUTS = [
  { action: 'Mulai obrolan baru', keys: ['Ctrl', 'K'] },
  { action: 'Buka daftar pintasan keyboard', keys: ['Ctrl', '/'] },
  { action: 'Kirim pertanyaan ke ZAPIN', keys: ['Enter'] },
  { action: 'Buat baris baru di kotak pesan', keys: ['Shift', 'Enter'] },
  { action: 'Tutup modal aktif', keys: ['Esc'] }
];

function HelpInfoModalContent({ section, onClose }) {
  const [bugCategory, setBugCategory] = useState('Jawaban / Sitasi RAG');
  const [bugDetail, setBugDetail] = useState('');
  const [submittedReport, setSubmittedReport] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const { title, icon: HeaderIcon } = SECTION_META[section];

  const handleSubmitBug = (e) => {
    e.preventDefault();
    const trimmed = bugDetail.trim();
    if (!trimmed) return;

    const entry = {
      id: `BUG-${Date.now().toString().slice(-6)}`,
      category: bugCategory,
      detail: trimmed,
      createdAt: new Date().toISOString()
    };

    try {
      const existing = JSON.parse(localStorage.getItem('zapin_bug_reports') || '[]');
      localStorage.setItem('zapin_bug_reports', JSON.stringify([entry, ...existing].slice(0, 20)));
    } catch {}

    setSubmittedReport(entry);
    setBugDetail('');
  };

  const handleCopyReport = async () => {
    if (!submittedReport) return;
    const summary = `[${submittedReport.id}] Kategori: ${submittedReport.category}\nDetail: ${submittedReport.detail}`;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="simple-modal-overlay" onClick={onClose}>
      <div
        className="help-modal-card animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="help-modal-header">
          <div className="help-modal-title-row">
            <HeaderIcon size={18} />
            <h3>{title}</h3>
          </div>
          <button
            type="button"
            className="help-modal-close"
            onClick={onClose}
            aria-label="Tutup"
          >
            <X size={16} />
          </button>
        </div>

        <div className="help-modal-body">
          {section === 'help-center' && (
            <div className="help-guide-list">
              <div className="help-guide-item">
                <strong>1. Ajukan Pertanyaan Budaya Zapin Riau</strong>
                <p>
                  Ketik pertanyaan seputar sejarah akulturasi, ragam gerak (Tahto, Pecah,
                  Siku Keluang, Tahtim), alat musik pengiring (Gambus dan Marwas), atau
                  busana Tari Zapin Melayu Riau.
                </p>
              </div>
              <div className="help-guide-item">
                <strong>2. Verifikasi Sumber melalui Sitasi [1]–[4]</strong>
                <p>
                  Klik angka sitasi pada jawaban atau tombol <em>Bar Rujukan</em> untuk
                  membuka kutipan teks asli dokumen PDF, nomor halaman, serta skor
                  kemiripan semantik (<em>Cosine Similarity</em>).
                </p>
              </div>
              <div className="help-guide-item">
                <strong>3. Mode Tamu vs Akun Terdaftar</strong>
                <p>
                  Pengguna tamu dapat langsung bertanya tanpa menyimpan riwayat ke server.
                  Masuk dengan akun atau Google OAuth untuk menyimpan riwayat obrolan secara
                  otomatis dengan penamaan topik cerdas.
                </p>
              </div>
            </div>
          )}

          {section === 'shortcuts' && (
            <div className="help-shortcut-list">
              {SHORTCUTS.map((item) => (
                <div key={item.action} className="help-shortcut-row">
                  <span>{item.action}</span>
                  <span className="help-kbd-group">
                    {item.keys.map((k, idx) => (
                      <React.Fragment key={k}>
                        {idx > 0 && <span>+</span>}
                        <kbd className="help-kbd">{k}</kbd>
                      </React.Fragment>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          )}

          {section === 'terms' && (
            <div className="help-legal-content">
              <div className="help-legal-block">
                <h4>1. Tujuan Penggunaan</h4>
                <p>
                  ZAPIN disediakan sebagai asisten tanya jawab berbasis riset akademik
                  untuk membantu pelajar, peneliti, dan masyarakat memahami seni budaya
                  Tari Zapin Melayu Riau berdasarkan literatur rujukan tervalidasi.
                </p>
              </div>
              <div className="help-legal-block">
                <h4>2. Keterbatasan Jawaban RAG</h4>
                <p>
                  Seluruh jawaban disintesis dari korpus dokumen referensi yang tersedia.
                  Apabila topik pertanyaan berada di luar cakupan korpus, sistem akan
                  memberikan pemberitahuan agar pengguna tetap merujuk sumber ilmiah primer.
                </p>
              </div>
              <div className="help-legal-block">
                <h4>3. Etika Pengguna</h4>
                <p>
                  Pengguna diharapkan menggunakan layanan secara wajar untuk kepentingan
                  edukasi, kajian budaya, dan dokumentasi akademik.
                </p>
              </div>
            </div>
          )}

          {section === 'privacy' && (
            <div className="help-legal-content">
              <div className="help-legal-block">
                <h4>1. Data Akun &amp; Autentikasi</h4>
                <p>
                  Informasi dasar akun (nama tampilan, username, email, atau profil dasar
                  Google OAuth 2.0) hanya digunakan untuk mengelola akses sesi pengguna.
                </p>
              </div>
              <div className="help-legal-block">
                <h4>2. Riwayat Percakapan</h4>
                <p>
                  Percakapan pengguna terdaftar disimpan pada basis data PostgreSQL (Neon)
                  agar dapat diakses kembali. Pada mode tamu, percakapan berjalan sementara
                  di peramban dan tidak disimpan persisten di basis data.
                </p>
              </div>
              <div className="help-legal-block">
                <h4>3. Preferensi Lokal</h4>
                <p>
                  Pengaturan tema tampilan (terang/gelap) dan preferensi sitasi disimpan
                  secara lokal pada peramban Anda (<code>localStorage</code>).
                </p>
              </div>
            </div>
          )}

          {section === 'report-bug' && (
            <>
              {submittedReport ? (
                <div className="help-bug-success">
                  <strong>Laporan tersimpan ({submittedReport.id})</strong>
                  <span>
                    Terima kasih. Laporan kendala pada kategori{' '}
                    <em>{submittedReport.category}</em> telah dicatat secara lokal untuk
                    evaluasi pengembangan sistem.
                  </span>
                  <button
                    type="button"
                    className="help-bug-copy-btn"
                    onClick={handleCopyReport}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copied ? 'Ringkasan Disalin' : 'Salin Ringkasan Laporan'}</span>
                  </button>
                </div>
              ) : (
                <form className="help-bug-form" onSubmit={handleSubmitBug}>
                  <div className="help-bug-field">
                    <label htmlFor="bug-category">Kategori Kendala</label>
                    <select
                      id="bug-category"
                      value={bugCategory}
                      onChange={(e) => setBugCategory(e.target.value)}
                    >
                      <option value="Jawaban / Sitasi RAG">Jawaban / Sitasi RAG</option>
                      <option value="Login & Riwayat Obrolan">Login &amp; Riwayat Obrolan</option>
                      <option value="Tampilan Antarmuka (UI)">Tampilan Antarmuka (UI)</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div className="help-bug-field">
                    <label htmlFor="bug-detail">Deskripsi Kendala</label>
                    <textarea
                      id="bug-detail"
                      placeholder="Jelaskan langkah yang terjadi dan hasil yang diharapkan..."
                      value={bugDetail}
                      onChange={(e) => setBugDetail(e.target.value)}
                    />
                  </div>

                  <div className="help-bug-actions">
                    <button
                      type="submit"
                      className="help-bug-submit"
                      disabled={!bugDetail.trim()}
                    >
                      Kirim Laporan
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>

        <div className="help-modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HelpInfoModal({ section, onClose }) {
  if (!section || !SECTION_META[section]) return null;
  return <HelpInfoModalContent key={section} section={section} onClose={onClose} />;
}
