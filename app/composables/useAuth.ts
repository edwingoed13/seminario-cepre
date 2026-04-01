export const useAuth = () => {
  const demoUser = useState<any>('demo-user', () => null)
  const supabase = useSupabaseClient()
  const supabaseUser = useSupabaseUser()

  const isDemoMode = () => {
    const config = useRuntimeConfig()
    return !config.public.supabase?.url || config.public.supabase.url.includes('placeholder')
  }

  const user = computed(() => isDemoMode() ? demoUser.value : supabaseUser.value)
  const isAuthenticated = computed(() => !!user.value)

  const login = async (dni: string, password: string) => {
    if (isDemoMode()) {
      if (password === 'demo' || password === '123456') {
        demoUser.value = {
          id: 'demo-user-id',
          email: `${dni}@cepreuna.edu.pe`,
          user_metadata: { nombre: 'Estudiante Demo', dni },
        }
        return demoUser.value
      }
      throw new Error('En modo demo usa contraseña: demo')
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: `${dni}@cepreuna.edu.pe`,
      password,
    })
    if (error) throw error
    return data
  }

  const logout = async () => {
    if (isDemoMode()) {
      demoUser.value = null
      navigateTo('/login')
      return
    }
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    navigateTo('/login')
  }

  return { login, logout, user, isAuthenticated }
}
