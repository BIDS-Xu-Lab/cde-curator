<template>
  <div class="relative p-4 space-y-3 max-w-4xl mx-auto">
    <!-- Title -->
    <h2 class="text-xl font-semibold text-gray-800">
      {{ preferredName }}
    </h2>

    <Panel header="CDE Summary" toggleable>
      <SummarySection />
    </Panel>

    <Panel header="Data Type Details" toggleable>
      <DataTypeSection />
    </Panel>

    <Panel header="Other Names & Definitions" toggleable :collapsed="true">
      <DesignationsSection />
    </Panel>

    <Panel header="Concepts" toggleable :collapsed="true">
      <ConceptsSection />
    </Panel>

    <Panel header="Properties" toggleable :collapsed="true">
      <PropertiesSection />
    </Panel>

    <Panel header="Related Documents" toggleable :collapsed="true">
      <ReferenceDocsSection />
    </Panel>

    <Panel header="Classification" toggleable :collapsed="true">
      <ClassificationSection />
    </Panel>

    <Panel header="Status" toggleable :collapsed="true">
      <StatusSection />
    </Panel>

    <!-- Floating JSON button -->
    <div class="fixed bottom-6 right-6 z-10">
      <Button
        v-tooltip.left="'View / Edit Raw JSON'"
        icon="pi pi-code"
        rounded
        raised
        @click="jsonDrawerVisible = true"
      />
    </div>

    <JsonDrawer v-model:visible="jsonDrawerVisible" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Panel from 'primevue/panel'
import Button from 'primevue/button'
import { useCdeStore } from '@/stores/cdeStore'
import SummarySection from '@/components/sections/SummarySection.vue'
import DataTypeSection from '@/components/sections/DataTypeSection.vue'
import DesignationsSection from '@/components/sections/DesignationsSection.vue'
import ConceptsSection from '@/components/sections/ConceptsSection.vue'
import PropertiesSection from '@/components/sections/PropertiesSection.vue'
import ReferenceDocsSection from '@/components/sections/ReferenceDocsSection.vue'
import ClassificationSection from '@/components/sections/ClassificationSection.vue'
import StatusSection from '@/components/sections/StatusSection.vue'
import JsonDrawer from '@/components/JsonDrawer.vue'

const store = useCdeStore()
const jsonDrawerVisible = ref(false)

const preferredName = computed(() => {
  const cde = store.activeFile?.cde
  if (!cde) return ''
  const preferred = cde.designations.find(d => d.tags.includes('Preferred Question Text'))
  return preferred?.designation ?? cde.designations[0]?.designation ?? cde.tinyId
})
</script>
