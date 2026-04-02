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
