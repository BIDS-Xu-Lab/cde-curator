# CDE Curator — Editor Design Spec
Date: 2026-04-02

## Overview

A purely browser-based single-page application for viewing and editing NIH Common Data Element (CDE) JSON files. No backend. Files are read from and written back to local disk via the File System Access API.

## Tech Stack

| Layer | Choice |
|---|---|
| Runtime / package manager | Bun |
| Framework | Vue 3 (Composition API) + TypeScript |
| Build tool | Vite |
| UI components | PrimeVue 4 |
| Styling | TailwindCSS |
| State management | Pinia |

## Data Model

Source: `cde-sample.json`. Key fields edited by users:

```typescript
interface CdeDocument {
  _id: string
  tinyId: string
  elementType: string
  stewardOrg: { name: string }
  createdBy: { username: string }
  nihEndorsed: boolean
  archived: boolean
  registrationState: {
    registrationStatus: string
    administrativeStatus: string
  }
  designations: Array<{
    designation: string
    tags: string[]
    sources: string[]
  }>
  definitions: Array<{
    definition: string
    tags: string[]
    sources: string[]
  }>
  valueDomain: {
    datatype: string
    uom: string
    permissibleValues: Array<{ permissibleValue: string; valueMeaning: string }>
    identifiers: any[]
    ids: any[]
  }
  dataElementConcept: {
    concepts: Array<{ name: string; origin: string; originId: string }>
  }
  objectClass: { concepts: any[] }
  property: { concepts: any[] }
  sources: Array<{ sourceName: string; imported?: string; registrationStatus?: string }>
  referenceDocuments: Array<{ document: string; uri: string; source: string }>
  properties: Array<{ key: string; value: string; source: string }>
  classification: Array<{
    stewardOrg: { name: string }
    elements: any[]
  }>
  ids: any[]
  partOfBundles: string[]
}
```

## Application Layout

```
┌─────────────────────────────────────────────────────┐
│  Menu Bar                                           │
│  [📂 Select File] [📁 Load Folder] [💾 Save] [❓ Help]│
├──────────────┬──────────────────────────────────────┤
│  File List   │  CDE Editor                          │
│  (260px)     │  (flex-1, scrollable)                │
│              │                                      │
│  • file1.json│  ┌─ CDE Summary ──────────────────┐ │
│  file2.json  │  │ Name, Definition, Data Type...  │ │
│  file3.json  │  └────────────────────────────────┘ │
│              │  ┌─ Data Type Details ────────────┐ │
│              │  │ Type, Min, Max, UoM, PVs...     │ │
│              │  └────────────────────────────────┘ │
│              │  ... more collapsible panels ...    │
│              │                       [{ }] JSON    │
└──────────────┴──────────────────────────────────────┘
```

## Components

### `AppMenuBar.vue`
Top bar with four actions:
- **Select File** — opens `showOpenFilePicker()`, accepts `.json`, multi-select
- **Load Folder** — opens `showDirectoryPicker()`, scans for `.json` files
- **Save** — writes current CDE back to its file handle; disabled when no file selected or no unsaved changes
- **Help** — opens a PrimeVue `Dialog` with usage instructions

### `FileList.vue`
- PrimeVue `Listbox`, single-select
- Each item shows filename; modified files marked with `•` prefix
- Tooltip shows full file path on hover
- Clicking an item sets the active CDE in the store (prompts to save if current file has unsaved changes)

### `CdeEditor.vue`
Right column. Renders a series of collapsible PrimeVue `Panel` components, one per section. Floating `{ }` button in the bottom-right corner opens the JSON drawer.

Sections (in order, mirroring the official NIH CDE viewer):

1. **CDE Summary** — `SummarySection.vue`
   - Preferred question text (first designation tagged "Preferred Question Text")
   - Definition (first definition)
   - Data type (read-only, from valueDomain.datatype)
   - Steward org, nihEndorsed badge, archived toggle

2. **Data Type Details** — `DataTypeSection.vue`
   - Datatype selector (Number / Text / Date / etc.)
   - Min value, Max value, Precision (shown when datatype = Number)
   - Unit of Measure
   - Permissible Values table (add/remove rows: permissibleValue + valueMeaning)

3. **Other Names & Definitions** — `DesignationsSection.vue`
   - Designations array: editable table with columns (designation, tags, sources); add/remove rows
   - Definitions array: same pattern

4. **Concepts** — `ConceptsSection.vue`
   - Three sub-tables: `dataElementConcept.concepts`, `objectClass.concepts`, `property.concepts`
   - Each table has columns (name, origin, originId); add/remove rows per table

5. **Properties** — `PropertiesSection.vue`
   - properties array: key/value/source table; add/remove rows

6. **Related Documents** — `ReferenceDocsSection.vue`
   - referenceDocuments array: document text, URI, source; add/remove rows

7. **Classification** — `ClassificationSection.vue`
   - Read-only tree display of classification hierarchy

8. **Status** — `StatusSection.vue`
   - registrationState.registrationStatus (dropdown)
   - registrationState.administrativeStatus (dropdown)
   - sources list (read-only)

### `JsonDrawer.vue`
- PrimeVue `Drawer`, slides in from right, width 500px
- Displays pretty-printed JSON in a `<textarea>` (monospace)
- **Apply** button: parses textarea content, validates JSON, syncs back to store; shows inline error on parse failure
- Changes in the form are reflected live in the drawer

## State Management (Pinia — `cdeStore.ts`)

```typescript
interface FileEntry {
  name: string
  handle: FileSystemFileHandle
  cde: CdeDocument
  dirty: boolean  // unsaved changes
}

state: {
  files: FileEntry[]
  activeIndex: number | null
}

actions:
  loadFiles(handles: FileSystemFileHandle[])
  loadFolder(dirHandle: FileSystemDirectoryHandle)
  selectFile(index: number)
  updateCde(patch: Partial<CdeDocument>)
  saveActive()           // writes JSON back via handle.createWritable()
  markDirty()
```

## File System Access API Usage

- **Read**: `handle.getFile()` → `file.text()` → `JSON.parse()`
- **Write**: `handle.createWritable()` → `writable.write(JSON.stringify(cde, null, 2))` → `writable.close()`
- Browser support: Chrome/Edge (full), Firefox (partial behind flag), Safari 16+ (partial). App shows a warning banner if the API is unavailable.

## Save Behavior

- Save is triggered by the Save button in the menu bar, or `Cmd/Ctrl+S` keyboard shortcut
- Only the currently active file is saved
- After a successful save, `dirty` is set to `false` and the `•` marker is removed from the file list
- If the file handle permission has expired, the browser re-prompts for permission

## Help Dialog Content

- Brief description of the app
- How to load files / folders
- Keyboard shortcut: `Cmd/Ctrl+S` to save
- Note about browser compatibility (File System Access API)

## Out of Scope

- No backend, no network requests
- No authentication
- No "Load Design" feature
- Classification editing (read-only display only)
- History / undo-redo
