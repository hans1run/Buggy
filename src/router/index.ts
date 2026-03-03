import { createRouter, createWebHistory } from 'vue-router'

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

  if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
    next()
    return
  }

  const token = localStorage.getItem('auth_token')
  if (!token) {
    next({ name: 'login' })
    return
  }

  next()
})

export default router
