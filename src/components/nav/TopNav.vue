<template>
  <header class="topnav">
    <div class="topnav__left">
      <span class="topnav__logo">
        <span class="topnav__logo-icon">&#x1fab2;</span>
        <span class="topnav__logo-text">Buggy</span>
      </span>
      <Select
        v-model="selectedProjectId"
        :options="projectOptions"
        optionLabel="label"
        optionValue="value"
        placeholder="Select project"
        class="topnav__project-select"
        :loading="projectStore.isLoading"
      />
    </div>
    <div class="topnav__right">
      <Button
        label="Create Item"
        icon="pi pi-plus"
        class="topnav__create-btn"
        size="small"
        @click="$emit('create-item')"
      />
      <Button
        icon="pi pi-sign-out"
        severity="secondary"
        text
        rounded
        aria-label="Logout"
        @click="auth.logout"
        class="topnav__logout-btn"
      />
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import Button from 'primevue/button'
import Select from 'primevue/select'
import { useProjectStore } from '../../stores/project'
import { useAuth0Service } from '../../services/auth0-service'
import { useRouter } from 'vue-router'

defineEmits<{
  'create-item': []
}>()

const projectStore = useProjectStore()
const auth = useAuth0Service()
const router = useRouter()

const projectOptions = computed(() =>
  projectStore.projects.map(p => ({ label: p.name, value: p.id }))
)

const selectedProjectId = computed({
  get: () => projectStore.currentProjectId,
  set: (val: string | null) => {
    if (val) {
      projectStore.setCurrentProject(val)
      router.push({ name: 'board', params: { projectId: val } })
    }
  }
})

watch(
  () => projectStore.currentProjectId,
  () => {
    // Keep in sync
  }
)
</script>

<style scoped>
.topnav {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-surface);
  border-bottom: 1px solid #e5e7eb;
  padding: 0 1.25rem;
  height: 56px;
  box-shadow: var(--shadow-sm);
}

.topnav__left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.topnav__logo {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  text-decoration: none;
  flex-shrink: 0;
}

.topnav__logo-icon {
  font-size: 1.25rem;
  line-height: 1;
}

.topnav__logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--accent-blue);
  letter-spacing: -0.01em;
}

.topnav__project-select {
  min-width: 180px;
}

.topnav__right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.topnav__logout-btn {
  color: var(--text-secondary);
}

/* Mobile */
@media (max-width: 640px) {
  .topnav {
    padding: 0 0.75rem;
  }

  .topnav__project-select {
    min-width: 120px;
    max-width: 150px;
  }

  .topnav__create-btn :deep(.p-button-label) {
    display: none;
  }
}
</style>
