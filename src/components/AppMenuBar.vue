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
