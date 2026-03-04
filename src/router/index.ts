import { createRouter, createWebHistory } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'
import { watch } from 'vue'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    redirect: '/projects'
  },
  {
    path: '/projects/:projectId/board',
    name: 'board',
    component: () => import('../views/BoardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/projects/:projectId/items/:number',
    name: 'item-detail',
    component: () => import('../views/BoardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/projects/:projectId/archive',
    name: 'archive',
    component: () => import('../views/ArchiveView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/projects',
    name: 'projects',
    component: () => import('../views/BoardView.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, _from, next) => {
  if (to.meta.requiresAuth === false) {
    next()
    return
  }

  const { isAuthenticated, isLoading } = useAuth0()

  // Wait for Auth0 SDK to finish processing (e.g. callback redirect)
  if (isLoading.value) {
    await new Promise<void>((resolve) => {
      const stop = watch(isLoading, (loading) => {
        if (!loading) {
          stop()
          resolve()
        }
      })
    })
  }

  if (isAuthenticated.value) {
    next()
    return
  }

  // Fallback: check localStorage for existing token (e.g. page refresh)
  if (localStorage.getItem('auth_token')) {
    next()
    return
  }

  next({ name: 'login' })
})

export default router
