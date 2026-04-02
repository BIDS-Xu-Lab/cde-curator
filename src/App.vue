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
