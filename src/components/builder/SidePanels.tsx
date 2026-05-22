import { useState } from 'react';
import type { ScriptCommand } from '../../types';
import { EXAMPLES } from '../../data/examples';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Btn } from '../common/Btn';

interface Props {
  commands: ScriptCommand[];
  variables: Record<string, string>;
  filterNames: string[];
  onLoadExample: (cmds: ScriptCommand[]) => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({
  title, children, defaultOpen = true,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: '1px solid var(--border)', marginBottom: 0 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          width: '100%', padding: '8px 12px', textAlign: 'left',
          fontSize: 11, fontWeight: 600, color: 'var(--text2)',
          letterSpacing: '0.5px', textTransform: 'uppercase',
        }}
      >
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        {title}
      </button>
      {open && <div style={{ padding: '0 12px 10px' }}>{children}</div>}
    </div>
  );
};

export const SidePanels: React.FC<Props> = ({ commands, variables, filterNames, onLoadExample }) => {
  return (
    <div style={{ fontSize: 12 }}>
      {/* Variables */}
      <Section title="Variables">
        {Object.keys(variables).length === 0 ? (
          <p style={{ color: 'var(--text3)', fontSize: 11 }}>
            Add a <strong>Set Variable</strong> command to define variables.
          </p>
        ) : (
          Object.entries(variables).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: 6, marginBottom: 4, alignItems: 'baseline' }}>
              <code style={{
                fontFamily: 'var(--mono)', fontSize: 11, background: 'var(--bg4)',
                padding: '1px 5px', borderRadius: 3, color: 'var(--purple)', whiteSpace: 'nowrap',
              }}>%{k}%</code>
              <span style={{ color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                = {v || <em style={{ color: 'var(--text3)' }}>empty</em>}
              </span>
            </div>
          ))
        )}
      </Section>

      {/* Filters */}
      <Section title="Filters" defaultOpen={true}>
        {filterNames.length === 0 ? (
          <p style={{ color: 'var(--text3)', fontSize: 11 }}>
            Add a <strong>Query Filter</strong> command to define filters.
          </p>
        ) : (
          filterNames.map(name => {
            const conditions = commands
              .filter(c => ['QueryFilter', 'BlockQueryFilter', 'AttributeQueryFilter'].includes(c.type) && c.attributes.Filter === name);
            return (
              <div key={name} style={{ marginBottom: 8 }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent-hover)', fontWeight: 600, marginBottom: 3 }}>
                  {name}
                </div>
                {conditions.map(c => (
                  <div key={c.id} style={{ fontSize: 11, color: 'var(--text2)', paddingLeft: 8, marginBottom: 1 }}>
                    <span style={{ color: 'var(--text3)' }}>{c.type.replace('QueryFilter', '').replace('Filter', '')}</span>{' '}
                    <span style={{ color: c.attributes.Condition?.startsWith('!') ? 'var(--red)' : 'var(--text)' }}>
                      {c.attributes.Condition}
                    </span>{' '}
                    <span style={{ color: 'var(--yellow)', fontFamily: 'var(--mono)' }}>{c.attributes.Value}</span>
                  </div>
                ))}
              </div>
            );
          })
        )}
      </Section>

      {/* Examples */}
      <Section title="Examples" defaultOpen={false}>
        {EXAMPLES.map(ex => (
          <div key={ex.name} style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>{ex.name}</div>
            <p style={{ color: 'var(--text2)', fontSize: 11, marginBottom: 5, lineHeight: 1.4 }}>{ex.description}</p>
            <Btn size="sm" variant="secondary" onClick={() => onLoadExample(ex.commands)}>
              Load example
            </Btn>
          </div>
        ))}
      </Section>
    </div>
  );
};
