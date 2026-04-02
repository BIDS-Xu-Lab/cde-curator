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
