import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import Aura from '@primevue/themes/aura'
import App from './App.vue'
import router from './router'
import { createAuth0 } from '@auth0/auth0-vue'

import 'primeicons/primeicons.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura
  }
})
app.use(ToastService)
app.use(
  createAuth0({
    domain: import.meta.env.VITE_AUTH0_DOMAIN || 'hans1.eu.auth0.com',
    clientId: import.meta.env.VITE_AUTH0_CLIENT_ID || '',
    authorizationParams: {
      redirect_uri: window.location.origin,
      audience: import.meta.env.VITE_AUTH0_AUDIENCE || 'plannerapi',
      scope: 'openid profile email'
    },
    cacheLocation: 'localstorage'
  })
)

app.mount('#app')
