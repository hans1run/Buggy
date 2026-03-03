<template>
  <div class="column">
    <div class="column__header">
      <h3 class="column__label">{{ label }}</h3>
      <span class="column__count">{{ items.length }}</span>
    </div>
    <QuickAdd :status="status" @add="(payload) => $emit('quick-add', payload)" />
    <div class="column__items">
      <draggable
        :list="localItems"
        group="backlog-items"
        item-key="id"
        ghost-class="ghost"
        drag-class="drag"
        :animation="200"
        @end="onDragEnd"
      >
        <template #item="{ element }">
          <BacklogItemCard
            :item="element"
            @click="(item) => $emit('item-click', item)"
          />
        </template>
      </draggable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
// @ts-ignore - vuedraggable@4.1.0 has no type declarations
import draggable from 'vuedraggable'
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

watch(
  () => props.items,
  (newItems) => {
    localItems.value = [...newItems]
  },
  { deep: true }
)

function onDragEnd() {
  // After drag ends, check each item in localItems to see if its status
  // differs from this column's status. If so, it was dropped here from another column.
  for (const item of localItems.value) {
    if (item.status !== props.status) {
      emit('status-change', { item, newStatus: props.status })
    }
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
