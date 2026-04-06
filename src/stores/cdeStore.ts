import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CdeDocument } from '@/types/cde'
import { cdeSamples, type CdeSampleId } from '@/samples/cdeSamples'

export interface FileEntry {
  name: string
  handle?: FileSystemFileHandle
  cde: CdeDocument
  dirty: boolean
  source: 'filesystem' | 'sample'
}

export const useCdeStore = defineStore('cde', () => {
  const files = ref<FileEntry[]>([])
  const activeIndex = ref<number | null>(null)

  const activeFile = computed<FileEntry | null>(() =>
    activeIndex.value !== null ? files.value[activeIndex.value] ?? null : null
  )
  const canSaveActive = computed(() => Boolean(activeFile.value?.handle))

  async function loadFiles(handles: FileSystemFileHandle[]) {
    for (const handle of handles) {
      const file = await handle.getFile()
      const text = await file.text()
      let cde: CdeDocument
      try {
        cde = JSON.parse(text) as CdeDocument
      } catch {
        console.warn(`Skipping "${handle.name}": invalid JSON`)
        continue
      }
      files.value.push({ name: handle.name, handle, cde, dirty: false, source: 'filesystem' })
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
    if (index < 0 || index >= files.value.length) return
    activeIndex.value = index
  }

  // Shallow-merges patch into the active CDE. Callers updating nested objects
  // (e.g. valueDomain) must spread the existing nested object themselves.
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

  function loadSample(sampleId: CdeSampleId) {
    const sample = cdeSamples.find((entry) => entry.id === sampleId)
    if (!sample) {
      console.warn(`Sample "${sampleId}" not found`)
      return
    }

    const existingIndex = files.value.findIndex(
      (entry) => entry.source === 'sample' && entry.name === sample.name
    )
    const clonedCde = structuredClone(sample.cde)

    if (existingIndex >= 0) {
      files.value[existingIndex] = {
        name: sample.name,
        cde: clonedCde,
        dirty: false,
        source: 'sample',
      }
      activeIndex.value = existingIndex
      return
    }

    files.value.push({
      name: sample.name,
      cde: clonedCde,
      dirty: false,
      source: 'sample',
    })
    activeIndex.value = files.value.length - 1
  }

  async function saveActive() {
    if (activeIndex.value === null) return
    const entry = files.value[activeIndex.value]
    if (!entry.handle) return
    const writable = await entry.handle.createWritable()
    await writable.write(JSON.stringify(entry.cde, null, 2))
    await writable.close()
    entry.dirty = false
  }

  return {
    files,
    activeIndex,
    activeFile,
    canSaveActive,
    loadFiles,
    loadFolder,
    selectFile,
    updateCde,
    replaceCde,
    loadSample,
    saveActive,
  }
})
