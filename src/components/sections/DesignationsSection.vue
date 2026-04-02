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
