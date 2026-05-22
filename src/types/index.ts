export interface ScriptCommand {
  id: string;
  type: string;
  attributes: Record<string, string>;
  children?: ScriptCommand[]; // for PerformOperation
  comment?: string;
}

export interface Script {
  name: string;
  commands: ScriptCommand[];
  createdAt: string;
  version: string;
}

export type AttributeKind =
  | 'text'
  | 'enum'
  | 'boolean'
  | 'tagname'
  | 'filter-ref'
  | 'variable-ref'
  | 'number';

export interface AttributeDef {
  name: string;
  label: string;
  kind: AttributeKind;
  required: boolean;
  options?: string[]; // for enum
  placeholder?: string;
  help: string;
  mutuallyExclusiveWith?: string; // attribute name
}

export interface CommandDef {
  type: string;
  label: string;
  description: string;
  category: string;
  tier: 1 | 2 | 3;
  attributes: AttributeDef[];
  supportsFilter?: boolean; // command accepts Filter= instead of primary object attr
  isContainer?: boolean; // PerformOperation
}
