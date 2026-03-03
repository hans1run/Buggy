<template>
  <Dialog
    v-model:visible="dialogVisible"
    modal
    :header="dialogTitle"
    :style="{ width: '700px', maxWidth: '95vw' }"
    class="item-dialog"
    :breakpoints="{ '640px': '100vw' }"
    @hide="onHide"
  >
    <div class="item-form" v-if="editableItem">
      <div class="item-form__row">
        <label class="item-form__label">Title</label>
        <InputText v-model="editableItem.title" class="item-form__input" />
      </div>
      <div class="item-form__row">
        <label class="item-form__label">Description</label>
        <Textarea
          v-model="editableItem.description"
          rows="3"
          autoResize
          class="item-form__input"
        />
      </div>
      <div class="item-form__row-group">
        <div class="item-form__row item-form__row--half">
          <label class="item-form__label">Type</label>
          <Select
            v-model="editableItem.type"
            :options="typeOptions"
            optionLabel="label"
            optionValue="value"
            class="item-form__input"
          />
        </div>
        <div class="item-form__row item-form__row--half">
          <label class="item-form__label">Priority</label>
          <Select
            v-model="editableItem.priority"
            :options="priorityOptions"
            optionLabel="label"
            optionValue="value"
            class="item-form__input"
          />
        </div>
      </div>
      <div class="item-form__row-group">
        <div class="item-form__row item-form__row--half">
          <label class="item-form__label">Assigned To</label>
          <InputText v-model="editableItem.assignedTo" class="item-form__input" />
        </div>
        <div class="item-form__row item-form__row--half">
          <label class="item-form__label">Tags</label>
          <InputText
            v-model="tagsString"
            placeholder="comma-separated"
            class="item-form__input"
          />
        </div>
      </div>

      <div class="item-form__actions">
        <Button
          label="Save"
          icon="pi pi-check"
          :loading="isSaving"
          @click="save"
        />
        <Button
          v-if="mode === 'edit'"
          label="Archive"
          icon="pi pi-inbox"
          severity="danger"
          outlined
          @click="archive"
        />
      </div>
    </div>

    <!-- Comments & Attachments (edit mode only) -->
    <div class="item-sections" v-if="mode === 'edit' && item">
      <div class="item-section">
        <h4 class="item-section__title">
          <i class="pi pi-comments"></i> Comments
        </h4>
        <CommentList :itemId="item.id" />
      </div>
      <div class="item-section">
        <h4 class="item-section__title">
          <i class="pi pi-paperclip"></i> Attachments
        </h4>
        <AttachmentList :itemId="item.id" />
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import Button from 'primevue/button'
import CommentList from './CommentList.vue'
import AttachmentList from './AttachmentList.vue'
import { BacklogItemType, Priority, BacklogItemStatus } from '../../types'
import type { BacklogItem, CreateBacklogItem } from '../../types'
import { itemService } from '../../services/item-service'
import { useBoardStore } from '../../stores/board'
import { useProjectStore } from '../../stores/project'

const props = defineProps<{
  visible: boolean
  item?: BacklogItem | null
  mode: 'create' | 'edit'
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  saved: [item: BacklogItem]
  archived: [itemNumber: number]
}>()

const boardStore = useBoardStore()
const projectStore = useProjectStore()
const isSaving = ref(false)

interface EditableFields {
  title: string
  description: string | null
  type: BacklogItemType
  priority: Priority
  status: BacklogItemStatus
  assignedTo: string | null
  tags: string[]
}

const editableItem = ref<EditableFields | null>(null)
const tagsString = computed({
  get: () => editableItem.value?.tags?.join(', ') || '',
  set: (val: string) => {
    if (editableItem.value) {
      editableItem.value.tags = val
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0)
    }
  }
})

const dialogVisible = computed({
  get: () => props.visible,
  set: (val: boolean) => emit('update:visible', val)
})

const dialogTitle = computed(() => {
  if (props.mode === 'create') return 'Create New Item'
  if (props.item) return `#${props.item.itemNumber} - Edit Item`
  return 'Item Detail'
})

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

watch(
  () => props.visible,
  (isVisible) => {
    if (isVisible) {
      if (props.mode === 'edit' && props.item) {
        editableItem.value = {
          title: props.item.title,
          description: props.item.description,
          type: props.item.type,
          priority: props.item.priority,
          status: props.item.status,
          assignedTo: props.item.assignedTo,
          tags: [...(props.item.tags || [])]
        }
      } else {
        editableItem.value = {
          title: '',
          description: null,
          type: BacklogItemType.Task,
          priority: Priority.None,
          status: BacklogItemStatus.Backlog,
          assignedTo: null,
          tags: []
        }
      }
    }
  }
)

function onHide() {
  editableItem.value = null
}

async function save() {
  if (!editableItem.value || !projectStore.currentProjectId) return
  const fields = editableItem.value

  if (!fields.title.trim()) return

  isSaving.value = true
  try {
    if (props.mode === 'create') {
      const dto: CreateBacklogItem = {
        type: fields.type,
        title: fields.title.trim(),
        description: fields.description || undefined,
        priority: fields.priority,
        status: fields.status,
        assignedTo: fields.assignedTo || undefined,
        tags: fields.tags.length > 0 ? fields.tags : undefined
      }
      const created = await itemService.create(projectStore.currentProjectId, dto)
      boardStore.addItem(created)
      emit('saved', created)
    } else if (props.item) {
      const updated = await itemService.update(
        projectStore.currentProjectId,
        props.item.itemNumber,
        {
          title: fields.title.trim(),
          description: fields.description,
          type: fields.type,
          priority: fields.priority,
          assignedTo: fields.assignedTo,
          tags: fields.tags
        }
      )
      boardStore.updateItem(updated)
      emit('saved', updated)
    }
    dialogVisible.value = false
  } catch (err) {
    console.error('Failed to save item', err)
  } finally {
    isSaving.value = false
  }
}

async function archive() {
  if (!props.item || !projectStore.currentProjectId) return
  try {
    await itemService.archive(projectStore.currentProjectId, props.item.itemNumber)
    boardStore.removeItem(props.item.itemNumber)
    emit('archived', props.item.itemNumber)
    dialogVisible.value = false
  } catch (err) {
    console.error('Failed to archive item', err)
  }
}
</script>

<style scoped>
.item-form {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding-bottom: 1rem;
}

.item-form__row {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.item-form__row-group {
  display: flex;
  gap: 0.75rem;
}

.item-form__row--half {
  flex: 1;
}

.item-form__label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.item-form__input {
  width: 100%;
  font-size: 0.85rem;
}

.item-form__actions {
  display: flex;
  gap: 0.5rem;
  padding-top: 0.5rem;
}

.item-sections {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  border-top: 1px solid #e5e7eb;
  padding-top: 1rem;
}

.item-section__title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.6rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.item-section__title .pi {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

@media (max-width: 640px) {
  .item-form__row-group {
    flex-direction: column;
  }
}
</style>
