import React from 'react';
import { Plus, MessageSquare, Trash2 } from 'lucide-react';

export default function ChatHistorySidebar({ sessions, activeSessionId, onSelectSession, onNewChat, onDeleteSession }) {
  return (
    <aside className="chat-sidebar">
      <button className="sidebar-new-btn" onClick={onNewChat}>
        <Plus size={16} />
        <span>Percakapan Baru</span>
      </button>

      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '8px 4px 4px 4px' }}>
        Riwayat Percakapan
      </div>

      <div className="history-list">
        {sessions.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', padding: '12px 6px', textAlign: 'center' }}>
            Belum ada riwayat dialog.
          </div>
        ) : (
          sessions.map((sess) => (
            <div
              key={sess.id}
              className={`history-item ${sess.id === activeSessionId ? 'active' : ''}`}
              onClick={() => onSelectSession(sess.id)}
            >
              <MessageSquare size={14} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {sess.title || 'Percakapan Budaya Zapin'}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(sess.id);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Hapus riwayat"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))
        )}
      </div>

      <div style={{ padding: '12px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        Tersimpan di Penyimpanan Lokal
      </div>
    </aside>
  );
}
