<template>
  <div class="board-view">
    <TopNav @create-item="openCreateDialog" />
    <div class="board-view__loading" v-if="boardStore.isLoading">
      <i class="pi pi-spin pi-spinner board-view__spinner"></i>
      <span>Loading board...</span>
    </div>
    <KanbanBoard
      v-else
      @item-click="openItemDialog"
    />
    <ItemDetailDialog
      v-model:visible="showItemDialog"
      :item="selectedItem"
      :mode="dialogMode"
      @saved="onItemSaved"
      @archived="onItemArchived"
    />
    <SpeechFab
      :is-active="voiceConversation.isActive.value"
      :is-supported="voiceConversation.isSupported.value"
      @activate="startVoiceConversation"
    />
    <VoiceOverlay
      v-if="voiceConversation.isActive.value"
      :status-message="voiceConversation.statusMessage.value"
      :live-transcript="voiceConversation.liveTranscript.value"
      :is-listening="voiceConversation.isListening.value"
      :state="voiceConversation.state.value"
      :parsed-type="voiceConversation.parsedType.value"
      :parsed-title="voiceConversation.parsedTitle.value"
      @cancel="voiceConversation.cancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TopNav from '../components/nav/TopNav.vue'
import KanbanBoard from '../components/board/KanbanBoard.vue'
import ItemDetailDialog from '../components/items/ItemDetailDialog.vue'
import SpeechFab from '../components/speech/SpeechFab.vue'
import VoiceOverlay from '../components/speech/VoiceOverlay.vue'
import { useProjectStore } from '../stores/project'
import { useBoardStore } from '../stores/board'
import { useVoiceConversation } from '../composables/useVoiceConversation'
import { itemService } from '../services/item-service'
import type { BacklogItem } from '../types'

const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()
const boardStore = useBoardStore()

const voiceConversation = useVoiceConversation()

const showItemDialog = ref(false)
const selectedItem = ref<BacklogItem | null>(null)
const dialogMode = ref<'create' | 'edit'>('edit')

onMounted(async () => {
  await projectStore.fetchProjects()

  // Set project from route param or use first available
  const routeProjectId = route.params.projectId as string | undefined
  if (routeProjectId) {
    projectStore.setCurrentProject(routeProjectId)
  } else if (projectStore.currentProjectId) {
    router.replace({
      name: 'board',
      params: { projectId: projectStore.currentProjectId }
    })
  } else if (projectStore.projects.length > 0) {
    const firstId = projectStore.projects[0]!.id
    projectStore.setCurrentProject(firstId)
    router.replace({ name: 'board', params: { projectId: firstId } })
  }
})

// Fetch items when project changes
watch(
  () => projectStore.currentProjectId,
  async (projectId) => {
    if (projectId) {
      await boardStore.fetchItems(projectId)
      // Handle deep link to item
      await handleItemDeepLink()
    }
  },
  { immediate: true }
)

async function handleItemDeepLink() {
  const itemNumber = route.params.number as string | undefined
  if (!itemNumber || !projectStore.currentProjectId) return

  try {
    const item = await itemService.getByNumber(
      projectStore.currentProjectId,
      parseInt(itemNumber, 10)
    )
    selectedItem.value = item
    dialogMode.value = 'edit'
    showItemDialog.value = true
  } catch (err) {
    console.error('Failed to load item from deep link', err)
  }
}

function openCreateDialog() {
  selectedItem.value = null
  dialogMode.value = 'create'
  showItemDialog.value = true
}

function openItemDialog(item: BacklogItem) {
  selectedItem.value = item
  dialogMode.value = 'edit'
  showItemDialog.value = true
}

function onItemSaved(_item: BacklogItem) {
  // Item already added/updated in store by dialog
}

function onItemArchived(_itemNumber: number) {
  // Item already removed from store by dialog
}

async function startVoiceConversation() {
  if (!projectStore.currentProjectId) return
  const result = await voiceConversation.startConversation()
  if (result) {
    const item = await itemService.create(projectStore.currentProjectId, result)
    boardStore.addItem(item)
  }
}
</script>

<style scoped>
.board-view {
  min-height: 100vh;
  background: var(--bg-primary);
}

.board-view__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 4rem 1rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.board-view__spinner {
  font-size: 1.5rem;
  color: var(--accent-blue);
}
</style>
