<template>
  <div class="column">
    <div class="column__header">
      <h3 class="column__label">{{ label }}</h3>
      <span class="column__count">{{ items.length }}</span>
    </div>
    <QuickAdd :status="status" @add="(payload) => $emit('quick-add', payload)" />
    <Sortable
      :list="localItems"
      item-key="id"
      :options="sortableOptions"
      class="column__items"
      @add="onAdd"
    >
      <template #item="{ element }">
        <BacklogItemCard
          :item="element"
          @click="(item) => $emit('item-click', item)"
        />
      </template>
    </Sortable>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Sortable } from 'sortablejs-vue3'
import type { SortableEvent } from 'sortablejs'
import type { BacklogItem } from '../../types'
import { BacklogItemStatus } from '../../types'
import BacklogItemCard from './BacklogItemCard.vue'
import QuickAdd from './QuickAdd.vue'

const props = defineProps<{
  status: BacklogItemStatus
  items: BacklogItem[]
  label: string
}>()

const emit = defineEmits<{
  'quick-add': [payload: { title: string; status: BacklogItemStatus }]
  'item-click': [item: BacklogItem]
  'status-change': [payload: { item: BacklogItem; newStatus: BacklogItemStatus }]
}>()

const localItems = ref<BacklogItem[]>([...props.items])

const sortableOptions = {
  group: 'backlog-items',
  animation: 200,
  ghostClass: 'ghost',
  dragClass: 'drag'
}

watch(
  () => props.items,
  (newItems) => {
    localItems.value = [...newItems]
  },
  { deep: true }
)

function onAdd(evt: SortableEvent) {
  const item = localItems.value[evt.newIndex!]
  if (item) {
    emit('status-change', { item, newStatus: props.status })
  }
}
</script>

<style scoped>
.column {
  min-width: 260px;
  max-width: 300px;
  flex: 1 0 260px;
  background: var(--bg-column);
  border-radius: var(--radius-md);
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 140px);
}

.column__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.column__label {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-secondary);
}

.column__count {
  font-family: 'Space Mono', monospace;
  font-size: 0.7rem;
  font-weight: 700;
  background: #e5e7eb;
  color: var(--text-secondary);
  padding: 1px 8px;
  border-radius: 999px;
}

.column__items {
  flex: 1;
  min-height: 60px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-right: 2px;
}

/* Ghost / drag styles */
.column__items :deep(.ghost) {
  opacity: 0.4;
  background: var(--accent-blue);
  border-radius: var(--radius-md);
}

.column__items :deep(.drag) {
  opacity: 0.9;
  transform: rotate(2deg);
}
</style>
