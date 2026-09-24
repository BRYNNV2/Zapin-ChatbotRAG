import React, { useState } from 'react';
import { X, User, Lock, Mail, Shield, Sparkles, LogIn, UserPlus } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    role: 'Peneliti / Mahasiswa Budaya'
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const payload = isRegister
        ? {
            username: formData.username.trim(),
            email: formData.email.trim(),
            password: formData.password,
            full_name: formData.full_name.trim(),
            role: formData.role
          }
        : {
            identifier: formData.username.trim(),
            password: formData.password
          };

      const res = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Terjadi kesalahan autentikasi.');
      }

      // Berhasil
      onAuthSuccess(data.user, data.token);
      onClose();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay animate-fade-in" onClick={onClose}>
      <div 
        className="auth-modal-card animate-scale-up" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button className="auth-modal-close-btn" onClick={onClose} title="Tutup">
          <X size={18} />
        </button>

        {/* Header Branding */}
        <div className="auth-modal-header">
          <div className="auth-logo-badge">Z</div>
          <h3 className="auth-modal-title">
            {isRegister ? 'Daftar Akun Baru' : 'Masuk ke ZapinAI'}
          </h3>
          <p className="auth-modal-sub">
            {isRegister 
              ? 'Simpan riwayat riset budaya dan eksplorasi tari Zapin di cloud.' 
              : 'Akses riwayat percakapan dan pangkalan naskah tervalidasi Anda.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="auth-tab-switch">
          <button
            type="button"
            className={`auth-tab-btn ${!isRegister ? 'active' : ''}`}
            onClick={() => { setIsRegister(false); setErrorMsg(''); }}
          >
            <LogIn size={14} />
            <span>Masuk</span>
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${isRegister ? 'active' : ''}`}
            onClick={() => { setIsRegister(true); setErrorMsg(''); }}
          >
            <UserPlus size={14} />
            <span>Daftar Akun</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="auth-error-alert animate-shake">
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="auth-form-body">
          {isRegister && (
            <div className="auth-input-group">
              <label className="auth-label">Nama Lengkap</label>
              <div className="auth-input-wrap">
                <User size={15} className="auth-icon" />
                <input
                  type="text"
                  name="full_name"
                  placeholder="Contoh: Ahmad Peneliti Zapin"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          )}

          <div className="auth-input-group">
            <label className="auth-label">
              {isRegister ? 'Nama Pengguna (Username)' : 'Username atau Email'}
            </label>
            <div className="auth-input-wrap">
              <User size={15} className="auth-icon" />
              <input
                type="text"
                name="username"
                placeholder={isRegister ? "Minimal 3 karakter tanpa spasi" : "Masukkan username atau email"}
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {isRegister && (
            <div className="auth-input-group">
              <label className="auth-label">Alamat Email</label>
              <div className="auth-input-wrap">
                <Mail size={15} className="auth-icon" />
                <input
                  type="email"
                  name="email"
                  placeholder="nama@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          )}

          <div className="auth-input-group">
            <label className="auth-label">Kata Sandi</label>
            <div className="auth-input-wrap">
              <Lock size={15} className="auth-icon" />
              <input
                type="password"
                name="password"
                placeholder={isRegister ? "Minimal 6 karakter" : "Masukkan kata sandi"}
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {isRegister && (
            <div className="auth-input-group">
              <label className="auth-label">Peran Pengguna</label>
              <div className="auth-input-wrap">
                <Shield size={15} className="auth-icon" />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="auth-select"
                >
                  <option value="Peneliti / Mahasiswa Budaya">Peneliti / Mahasiswa Budaya</option>
                  <option value="Pakar / Seniman Tari Zapin">Pakar / Seniman Tari Zapin</option>
                  <option value="Pengunjung Umum">Pengunjung Umum</option>
                </select>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="auth-submit-btn" 
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Sparkles size={15} className="animate-spin-slow" />
                Memproses...
              </span>
            ) : isRegister ? (
              'Daftar Sekarang'
            ) : (
              'Masuk Akun'
            )}
          </button>
        </form>

        {/* Footer Alternative */}
        <div className="auth-modal-footer">
          <button 
            type="button" 
            className="auth-guest-btn" 
            onClick={onClose}
          >
            Lanjutkan sebagai Tamu (Guest Mode)
          </button>
        </div>
      </div>
    </div>
  );
}
