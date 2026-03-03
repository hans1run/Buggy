<template>
  <span class="type-badge" :class="`type-badge--${type.toLowerCase()}`">
    <span class="type-badge__icon">{{ icon }}</span>
    <span class="type-badge__label">{{ type }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { BacklogItemType } from '../../types'

const props = defineProps<{
  type: BacklogItemType
}>()

const icon = computed(() => {
  switch (props.type) {
    case BacklogItemType.Bug:
      return '\uD83D\uDC1B'
    case BacklogItemType.Feature:
      return '\u2728'
    case BacklogItemType.Task:
      return '\uD83D\uDCCB'
    default:
      return '\uD83D\uDCCB'
  }
})
</script>

<style scoped>
.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
  white-space: nowrap;
}

.type-badge__icon {
  font-size: 0.7rem;
  line-height: 1;
}

.type-badge--bug {
  background: #fef2f2;
  color: var(--bug-red);
}

.type-badge--feature {
  background: #ecfdf5;
  color: var(--feature-green);
}

.type-badge--task {
  background: #eef2ff;
  color: var(--task-blue);
}
</style>
