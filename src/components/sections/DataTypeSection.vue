<template>
  <div class="space-y-4 text-sm">
    <div class="grid grid-cols-[160px_1fr] gap-x-4 gap-y-3 items-start">
      <!-- Data Type selector -->
      <label class="text-gray-500 font-medium pt-1">Data Type</label>
      <Select
        :model-value="cde.valueDomain.datatype"
        :options="datatypeOptions"
        class="w-full"
        placeholder="Select type"
        @update:model-value="(v) => updateValueDomain({ datatype: v })"
      />

      <!-- Number-specific fields -->
      <template v-if="cde.valueDomain.datatype === 'Number'">
        <label class="text-gray-500 font-medium pt-1">Min Value</label>
        <InputText
          :value="(cde.valueDomain as any).minValue ?? ''"
          class="w-full"
          placeholder="Minimum"
          @input="(e) => updateValueDomain({ minValue: (e.target as HTMLInputElement).value })"
        />

        <label class="text-gray-500 font-medium pt-1">Max Value</label>
        <InputText
          :value="(cde.valueDomain as any).maxValue ?? ''"
          class="w-full"
          placeholder="Maximum"
          @input="(e) => updateValueDomain({ maxValue: (e.target as HTMLInputElement).value })"
        />

        <label class="text-gray-500 font-medium pt-1">Precision</label>
        <InputText
          :value="(cde.valueDomain as any).precision ?? ''"
          class="w-full"
          placeholder="Decimal precision"
          @input="(e) => updateValueDomain({ precision: (e.target as HTMLInputElement).value })"
        />
      </template>

      <!-- Unit of Measure -->
      <label class="text-gray-500 font-medium pt-1">Unit of Measure</label>
      <InputText
        :value="cde.valueDomain.uom"
        class="w-full"
        placeholder="e.g. years, mg/dL"
        @input="(e) => updateValueDomain({ uom: (e.target as HTMLInputElement).value })"
      />
    </div>

    <!-- Permissible Values table -->
    <div>
      <div class="flex items-center justify-between mb-2">
        <span class="font-medium text-gray-700">Permissible Values</span>
        <Button icon="pi pi-plus" label="Add" size="small" text @click="addPV" />
      </div>

      <div v-if="cde.valueDomain.permissibleValues.length === 0" class="text-gray-400 text-xs py-2">
        No permissible values defined.
      </div>

      <table v-else class="w-full text-sm border-collapse">
        <thead>
          <tr class="border-b border-gray-200 text-gray-500">
            <th class="text-left py-1.5 pr-3 font-medium w-1/2">Value</th>
            <th class="text-left py-1.5 pr-3 font-medium w-1/2">Meaning</th>
            <th class="w-8" />
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(pv, i) in cde.valueDomain.permissibleValues"
            :key="i"
            class="border-b border-gray-100"
          >
            <td class="py-1 pr-2">
              <InputText
                :value="pv.permissibleValue"
                class="w-full"
                @input="(e) => updatePV(i, 'permissibleValue', (e.target as HTMLInputElement).value)"
              />
            </td>
            <td class="py-1 pr-2">
              <InputText
                :value="pv.valueMeaning"
                class="w-full"
                @input="(e) => updatePV(i, 'valueMeaning', (e.target as HTMLInputElement).value)"
              />
            </td>
            <td class="py-1">
              <Button icon="pi pi-trash" text severity="danger" size="small" @click="removePV(i)" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import { useCdeStore } from '@/stores/cdeStore'
import type { PermissibleValue, ValueDomain } from '@/types/cde'

const store = useCdeStore()
const cde = computed(() => store.activeFile!.cde)

const datatypeOptions = ['Text', 'Number', 'Date', 'Time', 'Externally Defined', 'Value List', 'File']

function updateValueDomain(patch: Partial<ValueDomain> & Record<string, unknown>) {
  store.updateCde({ valueDomain: { ...cde.value.valueDomain, ...patch } })
}

function addPV() {
  const pvs = [...cde.value.valueDomain.permissibleValues, { permissibleValue: '', valueMeaning: '' }]
  updateValueDomain({ permissibleValues: pvs })
}

function removePV(index: number) {
  const pvs = cde.value.valueDomain.permissibleValues.filter((_, i) => i !== index)
  updateValueDomain({ permissibleValues: pvs })
}

function updatePV(index: number, field: keyof PermissibleValue, value: string) {
  const pvs = cde.value.valueDomain.permissibleValues.map((pv, i) =>
    i === index ? { ...pv, [field]: value } : pv
  )
  updateValueDomain({ permissibleValues: pvs })
}
</script>
