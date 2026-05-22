import { useState, useCallback, useEffect, useRef } from 'react';
import type { ScriptCommand } from './types';
import { serializeScript, extractVariables } from './lib/xml';
import { BuilderPanel } from './components/builder/BuilderPanel';
import { XmlPreview } from './components/preview/XmlPreview';
import { ImportModal } from './components/builder/ImportModal';
import { Btn } from './components/common/Btn';
import { Download, Upload, Save, FolderOpen, FileCode, Sun, Moon } from 'lucide-react';

const STORAGE_KEY = 'da_builder_state';
const THEME_KEY = 'da_builder_theme';

interface AppState {
  name: string;
  commands: ScriptCommand[];
}

const defaultState: AppState = { name: 'my_script', commands: [] };

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return defaultState;
}

export default function App() {
  const [state, setStateRaw] = useState<AppState>(loadState);
  const [importOpen, setImportOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    (localStorage.getItem(THEME_KEY) as 'light' | 'dark') ?? 'light'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const setState = useCallback((updater: AppState | ((prev: AppState) => AppState)) => {
    setStateRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const variables = extractVariables(state.commands);

  const [previewWidth, setPreviewWidth] = useState(420);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const onDividerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMouseMove = (ev: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newWidth = rect.right - ev.clientX;
      setPreviewWidth(Math.min(Math.max(newWidth, 280), rect.width - 300));
    };

    const onMouseUp = () => {
      dragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, []);

  const handleDownload = () => {
    const xmlContent = serializeScript({ name: state.name, commands: state.commands, createdAt: new Date().toISOString(), version: '1' });
    const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.name || 'script'}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveProject = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.name || 'script'}.dascript.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadProject = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.dascript.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        try {
          const loaded = JSON.parse(ev.target?.result as string);
          if (loaded.commands) setState(loaded);
        } catch { alert('Could not parse project file.'); }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>
      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px',
        height: 46, borderBottom: '1px solid var(--border)', background: 'var(--bg2)',
        flexShrink: 0,
      }}>
        <FileCode size={18} style={{ color: 'var(--accent-hover)' }} />
        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', marginRight: 4 }}>
          Direct Access Builder
        </span>
        <span style={{ color: 'var(--border2)', fontSize: 16 }}>|</span>
        <input
          value={state.name}
          onChange={e => setState(s => ({ ...s, name: e.target.value }))}
          placeholder="script-name"
          style={{
            background: 'transparent', border: '1px solid transparent', borderRadius: 4,
            fontSize: 13, color: 'var(--text2)', width: 180, padding: '2px 6px',
          }}
          onFocus={e => (e.target.style.borderColor = 'var(--border)')}
          onBlur={e => (e.target.style.borderColor = 'transparent')}
        />

        <div style={{ flex: 1 }} />

        <Btn size="sm" variant="ghost" onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} title="Toggle theme">
          {theme === 'light' ? <Moon size={13} /> : <Sun size={13} />}
        </Btn>
        <Btn size="sm" variant="ghost" onClick={() => setImportOpen(true)}>
          <Upload size={12} /> Import XML
        </Btn>
        <Btn size="sm" variant="ghost" onClick={handleLoadProject}>
          <FolderOpen size={12} /> Load
        </Btn>
        <Btn size="sm" variant="ghost" onClick={handleSaveProject}>
          <Save size={12} /> Save
        </Btn>
        <Btn size="sm" variant="primary" onClick={handleDownload} disabled={state.commands.length === 0}>
          <Download size={12} /> Download XML
        </Btn>
      </header>

      {/* Main split panel */}
      <div ref={containerRef} style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>
        {/* Builder */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <BuilderPanel
            commands={state.commands}
            variables={variables}
            onChange={cmds => setState(s => ({ ...s, commands: cmds }))}
          />
        </div>

        {/* Resize handle */}
        <div
          onMouseDown={onDividerMouseDown}
          style={{
            width: 5, flexShrink: 0, cursor: 'col-resize',
            background: 'var(--border)',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--border)')}
        />

        {/* XML Preview */}
        <div style={{ width: previewWidth, minWidth: 280, display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
          <div style={{
            padding: '6px 12px', borderBottom: '1px solid var(--border)', background: 'var(--bg2)',
            fontSize: 11, color: 'var(--text3)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase',
          }}>
            Live XML Preview
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <XmlPreview
              commands={state.commands}
              scriptName={state.name}
              theme={theme}
              onImport={cmds => setState(s => ({ ...s, commands: cmds }))}
            />
          </div>
        </div>
      </div>

      {importOpen && (
        <ImportModal
          onImport={cmds => setState(s => ({ ...s, commands: cmds }))}
          onClose={() => setImportOpen(false)}
        />
      )}
    </div>
  );
}
