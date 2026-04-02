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
