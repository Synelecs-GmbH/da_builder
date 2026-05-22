import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ScriptCommand } from '../../types';
import { getCommandDef } from '../../data/commands';
import { CommandForm } from '../forms/CommandForm';
import { Badge } from '../common/Badge';
import { Btn } from '../common/Btn';
import { GripVertical, Trash2, Copy, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { CommandPicker } from './CommandPicker';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  command: ScriptCommand;
  index: number;
  variables: Record<string, string>;
  filterNames: string[];
  onUpdate: (id: string, attrs: Record<string, string>) => void;
  onDelete: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onAddChild?: (parentId: string, cmd: ScriptCommand) => void;
  onDeleteChild?: (parentId: string, childId: string) => void;
  onUpdateChild?: (parentId: string, childId: string, attrs: Record<string, string>) => void;
  depth?: number;
}

const TIER_COLOR: Record<number, 'green' | 'yellow' | 'gray'> = { 1: 'green', 2: 'yellow', 3: 'gray' };
const CATEGORY_COLOR: Record<string, string> = {
  'Support': '#6e7681',
  'Query Filters': '#bc8cff',
  'Assign': '#58a6ff',
  'Create': '#3fb950',
  'Delete': '#f85149',
  'Deploy': '#e3b341',
  'Rename': '#79c0ff',
  'Attribute Update': '#ffa657',
  'Lock/Unlock': '#ff7b72',
  'Reset': '#a5d6ff',
  'Repeat': '#d2a8ff',
  'Timer': '#7ee787',
  'Import/Export': '#f0883e',
  'Miscellaneous': '#8b949e',
};

export const CommandCard: React.FC<Props> = ({
  command, index, variables, filterNames,
  onUpdate, onDelete, onDuplicate, onAddChild, onDeleteChild, onUpdateChild,
  depth = 0,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const def = getCommandDef(command.type);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: command.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    marginLeft: depth * 16,
  };

  const catColor = CATEGORY_COLOR[def?.category ?? ''] ?? 'var(--text3)';

  // Summary of key attributes for collapsed view
  const summary = def?.attributes.slice(0, 3)
    .map(a => command.attributes[a.name])
    .filter(Boolean)
    .join(' · ') ?? '';

  return (
    <div ref={setNodeRef} style={style}>
      <div style={{
        background: 'var(--bg2)',
        border: `1px solid ${expanded ? 'var(--border2)' : 'var(--border)'}`,
        borderLeft: `3px solid ${catColor}`,
        borderRadius: 'var(--radius)',
        marginBottom: 4,
        overflow: 'hidden',
        transition: 'border-color 0.15s',
      }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 10px' }}>
          <span
            {...attributes} {...listeners}
            style={{ cursor: 'grab', color: 'var(--text3)', display: 'flex', flexShrink: 0 }}
          >
            <GripVertical size={14} />
          </span>

          <span style={{ fontSize: 11, color: 'var(--text3)', minWidth: 20, textAlign: 'right' }}>
            {index + 1}
          </span>

          <button
            onClick={() => setExpanded(!expanded)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, textAlign: 'left', minWidth: 0 }}
          >
            <span style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap' }}>
              {command.type}
            </span>
            {def && (
              <Badge color={TIER_COLOR[def.tier]}>{`T${def.tier}`}</Badge>
            )}
            {!expanded && summary && (
              <span style={{ fontSize: 11, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {summary}
              </span>
            )}
            <span style={{ marginLeft: 'auto', color: 'var(--text3)', display: 'flex' }}>
              {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </span>
          </button>

          {onDuplicate && (
            <button
              onClick={() => onDuplicate(command.id)}
              style={{ color: 'var(--text3)', display: 'flex', flexShrink: 0, padding: 2 }}
              title="Duplicate"
            >
              <Copy size={13} />
            </button>
          )}
          <button
            onClick={() => onDelete(command.id)}
            style={{ color: 'var(--text3)', display: 'flex', flexShrink: 0, padding: 2 }}
            title="Delete"
          >
            <Trash2 size={13} />
          </button>
        </div>

        {/* Expanded form */}
        {expanded && def && (
          <div style={{ borderTop: '1px solid var(--border)', padding: '12px 14px' }}>
            <p style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 12 }}>{def.description}</p>
            <CommandForm
              def={def}
              command={command}
              variables={variables}
              filterNames={filterNames}
              onChange={attrs => onUpdate(command.id, attrs)}
            />
          </div>
        )}

        {/* Loop children */}
        {def?.isContainer && (
          <div style={{ borderTop: '1px solid var(--border)', padding: '8px 10px', background: 'rgba(188,140,255,0.04)' }}>
            <div style={{ fontSize: 11, color: 'var(--purple)', marginBottom: 6, fontWeight: 600 }}>
              Loop body — use ^ as the loop index in attribute values
            </div>
            {(command.children ?? []).map((child, ci) => (
              <CommandCard
                key={child.id}
                command={child}
                index={ci}
                variables={variables}
                filterNames={filterNames}
                onUpdate={(childId, attrs) => onUpdateChild?.(command.id, childId, attrs)}
                onDelete={childId => onDeleteChild?.(command.id, childId)}
                depth={1}
              />
            ))}
            <Btn
              size="sm"
              variant="ghost"
              onClick={() => setPickerOpen(true)}
              style={{ marginTop: 4, color: 'var(--purple)', borderColor: 'rgba(188,140,255,0.3)' }}
            >
              <Plus size={12} /> Add command to loop
            </Btn>
            {pickerOpen && (
              <CommandPicker
                onSelect={type => {
                  const def2 = getCommandDef(type);
                  const newCmd: ScriptCommand = { id: uuidv4(), type, attributes: {} };
                  if (def2) def2.attributes.forEach(a => { newCmd.attributes[a.name] = ''; });
                  onAddChild?.(command.id, newCmd);
                  setPickerOpen(false);
                }}
                onClose={() => setPickerOpen(false)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
