import React, { useState } from 'react';
import { X, ChevronDown, Check, Sparkles, Eye, EyeOff } from 'lucide-react';

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

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [countryCode, setCountryCode] = useState('+62');
  const [showCountryMenu, setShowCountryMenu] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  if (!isOpen) return null;

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4500);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!agreed) {
      setErrorMsg('Harap setujui Perjanjian Layanan dan Kebijakan Privasi terlebih dahulu.');
      return;
    }
    if (!identifier.trim() || !password.trim()) {
      setErrorMsg('Silakan lengkapi nomor telepon/email dan kata sandi.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const cleanId = identifier.trim();

      let payload = {};
      if (isRegister) {
        // Tentukan apakah identifier adalah nomor hp atau email
        const isNumeric = /^[0-9+ -]+$/.test(cleanId);
        const isEmail = cleanId.includes('@');

        let phoneVal = null;
        let emailVal = null;
        let usernameVal = '';

        if (isEmail) {
          emailVal = cleanId;
          usernameVal = cleanId.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || `user_${Date.now()}`;
        } else if (isNumeric) {
          phoneVal = cleanId.startsWith('+') ? cleanId : `${countryCode}${cleanId.replace(/^0+/, '')}`;
          usernameVal = `user_${cleanId.replace(/[^0-9]/g, '').slice(-6)}`;
          emailVal = `${usernameVal}@zapin.ai`;
        } else {
          usernameVal = cleanId;
          emailVal = `${cleanId}@zapin.ai`;
        }

        payload = {
          username: usernameVal,
          email: emailVal,
          phone: phoneVal,
          password: password,
          full_name: fullName.trim() || usernameVal,
          role: 'Peneliti / Mahasiswa Budaya'
        };
      } else {
        payload = {
          identifier: cleanId,
          password: password
        };
      }

      const res = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Terjadi kesalahan saat masuk.');
      }

      // Berhasil login / register
      onAuthSuccess(data.user, data.token);
      onClose();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const countryOptions = [
    { code: '+62', name: 'Indonesia (+62)' },
    { code: '+60', name: 'Malaysia (+60)' },
    { code: '+65', name: 'Singapura (+65)' },
    { code: '+1', name: 'Amerika Serikat (+1)' }
  ];

  return (
    <div className="auth-kimi-backdrop animate-fade-in" onClick={onClose}>
      <div 
        className="auth-kimi-split-card animate-scale-up" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tombol Tutup X di Kanan Atas */}
        <button className="auth-kimi-close-btn" onClick={onClose} title="Tutup">
          <X size={18} />
        </button>

        {/* ================= PANEL KIRI: ARTWORK HALFTONE GLOBE ================= */}
        <div className="auth-kimi-art-panel">
          <div className="auth-globe-wrapper">
            {/* ASCII / Halftone Globe Art sesuai Screenshot Kimi AI (Gambar 2) */}
            <pre className="auth-ascii-sphere" aria-hidden="true">
{`                        .*#^▲▲▲▲▲▲▲▲...
              ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲*******
          /// ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲*********
        //    ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲*******
              ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲*****
      (---)(---)  ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲***
            ////  ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲
                  ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲
          •••///  ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲●●●●●●●●●●●●●●●●●●●●●●●●●●
                  ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲●●●●●●●●●●●●●●●●●●●●●●●●●●
                  ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲●●●●●●●●●●●●●●●●●●●●●●●●●●
       (---)(---) ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲●●●●●●●●●●●●●●●●●●●●●●●●●●
                  ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲●●●●●●●●●●●●●●●●●●●●●●●●●●
                  ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲●●●●●●●●●●●●●●●●●●●●●●●●●●
                  ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲●●●●●●●●●●●●●●●●●●●●●●●●●●
          •••///  ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲●●●●●●●●●●●●●●●●●●●●●●●●●●
                  ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲●●●●●●●●●●●●●●●●●●●●●●●●●●
                  ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲●●●●●●●●●●●●●●●●●●●●●●●●●●
                     ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲●●●●●●●●●●●●●●●●●●●●●●●●●
                        ▲▲▲▲▲▲▲▲▲▲▲▲▲▲●●●●●●●●●●●●●●●●●●●●●●
                           ▲▲▲▲▲▲▲▲▲▲▲●●●●●●●●●●●●●●●●●●
                              ▲▲▲▲▲▲▲▲●●●●●●●●●●●●●●
                                 ▲▲▲▲▲●●●●●●●●●●
                                    ▲▲●●●●●`}
            </pre>
          </div>
        </div>

        {/* ================= PANEL KANAN: FORM LOGIN KIMI ================= */}
        <div className="auth-kimi-form-panel">
          {/* Header Judul KIMI / ZAPIN */}
          <div className="auth-kimi-brand-header">
            <h1 className="auth-kimi-title">KIMI</h1>
          </div>

          {/* Alert Error / Toast Pesan */}
          {errorMsg && (
            <div className="auth-kimi-alert animate-shake">
              <span>{errorMsg}</span>
            </div>
          )}

          {toastMsg && (
            <div className="auth-kimi-toast animate-fade-in">
              <span>{toastMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-kimi-form">
            {/* Input 1: Nomor Telepon atau Email dengan Prefix Dropdown */}
            <div className="auth-kimi-input-box">
              <div 
                className="auth-kimi-country-btn"
                onClick={() => setShowCountryMenu(!showCountryMenu)}
                title="Pilih kode negara"
              >
                <span>{countryCode}</span>
                <ChevronDown size={14} color="#9ca3af" />
              </div>

              {showCountryMenu && (
                <div className="auth-country-dropdown animate-fade-in">
                  {countryOptions.map((opt) => (
                    <div
                      key={opt.code}
                      className={`auth-country-item ${countryCode === opt.code ? 'selected' : ''}`}
                      onClick={() => {
                        setCountryCode(opt.code);
                        setShowCountryMenu(false);
                      }}
                    >
                      <span>{opt.name}</span>
                      {countryCode === opt.code && <Check size={14} color="#d4af37" />}
                    </div>
                  ))}
                </div>
              )}

              <div className="auth-kimi-divider-v" />

              <input
                type="text"
                className="auth-kimi-input-field"
                placeholder={isRegister ? "Nomor telepon atau Email baru" : "Nomor telepon atau Email"}
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  setErrorMsg('');
                }}
                autoFocus
              />
            </div>

            {/* Input Tambahan Nama Lengkap saat Daftar */}
            {isRegister && (
              <div className="auth-kimi-input-box">
                <input
                  type="text"
                  className="auth-kimi-input-field"
                  placeholder="Nama Lengkap Anda"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            )}

            {/* Input 2: Kata Sandi / Kode Verifikasi */}
            <div className="auth-kimi-input-box">
              <input
                type={showPassword ? "text" : "password"}
                className="auth-kimi-input-field"
                placeholder={isRegister ? "Buat Kata Sandi (min. 6 karakter)" : "Kata Sandi"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg('');
                }}
              />
              <button
                type="button"
                className="auth-kimi-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Sembunyikan sandi" : "Lihat sandi"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Tombol Utama: Login / Daftar */}
            <button
              type="submit"
              className={`auth-kimi-submit-btn ${identifier.trim() && password.trim() ? 'active' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Sparkles size={16} className="animate-spin-slow" />
                  Memproses...
                </span>
              ) : isRegister ? (
                'Daftar Sekarang'
              ) : (
                'Login'
              )}
            </button>

            {/* Pemisah OR */}
            <div className="auth-kimi-or-line">
              <div className="or-line" />
              <span className="or-text">OR</span>
              <div className="or-line" />
            </div>

            {/* Tombol Lanjutkan dengan Google */}
            <button
              type="button"
              className="auth-kimi-google-btn"
              onClick={() => showToast('Login akun Google akan segera tersedia nanti. Silakan masuk menggunakan Nomor Telepon/Email dan Kata Sandi.')}
            >
              <GoogleIcon />
              <span>Lanjutkan dengan Google</span>
            </button>

            {/* Link Toggle Mode / SSO */}
            <div className="auth-kimi-extra-links">
              <button
                type="button"
                className="auth-kimi-text-link"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setErrorMsg('');
                }}
              >
                {isRegister ? 'Sudah memiliki akun? Login di sini' : 'Belum punya akun? Daftar sekarang'}
              </button>
              
              {!isRegister && (
                <button
                  type="button"
                  className="auth-kimi-text-link sub"
                  onClick={() => showToast('Login SSO perusahaan sedang dalam pengembangan.')}
                >
                  Login SSO perusahaan
                </button>
              )}
            </div>

            {/* Checkbox Persetujuan Perjanjian Layanan */}
            <div className="auth-kimi-terms-wrap">
              <label className="auth-kimi-checkbox-label">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="auth-kimi-checkbox"
                />
                <span className="auth-kimi-terms-text">
                  Saya telah membaca dan menyetujui{' '}
                  <span className="auth-link-bold">Perjanjian Layanan Model</span> dan{' '}
                  <span className="auth-link-bold">Kebijakan Privasi</span>
                </span>
              </label>

              <div className="auth-kimi-footer-info">
                <span>Butuh bantuan?</span>
                <span className="auth-feedback-link" onClick={() => showToast('Kirimkan pertanyaan atau saran Anda ke pengembang.')}>
                  Beri umpan balik
                </span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
