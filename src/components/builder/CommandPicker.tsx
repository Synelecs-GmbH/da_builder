import React, { useState, useEffect, useRef } from 'react';
import { getCommandsByCategory, COMMAND_DEFS } from '../../data/commands';
import { Badge } from '../common/Badge';
import { Search, X } from 'lucide-react';

interface Props {
  onSelect: (type: string) => void;
  onClose: () => void;
}

const TIER_COLOR: Record<number, 'green' | 'yellow' | 'gray'> = { 1: 'green', 2: 'yellow', 3: 'gray' };

export const CommandPicker: React.FC<Props> = ({ onSelect, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const byCategory = getCommandsByCategory();
  const categories = Object.keys(byCategory);

  useEffect(() => {
    searchRef.current?.focus();
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const filtered = query.trim()
    ? COMMAND_DEFS.filter(c =>
        c.type.toLowerCase().includes(query.toLowerCase()) ||
        c.label.toLowerCase().includes(query.toLowerCase()) ||
        c.description.toLowerCase().includes(query.toLowerCase())
      )
    : selectedCat ? byCategory[selectedCat] ?? [] : null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border2)',
        borderRadius: 'var(--radius-lg)',
        width: 640, maxHeight: '80vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
      }}>
        {/* Search bar */}
        <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'center' }}>
          <Search size={15} style={{ color: 'var(--text3)', flexShrink: 0 }} />
          <input
            ref={searchRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedCat(null); }}
            placeholder="Search commands..."
            style={{ border: 'none', background: 'transparent', flex: 1, fontSize: 14, padding: 0 }}
          />
          <button onClick={onClose} style={{ color: 'var(--text3)', display: 'flex' }}>
            <X size={15} />
          </button>
        </div>

        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          {/* Category sidebar */}
          {!query && (
            <div style={{
              width: 160, borderRight: '1px solid var(--border)',
              padding: '8px 0', overflowY: 'auto', flexShrink: 0,
            }}>
              <button
                onClick={() => setSelectedCat(null)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '5px 12px', fontSize: 12, color: selectedCat === null ? 'var(--accent-hover)' : 'var(--text2)',
                  background: selectedCat === null ? 'rgba(31,111,235,0.1)' : 'transparent',
                  borderLeft: selectedCat === null ? '2px solid var(--accent)' : '2px solid transparent',
                }}
              >
                All commands
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCat(cat)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '5px 12px', fontSize: 12,
                    color: selectedCat === cat ? 'var(--accent-hover)' : 'var(--text2)',
                    background: selectedCat === cat ? 'rgba(31,111,235,0.1)' : 'transparent',
                    borderLeft: selectedCat === cat ? '2px solid var(--accent)' : '2px solid transparent',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Command list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
            {(filtered ?? COMMAND_DEFS).map(cmd => (
              <button
                key={cmd.type}
                onClick={() => onSelect(cmd.type)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 8,
                  width: '100%', textAlign: 'left', padding: '8px 10px',
                  borderRadius: 'var(--radius)', marginBottom: 2,
                  background: 'transparent', color: 'var(--text)',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg3)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600 }}>{cmd.type}</span>
                    <Badge color={TIER_COLOR[cmd.tier]}>T{cmd.tier}</Badge>
                    <span style={{ fontSize: 11, color: 'var(--text3)' }}>{cmd.category}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.4 }}>{cmd.description}</div>
                </div>
              </button>
            ))}
            {filtered?.length === 0 && (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--text3)' }}>
                No commands match "{query}"
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
