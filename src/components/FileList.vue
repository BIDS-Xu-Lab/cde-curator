<template>
  <div class="p-2">
    <p class="text-xs text-gray-400 px-2 py-1 mb-1">
      {{ store.files.length }} file{{ store.files.length !== 1 ? 's' : '' }} loaded
    </p>
    <ul class="space-y-0.5">
      <li
        v-for="(entry, i) in store.files"
        :key="i"
        v-tooltip.right="entry.name"
        :class="[
          'flex items-center gap-1.5 px-2 py-1.5 rounded cursor-pointer text-sm select-none',
          store.activeIndex === i
            ? 'bg-blue-50 text-blue-700 font-medium'
            : 'text-gray-700 hover:bg-gray-100',
        ]"
        @click="store.selectFile(i)"
      >
        <span
          v-if="entry.dirty"
          class="text-orange-500 shrink-0 leading-none"
          title="Unsaved changes"
        >•</span>
        <span class="truncate">{{ entry.name }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useCdeStore } from '@/stores/cdeStore'

const store = useCdeStore()
</script>
