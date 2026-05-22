# Direct Access Script Builder

A browser-based tool for building [Foxboro Evo](https://www.schneider-electric.com/en/work/solutions/for-business/industrial-automation-and-control/foxboro-evo-process-automation-system/) Direct Access XML scripts — no installation required on the target system.

Engineers write scripts to bulk-configure the Galaxy database (creating hardware objects, assigning controllers, deploying strategies, updating block attributes, etc.). Hand-writing the XML is error-prone. This app provides a form-driven builder with a live XML preview that outputs valid, ready-to-run `.xml` files for use with `DirectAccess.exe` / `DirectAccess_Cmd.exe`.

## Features

- **Categorised command picker** — 100+ commands organised by category (Support, Query Filters, Assign, Create, Delete, Deploy, Rename, Attribute Update, Lock/Unlock, Timer, Import/Export, …)
- **Inline form editor** — each command expands into a typed form with field-level help, enums, filter references, and variable insertion
- **Live XML preview** — CodeMirror 6 syntax-highlighted panel that updates in real time; toggle to edit mode to tweak XML directly and sync changes back to the builder
- **Variable manager** — tracks all `SetVar` variables; insert `%VarName%` into any field
- **Filter tracker** — shows all named filters and their accumulated conditions
- **Loop container** — `PerformOperation` visually nests child commands with the `^` loop-index badge
- **Drag-to-reorder** — rearrange commands via drag handle
- **Duplicate command** — clone any command (including loop children) and insert it immediately after
- **Import XML** — paste or upload an existing `.xml` script and populate the builder
- **Save / Load project** — round-trip the builder state as `.dascript.json`
- **Download XML** — export a UTF-8 `.xml` file ready to run
- **Light / dark theme** — persisted in `localStorage`
- **Built-in examples** — one-click load for common script patterns

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
```

Output goes to `dist/` — deploy as any static site.

## Stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [CodeMirror 6](https://codemirror.net/) — XML syntax highlighting
- [@dnd-kit](https://dndkit.com/) — drag-and-drop
- [Lucide React](https://lucide.dev/) — icons

## Script Compatibility

Generated XML targets the **Foxboro Evo / ArchestrA** Direct Access scripting engine. Attribute names and command structure follow the *Scripting with Direct Access User's Guide* (document B0750BM).
