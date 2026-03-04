<template>
  <div
    class="card"
    :class="[`card--${item.type.toLowerCase()}`]"
    :data-item-number="item.itemNumber"
    @click="$emit('click', item)"
  >
    <div class="card__header">
      <span class="card__number">#{{ item.itemNumber }}</span>
      <TypeBadge :type="item.type" />
    </div>
    <h4 class="card__title">{{ item.title }}</h4>
    <div class="card__footer">
      <PriorityBadge :priority="item.priority" />
      <div class="card__tags" v-if="item.tags && item.tags.length > 0">
        <span class="card__tag" v-for="tag in item.tags.slice(0, 3)" :key="tag">
          {{ tag }}
        </span>
        <span class="card__tag card__tag--more" v-if="item.tags.length > 3">
          +{{ item.tags.length - 3 }}
        </span>
      </div>
    </div>
    <div class="card__meta" v-if="item.assignedTo || item.commentCount > 0 || item.attachmentCount > 0">
      <span class="card__assignee" v-if="item.assignedTo">
        <i class="pi pi-user"></i> {{ item.assignedTo }}
      </span>
      <span class="card__counts">
        <span v-if="item.commentCount > 0" class="card__count">
          <i class="pi pi-comment"></i> {{ item.commentCount }}
        </span>
        <span v-if="item.attachmentCount > 0" class="card__count">
          <i class="pi pi-paperclip"></i> {{ item.attachmentCount }}
        </span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BacklogItem } from '../../types'
import TypeBadge from '../common/TypeBadge.vue'
import PriorityBadge from '../common/PriorityBadge.vue'

defineProps<{
  item: BacklogItem
}>()

defineEmits<{
  click: [item: BacklogItem]
}>()
</script>

<style scoped>
.card {
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  padding: 0.75rem;
  box-shadow: var(--shadow-sm);
  border-left: 3px solid transparent;
  cursor: grab;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  user-select: none;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.card:active {
  cursor: grabbing;
}

.card--bug {
  border-left-color: var(--bug-red);
}

.card--feature {
  border-left-color: var(--feature-green);
}

.card--task {
  border-left-color: var(--task-blue);
}

.card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.35rem;
}

.card__number {
  font-family: 'Space Mono', monospace;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.card__title {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.35;
  margin-bottom: 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card__footer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.card__tags {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.card__tag {
  font-size: 0.65rem;
  font-weight: 500;
  padding: 1px 6px;
  border-radius: 999px;
  background: #f1f5f9;
  color: var(--text-secondary);
  white-space: nowrap;
}

.card__tag--more {
  background: #e2e8f0;
}

.card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.5rem;
  padding-top: 0.4rem;
  border-top: 1px solid #f1f5f9;
}

.card__assignee {
  font-size: 0.7rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.card__assignee .pi {
  font-size: 0.65rem;
}

.card__counts {
  display: flex;
  gap: 0.5rem;
}

.card__count {
  font-size: 0.7rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 0.2rem;
}

.card__count .pi {
  font-size: 0.6rem;
}
</style>
