<template>
  <span class="priority-badge" :class="`priority-badge--${priority.toLowerCase()}`">
    <span class="priority-badge__dot"></span>
    <span class="priority-badge__label">{{ priority }}</span>
  </span>
</template>

<script setup lang="ts">
import { Priority } from '../../types'

defineProps<{
  priority: Priority
}>()
</script>

<style scoped>
.priority-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--text-secondary);
  white-space: nowrap;
}

.priority-badge__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.priority-badge--critical .priority-badge__dot {
  background: var(--priority-critical);
}
.priority-badge--critical .priority-badge__label {
  color: var(--priority-critical);
}

.priority-badge--high .priority-badge__dot {
  background: var(--priority-high);
}
.priority-badge--high .priority-badge__label {
  color: var(--priority-high);
}

.priority-badge--medium .priority-badge__dot {
  background: var(--priority-medium);
}
.priority-badge--medium .priority-badge__label {
  color: var(--priority-medium);
}

.priority-badge--low .priority-badge__dot {
  background: var(--priority-low);
}

.priority-badge--none .priority-badge__dot {
  background: var(--priority-none);
}
</style>
