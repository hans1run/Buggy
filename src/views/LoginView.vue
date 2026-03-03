<template>
  <div class="login-page">
    <div class="login-card" :class="{ 'login-card--visible': isVisible }">
      <div class="login-brand">
        <span class="login-icon">&#x1fab2;</span>
        <h1 class="login-title">Buggy</h1>
      </div>
      <p class="login-subtitle">Personal Bug Tracker</p>
      <p class="login-description">
        Track bugs, features, and tasks with a clean Kanban board.
      </p>
      <Button
        label="Sign in with Auth0"
        icon="pi pi-sign-in"
        class="login-button"
        :loading="auth.isLoading.value"
        @click="auth.login"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Button from 'primevue/button'
import { useAuth0Service } from '../services/auth0-service'

const auth = useAuth0Service()
const isVisible = ref(false)

onMounted(() => {
  requestAnimationFrame(() => {
    isVisible.value = true
  })
})
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e0e7ef 0%, #f0f4f8 50%, #dbeafe 100%);
  padding: 1rem;
}

.login-card {
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  padding: 3rem 2.5rem;
  box-shadow: var(--shadow-lg);
  text-align: center;
  max-width: 400px;
  width: 100%;
  opacity: 0;
  transform: translateY(20px) scale(0.97);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.login-card--visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.login-brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.login-icon {
  font-size: 2rem;
  line-height: 1;
}

.login-title {
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--accent-blue);
  letter-spacing: -0.02em;
}

.login-subtitle {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.login-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 2rem;
}

.login-button {
  width: 100%;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}
</style>
