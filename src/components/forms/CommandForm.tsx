import { useState, type FC } from 'react';
import type { CommandDef, AttributeDef, ScriptCommand } from '../../types';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  def: CommandDef;
  command: ScriptCommand;
  variables: Record<string, string>;
  filterNames: string[];
  onChange: (attrs: Record<string, string>) => void;
}

export const CommandForm: FC<Props> = ({ def, command, variables, filterNames, onChange }) => {
  const [helpOpen, setHelpOpen] = useState<string | null>(null);
  const attrs = command.attributes;

  const update = (name: string, value: string) => {
    onChange({ ...attrs, [name]: value });
  };

  const getWarning = (attrDef: AttributeDef): string | null => {
    const val = attrs[attrDef.name] ?? '';
    if (attrDef.required && val.trim() === '') return 'Required';
    if (attrDef.kind === 'tagname' && val.startsWith('$') === false && val !== '' && !val.includes('%')) {
      // Warn if template fields don't start with $
      if (attrDef.name === 'Template') return 'Template names should start with $';
    }
    if (attrDef.mutuallyExclusiveWith) {
      const otherVal = attrs[attrDef.mutuallyExclusiveWith] ?? '';
      if (val !== '' && otherVal !== '') {
        return `Cannot be set together with "${attrDef.mutuallyExclusiveWith}"`;
      }
    }
    return null;
  };

  const renderField = (attrDef: AttributeDef) => {
    const val = attrs[attrDef.name] ?? '';
    const warning = getWarning(attrDef);
    const isOpen = helpOpen === attrDef.name;

    return (
      <div key={attrDef.name} style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
          <label style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 500 }}>
            {attrDef.label}
            {attrDef.required && <span style={{ color: 'var(--red)', marginLeft: 2 }}>*</span>}
          </label>
          <button
            onClick={() => setHelpOpen(isOpen ? null : attrDef.name)}
            style={{ color: 'var(--text3)', display: 'flex', alignItems: 'center' }}
            title="Help"
          >
            <HelpCircle size={12} />
          </button>
          {Object.keys(variables).length > 0 && (attrDef.kind === 'text' || attrDef.kind === 'tagname') && (
            <VarInserter variables={variables} onInsert={v => update(attrDef.name, val + v)} />
          )}
        </div>

        {isOpen && (
          <div style={{
            fontSize: 11, color: 'var(--text2)', background: 'var(--bg4)',
            padding: '6px 8px', borderRadius: 'var(--radius)', marginBottom: 6,
            borderLeft: '2px solid var(--accent)',
          }}>
            {attrDef.help}
          </div>
        )}

        {attrDef.kind === 'enum' ? (
          <select
            value={val}
            onChange={e => update(attrDef.name, e.target.value)}
            style={{ borderColor: warning ? 'var(--red)' : undefined }}
          >
            <option value="">— select —</option>
            {attrDef.options?.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : attrDef.kind === 'filter-ref' ? (
          <select
            value={val}
            onChange={e => update(attrDef.name, e.target.value)}
            style={{ borderColor: warning ? 'var(--red)' : undefined }}
          >
            <option value="">— select filter —</option>
            {filterNames.map(n => <option key={n} value={n}>{n}</option>)}
            <option value="__custom__">Custom...</option>
          </select>
        ) : attrDef.kind === 'boolean' ? (
          <select
            value={val}
            onChange={e => update(attrDef.name, e.target.value)}
            style={{ borderColor: warning ? 'var(--red)' : undefined }}
          >
            <option value="">— select —</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        ) : (
          <input
            type={attrDef.kind === 'number' ? 'number' : 'text'}
            value={val}
            placeholder={attrDef.placeholder}
            onChange={e => update(attrDef.name, e.target.value)}
            style={{ borderColor: warning ? 'var(--red)' : undefined, fontFamily: 'var(--mono)' }}
          />
        )}

        {warning && (
          <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 3 }}>{warning}</div>
        )}
      </div>
    );
  };

  return (
    <div>
      {def.attributes.map(attrDef => renderField(attrDef))}
    </div>
  );
};

const VarInserter: FC<{ variables: Record<string, string>; onInsert: (v: string) => void }> = ({
  variables, onInsert,
}) => {
  const [open, setOpen] = useState(false);
  const names = Object.keys(variables);
  if (names.length === 0) return null;

  return (
    <div style={{ position: 'relative', marginLeft: 'auto' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          fontSize: 10, color: 'var(--accent-hover)',
          background: 'rgba(31,111,235,0.1)', border: '1px solid rgba(31,111,235,0.2)',
          borderRadius: 3, padding: '1px 5px', display: 'flex', alignItems: 'center', gap: 2,
        }}
        title="Insert variable"
      >
        %var% {open ? <ChevronUp size={9} /> : <ChevronDown size={9} />}
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, zIndex: 100,
          background: 'var(--bg3)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', marginTop: 2, minWidth: 140,
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        }}>
          {names.map(n => (
            <button
              key={n}
              onClick={() => { onInsert(`%${n}%`); setOpen(false); }}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '5px 10px', fontSize: 12, color: 'var(--text)',
                fontFamily: 'var(--mono)',
              }}
            >
              %{n}% <span style={{ color: 'var(--text3)', fontSize: 11 }}>= {variables[n]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
