<template>
  <div class="board">
    <div class="board__filters">
      <Select
        v-model="boardStore.filterType"
        :options="typeOptions"
        optionLabel="label"
        optionValue="value"
        placeholder="All Types"
        showClear
        class="board__filter"
      />
      <Select
        v-model="boardStore.filterPriority"
        :options="priorityOptions"
        optionLabel="label"
        optionValue="value"
        placeholder="All Priorities"
        showClear
        class="board__filter"
      />
    </div>
    <div class="board__columns">
      <KanbanColumn
        v-for="(col, index) in columns"
        :key="col.status"
        :status="col.status"
        :label="col.label"
        :items="boardStore.itemsByStatus[col.status] || []"
        :class="{ 'board__column--stagger': loaded }"
        :style="{ animationDelay: `${index * 80}ms` }"
        @quick-add="onQuickAdd"
        @item-click="(item) => $emit('item-click', item)"
        @status-change="onStatusChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Select from 'primevue/select'
import KanbanColumn from './KanbanColumn.vue'
import { useBoardStore } from '../../stores/board'
import { useProjectStore } from '../../stores/project'
import { BacklogItemStatus, BacklogItemType, Priority } from '../../types'
import type { BacklogItem, CreateBacklogItem } from '../../types'
import { itemService } from '../../services/item-service'

defineEmits<{
  'item-click': [item: BacklogItem]
}>()

const boardStore = useBoardStore()
const projectStore = useProjectStore()
const loaded = ref(false)

const columns = [
  { status: BacklogItemStatus.Backlog, label: 'Backlog' },
  { status: BacklogItemStatus.ToDo, label: 'To Do' },
  { status: BacklogItemStatus.InProgress, label: 'In Progress' },
  { status: BacklogItemStatus.InReview, label: 'In Review' },
  { status: BacklogItemStatus.Done, label: 'Done' }
]

const typeOptions = [
  { label: 'Bug', value: BacklogItemType.Bug },
  { label: 'Feature', value: BacklogItemType.Feature },
  { label: 'Task', value: BacklogItemType.Task }
]

const priorityOptions = [
  { label: 'Critical', value: Priority.Critical },
  { label: 'High', value: Priority.High },
  { label: 'Medium', value: Priority.Medium },
  { label: 'Low', value: Priority.Low },
  { label: 'None', value: Priority.None }
]

onMounted(() => {
  requestAnimationFrame(() => {
    loaded.value = true
  })
})

async function onQuickAdd(payload: { title: string; status: BacklogItemStatus }) {
  if (!projectStore.currentProjectId) return
  const dto: CreateBacklogItem = {
    type: BacklogItemType.Task,
    title: payload.title,
    priority: Priority.None,
    status: payload.status
  }
  try {
    const created = await itemService.create(projectStore.currentProjectId, dto)
    boardStore.addItem(created)
  } catch (err) {
    console.error('Failed to create item', err)
  }
}

async function onStatusChange(payload: { itemNumber: number; newStatus: BacklogItemStatus }) {
  if (!projectStore.currentProjectId) return
  try {
    await boardStore.updateItemStatus(
      projectStore.currentProjectId,
      payload.itemNumber,
      payload.newStatus
    )
  } catch (err) {
    console.error('Failed to update status', err)
    // Re-fetch to restore correct state
    if (projectStore.currentProjectId) {
      await boardStore.fetchItems(projectStore.currentProjectId)
    }
  }
}
</script>

<style scoped>
.board {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  height: calc(100vh - 56px);
}

.board__filters {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.board__filter {
  min-width: 150px;
  font-size: 0.85rem;
}

.board__columns {
  display: flex;
  gap: 0.75rem;
  flex: 1;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  scroll-snap-type: x mandatory;
}

.board__columns > * {
  scroll-snap-align: start;
}

/* Staggered fade-in */
.board__column--stagger {
  animation: columnFadeIn 0.4s ease-out both;
}

@keyframes columnFadeIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Mobile: horizontal scroll */
@media (max-width: 768px) {
  .board__columns {
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
  }

  .board__columns > * {
    min-width: 80vw;
    max-width: 85vw;
  }
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1200px) {
  .board__columns > * {
    min-width: 240px;
  }
}
</style>
