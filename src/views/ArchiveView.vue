<template>
  <div class="archive-view">
    <TopNav @create-item="() => {}" />
    <div class="archive-content">
      <div class="archive-header">
        <h2 class="archive-title">
          <i class="pi pi-inbox"></i> Archived Items
        </h2>
        <Button
          label="Back to Board"
          icon="pi pi-arrow-left"
          severity="secondary"
          outlined
          size="small"
          @click="goBack"
        />
      </div>
      <div class="archive-loading" v-if="isLoading">
        <i class="pi pi-spin pi-spinner"></i> Loading...
      </div>
      <div class="archive-empty" v-else-if="archivedItems.length === 0">
        No archived items found.
      </div>
      <div class="archive-table" v-else>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Type</th>
              <th>Priority</th>
              <th>Archived</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in archivedItems" :key="item.id">
              <td class="archive-number">{{ item.itemNumber }}</td>
              <td class="archive-item-title">{{ item.title }}</td>
              <td>
                <TypeBadge :type="item.type" />
              </td>
              <td>
                <PriorityBadge :priority="item.priority" />
              </td>
              <td class="archive-date">
                {{ formatDate(item.updatedDate || item.createdDate) }}
              </td>
              <td>
                <Button
                  label="Restore"
                  icon="pi pi-refresh"
                  size="small"
                  severity="secondary"
                  outlined
                  @click="restore(item)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import TopNav from '../components/nav/TopNav.vue'
import TypeBadge from '../components/common/TypeBadge.vue'
import PriorityBadge from '../components/common/PriorityBadge.vue'
import { useProjectStore } from '../stores/project'
import { itemService } from '../services/item-service'
import type { BacklogItem } from '../types'

const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()

const archivedItems = ref<BacklogItem[]>([])
const isLoading = ref(false)

onMounted(async () => {
  await projectStore.fetchProjects()
  const routeProjectId = route.params.projectId as string | undefined
  if (routeProjectId) {
    projectStore.setCurrentProject(routeProjectId)
  }
})

watch(
  () => projectStore.currentProjectId,
  async (projectId) => {
    if (projectId) {
      await loadArchived(projectId)
    }
  },
  { immediate: true }
)

async function loadArchived(projectId: string) {
  isLoading.value = true
  try {
    archivedItems.value = await itemService.getArchived(projectId)
  } catch (err) {
    console.error('Failed to load archived items', err)
  } finally {
    isLoading.value = false
  }
}

async function restore(item: BacklogItem) {
  if (!projectStore.currentProjectId) return
  try {
    await itemService.unarchive(projectStore.currentProjectId, item.itemNumber)
    archivedItems.value = archivedItems.value.filter(i => i.id !== item.id)
  } catch (err) {
    console.error('Failed to restore item', err)
  }
}

function goBack() {
  if (projectStore.currentProjectId) {
    router.push({
      name: 'board',
      params: { projectId: projectStore.currentProjectId }
    })
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<style scoped>
.archive-view {
  min-height: 100vh;
  background: var(--bg-primary);
}

.archive-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
}

.archive-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.archive-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.archive-title .pi {
  color: var(--text-secondary);
}

.archive-loading {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

.archive-empty {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.archive-table {
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-secondary);
  padding: 0.75rem 1rem;
  border-bottom: 2px solid #e5e7eb;
}

td {
  padding: 0.6rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.85rem;
}

.archive-number {
  font-family: 'Space Mono', monospace;
  font-weight: 700;
  color: var(--text-secondary);
  font-size: 0.8rem;
}

.archive-item-title {
  font-weight: 500;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.archive-date {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

@media (max-width: 640px) {
  table {
    font-size: 0.78rem;
  }

  th, td {
    padding: 0.5rem 0.5rem;
  }
}
</style>
