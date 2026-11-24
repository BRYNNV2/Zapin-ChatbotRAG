import React from 'react';
import {
  HelpCircle,
  Zap,
  FileText,
  Info,
  Bug
} from 'lucide-react';
import '../styles/help-menu.css';

const TOP_ITEMS = [
  { key: 'help-center', label: 'Pusat bantuan', icon: HelpCircle },
  { key: 'shortcuts', label: 'Pintasan keyboard', icon: Zap, shortcut: 'Ctrl+/' }
];

const BOTTOM_ITEMS = [
  { key: 'terms', label: 'Ketentuan Layanan', icon: FileText },
  { key: 'privacy', label: 'Kebijakan Privasi', icon: Info },
  { key: 'report-bug', label: 'Laporkan bug', icon: Bug }
];

export default function HelpSubmenu({ onSelect, onMouseEnter, onMouseLeave }) {
  const renderItem = ({ key, label, icon: Icon, shortcut }) => (
    <button
      key={key}
      type="button"
      className="help-submenu-item"
      role="menuitem"
      onClick={() => onSelect(key)}
    >
      <span className="help-submenu-left">
        <Icon size={16} />
        <span>{label}</span>
      </span>
      {shortcut && <span className="help-submenu-shortcut">{shortcut}</span>}
    </button>
  );

  return (
    <div
      id="help-submenu-card"
      className="help-submenu-card animate-fade-in"
      role="menu"
      aria-label="Menu Bantuan"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {TOP_ITEMS.map(renderItem)}
      <div className="help-submenu-divider" />
      {BOTTOM_ITEMS.map(renderItem)}
    </div>
  );
}
