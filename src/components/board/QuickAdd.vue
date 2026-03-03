<template>
  <div class="quick-add">
    <InputText
      v-model="title"
      placeholder="Add item..."
      class="quick-add__input"
      @keydown.enter="submit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import InputText from 'primevue/inputtext'
import type { BacklogItemStatus } from '../../types'

const props = defineProps<{
  status: BacklogItemStatus
}>()

const emit = defineEmits<{
  add: [payload: { title: string; status: BacklogItemStatus }]
}>()

const title = ref('')

function submit() {
  const trimmed = title.value.trim()
  if (!trimmed) return
  emit('add', { title: trimmed, status: props.status })
  title.value = ''
}
</script>

<style scoped>
.quick-add {
  padding: 0 0 0.5rem 0;
}

.quick-add__input {
  width: 100%;
  font-size: 0.8rem;
  padding: 0.45rem 0.65rem;
  background: var(--bg-surface);
  border: 1px dashed #d1d5db;
  border-radius: var(--radius-sm);
  transition: border-color 0.15s ease;
}

.quick-add__input:focus {
  border-style: solid;
  border-color: var(--accent-blue);
}
</style>
