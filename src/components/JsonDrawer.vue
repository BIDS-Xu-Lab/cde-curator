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
