<template>
  <div class="comments">
    <div class="comments__list" v-if="comments.length > 0">
      <div class="comments__item" v-for="comment in comments" :key="comment.id">
        <div class="comments__meta">
          <span class="comments__author">{{ comment.createdBy }}</span>
          <span class="comments__date">{{ formatDate(comment.createdDate) }}</span>
        </div>
        <p class="comments__text">{{ comment.text }}</p>
      </div>
    </div>
    <p class="comments__empty" v-else>No comments yet.</p>
    <div class="comments__add">
      <InputText
        v-model="newComment"
        placeholder="Write a comment..."
        class="comments__input"
        @keydown.enter="addComment"
      />
      <Button
        label="Add"
        size="small"
        :disabled="!newComment.trim()"
        :loading="isSubmitting"
        @click="addComment"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import type { Comment } from '../../types'
import { commentService } from '../../services/comment-service'

const props = defineProps<{
  itemId: string
}>()

const comments = ref<Comment[]>([])
const newComment = ref('')
const isSubmitting = ref(false)

onMounted(async () => {
  await loadComments()
})

async function loadComments() {
  try {
    comments.value = await commentService.getByItem(props.itemId)
  } catch (err) {
    console.error('Failed to load comments', err)
  }
}

async function addComment() {
  const text = newComment.value.trim()
  if (!text) return
  isSubmitting.value = true
  try {
    const created = await commentService.create(props.itemId, text)
    comments.value.push(created)
    newComment.value = ''
  } catch (err) {
    console.error('Failed to add comment', err)
  } finally {
    isSubmitting.value = false
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.comments {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.comments__list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 250px;
  overflow-y: auto;
}

.comments__item {
  background: var(--bg-column);
  border-radius: var(--radius-sm);
  padding: 0.6rem 0.75rem;
}

.comments__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.comments__author {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-primary);
}

.comments__date {
  font-size: 0.7rem;
  color: var(--text-secondary);
}

.comments__text {
  font-size: 0.82rem;
  line-height: 1.4;
  color: var(--text-primary);
}

.comments__empty {
  font-size: 0.82rem;
  color: var(--text-secondary);
  text-align: center;
  padding: 1rem 0;
}

.comments__add {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.comments__input {
  flex: 1;
  font-size: 0.82rem;
}
</style>
