interface UserData {
  id: number
  nombres: string
  paterno: string
  materno: string
  dni: string
  foto: string | null
}

export const useAuth = () => {
  const user = useState<UserData | null>('auth-user', () => null)
  const isAuthenticated = computed(() => !!user.value)

  const fetchUser = async () => {
    try {
      const headers = import.meta.server ? useRequestHeaders(['cookie']) : {}
      user.value = await $fetch<UserData>('/api/auth/me', { headers })
    } catch {
      user.value = null
    }
  }

  const login = async (dni: string, password: string, remember: boolean = true) => {
    const data = await $fetch<UserData>('/api/auth/login', {
      method: 'POST',
      body: { dni, password, remember },
    })
    user.value = data
    return data
  }

  const logout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    navigateTo('/login')
  }

  return { login, logout, user, isAuthenticated, fetchUser }
}
