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
