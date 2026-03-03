<script setup lang="ts">
defineProps<{ isActive: boolean; isSupported: boolean }>()
defineEmits<{ activate: [] }>()
</script>

<template>
  <button
    v-if="isSupported"
    class="speech-fab"
    :class="{ active: isActive }"
    @click="$emit('activate')"
    aria-label="Speech to bug"
  >
    <i :class="isActive ? 'pi pi-spin pi-spinner' : 'pi pi-microphone'" />
  </button>
</template>

<style scoped>
.speech-fab {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: var(--accent-blue);
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
  z-index: 200;
  box-shadow: var(--shadow-lg);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}
.speech-fab:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.4);
}
.speech-fab.active {
  background: var(--bug-red);
  animation: pulse-ring 1.5s infinite;
}
@keyframes pulse-ring {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
  50% { box-shadow: 0 0 0 16px rgba(239, 68, 68, 0); }
}
</style>
