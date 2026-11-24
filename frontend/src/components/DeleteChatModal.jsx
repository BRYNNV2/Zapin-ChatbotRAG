import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import '../styles/chat-item-menu.css';

export default function DeleteChatModal({ session, onCancel, onConfirm }) {
  useEffect(() => {
    if (!session) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [session, onCancel]);

  if (!session) return null;

  const title = session.title || 'Percakapan Budaya Zapin';

  return createPortal(
    <div className="delete-chat-modal-backdrop animate-fade-in" onClick={onCancel}>
      <div
        className="delete-chat-modal-card animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Hapus obrolan?"
      >
        <h3 className="delete-chat-modal-title">Hapus obrolan?</h3>
        <p className="delete-chat-modal-desc">
          Tindakan ini akan menghapus <strong>{title}</strong> secara permanen dan tidak
          dapat dikembalikan.
        </p>

        <div className="delete-chat-modal-actions">
          <button
            type="button"
            className="delete-chat-cancel-btn"
            onClick={onCancel}
          >
            Batal
          </button>
          <button
            type="button"
            className="delete-chat-confirm-btn"
            onClick={() => onConfirm(session.id)}
          >
            Hapus
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
