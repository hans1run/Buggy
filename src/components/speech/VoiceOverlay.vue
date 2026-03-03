<script setup lang="ts">
defineProps<{
  statusMessage: string
  liveTranscript: string
  isListening: boolean
  state: string
  parsedType: string
  parsedTitle: string
}>()
defineEmits<{ cancel: [] }>()
</script>

<template>
  <Teleport to="body">
    <div class="voice-overlay" @click.self="$emit('cancel')">
      <div class="overlay-content">
        <div class="state-indicator" :class="{ listening: isListening }">
          <i class="pi pi-microphone" />
        </div>

        <div class="step-badges">
          <span class="step-badge" :class="{ active: state.includes('COMMAND') }">Command</span>
          <span class="step-badge" :class="{ active: state.includes('DESCRIPTION') }">Description</span>
          <span class="step-badge" :class="{ active: state.includes('PRIORITY') }">Priority</span>
        </div>

        <p class="status-text">{{ statusMessage }}</p>

        <p v-if="liveTranscript" class="transcript">"{{ liveTranscript }}"</p>

        <div v-if="parsedTitle" class="parsed-info">
          <span class="parsed-type">{{ parsedType }}</span>
          <span class="parsed-title">{{ parsedTitle }}</span>
        </div>

        <button class="cancel-btn" @click="$emit('cancel')">
          <i class="pi pi-times" /> Cancel
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.voice-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.88);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.overlay-content {
  text-align: center;
  color: white;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
}
.state-indicator {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  font-size: 2.5rem;
  transition: all 0.3s ease;
}
.state-indicator.listening {
  background: rgba(59, 130, 246, 0.2);
  animation: pulse-listen 1.5s infinite;
}
@keyframes pulse-listen {
  0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
  50% { box-shadow: 0 0 0 20px rgba(59, 130, 246, 0); }
}
.step-badges {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}
.step-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.step-badge.active {
  background: var(--accent-blue);
  color: white;
}
.status-text {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 1rem;
  line-height: 1.5;
}
.transcript {
  font-family: 'Space Mono', monospace;
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: white;
}
.parsed-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
}
.parsed-type {
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  background: var(--bug-red);
  color: white;
}
.parsed-title {
  font-size: 1rem;
  font-weight: 500;
}
.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
