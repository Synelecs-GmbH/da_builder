import { v4 as uuidv4 } from 'uuid';
import type { ScriptCommand, Script } from '../types';
import { getCommandDef } from '../data/commands';

const INDENT = '  ';

function serializeCommand(cmd: ScriptCommand, depth = 1): string {
  const indent = INDENT.repeat(depth);
  const def = getCommandDef(cmd.type);

  // Only emit non-empty attributes
  const attrs = Object.entries(cmd.attributes)
    .filter(([, v]) => v !== '')
    .map(([k, v]) => `${k}="${escapeXml(v)}"`)
    .join(' ');

  const tag = attrs ? `${cmd.type} ${attrs}` : cmd.type;

  if (def?.isContainer && cmd.children && cmd.children.length > 0) {
    const childLines = cmd.children.map(c => serializeCommand(c, depth + 1)).join('\n');
    return `${indent}<${tag}>\n${childLines}\n${indent}</${cmd.type}>`;
  }

  return `${indent}<${tag}/>`;
}

export function serializeScript(script: Script): string {
  const lines = [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<DirectAccess>',
    ...script.commands.map(cmd => serializeCommand(cmd)),
    '</DirectAccess>',
  ];
  return lines.join('\n');
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&apos;');
}

function unescapeXml(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&apos;/g, "'");
}

export function parseXmlToCommands(xmlString: string): ScriptCommand[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'application/xml');

  const parseError = doc.querySelector('parsererror');
  if (parseError) throw new Error('XML parse error: ' + parseError.textContent);

  const root = doc.documentElement;
  if (root.tagName !== 'DirectAccess') throw new Error('Root element must be <DirectAccess>');

  return Array.from(root.children).map(el => parseElement(el));
}

function parseElement(el: Element): ScriptCommand {
  const attributes: Record<string, string> = {};
  for (const attr of Array.from(el.attributes)) {
    attributes[attr.name] = unescapeXml(attr.value);
  }

  const cmd: ScriptCommand = {
    id: uuidv4(),
    type: el.tagName,
    attributes,
  };

  if (el.children.length > 0) {
    cmd.children = Array.from(el.children).map(child => parseElement(child));
  }

  return cmd;
}

// Extract all variable names defined by SetVar commands
export function extractVariables(commands: ScriptCommand[]): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const cmd of commands) {
    if (cmd.type === 'SetVar' && cmd.attributes.Variable) {
      vars[cmd.attributes.Variable] = cmd.attributes.Value ?? '';
    }
    if (cmd.children) {
      Object.assign(vars, extractVariables(cmd.children));
    }
  }
  return vars;
}

// Extract all named filters defined by QueryFilter/BlockQueryFilter/AttributeQueryFilter
export function extractFilters(commands: ScriptCommand[]): string[] {
  const names = new Set<string>();
  for (const cmd of commands) {
    if (['QueryFilter', 'BlockQueryFilter', 'AttributeQueryFilter'].includes(cmd.type) && cmd.attributes.Filter) {
      names.add(cmd.attributes.Filter);
    }
    if (cmd.children) {
      for (const name of extractFilters(cmd.children)) names.add(name);
    }
  }
  return [...names];
}
