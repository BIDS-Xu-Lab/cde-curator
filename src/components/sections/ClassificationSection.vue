<template>
  <div class="text-sm">
    <div v-if="cde.classification.length === 0" class="text-gray-400 text-xs py-2">
      No classification data.
    </div>
    <div v-else class="space-y-3">
      <div v-for="(cls, i) in cde.classification" :key="i" class="border border-gray-200 rounded p-3">
        <p class="font-medium text-gray-700 mb-2">{{ cls.stewardOrg.name }}</p>
        <Tree :value="toTreeNodes(cls.elements)" class="text-sm" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Tree from 'primevue/tree'
import { useCdeStore } from '@/stores/cdeStore'
import type { ClassificationElement } from '@/types/cde'

const store = useCdeStore()
const cde = computed(() => store.activeFile!.cde)

interface TreeNode {
  key: string
  label: string
  children?: TreeNode[]
}

function toTreeNodes(elements: ClassificationElement[], prefix = ''): TreeNode[] {
  return elements.map((el, i) => ({
    key: `${prefix}${i}`,
    label: el.name,
    children: el.elements.length > 0 ? toTreeNodes(el.elements, `${prefix}${i}-`) : undefined,
  }))
}
</script>
