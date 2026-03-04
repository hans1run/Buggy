import { ref, watch, computed } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'

// Shared token refresh function accessible outside Vue components (e.g. API interceptor)
let _getAccessTokenSilently: (() => Promise<string>) | null = null

export function getTokenSilently(): Promise<string> | null {
  return _getAccessTokenSilently?.() ?? null
}

export const useAuth0Service = () => {
  const {
    loginWithRedirect,
    logout: auth0Logout,
    user: auth0User,
    isAuthenticated,
    isLoading,
    getAccessTokenSilently
  } = useAuth0()

  _getAccessTokenSilently = getAccessTokenSilently

  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const error = ref<string | null>(null)

  watch(
    [isAuthenticated, isLoading, auth0User],
    async ([authenticated, authLoading]) => {
      if (authLoading) return
      if (!authenticated) return

      try {
        const accessToken = await getAccessTokenSilently()
        token.value = accessToken
        localStorage.setItem('auth_token', accessToken)
      } catch (err) {
        error.value = 'Failed to get access token'
        console.error(err)
      }
    },
    { immediate: true }
  )

  const login = () => loginWithRedirect()

  const logout = () => {
    localStorage.removeItem('auth_token')
    auth0Logout({ logoutParams: { returnTo: window.location.origin } })
  }

  const refreshToken = async () => {
    const accessToken = await getAccessTokenSilently()
    token.value = accessToken
    localStorage.setItem('auth_token', accessToken)
    return accessToken
  }

  return {
    user: computed(() => auth0User.value),
    isAuthenticated,
    isLoading,
    error: computed(() => error.value),
    token: computed(() => token.value),
    login,
    logout,
    refreshToken
  }
}
