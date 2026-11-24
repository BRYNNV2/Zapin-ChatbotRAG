import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Pin,
  PinOff,
  Pencil,
  Share,
  Archive,
  ArchiveRestore,
  Trash2
} from 'lucide-react';
import '../styles/chat-item-menu.css';

const MENU_WIDTH = 224;
const MENU_EST_HEIGHT = 236;

export default function ChatItemMenu({
  session,
  anchorRect,
  isPinned,
  isArchived,
  onClose,
  onTogglePin,
  onRename,
  onShare,
  onToggleArchive,
  onDelete
}) {
  const menuRef = useRef(null);

  useEffect(() => {
    if (!session) return;

    const handleClickOutside = (e) => {
      if (e.target.closest?.('.history-more-btn')) return;
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleScroll = () => onClose();

    const handleKeyDown = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable) {
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        const lower = e.key.toLowerCase();
        if (lower === 'p') {
          e.preventDefault();
          onTogglePin(session.id);
          onClose();
        } else if (lower === 'r') {
          e.preventDefault();
          onRename(session);
          onClose();
        } else if (lower === 'a') {
          e.preventDefault();
          onToggleArchive(session.id);
          onClose();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [session, onClose, onTogglePin, onRename, onToggleArchive]);

  if (!session || !anchorRect) return null;

  const viewportW = typeof window !== 'undefined' ? window.innerWidth : 1280;
  const viewportH = typeof window !== 'undefined' ? window.innerHeight : 720;

  const left = Math.max(10, Math.min(anchorRect.right - 22, viewportW - MENU_WIDTH - 12));
  const rawTop = anchorRect.bottom + 6;
  const top =
    rawTop + MENU_EST_HEIGHT > viewportH - 12
      ? Math.max(12, anchorRect.top - MENU_EST_HEIGHT - 6)
      : rawTop;

  const menuContent = (
    <div
      ref={menuRef}
      className="chat-item-menu-card animate-fade-in"
      style={{ top: `${top}px`, left: `${left}px` }}
      role="menu"
      aria-label="Opsi percakapan"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="chat-item-menu-item"
        role="menuitem"
        onClick={() => {
          onTogglePin(session.id);
          onClose();
        }}
      >
        <span className="chat-item-menu-left">
          {isPinned ? <PinOff size={16} /> : <Pin size={16} />}
          <span>{isPinned ? 'Lepas sematan' : 'Sematkan'}</span>
        </span>
        <span className="chat-item-menu-shortcut">P</span>
      </button>

      <button
        type="button"
        className="chat-item-menu-item"
        role="menuitem"
        onClick={() => {
          onRename(session);
          onClose();
        }}
      >
        <span className="chat-item-menu-left">
          <Pencil size={16} />
          <span>Ganti nama</span>
        </span>
        <span className="chat-item-menu-shortcut">R</span>
      </button>

      <button
        type="button"
        className="chat-item-menu-item"
        role="menuitem"
        onClick={() => {
          onShare(session.id);
          onClose();
        }}
      >
        <span className="chat-item-menu-left">
          <Share size={16} />
          <span>Bagikan</span>
        </span>
      </button>

      <button
        type="button"
        className="chat-item-menu-item"
        role="menuitem"
        onClick={() => {
          onToggleArchive(session.id);
          onClose();
        }}
      >
        <span className="chat-item-menu-left">
          {isArchived ? <ArchiveRestore size={16} /> : <Archive size={16} />}
          <span>{isArchived ? 'Batalkan arsip' : 'Arsipkan'}</span>
        </span>
        <span className="chat-item-menu-shortcut">A</span>
      </button>

      <button
        type="button"
        className="chat-item-menu-item danger"
        role="menuitem"
        onClick={() => {
          onDelete(session.id);
          onClose();
        }}
      >
        <span className="chat-item-menu-left">
          <Trash2 size={16} />
          <span>Hapus</span>
        </span>
      </button>
    </div>
  );

  return createPortal(menuContent, document.body);
}
