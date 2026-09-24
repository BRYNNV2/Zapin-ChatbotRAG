import React from 'react';

/**
 * Parses inline formatting:
 * - Citations: [1], [2] -> interactive buttons
 * - Bold + Italic: ***text***
 * - Bold: **text**
 * - Italic: *text*
 * - Code: `code`
 */
function renderInlineContent(text, sources, onOpenSources) {
  if (!text) return null;

  const tokenRegex = /(\[\d+\]|\*\*\*[^*]+?\*\*\*|\*\*[^*]+?\*\*|\*[^*]+?\*|`[^`]+?`)/g;
  const parts = text.split(tokenRegex);

  return parts.filter(p => p !== '').map((part, idx) => {
    // 1. Interactive Citation [1]
    const citMatch = part.match(/^\[(\d+)\]$/);
    if (citMatch) {
      const citationId = parseInt(citMatch[1], 10);
      return (
        <button
          key={idx}
          type="button"
          className="citation-badge"
          title={`Buka rujukan sumber kutipan [${citationId}]`}
          onClick={() => onOpenSources && onOpenSources(sources, citationId)}
        >
          [{citationId}]
        </button>
      );
    }

    // 2. Bold + Italic ***text***
    if (/^\*\*\*[^*]+?\*\*\*$/.test(part)) {
      return (
        <strong key={idx} className="md-bold">
          <em className="md-italic">{part.slice(3, -3)}</em>
        </strong>
      );
    }

    // 3. Bold **text**
    if (/^\*\*[^*]+?\*\*$/.test(part)) {
      return (
        <strong key={idx} className="md-bold">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // 4. Italic *text*
    if (/^\*[^*]+?\*$/.test(part)) {
      return (
        <em key={idx} className="md-italic">
          {part.slice(1, -1)}
        </em>
      );
    }

    // 5. Inline Code `code`
    if (/^`[^`]+?`$/.test(part)) {
      return (
        <code key={idx} className="md-inline-code">
          {part.slice(1, -1)}
        </code>
      );
    }

    // Plain text
    return <span key={idx}>{part}</span>;
  });
}

/**
 * Groups raw Markdown text into block-level elements:
 * - Paragraphs <p>
 * - Headings <h3>, <h4>
 * - Unordered lists <ul><li>...</li></ul>
 * - Ordered lists <ol><li>...</li></ol>
 */
export default function MarkdownMessage({ text, sources, onOpenSources }) {
  if (!text) return null;

  const lines = text.split(/\r?\n/);
  const blocks = [];
  let currentList = null;

  const flushList = () => {
    if (currentList) {
      blocks.push(currentList);
      currentList = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      continue;
    }

    // Unordered list item (* or - or •)
    const ulMatch = trimmed.match(/^[\*\-•]\s+(.+)$/);
    if (ulMatch) {
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(ulMatch[1]);
      continue;
    }

    // Ordered list item (e.g., 1. or 2.)
    const olMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (olMatch) {
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push({ num: olMatch[1], content: olMatch[2] });
      continue;
    }

    flushList();

    // Headings
    if (trimmed.startsWith('### ')) {
      blocks.push({ type: 'h3', content: trimmed.replace(/^###\s+/, '') });
    } else if (trimmed.startsWith('## ')) {
      blocks.push({ type: 'h2', content: trimmed.replace(/^##\s+/, '') });
    } else if (trimmed.startsWith('# ')) {
      blocks.push({ type: 'h1', content: trimmed.replace(/^#\s+/, '') });
    } else if (/^\*\*\d+\..+\*\*$/.test(trimmed) || /^\*\*[^*]+:\*\*$/.test(trimmed)) {
      // Formatted subheadings like **1. Musik Pengiring Utama**
      const cleanSub = trimmed.replace(/^\*\*|\*\*$/g, '');
      blocks.push({ type: 'subheading', content: cleanSub });
    } else {
      blocks.push({ type: 'p', content: trimmed });
    }
  }

  flushList();

  return (
    <div className="kimi-markdown-body">
      {blocks.map((block, bIdx) => {
        switch (block.type) {
          case 'h1':
          case 'h2':
          case 'h3':
            return (
              <h4 key={bIdx} className="md-heading">
                {renderInlineContent(block.content, sources, onOpenSources)}
              </h4>
            );

          case 'subheading':
            return (
              <div key={bIdx} className="md-subheading">
                {renderInlineContent(block.content, sources, onOpenSources)}
              </div>
            );

          case 'ul':
            return (
              <ul key={bIdx} className="md-list md-ul">
                {block.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="md-list-item">
                    <span className="md-bullet">•</span>
                    <span className="md-item-content">
                      {renderInlineContent(item, sources, onOpenSources)}
                    </span>
                  </li>
                ))}
              </ul>
            );

          case 'ol':
            return (
              <ol key={bIdx} className="md-list md-ol">
                {block.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="md-list-item">
                    <span className="md-number">{item.num}.</span>
                    <span className="md-item-content">
                      {renderInlineContent(item.content, sources, onOpenSources)}
                    </span>
                  </li>
                ))}
              </ol>
            );

          case 'p':
          default:
            return (
              <p key={bIdx} className="md-paragraph">
                {renderInlineContent(block.content, sources, onOpenSources)}
              </p>
            );
        }
      })}
    </div>
  );
}
