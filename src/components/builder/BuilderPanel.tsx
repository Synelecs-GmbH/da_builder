import { useState } from 'react';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import type { ScriptCommand } from '../../types';
import { getCommandDef } from '../../data/commands';
import { CommandCard } from './CommandCard';
import { CommandPicker } from './CommandPicker';
import { SidePanels } from './SidePanels';
import { Btn } from '../common/Btn';
import { extractFilters } from '../../lib/xml';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  commands: ScriptCommand[];
  variables: Record<string, string>;
  onChange: (cmds: ScriptCommand[]) => void;
}

export const BuilderPanel: React.FC<Props> = ({ commands, variables, onChange }) => {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const filterNames = extractFilters(commands);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIdx = commands.findIndex(c => c.id === active.id);
      const newIdx = commands.findIndex(c => c.id === over.id);
      onChange(arrayMove(commands, oldIdx, newIdx));
    }
  };

  const addCommand = (type: string) => {
    const def = getCommandDef(type);
    const newCmd: ScriptCommand = { id: uuidv4(), type, attributes: {} };
    if (def) def.attributes.forEach(a => { newCmd.attributes[a.name] = ''; });
    if (def?.isContainer) newCmd.children = [];
    onChange([...commands, newCmd]);
    setPickerOpen(false);
  };

  const updateCommand = (id: string, attrs: Record<string, string>) => {
    onChange(commands.map(c => c.id === id ? { ...c, attributes: attrs } : c));
  };

  const deleteCommand = (id: string) => {
    onChange(commands.filter(c => c.id !== id));
  };

  const duplicateCommand = (id: string) => {
    const idx = commands.findIndex(c => c.id === id);
    if (idx === -1) return;
    const src = commands[idx];
    const copy: ScriptCommand = {
      ...src,
      id: uuidv4(),
      attributes: { ...src.attributes },
      children: src.children?.map(ch => ({ ...ch, id: uuidv4(), attributes: { ...ch.attributes } })),
    };
    const next = [...commands];
    next.splice(idx + 1, 0, copy);
    onChange(next);
  };

  const addChild = (parentId: string, child: ScriptCommand) => {
    onChange(commands.map(c => c.id === parentId
      ? { ...c, children: [...(c.children ?? []), child] }
      : c
    ));
  };

  const deleteChild = (parentId: string, childId: string) => {
    onChange(commands.map(c => c.id === parentId
      ? { ...c, children: (c.children ?? []).filter(ch => ch.id !== childId) }
      : c
    ));
  };

  const updateChild = (parentId: string, childId: string, attrs: Record<string, string>) => {
    onChange(commands.map(c => c.id === parentId
      ? { ...c, children: (c.children ?? []).map(ch => ch.id === childId ? { ...ch, attributes: attrs } : ch) }
      : c
    ));
  };

  return (
    <div style={{ display: 'flex', height: '100%', minHeight: 0 }}>
      {/* Sidebar */}
      {sidebarOpen && (
        <div style={{
          width: 220, borderRight: '1px solid var(--border)', overflowY: 'auto',
          background: 'var(--bg2)', flexShrink: 0,
        }}>
          <SidePanels
            commands={commands}
            variables={variables}
            filterNames={filterNames}
            onLoadExample={cmds => onChange(cmds)}
          />
        </div>
      )}

      {/* Collapse sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          width: 14, background: 'var(--bg3)', border: 'none', borderRight: '1px solid var(--border)',
          color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', flexShrink: 0,
        }}
        title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
      >
        {sidebarOpen ? <ChevronLeft size={10} /> : <ChevronRight size={10} />}
      </button>

      {/* Main builder */}
      <div style={{ flex: 1, overflow: 'auto', padding: 12, minWidth: 0 }}>
        {commands.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            height: '100%', color: 'var(--text3)', gap: 12,
          }}>
            <p style={{ fontSize: 14 }}>Your script is empty.</p>
            <Btn variant="primary" onClick={() => setPickerOpen(true)}>
              <Plus size={14} /> Add first command
            </Btn>
            <p style={{ fontSize: 12 }}>Or load an example from the sidebar.</p>
          </div>
        ) : (
          <>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={commands.map(c => c.id)} strategy={verticalListSortingStrategy}>
                {commands.map((cmd, i) => (
                  <CommandCard
                    key={cmd.id}
                    command={cmd}
                    index={i}
                    variables={variables}
                    filterNames={filterNames}
                    onUpdate={updateCommand}
                    onDelete={deleteCommand}
                    onDuplicate={duplicateCommand}
                    onAddChild={addChild}
                    onDeleteChild={deleteChild}
                    onUpdateChild={updateChild}
                  />
                ))}
              </SortableContext>
            </DndContext>

            <div style={{ marginTop: 8 }}>
              <Btn variant="secondary" onClick={() => setPickerOpen(true)}>
                <Plus size={13} /> Add command
              </Btn>
            </div>
          </>
        )}
      </div>

      {pickerOpen && (
        <CommandPicker onSelect={addCommand} onClose={() => setPickerOpen(false)} />
      )}
    </div>
  );
};
