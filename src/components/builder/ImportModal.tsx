import { useState, useRef } from 'react';
import { parseXmlToCommands } from '../../lib/xml';
import type { ScriptCommand } from '../../types';
import { Btn } from '../common/Btn';
import { X, Upload } from 'lucide-react';

interface Props {
  onImport: (cmds: ScriptCommand[]) => void;
  onClose: () => void;
}

export const ImportModal: React.FC<Props> = ({ onImport, onClose }) => {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleParse = () => {
    try {
      const cmds = parseXmlToCommands(text);
      onImport(cmds);
      onClose();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setText(ev.target?.result as string ?? '');
    reader.readAsText(file);
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 'var(--radius-lg)',
        width: 560, maxHeight: '80vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontWeight: 600, flex: 1 }}>Import XML Script</span>
          <button onClick={onClose} style={{ color: 'var(--text3)', display: 'flex' }}><X size={15} /></button>
        </div>
        <div style={{ padding: 16, flex: 1, overflow: 'auto' }}>
          <div style={{ marginBottom: 10, display: 'flex', gap: 8 }}>
            <Btn variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
              <Upload size={12} /> Upload .xml file
            </Btn>
            <input ref={fileRef} type="file" accept=".xml" onChange={handleFile} style={{ display: 'none' }} />
          </div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={'<?xml version="1.0" encoding="utf-8"?>\n<DirectAccess>\n  ...\n</DirectAccess>'}
            style={{
              height: 280, fontFamily: 'var(--mono)', fontSize: 12, resize: 'vertical',
              background: 'var(--bg)', border: '1px solid var(--border)',
            }}
          />
          {error && (
            <div style={{ color: 'var(--red)', fontSize: 12, marginTop: 6 }}>{error}</div>
          )}
          <p style={{ color: 'var(--text2)', fontSize: 11, marginTop: 8 }}>
            Unknown commands will be preserved as passthrough blocks.
          </p>
        </div>
        <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={handleParse} disabled={!text.trim()}>Parse & Import</Btn>
        </div>
      </div>
    </div>
  );
};
