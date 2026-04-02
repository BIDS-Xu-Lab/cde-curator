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
