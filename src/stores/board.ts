import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { BacklogItemStatus, Priority } from '../types'
import type { BacklogItem, BacklogItemType } from '../types'
import { itemService } from '../services/item-service'

export const useBoardStore = defineStore('board', () => {
  const items = ref<BacklogItem[]>([])
  const isLoading = ref(false)
  const filterType = ref<BacklogItemType | null>(null)
  const filterPriority = ref<Priority | null>(null)

  const filteredItems = computed(() => {
    let result = items.value
    if (filterType.value) result = result.filter(i => i.type === filterType.value)
    if (filterPriority.value) result = result.filter(i => i.priority === filterPriority.value)
    return result
  })

  const priorityOrder: Record<string, number> = {
    [Priority.Critical]: 0,
    [Priority.High]: 1,
    [Priority.Medium]: 2,
    [Priority.Low]: 3,
    [Priority.None]: 4
  }

  const itemsByStatus = computed(() => {
    const statuses = [
      BacklogItemStatus.Backlog,
      BacklogItemStatus.ToDo,
      BacklogItemStatus.InProgress,
      BacklogItemStatus.InReview,
      BacklogItemStatus.Done
    ]
    const map: Record<string, BacklogItem[]> = {}
    for (const status of statuses) {
      map[status] = filteredItems.value
        .filter(i => i.status === status)
        .sort((a, b) => (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4))
    }
    return map
  })

  async function fetchItems(projectId: string) {
    isLoading.value = true
    try {
      items.value = await itemService.getByProject(projectId)
    } finally {
      isLoading.value = false
    }
  }

  async function updateItemStatus(projectId: string, itemNumber: number, status: BacklogItemStatus) {
    const updated = await itemService.updateStatus(projectId, itemNumber, status)
    const index = items.value.findIndex(i => i.itemNumber === itemNumber)
    if (index !== -1) items.value[index] = updated
  }

  function addItem(item: BacklogItem) {
    items.value.push(item)
  }

  function updateItem(item: BacklogItem) {
    const index = items.value.findIndex(i => i.id === item.id)
    if (index !== -1) items.value[index] = item
  }

  function removeItem(itemNumber: number) {
    items.value = items.value.filter(i => i.itemNumber !== itemNumber)
  }

  return {
    items, isLoading, filterType, filterPriority,
    filteredItems, itemsByStatus,
    fetchItems, updateItemStatus, addItem, updateItem, removeItem
  }
})
