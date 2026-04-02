<template>
  <div class="space-y-6 text-sm">
    <ConceptTable
      title="Data Element Concept"
      :concepts="cde.dataElementConcept.concepts"
      @update="(v) => store.updateCde({ dataElementConcept: { concepts: v } })"
    />
    <ConceptTable
      title="Object Class"
      :concepts="cde.objectClass.concepts"
      @update="(v) => store.updateCde({ objectClass: { concepts: v } })"
    />
    <ConceptTable
      title="Property"
      :concepts="cde.property.concepts"
      @update="(v) => store.updateCde({ property: { concepts: v } })"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import { useCdeStore } from '@/stores/cdeStore'
import type { Concept } from '@/types/cde'

const store = useCdeStore()
const cde = computed(() => store.activeFile!.cde)

// Inline sub-component to avoid file proliferation
const ConceptTable = defineComponent({
  props: {
    title: String,
    concepts: { type: Array as () => Concept[], default: () => [] },
  },
  emits: ['update'],
  setup(props, { emit }) {
    function add() {
      emit('update', [...props.concepts, { name: '', origin: '', originId: '' }])
    }
    function remove(i: number) {
      emit('update', props.concepts.filter((_, idx) => idx !== i))
    }
    function update(i: number, field: keyof Concept, value: string) {
      emit('update', props.concepts.map((c, idx) => idx === i ? { ...c, [field]: value } : c))
    }

    return () =>
      h('div', [
        h('div', { class: 'flex items-center justify-between mb-2' }, [
          h('span', { class: 'font-medium text-gray-700' }, props.title),
          h(Button, { icon: 'pi pi-plus', label: 'Add', size: 'small', text: true, onClick: add }),
        ]),
        props.concepts.length === 0
          ? h('p', { class: 'text-gray-400 text-xs py-2' }, 'No concepts.')
          : h('table', { class: 'w-full text-sm border-collapse' }, [
              h('thead', [
                h('tr', { class: 'border-b border-gray-200 text-gray-500' }, [
                  h('th', { class: 'text-left py-1.5 pr-3 font-medium w-2/5' }, 'Name'),
                  h('th', { class: 'text-left py-1.5 pr-3 font-medium w-1/5' }, 'Origin'),
                  h('th', { class: 'text-left py-1.5 pr-3 font-medium w-1/4' }, 'Origin ID'),
                  h('th', { class: 'w-8' }),
                ]),
              ]),
              h('tbody',
                props.concepts.map((c, i) =>
                  h('tr', { key: i, class: 'border-b border-gray-100' }, [
                    h('td', { class: 'py-1 pr-2' },
                      h(InputText, {
                        value: c.name, class: 'w-full',
                        onInput: (e: Event) => update(i, 'name', (e.target as HTMLInputElement).value),
                      })
                    ),
                    h('td', { class: 'py-1 pr-2' },
                      h(InputText, {
                        value: c.origin, class: 'w-full',
                        onInput: (e: Event) => update(i, 'origin', (e.target as HTMLInputElement).value),
                      })
                    ),
                    h('td', { class: 'py-1 pr-2' },
                      h(InputText, {
                        value: c.originId, class: 'w-full',
                        onInput: (e: Event) => update(i, 'originId', (e.target as HTMLInputElement).value),
                      })
                    ),
                    h('td', { class: 'py-1' },
                      h(Button, { icon: 'pi pi-trash', text: true, severity: 'danger', size: 'small', onClick: () => remove(i) })
                    ),
                  ])
                )
              ),
            ]),
      ])
  },
})
</script>
