import { useEffect, useRef, useState, type FC } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { xml } from '@codemirror/lang-xml';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorState, Compartment } from '@codemirror/state';
import type { ScriptCommand } from '../../types';
import { serializeScript, parseXmlToCommands } from '../../lib/xml';
import { Btn } from '../common/Btn';
import { Copy, Check, RefreshCw, Edit3, Eye } from 'lucide-react';

interface Props {
  commands: ScriptCommand[];
  scriptName: string;
  theme: 'light' | 'dark';
  onImport: (cmds: ScriptCommand[]) => void;
}

export const XmlPreview: FC<Props> = ({ commands, scriptName, theme, onImport }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const themeCompartment = useRef(new Compartment());
  const editableCompartment = useRef(new Compartment());
  const [copied, setCopied] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const xml_content = serializeScript({ name: scriptName, commands, createdAt: '', version: '1' });

  // Create editor once on mount
  useEffect(() => {
    if (!editorRef.current) return;

    const view = new EditorView({
      state: EditorState.create({
        doc: xml_content,
        extensions: [
          basicSetup,
          xml(),
          themeCompartment.current.of([]),
          editableCompartment.current.of(EditorView.editable.of(false)),
          EditorView.theme({
            '&': { height: '100%', fontSize: '12px' },
            '.cm-scroller': { fontFamily: 'var(--mono)', overflow: 'auto' },
            '.cm-content': { padding: '8px 0' },
          }),
        ],
      }),
      parent: editorRef.current,
    });

    viewRef.current = view;
    return () => { view.destroy(); viewRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Dynamically switch theme without rebuilding the editor
  useEffect(() => {
    viewRef.current?.dispatch({
      effects: themeCompartment.current.reconfigure(theme === 'dark' ? oneDark : []),
    });
  }, [theme]);

  // Dynamically toggle editability
  useEffect(() => {
    viewRef.current?.dispatch({
      effects: editableCompartment.current.reconfigure(EditorView.editable.of(editMode)),
    });
  }, [editMode]);

  // Update content whenever commands change (skip while user is editing)
  useEffect(() => {
    if (editMode || !viewRef.current) return;
    const current = viewRef.current.state.doc.toString();
    if (current !== xml_content) {
      viewRef.current.dispatch({
        changes: { from: 0, to: viewRef.current.state.doc.length, insert: xml_content },
      });
    }
  }, [xml_content, editMode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(editMode ? (viewRef.current?.state.doc.toString() ?? xml_content) : xml_content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleApplyEdits = () => {
    const text = viewRef.current?.state.doc.toString() ?? '';
    try {
      const cmds = parseXmlToCommands(text);
      onImport(cmds);
      setEditMode(false);
      setParseError(null);
    } catch (e) {
      setParseError((e as Error).message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px',
        borderBottom: '1px solid var(--border)', background: 'var(--bg2)', flexShrink: 0,
      }}>
        <span style={{ fontSize: 11, color: 'var(--text3)', flex: 1 }}>
          {commands.length} command{commands.length !== 1 ? 's' : ''}
          {editMode && <span style={{ color: 'var(--yellow)', marginLeft: 8 }}>edit mode</span>}
        </span>
        <Btn size="sm" variant="ghost" onClick={handleCopy}>
          {copied ? <><Check size={12} style={{ color: 'var(--green)' }} /> Copied</> : <><Copy size={12} /> Copy</>}
        </Btn>
        {editMode ? (
          <>
            <Btn size="sm" variant="primary" onClick={handleApplyEdits}>
              <RefreshCw size={12} /> Apply edits
            </Btn>
            <Btn size="sm" variant="ghost" onClick={() => { setEditMode(false); setParseError(null); }}>
              <Eye size={12} /> View
            </Btn>
          </>
        ) : (
          <Btn size="sm" variant="ghost" onClick={() => setEditMode(true)}>
            <Edit3 size={12} /> Edit XML
          </Btn>
        )}
      </div>

      {parseError && (
        <div style={{ padding: '6px 12px', background: 'rgba(248,81,73,0.1)', borderBottom: '1px solid var(--red)', color: 'var(--red)', fontSize: 12 }}>
          {parseError}
        </div>
      )}

      <div ref={editorRef} style={{ flex: 1, overflow: 'hidden' }} />
    </div>
  );
};
