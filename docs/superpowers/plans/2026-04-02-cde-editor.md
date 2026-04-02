# CDE Curator Editor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a browser-only SPA that lets users load, edit, and save NIH CDE JSON files from local disk.

**Architecture:** Vite + Vue 3 SPA with no backend. Pinia manages loaded files and active selection. File System Access API handles disk read/write. PrimeVue provides UI components; TailwindCSS handles layout and spacing.

**Tech Stack:** Bun, Vite 5, Vue 3 (Composition API), TypeScript, Pinia, PrimeVue 4, TailwindCSS 3, Vitest, @vue/test-utils

---

## File Map

| File | Purpose |
|---|---|
| `package.json` | Dependencies and scripts |
| `vite.config.ts` | Vite + Vitest config |
| `tsconfig.json` | TypeScript config (app) |
| `tsconfig.node.json` | TypeScript config (vite config file) |
| `index.html` | Entry HTML |
| `tailwind.config.ts` | Tailwind content paths |
| `postcss.config.js` | PostCSS with Tailwind + Autoprefixer |
| `src/style.css` | Global CSS with Tailwind + PrimeVue layer ordering |
| `src/main.ts` | App bootstrap, PrimeVue + Pinia setup |
| `src/App.vue` | Root layout: menubar + two-column body + compat banner |
| `src/types/cde.ts` | TypeScript interfaces for CDE JSON |
| `src/stores/cdeStore.ts` | Pinia store: file list, active selection, load/save |
| `src/components/AppMenuBar.vue` | Top bar: Select File, Load Folder, Save, Help |
| `src/components/BrowserCompatBanner.vue` | Warning when File System Access API is absent |
| `src/components/FileList.vue` | Left column: clickable file list with dirty indicator |
| `src/components/CdeEditor.vue` | Right column: collapsible section panels + JSON button |
| `src/components/JsonDrawer.vue` | Right-side drawer with raw JSON textarea + Apply |
| `src/components/sections/SummarySection.vue` | Question text, definition, data type, steward, flags |
| `src/components/sections/DataTypeSection.vue` | Datatype select, min/max/precision, UoM, permissible values table |
| `src/components/sections/DesignationsSection.vue` | Designations + definitions editable tables |
| `src/components/sections/ConceptsSection.vue` | dataElementConcept / objectClass / property concept tables |
| `src/components/sections/PropertiesSection.vue` | Key/value/source properties table |
| `src/components/sections/ReferenceDocsSection.vue` | Reference documents table |
| `src/components/sections/ClassificationSection.vue` | Read-only classification tree |
| `src/components/sections/StatusSection.vue` | Registration status dropdowns + sources list |
| `tests/stores/cdeStore.test.ts` | Unit tests for Pinia store actions |

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `index.html`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "cde-curator",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "vue": "^3.4.21",
    "pinia": "^2.1.7",
    "primevue": "^4.0.0",
    "@primevue/themes": "^4.0.0",
    "primeicons": "^7.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.4",
    "typescript": "^5.4.0",
    "vite": "^5.2.0",
    "vue-tsc": "^2.0.0",
    "tailwindcss": "^3.4.3",
    "postcss": "^8.4.38",
    "autoprefixer": "^10.4.19",
    "vitest": "^1.4.0",
    "@vue/test-utils": "^2.4.5",
    "jsdom": "^24.0.0",
    "@pinia/testing": "^0.1.3"
  }
}
```

- [ ] **Step 2: Create `vite.config.ts`**

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 4: Create `tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 5: Create `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CDE Curator</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 6: Create `tailwind.config.ts`**

```typescript
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config
```

- [ ] **Step 7: Create `postcss.config.js`**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 8: Install dependencies**

```bash
bun install
```

Expected: `node_modules/` created, `bun.lockb` updated. No errors.

- [ ] **Step 9: Commit**

```bash
git add package.json vite.config.ts tsconfig.json tsconfig.node.json index.html tailwind.config.ts postcss.config.js bun.lockb
git commit -m "chore: scaffold Vite + Vue 3 + PrimeVue + Tailwind project"
```

---

## Task 2: TypeScript Types + Global CSS

**Files:**
- Create: `src/types/cde.ts`
- Create: `src/style.css`

- [ ] **Step 1: Create `src/types/cde.ts`**

```typescript
export interface Concept {
  name: string
  origin: string
  originId: string
}

export interface Designation {
  designation: string
  tags: string[]
  sources: string[]
}

export interface Definition {
  definition: string
  tags: string[]
  sources: string[]
}

export interface PermissibleValue {
  permissibleValue: string
  valueMeaning: string
}

export interface ValueDomain {
  datatype: string
  uom: string
  permissibleValues: PermissibleValue[]
  identifiers: unknown[]
  ids: unknown[]
}

export interface CdeSource {
  sourceName: string
  imported?: string
  registrationStatus?: string
  administrativeStatus?: string
  datatype?: string
}

export interface ReferenceDocument {
  document: string
  uri: string
  source: string
}

export interface CdeProperty {
  key: string
  value: string
  source: string
}

export interface ClassificationElement {
  name: string
  elements: ClassificationElement[]
}

export interface Classification {
  stewardOrg: { name: string }
  elements: ClassificationElement[]
}

export interface CdeDocument {
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
  designations: Designation[]
  definitions: Definition[]
  valueDomain: ValueDomain
  dataElementConcept: { concepts: Concept[] }
  objectClass: { concepts: Concept[] }
  property: { concepts: Concept[] }
  sources: CdeSource[]
  referenceDocuments: ReferenceDocument[]
  properties: CdeProperty[]
  classification: Classification[]
  ids: unknown[]
  partOfBundles: string[]
  // preserve any extra fields from the JSON
  [key: string]: unknown
}
```

- [ ] **Step 2: Create `src/style.css`** (Tailwind + PrimeVue layer ordering)

```css
@layer tailwind-base, primevue, tailwind-utilities;

@layer tailwind-base {
  @tailwind base;
}

@layer tailwind-utilities {
  @tailwind components;
  @tailwind utilities;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/types/cde.ts src/style.css
git commit -m "feat: add CDE TypeScript types and global CSS layer setup"
```

---

## Task 3: Pinia Store

**Files:**
- Create: `src/stores/cdeStore.ts`
- Create: `tests/stores/cdeStore.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/stores/cdeStore.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCdeStore } from '@/stores/cdeStore'
import type { CdeDocument } from '@/types/cde'

const minimalCde: CdeDocument = {
  _id: 'test-id',
  tinyId: 'test-tiny',
  elementType: 'cde',
  stewardOrg: { name: 'TEST' },
  createdBy: { username: 'user' },
  nihEndorsed: false,
  archived: false,
  registrationState: { registrationStatus: 'Draft', administrativeStatus: 'Not Endorsed' },
  designations: [],
  definitions: [],
  valueDomain: { datatype: 'Text', uom: '', permissibleValues: [], identifiers: [], ids: [] },
  dataElementConcept: { concepts: [] },
  objectClass: { concepts: [] },
  property: { concepts: [] },
  sources: [],
  referenceDocuments: [],
  properties: [],
  classification: [],
  ids: [],
  partOfBundles: [],
}

function mockFileHandle(name: string, cde: CdeDocument): FileSystemFileHandle {
  return {
    name,
    kind: 'file' as const,
    getFile: vi.fn().mockResolvedValue({
      text: vi.fn().mockResolvedValue(JSON.stringify(cde)),
    }),
    createWritable: vi.fn().mockResolvedValue({
      write: vi.fn().mockResolvedValue(undefined),
      close: vi.fn().mockResolvedValue(undefined),
    }),
  } as unknown as FileSystemFileHandle
}

describe('cdeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts empty with no active file', () => {
    const store = useCdeStore()
    expect(store.files).toHaveLength(0)
    expect(store.activeIndex).toBeNull()
    expect(store.activeFile).toBeNull()
  })

  it('loadFiles adds entries and auto-selects the first', async () => {
    const store = useCdeStore()
    const handle = mockFileHandle('test.json', minimalCde)
    await store.loadFiles([handle])
    expect(store.files).toHaveLength(1)
    expect(store.files[0].name).toBe('test.json')
    expect(store.files[0].dirty).toBe(false)
    expect(store.activeIndex).toBe(0)
    expect(store.activeFile?.name).toBe('test.json')
  })

  it('loadFiles appends to existing list without resetting activeIndex', async () => {
    const store = useCdeStore()
    await store.loadFiles([mockFileHandle('a.json', minimalCde)])
    await store.loadFiles([mockFileHandle('b.json', minimalCde)])
    expect(store.files).toHaveLength(2)
    expect(store.activeIndex).toBe(0) // unchanged
  })

  it('selectFile sets activeIndex', async () => {
    const store = useCdeStore()
    await store.loadFiles([
      mockFileHandle('a.json', minimalCde),
      mockFileHandle('b.json', minimalCde),
    ])
    store.selectFile(1)
    expect(store.activeIndex).toBe(1)
    expect(store.activeFile?.name).toBe('b.json')
  })

  it('updateCde merges patch into active CDE and marks dirty', async () => {
    const store = useCdeStore()
    await store.loadFiles([mockFileHandle('test.json', minimalCde)])
    store.updateCde({ archived: true })
    expect(store.files[0].cde.archived).toBe(true)
    expect(store.files[0].dirty).toBe(true)
  })

  it('updateCde does nothing when no active file', () => {
    const store = useCdeStore()
    expect(() => store.updateCde({ archived: true })).not.toThrow()
  })

  it('saveActive writes JSON to file handle and clears dirty flag', async () => {
    const store = useCdeStore()
    const handle = mockFileHandle('test.json', minimalCde)
    await store.loadFiles([handle])
    store.updateCde({ archived: true })
    expect(store.files[0].dirty).toBe(true)
    await store.saveActive()
    const writableMock = await (handle.createWritable as ReturnType<typeof vi.fn>).mock.results[0].value
    expect(writableMock.write).toHaveBeenCalledWith(
      expect.stringContaining('"archived": true')
    )
    expect(store.files[0].dirty).toBe(false)
  })

  it('saveActive does nothing when no active file', async () => {
    const store = useCdeStore()
    await expect(store.saveActive()).resolves.toBeUndefined()
  })

  it('replaceCde fully replaces the CDE and marks dirty', async () => {
    const store = useCdeStore()
    await store.loadFiles([mockFileHandle('test.json', minimalCde)])
    const replacement = { ...minimalCde, tinyId: 'replaced', archived: true }
    store.replaceCde(replacement)
    expect(store.files[0].cde.tinyId).toBe('replaced')
    expect(store.files[0].cde.archived).toBe(true)
    expect(store.files[0].dirty).toBe(true)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
bun test
```

Expected: FAIL — `Cannot find module '@/stores/cdeStore'`

- [ ] **Step 3: Create `src/stores/cdeStore.ts`**

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CdeDocument } from '@/types/cde'

export interface FileEntry {
  name: string
  handle: FileSystemFileHandle
  cde: CdeDocument
  dirty: boolean
}

export const useCdeStore = defineStore('cde', () => {
  const files = ref<FileEntry[]>([])
  const activeIndex = ref<number | null>(null)

  const activeFile = computed<FileEntry | null>(() =>
    activeIndex.value !== null ? files.value[activeIndex.value] ?? null : null
  )

  async function loadFiles(handles: FileSystemFileHandle[]) {
    for (const handle of handles) {
      const file = await handle.getFile()
      const text = await file.text()
      const cde = JSON.parse(text) as CdeDocument
      files.value.push({ name: handle.name, handle, cde, dirty: false })
    }
    if (activeIndex.value === null && files.value.length > 0) {
      activeIndex.value = 0
    }
  }

  async function loadFolder(dirHandle: FileSystemDirectoryHandle) {
    const newHandles: FileSystemFileHandle[] = []
    for await (const entry of dirHandle.values()) {
      if (entry.kind === 'file' && entry.name.endsWith('.json')) {
        newHandles.push(entry as FileSystemFileHandle)
      }
    }
    await loadFiles(newHandles)
  }

  function selectFile(index: number) {
    activeIndex.value = index
  }

  function updateCde(patch: Partial<CdeDocument>) {
    if (activeIndex.value === null) return
    const entry = files.value[activeIndex.value]
    entry.cde = { ...entry.cde, ...patch }
    entry.dirty = true
  }

  // Full replacement — used by JsonDrawer to avoid shallow-merge leaving deleted fields behind
  function replaceCde(newCde: CdeDocument) {
    if (activeIndex.value === null) return
    const entry = files.value[activeIndex.value]
    entry.cde = newCde
    entry.dirty = true
  }

  async function saveActive() {
    if (activeIndex.value === null) return
    const entry = files.value[activeIndex.value]
    const writable = await entry.handle.createWritable()
    await writable.write(JSON.stringify(entry.cde, null, 2))
    await writable.close()
    entry.dirty = false
  }

  return {
    files,
    activeIndex,
    activeFile,
    loadFiles,
    loadFolder,
    selectFile,
    updateCde,
    replaceCde,
    saveActive,
  }
})
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
bun test
```

Expected: All 8 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/stores/cdeStore.ts tests/stores/cdeStore.test.ts
git commit -m "feat: add Pinia cdeStore with file load/save actions"
```

---

## Task 4: App Shell (`main.ts` + `App.vue`)

**Files:**
- Create: `src/main.ts`
- Create: `src/App.vue`
- Create: `src/components/BrowserCompatBanner.vue`

- [ ] **Step 1: Create `src/main.ts`**

```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import Tooltip from 'primevue/tooltip'
import './style.css'
import 'primeicons/primeicons.css'
import App from './App.vue'

const app = createApp(App)

app.use(createPinia())

app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      cssLayer: {
        name: 'primevue',
        order: 'tailwind-base, primevue, tailwind-utilities',
      },
    },
  },
})

app.directive('tooltip', Tooltip)

app.mount('#app')
```

- [ ] **Step 2: Create `src/components/BrowserCompatBanner.vue`**

```vue
<template>
  <div class="bg-amber-50 border-b border-amber-200 px-4 py-2 text-sm text-amber-800 flex items-center gap-2">
    <i class="pi pi-exclamation-triangle" />
    <span>
      Your browser does not fully support the File System Access API. Use Chrome or Edge 86+ for full
      read/write support.
    </span>
  </div>
</template>
```

- [ ] **Step 3: Create `src/App.vue`**

```vue
<template>
  <div class="h-screen flex flex-col overflow-hidden bg-gray-50">
    <AppMenuBar />
    <BrowserCompatBanner v-if="!fsApiSupported" />
    <div class="flex flex-1 overflow-hidden">
      <aside class="w-64 shrink-0 border-r border-gray-200 bg-white overflow-y-auto">
        <FileList />
      </aside>
      <main class="flex-1 overflow-y-auto">
        <CdeEditor v-if="store.activeFile" />
        <div v-else class="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
          <i class="pi pi-folder-open text-4xl" />
          <p class="text-sm">Use <strong>Select File</strong> or <strong>Load Folder</strong> to get started.</p>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useCdeStore } from '@/stores/cdeStore'
import AppMenuBar from '@/components/AppMenuBar.vue'
import BrowserCompatBanner from '@/components/BrowserCompatBanner.vue'
import FileList from '@/components/FileList.vue'
import CdeEditor from '@/components/CdeEditor.vue'

const store = useCdeStore()
const fsApiSupported = computed(() => 'showOpenFilePicker' in window)

function onKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 's') {
    e.preventDefault()
    if (store.activeFile?.dirty) store.saveActive()
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>
```

- [ ] **Step 4: Verify the app builds (stub components will be missing — that's expected for now)**

```bash
bun run dev
```

Expected: Vite starts. Browser will show errors about missing components — that's OK for now.

- [ ] **Step 5: Commit**

```bash
git add src/main.ts src/App.vue src/components/BrowserCompatBanner.vue
git commit -m "feat: add app shell with two-column layout and Cmd+S shortcut"
```

---

## Task 5: AppMenuBar

**Files:**
- Create: `src/components/AppMenuBar.vue`

- [ ] **Step 1: Create `src/components/AppMenuBar.vue`**

```vue
<template>
  <header class="flex items-center gap-2 px-4 py-2 bg-white border-b border-gray-200 shadow-sm shrink-0">
    <span class="text-base font-semibold text-gray-800 mr-2">CDE Curator</span>

    <Button
      icon="pi pi-file"
      label="Select File"
      size="small"
      outlined
      @click="onSelectFile"
    />
    <Button
      icon="pi pi-folder-open"
      label="Load Folder"
      size="small"
      outlined
      @click="onLoadFolder"
    />

    <div class="flex-1" />

    <Button
      icon="pi pi-save"
      label="Save"
      size="small"
      :disabled="!store.activeFile?.dirty"
      @click="store.saveActive()"
    />
    <Button
      icon="pi pi-question-circle"
      label="Help"
      size="small"
      text
      @click="helpVisible = true"
    />

    <Dialog
      v-model:visible="helpVisible"
      header="CDE Curator — Help"
      modal
      :style="{ width: '480px' }"
    >
      <div class="space-y-3 text-sm text-gray-700 leading-relaxed">
        <p>
          <strong>CDE Curator</strong> is a local editor for NIH Common Data Element JSON files.
          Nothing is sent to any server — all data stays on your machine.
        </p>
        <ul class="list-disc ml-5 space-y-1">
          <li>
            <strong>Select File</strong> — open one or more <code>.json</code> CDE files.
          </li>
          <li>
            <strong>Load Folder</strong> — load all <code>.json</code> files from a directory.
          </li>
          <li>
            <strong>Save</strong> — write the currently selected file back to disk.<br />
            Keyboard shortcut: <kbd class="bg-gray-100 border border-gray-300 rounded px-1">⌘S</kbd>
            / <kbd class="bg-gray-100 border border-gray-300 rounded px-1">Ctrl+S</kbd>
          </li>
          <li>Files with unsaved changes are marked with <strong class="text-orange-500">•</strong> in the file list.</li>
          <li>Click <strong>{ }</strong> in the editor to view/edit the raw JSON.</li>
        </ul>
        <p class="text-gray-400 text-xs">
          Requires Chrome / Edge 86+ or Safari 15.2+ (File System Access API).
        </p>
      </div>
    </Dialog>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import { useCdeStore } from '@/stores/cdeStore'

const store = useCdeStore()
const helpVisible = ref(false)

async function onSelectFile() {
  try {
    const handles = await window.showOpenFilePicker({
      multiple: true,
      types: [{ description: 'JSON files', accept: { 'application/json': ['.json'] } }],
    })
    await store.loadFiles(handles)
  } catch {
    // user cancelled the picker — no action needed
  }
}

async function onLoadFolder() {
  try {
    const dirHandle = await window.showDirectoryPicker()
    await store.loadFolder(dirHandle)
  } catch {
    // user cancelled
  }
}
</script>
```

- [ ] **Step 2: Verify in browser** — run `bun run dev`, open browser. Menu bar should render with four buttons. Help dialog should open on click.

- [ ] **Step 3: Commit**

```bash
git add src/components/AppMenuBar.vue
git commit -m "feat: add AppMenuBar with file/folder picker and help dialog"
```

---

## Task 6: FileList

**Files:**
- Create: `src/components/FileList.vue`

- [ ] **Step 1: Create `src/components/FileList.vue`**

```vue
<template>
  <div class="p-2">
    <p class="text-xs text-gray-400 px-2 py-1 mb-1">
      {{ store.files.length }} file{{ store.files.length !== 1 ? 's' : '' }} loaded
    </p>
    <ul class="space-y-0.5">
      <li
        v-for="(entry, i) in store.files"
        :key="i"
        v-tooltip.right="entry.name"
        :class="[
          'flex items-center gap-1.5 px-2 py-1.5 rounded cursor-pointer text-sm select-none',
          store.activeIndex === i
            ? 'bg-blue-50 text-blue-700 font-medium'
            : 'text-gray-700 hover:bg-gray-100',
        ]"
        @click="store.selectFile(i)"
      >
        <span
          v-if="entry.dirty"
          class="text-orange-500 shrink-0 leading-none"
          title="Unsaved changes"
        >•</span>
        <span class="truncate">{{ entry.name }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useCdeStore } from '@/stores/cdeStore'

const store = useCdeStore()
</script>
```

- [ ] **Step 2: Verify in browser** — load a JSON file. It should appear in the file list. Clicking it should highlight it.

- [ ] **Step 3: Commit**

```bash
git add src/components/FileList.vue
git commit -m "feat: add FileList with selection and dirty indicator"
```

---

## Task 7: CdeEditor Shell + SummarySection

**Files:**
- Create: `src/components/CdeEditor.vue`
- Create: `src/components/sections/SummarySection.vue`

- [ ] **Step 1: Create `src/components/CdeEditor.vue`**

```vue
<template>
  <div class="relative p-4 space-y-3 max-w-4xl mx-auto">
    <!-- Title -->
    <h2 class="text-xl font-semibold text-gray-800">
      {{ preferredName }}
    </h2>

    <Panel header="CDE Summary" toggleable>
      <SummarySection />
    </Panel>

    <Panel header="Data Type Details" toggleable>
      <DataTypeSection />
    </Panel>

    <Panel header="Other Names & Definitions" toggleable :collapsed="true">
      <DesignationsSection />
    </Panel>

    <Panel header="Concepts" toggleable :collapsed="true">
      <ConceptsSection />
    </Panel>

    <Panel header="Properties" toggleable :collapsed="true">
      <PropertiesSection />
    </Panel>

    <Panel header="Related Documents" toggleable :collapsed="true">
      <ReferenceDocsSection />
    </Panel>

    <Panel header="Classification" toggleable :collapsed="true">
      <ClassificationSection />
    </Panel>

    <Panel header="Status" toggleable :collapsed="true">
      <StatusSection />
    </Panel>

    <!-- Floating JSON button -->
    <div class="fixed bottom-6 right-6 z-10">
      <Button
        v-tooltip.left="'View / Edit Raw JSON'"
        icon="pi pi-code"
        rounded
        raised
        @click="jsonDrawerVisible = true"
      />
    </div>

    <JsonDrawer v-model:visible="jsonDrawerVisible" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Panel from 'primevue/panel'
import Button from 'primevue/button'
import { useCdeStore } from '@/stores/cdeStore'
import SummarySection from '@/components/sections/SummarySection.vue'
import DataTypeSection from '@/components/sections/DataTypeSection.vue'
import DesignationsSection from '@/components/sections/DesignationsSection.vue'
import ConceptsSection from '@/components/sections/ConceptsSection.vue'
import PropertiesSection from '@/components/sections/PropertiesSection.vue'
import ReferenceDocsSection from '@/components/sections/ReferenceDocsSection.vue'
import ClassificationSection from '@/components/sections/ClassificationSection.vue'
import StatusSection from '@/components/sections/StatusSection.vue'
import JsonDrawer from '@/components/JsonDrawer.vue'

const store = useCdeStore()
const jsonDrawerVisible = ref(false)

const preferredName = computed(() => {
  const cde = store.activeFile?.cde
  if (!cde) return ''
  const preferred = cde.designations.find(d => d.tags.includes('Preferred Question Text'))
  return preferred?.designation ?? cde.designations[0]?.designation ?? cde.tinyId
})
</script>
```

- [ ] **Step 2: Create `src/components/sections/SummarySection.vue`**

```vue
<template>
  <div class="grid grid-cols-[160px_1fr] gap-x-4 gap-y-3 items-start text-sm">
    <!-- Question Text (preferred designation) -->
    <label class="text-gray-500 font-medium pt-1">Question Text</label>
    <InputText
      :value="preferredDesignation"
      class="w-full"
      placeholder="Preferred question text"
      @input="onPreferredDesignationInput"
    />

    <!-- Definition -->
    <label class="text-gray-500 font-medium pt-1">Definition</label>
    <Textarea
      :value="firstDefinition"
      rows="3"
      class="w-full"
      placeholder="Primary definition"
      @input="onDefinitionInput"
    />

    <!-- Data Type (read-only summary) -->
    <label class="text-gray-500 font-medium pt-1">Data Type</label>
    <span class="pt-1 text-gray-700">{{ cde.valueDomain.datatype || '—' }}</span>

    <!-- Steward -->
    <label class="text-gray-500 font-medium pt-1">Steward</label>
    <InputText
      :value="cde.stewardOrg.name"
      class="w-full"
      placeholder="Steward organization"
      @input="(e) => updateSteward((e.target as HTMLInputElement).value)"
    />

    <!-- Flags -->
    <label class="text-gray-500 font-medium pt-1">NIH Endorsed</label>
    <div class="pt-1">
      <ToggleSwitch
        :model-value="cde.nihEndorsed"
        @update:model-value="(v) => store.updateCde({ nihEndorsed: v })"
      />
    </div>

    <label class="text-gray-500 font-medium pt-1">Archived</label>
    <div class="pt-1">
      <ToggleSwitch
        :model-value="cde.archived"
        @update:model-value="(v) => store.updateCde({ archived: v })"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import ToggleSwitch from 'primevue/toggleswitch'
import { useCdeStore } from '@/stores/cdeStore'

const store = useCdeStore()
const cde = computed(() => store.activeFile!.cde)

const preferredDesignation = computed(() => {
  const d = cde.value.designations.find(d => d.tags.includes('Preferred Question Text'))
  return d?.designation ?? ''
})

const firstDefinition = computed(() => cde.value.definitions[0]?.definition ?? '')

function onPreferredDesignationInput(e: Event) {
  const val = (e.target as HTMLInputElement).value
  const updated = cde.value.designations.map(d =>
    d.tags.includes('Preferred Question Text') ? { ...d, designation: val } : d
  )
  store.updateCde({ designations: updated })
}

function onDefinitionInput(e: Event) {
  const val = (e.target as HTMLTextAreaElement).value
  const defs = [...cde.value.definitions]
  if (defs.length === 0) {
    defs.push({ definition: val, tags: [], sources: [] })
  } else {
    defs[0] = { ...defs[0], definition: val }
  }
  store.updateCde({ definitions: defs })
}

function updateSteward(name: string) {
  store.updateCde({ stewardOrg: { name } })
}
</script>
```

- [ ] **Step 3: Verify in browser** — load a CDE file. The editor should render with the Summary panel showing question text, definition, steward, and toggle switches. Editing should mark the file dirty (• appears in file list).

- [ ] **Step 4: Commit**

```bash
git add src/components/CdeEditor.vue src/components/sections/SummarySection.vue
git commit -m "feat: add CdeEditor shell and SummarySection"
```

---

## Task 8: DataTypeSection

**Files:**
- Create: `src/components/sections/DataTypeSection.vue`

- [ ] **Step 1: Create `src/components/sections/DataTypeSection.vue`**

```vue
<template>
  <div class="space-y-4 text-sm">
    <div class="grid grid-cols-[160px_1fr] gap-x-4 gap-y-3 items-start">
      <!-- Data Type selector -->
      <label class="text-gray-500 font-medium pt-1">Data Type</label>
      <Select
        :model-value="cde.valueDomain.datatype"
        :options="datatypeOptions"
        class="w-full"
        placeholder="Select type"
        @update:model-value="(v) => updateValueDomain({ datatype: v })"
      />

      <!-- Number-specific fields -->
      <template v-if="cde.valueDomain.datatype === 'Number'">
        <label class="text-gray-500 font-medium pt-1">Min Value</label>
        <InputText
          :value="(cde.valueDomain as any).minValue ?? ''"
          class="w-full"
          placeholder="Minimum"
          @input="(e) => updateValueDomain({ minValue: (e.target as HTMLInputElement).value })"
        />

        <label class="text-gray-500 font-medium pt-1">Max Value</label>
        <InputText
          :value="(cde.valueDomain as any).maxValue ?? ''"
          class="w-full"
          placeholder="Maximum"
          @input="(e) => updateValueDomain({ maxValue: (e.target as HTMLInputElement).value })"
        />

        <label class="text-gray-500 font-medium pt-1">Precision</label>
        <InputText
          :value="(cde.valueDomain as any).precision ?? ''"
          class="w-full"
          placeholder="Decimal precision"
          @input="(e) => updateValueDomain({ precision: (e.target as HTMLInputElement).value })"
        />
      </template>

      <!-- Unit of Measure -->
      <label class="text-gray-500 font-medium pt-1">Unit of Measure</label>
      <InputText
        :value="cde.valueDomain.uom"
        class="w-full"
        placeholder="e.g. years, mg/dL"
        @input="(e) => updateValueDomain({ uom: (e.target as HTMLInputElement).value })"
      />
    </div>

    <!-- Permissible Values table -->
    <div>
      <div class="flex items-center justify-between mb-2">
        <span class="font-medium text-gray-700">Permissible Values</span>
        <Button icon="pi pi-plus" label="Add" size="small" text @click="addPV" />
      </div>

      <div v-if="cde.valueDomain.permissibleValues.length === 0" class="text-gray-400 text-xs py-2">
        No permissible values defined.
      </div>

      <table v-else class="w-full text-sm border-collapse">
        <thead>
          <tr class="border-b border-gray-200 text-gray-500">
            <th class="text-left py-1.5 pr-3 font-medium w-1/2">Value</th>
            <th class="text-left py-1.5 pr-3 font-medium w-1/2">Meaning</th>
            <th class="w-8" />
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(pv, i) in cde.valueDomain.permissibleValues"
            :key="i"
            class="border-b border-gray-100"
          >
            <td class="py-1 pr-2">
              <InputText
                :value="pv.permissibleValue"
                class="w-full"
                @input="(e) => updatePV(i, 'permissibleValue', (e.target as HTMLInputElement).value)"
              />
            </td>
            <td class="py-1 pr-2">
              <InputText
                :value="pv.valueMeaning"
                class="w-full"
                @input="(e) => updatePV(i, 'valueMeaning', (e.target as HTMLInputElement).value)"
              />
            </td>
            <td class="py-1">
              <Button icon="pi pi-trash" text severity="danger" size="small" @click="removePV(i)" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import { useCdeStore } from '@/stores/cdeStore'
import type { PermissibleValue, ValueDomain } from '@/types/cde'

const store = useCdeStore()
const cde = computed(() => store.activeFile!.cde)

const datatypeOptions = ['Text', 'Number', 'Date', 'Time', 'Externally Defined', 'Value List', 'File']

function updateValueDomain(patch: Partial<ValueDomain> & Record<string, unknown>) {
  store.updateCde({ valueDomain: { ...cde.value.valueDomain, ...patch } })
}

function addPV() {
  const pvs = [...cde.value.valueDomain.permissibleValues, { permissibleValue: '', valueMeaning: '' }]
  updateValueDomain({ permissibleValues: pvs })
}

function removePV(index: number) {
  const pvs = cde.value.valueDomain.permissibleValues.filter((_, i) => i !== index)
  updateValueDomain({ permissibleValues: pvs })
}

function updatePV(index: number, field: keyof PermissibleValue, value: string) {
  const pvs = cde.value.valueDomain.permissibleValues.map((pv, i) =>
    i === index ? { ...pv, [field]: value } : pv
  )
  updateValueDomain({ permissibleValues: pvs })
}
</script>
```

- [ ] **Step 2: Verify in browser** — open the Data Type Details panel. Selecting "Number" should reveal Min/Max/Precision fields. Add/remove permissible value rows should work.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/DataTypeSection.vue
git commit -m "feat: add DataTypeSection with PV table and number fields"
```

---

## Task 9: DesignationsSection

**Files:**
- Create: `src/components/sections/DesignationsSection.vue`

- [ ] **Step 1: Create `src/components/sections/DesignationsSection.vue`**

```vue
<template>
  <div class="space-y-6 text-sm">
    <!-- Designations -->
    <div>
      <div class="flex items-center justify-between mb-2">
        <span class="font-medium text-gray-700">Names (Designations)</span>
        <Button icon="pi pi-plus" label="Add" size="small" text @click="addDesignation" />
      </div>
      <div v-if="cde.designations.length === 0" class="text-gray-400 text-xs py-2">No designations.</div>
      <table v-else class="w-full text-sm border-collapse">
        <thead>
          <tr class="border-b border-gray-200 text-gray-500">
            <th class="text-left py-1.5 pr-3 font-medium w-1/2">Name</th>
            <th class="text-left py-1.5 pr-3 font-medium w-1/4">Tags</th>
            <th class="text-left py-1.5 pr-3 font-medium w-1/4">Sources</th>
            <th class="w-8" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="(d, i) in cde.designations" :key="i" class="border-b border-gray-100">
            <td class="py-1 pr-2">
              <InputText
                :value="d.designation"
                class="w-full"
                @input="(e) => updateDesignation(i, 'designation', (e.target as HTMLInputElement).value)"
              />
            </td>
            <td class="py-1 pr-2">
              <InputText
                :value="d.tags.join(', ')"
                class="w-full"
                placeholder="comma separated"
                @change="(e) => updateDesignationArray(i, 'tags', (e.target as HTMLInputElement).value)"
              />
            </td>
            <td class="py-1 pr-2">
              <InputText
                :value="d.sources.join(', ')"
                class="w-full"
                placeholder="comma separated"
                @change="(e) => updateDesignationArray(i, 'sources', (e.target as HTMLInputElement).value)"
              />
            </td>
            <td class="py-1">
              <Button icon="pi pi-trash" text severity="danger" size="small" @click="removeDesignation(i)" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Definitions -->
    <div>
      <div class="flex items-center justify-between mb-2">
        <span class="font-medium text-gray-700">Definitions</span>
        <Button icon="pi pi-plus" label="Add" size="small" text @click="addDefinition" />
      </div>
      <div v-if="cde.definitions.length === 0" class="text-gray-400 text-xs py-2">No definitions.</div>
      <table v-else class="w-full text-sm border-collapse">
        <thead>
          <tr class="border-b border-gray-200 text-gray-500">
            <th class="text-left py-1.5 pr-3 font-medium w-1/2">Definition</th>
            <th class="text-left py-1.5 pr-3 font-medium w-1/4">Tags</th>
            <th class="text-left py-1.5 pr-3 font-medium w-1/4">Sources</th>
            <th class="w-8" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="(d, i) in cde.definitions" :key="i" class="border-b border-gray-100">
            <td class="py-1 pr-2">
              <Textarea
                :value="d.definition"
                class="w-full"
                rows="2"
                @input="(e) => updateDefinition(i, 'definition', (e.target as HTMLTextAreaElement).value)"
              />
            </td>
            <td class="py-1 pr-2">
              <InputText
                :value="d.tags.join(', ')"
                class="w-full"
                placeholder="comma separated"
                @change="(e) => updateDefinitionArray(i, 'tags', (e.target as HTMLInputElement).value)"
              />
            </td>
            <td class="py-1 pr-2">
              <InputText
                :value="d.sources.join(', ')"
                class="w-full"
                placeholder="comma separated"
                @change="(e) => updateDefinitionArray(i, 'sources', (e.target as HTMLInputElement).value)"
              />
            </td>
            <td class="py-1">
              <Button icon="pi pi-trash" text severity="danger" size="small" @click="removeDefinition(i)" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import { useCdeStore } from '@/stores/cdeStore'
import type { Designation, Definition } from '@/types/cde'

const store = useCdeStore()
const cde = computed(() => store.activeFile!.cde)

// Designations
function addDesignation() {
  store.updateCde({ designations: [...cde.value.designations, { designation: '', tags: [], sources: [] }] })
}
function removeDesignation(i: number) {
  store.updateCde({ designations: cde.value.designations.filter((_, idx) => idx !== i) })
}
function updateDesignation(i: number, field: keyof Designation, value: string) {
  const updated = cde.value.designations.map((d, idx) => idx === i ? { ...d, [field]: value } : d)
  store.updateCde({ designations: updated })
}
function updateDesignationArray(i: number, field: 'tags' | 'sources', raw: string) {
  const arr = raw.split(',').map(s => s.trim()).filter(Boolean)
  const updated = cde.value.designations.map((d, idx) => idx === i ? { ...d, [field]: arr } : d)
  store.updateCde({ designations: updated })
}

// Definitions
function addDefinition() {
  store.updateCde({ definitions: [...cde.value.definitions, { definition: '', tags: [], sources: [] }] })
}
function removeDefinition(i: number) {
  store.updateCde({ definitions: cde.value.definitions.filter((_, idx) => idx !== i) })
}
function updateDefinition(i: number, field: keyof Definition, value: string) {
  const updated = cde.value.definitions.map((d, idx) => idx === i ? { ...d, [field]: value } : d)
  store.updateCde({ definitions: updated })
}
function updateDefinitionArray(i: number, field: 'tags' | 'sources', raw: string) {
  const arr = raw.split(',').map(s => s.trim()).filter(Boolean)
  const updated = cde.value.definitions.map((d, idx) => idx === i ? { ...d, [field]: arr } : d)
  store.updateCde({ definitions: updated })
}
</script>
```

- [ ] **Step 2: Verify in browser** — expand "Other Names & Definitions". Tables should show existing designations/definitions. Tags and sources use comma-separated editing (changes apply on blur/Enter).

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/DesignationsSection.vue
git commit -m "feat: add DesignationsSection with editable names and definitions"
```

---

## Task 10: ConceptsSection

**Files:**
- Create: `src/components/sections/ConceptsSection.vue`

- [ ] **Step 1: Create `src/components/sections/ConceptsSection.vue`**

```vue
<template>
  <div class="space-y-6 text-sm">
    <ConceptTable
      title="Data Element Concept"
      :concepts="cde.dataElementConcept.concepts"
      @update="(v) => store.updateCde({ dataElementConcept: { concepts: v } })"
    />
    <ConceptTable
      title="Object Class"
      :concepts="cde.objectClass.concepts"
      @update="(v) => store.updateCde({ objectClass: { concepts: v } })"
    />
    <ConceptTable
      title="Property"
      :concepts="cde.property.concepts"
      @update="(v) => store.updateCde({ property: { concepts: v } })"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import { useCdeStore } from '@/stores/cdeStore'
import type { Concept } from '@/types/cde'

const store = useCdeStore()
const cde = computed(() => store.activeFile!.cde)

// Inline sub-component to avoid file proliferation
const ConceptTable = defineComponent({
  props: {
    title: String,
    concepts: { type: Array as () => Concept[], default: () => [] },
  },
  emits: ['update'],
  setup(props, { emit }) {
    function add() {
      emit('update', [...props.concepts, { name: '', origin: '', originId: '' }])
    }
    function remove(i: number) {
      emit('update', props.concepts.filter((_, idx) => idx !== i))
    }
    function update(i: number, field: keyof Concept, value: string) {
      emit('update', props.concepts.map((c, idx) => idx === i ? { ...c, [field]: value } : c))
    }

    return () =>
      h('div', [
        h('div', { class: 'flex items-center justify-between mb-2' }, [
          h('span', { class: 'font-medium text-gray-700' }, props.title),
          h(Button, { icon: 'pi pi-plus', label: 'Add', size: 'small', text: true, onClick: add }),
        ]),
        props.concepts.length === 0
          ? h('p', { class: 'text-gray-400 text-xs py-2' }, 'No concepts.')
          : h('table', { class: 'w-full text-sm border-collapse' }, [
              h('thead', [
                h('tr', { class: 'border-b border-gray-200 text-gray-500' }, [
                  h('th', { class: 'text-left py-1.5 pr-3 font-medium w-2/5' }, 'Name'),
                  h('th', { class: 'text-left py-1.5 pr-3 font-medium w-1/5' }, 'Origin'),
                  h('th', { class: 'text-left py-1.5 pr-3 font-medium w-1/4' }, 'Origin ID'),
                  h('th', { class: 'w-8' }),
                ]),
              ]),
              h('tbody',
                props.concepts.map((c, i) =>
                  h('tr', { key: i, class: 'border-b border-gray-100' }, [
                    h('td', { class: 'py-1 pr-2' },
                      h(InputText, {
                        value: c.name, class: 'w-full',
                        onInput: (e: Event) => update(i, 'name', (e.target as HTMLInputElement).value),
                      })
                    ),
                    h('td', { class: 'py-1 pr-2' },
                      h(InputText, {
                        value: c.origin, class: 'w-full',
                        onInput: (e: Event) => update(i, 'origin', (e.target as HTMLInputElement).value),
                      })
                    ),
                    h('td', { class: 'py-1 pr-2' },
                      h(InputText, {
                        value: c.originId, class: 'w-full',
                        onInput: (e: Event) => update(i, 'originId', (e.target as HTMLInputElement).value),
                      })
                    ),
                    h('td', { class: 'py-1' },
                      h(Button, { icon: 'pi pi-trash', text: true, severity: 'danger', size: 'small', onClick: () => remove(i) })
                    ),
                  ])
                )
              ),
            ]),
      ])
  },
})
</script>
```

- [ ] **Step 2: Verify in browser** — expand Concepts. Three sub-tables (Data Element Concept, Object Class, Property) should show and be editable.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/ConceptsSection.vue
git commit -m "feat: add ConceptsSection with three concept tables"
```

---

## Task 11: PropertiesSection + ReferenceDocsSection

**Files:**
- Create: `src/components/sections/PropertiesSection.vue`
- Create: `src/components/sections/ReferenceDocsSection.vue`

- [ ] **Step 1: Create `src/components/sections/PropertiesSection.vue`**

```vue
<template>
  <div class="text-sm">
    <div class="flex items-center justify-between mb-2">
      <span class="font-medium text-gray-700">Properties</span>
      <Button icon="pi pi-plus" label="Add" size="small" text @click="add" />
    </div>
    <div v-if="cde.properties.length === 0" class="text-gray-400 text-xs py-2">No properties.</div>
    <table v-else class="w-full border-collapse">
      <thead>
        <tr class="border-b border-gray-200 text-gray-500">
          <th class="text-left py-1.5 pr-3 font-medium w-1/3">Key</th>
          <th class="text-left py-1.5 pr-3 font-medium w-1/3">Value</th>
          <th class="text-left py-1.5 pr-3 font-medium w-1/4">Source</th>
          <th class="w-8" />
        </tr>
      </thead>
      <tbody>
        <tr v-for="(p, i) in cde.properties" :key="i" class="border-b border-gray-100">
          <td class="py-1 pr-2">
            <InputText :value="p.key" class="w-full"
              @input="(e) => update(i, 'key', (e.target as HTMLInputElement).value)" />
          </td>
          <td class="py-1 pr-2">
            <InputText :value="p.value" class="w-full"
              @input="(e) => update(i, 'value', (e.target as HTMLInputElement).value)" />
          </td>
          <td class="py-1 pr-2">
            <InputText :value="p.source" class="w-full"
              @input="(e) => update(i, 'source', (e.target as HTMLInputElement).value)" />
          </td>
          <td class="py-1">
            <Button icon="pi pi-trash" text severity="danger" size="small" @click="remove(i)" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import { useCdeStore } from '@/stores/cdeStore'
import type { CdeProperty } from '@/types/cde'

const store = useCdeStore()
const cde = computed(() => store.activeFile!.cde)

function add() {
  store.updateCde({ properties: [...cde.value.properties, { key: '', value: '', source: '' }] })
}
function remove(i: number) {
  store.updateCde({ properties: cde.value.properties.filter((_, idx) => idx !== i) })
}
function update(i: number, field: keyof CdeProperty, value: string) {
  const updated = cde.value.properties.map((p, idx) => idx === i ? { ...p, [field]: value } : p)
  store.updateCde({ properties: updated })
}
</script>
```

- [ ] **Step 2: Create `src/components/sections/ReferenceDocsSection.vue`**

```vue
<template>
  <div class="text-sm">
    <div class="flex items-center justify-between mb-2">
      <span class="font-medium text-gray-700">Reference Documents</span>
      <Button icon="pi pi-plus" label="Add" size="small" text @click="add" />
    </div>
    <div v-if="cde.referenceDocuments.length === 0" class="text-gray-400 text-xs py-2">
      No reference documents.
    </div>
    <div v-else class="space-y-3">
      <div
        v-for="(doc, i) in cde.referenceDocuments"
        :key="i"
        class="border border-gray-200 rounded p-3 space-y-2"
      >
        <div class="flex items-center justify-between">
          <span class="text-gray-500 text-xs">Document {{ i + 1 }}</span>
          <Button icon="pi pi-trash" text severity="danger" size="small" @click="remove(i)" />
        </div>
        <div class="grid grid-cols-[80px_1fr] gap-2 items-start">
          <label class="text-gray-500 pt-1">Text</label>
          <Textarea :value="doc.document" rows="2" class="w-full"
            @input="(e) => update(i, 'document', (e.target as HTMLTextAreaElement).value)" />
          <label class="text-gray-500 pt-1">URI</label>
          <InputText :value="doc.uri" class="w-full" placeholder="https://..."
            @input="(e) => update(i, 'uri', (e.target as HTMLInputElement).value)" />
          <label class="text-gray-500 pt-1">Source</label>
          <InputText :value="doc.source" class="w-full"
            @input="(e) => update(i, 'source', (e.target as HTMLInputElement).value)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import { useCdeStore } from '@/stores/cdeStore'
import type { ReferenceDocument } from '@/types/cde'

const store = useCdeStore()
const cde = computed(() => store.activeFile!.cde)

function add() {
  store.updateCde({ referenceDocuments: [...cde.value.referenceDocuments, { document: '', uri: '', source: '' }] })
}
function remove(i: number) {
  store.updateCde({ referenceDocuments: cde.value.referenceDocuments.filter((_, idx) => idx !== i) })
}
function update(i: number, field: keyof ReferenceDocument, value: string) {
  const updated = cde.value.referenceDocuments.map((d, idx) => idx === i ? { ...d, [field]: value } : d)
  store.updateCde({ referenceDocuments: updated })
}
</script>
```

- [ ] **Step 3: Verify in browser** — both panels should show editable tables with add/remove rows.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/PropertiesSection.vue src/components/sections/ReferenceDocsSection.vue
git commit -m "feat: add PropertiesSection and ReferenceDocsSection"
```

---

## Task 12: ClassificationSection + StatusSection

**Files:**
- Create: `src/components/sections/ClassificationSection.vue`
- Create: `src/components/sections/StatusSection.vue`

- [ ] **Step 1: Create `src/components/sections/ClassificationSection.vue`**

```vue
<template>
  <div class="text-sm">
    <div v-if="cde.classification.length === 0" class="text-gray-400 text-xs py-2">
      No classification data.
    </div>
    <div v-else class="space-y-3">
      <div v-for="(cls, i) in cde.classification" :key="i" class="border border-gray-200 rounded p-3">
        <p class="font-medium text-gray-700 mb-2">{{ cls.stewardOrg.name }}</p>
        <Tree :value="toTreeNodes(cls.elements)" class="text-sm" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Tree from 'primevue/tree'
import { useCdeStore } from '@/stores/cdeStore'
import type { ClassificationElement } from '@/types/cde'

const store = useCdeStore()
const cde = computed(() => store.activeFile!.cde)

interface TreeNode {
  key: string
  label: string
  children?: TreeNode[]
}

function toTreeNodes(elements: ClassificationElement[], prefix = ''): TreeNode[] {
  return elements.map((el, i) => ({
    key: `${prefix}${i}`,
    label: el.name,
    children: el.elements.length > 0 ? toTreeNodes(el.elements, `${prefix}${i}-`) : undefined,
  }))
}
</script>
```

- [ ] **Step 2: Create `src/components/sections/StatusSection.vue`**

```vue
<template>
  <div class="space-y-4 text-sm">
    <div class="grid grid-cols-[200px_1fr] gap-x-4 gap-y-3 items-start">
      <label class="text-gray-500 font-medium pt-1">Registration Status</label>
      <Select
        :model-value="cde.registrationState.registrationStatus"
        :options="registrationStatusOptions"
        class="w-full"
        @update:model-value="(v) => updateState({ registrationStatus: v })"
      />

      <label class="text-gray-500 font-medium pt-1">Administrative Status</label>
      <Select
        :model-value="cde.registrationState.administrativeStatus"
        :options="adminStatusOptions"
        class="w-full"
        @update:model-value="(v) => updateState({ administrativeStatus: v })"
      />
    </div>

    <!-- Sources (read-only) -->
    <div v-if="cde.sources.length > 0">
      <p class="font-medium text-gray-700 mb-2">Sources</p>
      <ul class="space-y-1 text-gray-600">
        <li
          v-for="(src, i) in cde.sources"
          :key="i"
          class="text-xs bg-gray-50 rounded px-2 py-1.5 border border-gray-200"
        >
          {{ src.sourceName }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Select from 'primevue/select'
import { useCdeStore } from '@/stores/cdeStore'

const store = useCdeStore()
const cde = computed(() => store.activeFile!.cde)

const registrationStatusOptions = [
  'Incomplete', 'Candidate', 'Recorded', 'Qualified', 'Standard', 'Preferred Standard', 'Retired',
]

const adminStatusOptions = [
  'Not Endorsed', 'Endorsed',
]

function updateState(patch: Partial<{ registrationStatus: string; administrativeStatus: string }>) {
  store.updateCde({ registrationState: { ...cde.value.registrationState, ...patch } })
}
</script>
```

- [ ] **Step 3: Verify in browser** — Classification renders a read-only tree. Status shows two dropdowns.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/ClassificationSection.vue src/components/sections/StatusSection.vue
git commit -m "feat: add ClassificationSection (read-only tree) and StatusSection"
```

---

## Task 13: JsonDrawer

**Files:**
- Create: `src/components/JsonDrawer.vue`

- [ ] **Step 1: Create `src/components/JsonDrawer.vue`**

```vue
<template>
  <Drawer
    :visible="visible"
    position="right"
    :style="{ width: '500px' }"
    header="Raw JSON"
    @update:visible="$emit('update:visible', $event)"
  >
    <div class="flex flex-col h-full gap-3">
      <textarea
        v-model="jsonText"
        class="flex-1 font-mono text-xs border border-gray-200 rounded p-2 resize-none outline-none focus:ring-2 focus:ring-blue-300"
        spellcheck="false"
      />
      <p v-if="parseError" class="text-red-600 text-xs">{{ parseError }}</p>
      <div class="flex gap-2 justify-end shrink-0">
        <Button label="Apply" icon="pi pi-check" @click="applyJson" />
        <Button label="Close" text @click="$emit('update:visible', false)" />
      </div>
    </div>
  </Drawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Drawer from 'primevue/drawer'
import Button from 'primevue/button'
import { useCdeStore } from '@/stores/cdeStore'
import type { CdeDocument } from '@/types/cde'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{ (e: 'update:visible', v: boolean): void }>()

const store = useCdeStore()
const jsonText = ref('')
const parseError = ref('')

// Sync store → textarea whenever drawer opens or active file changes
watch(
  [() => props.visible, () => store.activeFile?.cde],
  ([isVisible]) => {
    if (isVisible && store.activeFile) {
      jsonText.value = JSON.stringify(store.activeFile.cde, null, 2)
      parseError.value = ''
    }
  },
  { deep: true }
)

function applyJson() {
  try {
    const parsed = JSON.parse(jsonText.value) as CdeDocument
    store.replaceCde(parsed) // full replace, not shallow merge
    parseError.value = ''
    emit('update:visible', false)
  } catch (err) {
    parseError.value = `Invalid JSON: ${(err as Error).message}`
  }
}
</script>
```

- [ ] **Step 2: Verify in browser** — click the `{ }` floating button. Drawer slides in from right showing formatted JSON. Edit the JSON, click Apply. The form should reflect the changes and the file should be marked dirty. A malformed JSON should show an error message without closing the drawer.

- [ ] **Step 3: Commit**

```bash
git add src/components/JsonDrawer.vue
git commit -m "feat: add JsonDrawer with two-way JSON sync and parse error display"
```

---

## Task 14: Final Verification + Build Check

- [ ] **Step 1: Run all tests**

```bash
bun test
```

Expected: All tests pass.

- [ ] **Step 2: Run type check**

```bash
bun run build
```

Expected: No TypeScript errors. `dist/` folder created.

- [ ] **Step 3: Smoke test in browser**

```bash
bun run dev
```

Verify end-to-end:
1. Open browser at `http://localhost:5173`
2. Click **Select File**, load `cde-sample.json`
3. File appears in left list
4. Editor shows all panels with data from the JSON
5. Edit the Question Text field → `•` appears on the file
6. Press **⌘S** → `•` disappears (file saved)
7. Click `{ }` button → JSON drawer opens with full JSON
8. Edit JSON in drawer → click Apply → form reflects change
9. Click **Load Folder** → load a directory → all `.json` files appear in list

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: complete CDE Curator editor - all sections and JSON drawer"
```
