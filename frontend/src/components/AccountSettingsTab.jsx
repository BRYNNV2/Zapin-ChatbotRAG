import React, { useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import '../styles/account-settings.css';

export default function AccountSettingsTab({
  currentUser,
  authToken,
  onUserUpdated,
  onAccountDeleted
}) {
  const [editingField, setEditingField] = useState(null);
  const [draftValue, setDraftValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'error' | 'success', message: string }

  const displayName = currentUser.full_name || currentUser.username || 'Pengguna';
  const usernameHandle = currentUser.username ? `@${currentUser.username}` : '-';
  const userEmail = currentUser.email || '-';

  const editableRows = [
    {
      key: 'full_name',
      title: 'Nama',
      desc: 'Nama yang terkait dengan akun Anda',
      display: displayName,
      rawValue: currentUser.full_name || currentUser.username || '',
      inputType: 'text',
      placeholder: 'Masukkan nama lengkap'
    },
    {
      key: 'username',
      title: 'Nama pengguna',
      desc: 'Nama pengguna unik Anda di ZAPIN',
      display: usernameHandle,
      rawValue: currentUser.username || '',
      inputType: 'text',
      placeholder: 'Masukkan nama pengguna'
    },
    {
      key: 'email',
      title: 'Email',
      desc: 'Alamat email yang ditautkan ke akun Anda',
      display: userEmail,
      rawValue: currentUser.email || '',
      inputType: 'email',
      placeholder: 'Masukkan alamat email'
    }
  ];

  const startEdit = (row) => {
    setFeedback(null);
    setEditingField(row.key);
    setDraftValue(row.rawValue);
  };

  const cancelEdit = () => {
    setEditingField(null);
    setDraftValue('');
  };

  const handleSaveField = async (fieldKey) => {
    const trimmed = draftValue.trim();
    if (!trimmed) {
      setFeedback({ type: 'error', message: 'Nilai tidak boleh kosong.' });
      return;
    }

    if (!authToken) {
      setFeedback({ type: 'error', message: 'Token sesi tidak ditemukan. Silakan masuk ulang.' });
      return;
    }

    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await fetch('http://localhost:8000/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ [fieldKey]: trimmed })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFeedback({
          type: 'error',
          message: data.detail || 'Gagal memperbarui detail akun.'
        });
        return;
      }

      if (data.user && onUserUpdated) {
        onUserUpdated(data.user);
      }
      setEditingField(null);
      setDraftValue('');
      setFeedback({ type: 'success', message: 'Detail akun berhasil diperbarui.' });
    } catch {
      setFeedback({
        type: 'error',
        message: 'Tidak dapat terhubung ke server backend.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!authToken) {
      setFeedback({ type: 'error', message: 'Token sesi tidak ditemukan.' });
      return;
    }

    setIsDeleting(true);
    setFeedback(null);
    try {
      const res = await fetch('http://localhost:8000/api/auth/me', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFeedback({
          type: 'error',
          message: data.detail || 'Gagal menghapus akun.'
        });
        return;
      }

      if (onAccountDeleted) {
        onAccountDeleted();
      }
    } catch {
      setFeedback({
        type: 'error',
        message: 'Tidak dapat terhubung ke server backend.'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="settings-modal-pane">
      <h2 className="settings-modal-heading">Akun</h2>
      <p className="settings-modal-subheading">Tinjau detail akun Anda</p>

      {feedback && (
        <div className={`account-feedback ${feedback.type}`}>{feedback.message}</div>
      )}

      <div className="settings-modal-section-label">Detail</div>

      <div className="settings-modal-detail-list">
        {editableRows.map((row) => {
          const isEditing = editingField === row.key;
          return (
            <div key={row.key} className="settings-modal-detail-row">
              <div className="settings-modal-row-left">
                <div className="settings-modal-row-title">{row.title}</div>
                <div className="settings-modal-row-desc">{row.desc}</div>
              </div>

              {isEditing ? (
                <div className="account-inline-editor">
                  <input
                    type={row.inputType}
                    className="account-inline-input"
                    value={draftValue}
                    placeholder={row.placeholder}
                    autoFocus
                    disabled={isSaving}
                    onChange={(e) => setDraftValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSaveField(row.key);
                      } else if (e.key === 'Escape') {
                        e.stopPropagation();
                        cancelEdit();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="account-inline-save"
                    onClick={() => handleSaveField(row.key)}
                    disabled={isSaving || !draftValue.trim()}
                    title="Simpan"
                    aria-label="Simpan"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    type="button"
                    className="account-inline-cancel"
                    onClick={cancelEdit}
                    disabled={isSaving}
                    title="Batal"
                    aria-label="Batal"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="account-value-wrap">
                  <span className="settings-modal-row-value">{row.display}</span>
                  <button
                    type="button"
                    className="account-edit-btn"
                    onClick={() => startEdit(row)}
                    title={`Ubah ${row.title.toLowerCase()}`}
                    aria-label={`Ubah ${row.title.toLowerCase()}`}
                  >
                    <Pencil size={14} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Seksi Hapus Akun sesuai tata letak referensi */}
      <div className="account-danger-section">
        <div className="account-danger-row">
          <div className="settings-modal-row-left">
            <div className="settings-modal-row-title">Hapus akun</div>
            <div className="settings-modal-row-desc">
              Hapus akun Anda beserta datanya secara permanen
            </div>
          </div>

          {!confirmDelete && (
            <button
              type="button"
              className="account-delete-pill-btn"
              onClick={() => {
                setFeedback(null);
                setConfirmDelete(true);
              }}
            >
              Hapus
            </button>
          )}
        </div>

        {confirmDelete && (
          <div className="account-delete-confirm animate-fade-in">
            <p className="account-delete-confirm-text">
              Tindakan ini akan menghapus akun dan seluruh riwayat percakapan Anda secara
              permanen dan tidak dapat dibatalkan.
            </p>
            <div className="account-delete-confirm-actions">
              <button
                type="button"
                className="account-confirm-cancel-btn"
                onClick={() => setConfirmDelete(false)}
                disabled={isDeleting}
              >
                Batal
              </button>
              <button
                type="button"
                className="account-confirm-delete-btn"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus Permanen'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
