<template>
  <div class="attachments">
    <div class="attachments__grid" v-if="attachments.length > 0">
      <div class="attachments__item" v-for="att in attachments" :key="att.id">
        <div class="attachments__thumb" @click="openAttachment(att.id)">
          <i class="pi pi-image"></i>
          <span class="attachments__filename">{{ att.fileName }}</span>
        </div>
        <Button
          icon="pi pi-trash"
          severity="danger"
          text
          rounded
          size="small"
          class="attachments__delete"
          @click="deleteAttachment(att.id)"
        />
      </div>
    </div>
    <p class="attachments__empty" v-else>No attachments yet.</p>
    <div class="attachments__upload">
      <label class="attachments__upload-label">
        <i class="pi pi-upload"></i>
        <span>Upload Image</span>
        <input
          type="file"
          accept="image/*"
          class="attachments__upload-input"
          @change="onFileSelect"
        />
      </label>
      <span v-if="isUploading" class="attachments__uploading">
        <i class="pi pi-spin pi-spinner"></i> Uploading...
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Button from 'primevue/button'
import type { Attachment } from '../../types'
import { attachmentService } from '../../services/attachment-service'

const props = defineProps<{
  itemId: string
}>()

const attachments = ref<Attachment[]>([])
const isUploading = ref(false)

onMounted(async () => {
  await loadAttachments()
})

async function loadAttachments() {
  try {
    attachments.value = await attachmentService.getByItem(props.itemId)
  } catch (err) {
    console.error('Failed to load attachments', err)
  }
}

function openAttachment(attachmentId: string) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
  window.open(`${baseUrl}/attachments/${attachmentId}/download`, '_blank')
}

async function deleteAttachment(attachmentId: string) {
  try {
    await attachmentService.delete(props.itemId, attachmentId)
    attachments.value = attachments.value.filter(a => a.id !== attachmentId)
  } catch (err) {
    console.error('Failed to delete attachment', err)
  }
}

async function onFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  isUploading.value = true
  try {
    const created = await attachmentService.upload(props.itemId, file)
    attachments.value.push(created)
  } catch (err) {
    console.error('Failed to upload attachment', err)
  } finally {
    isUploading.value = false
    input.value = ''
  }
}
</script>

<style scoped>
.attachments {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.attachments__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.5rem;
}

.attachments__item {
  position: relative;
  background: var(--bg-column);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.attachments__thumb {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  padding: 1.25rem 0.5rem;
  cursor: pointer;
  transition: background 0.15s ease;
}

.attachments__thumb:hover {
  background: #e5e7eb;
}

.attachments__thumb .pi {
  font-size: 1.5rem;
  color: var(--text-secondary);
}

.attachments__filename {
  font-size: 0.7rem;
  color: var(--text-secondary);
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  padding: 0 0.25rem;
}

.attachments__delete {
  position: absolute;
  top: 2px;
  right: 2px;
}

.attachments__empty {
  font-size: 0.82rem;
  color: var(--text-secondary);
  text-align: center;
  padding: 1rem 0;
}

.attachments__upload {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.attachments__upload-label {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--accent-blue);
  cursor: pointer;
  padding: 0.4rem 0.75rem;
  border: 1px dashed var(--accent-blue);
  border-radius: var(--radius-sm);
  transition: background 0.15s ease;
}

.attachments__upload-label:hover {
  background: #eff6ff;
}

.attachments__upload-input {
  display: none;
}

.attachments__uploading {
  font-size: 0.8rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 0.3rem;
}
</style>
