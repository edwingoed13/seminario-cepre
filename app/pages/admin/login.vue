<script setup lang="ts">
definePageMeta({ layout: 'default' })

const supabase = useSupabaseClient()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMsg = ref('')

const handleLogin = async () => {
  errorMsg.value = ''
  loading.value = true
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })
    if (error) throw error
    navigateTo('/admin/dashboard')
  } catch (e: any) {
    errorMsg.value = e?.message || 'Credenciales incorrectas'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="flex-grow flex items-center justify-center px-8 py-12 min-h-screen">
    <div class="max-w-md w-full">
      <!-- Logo -->
      <div class="flex flex-col items-center mb-10">
        <div class="w-20 h-20 bg-slate-800 rounded-xl flex items-center justify-center mb-6 shadow-lg">
          <span class="material-symbols-outlined text-white text-4xl">admin_panel_settings</span>
        </div>
        <h1 class="font-headline font-black text-3xl tracking-tighter text-slate-800 mb-2">Panel Admin</h1>
        <p class="font-body text-secondary text-center text-sm tracking-wide">
          CEPREUNA — Gestión de Seminarios
        </p>
      </div>

      <!-- Card -->
      <div class="bg-surface-container-lowest p-8 md:p-10 rounded-[1.5rem] shadow-[0_8px_24px_rgba(26,28,28,0.06)]">
        <div class="mb-8">
          <span class="font-label font-bold text-[0.75rem] uppercase tracking-widest text-slate-500 block mb-1">Administrador</span>
          <h2 class="font-headline font-bold text-2xl text-on-surface">Iniciar Sesión</h2>
        </div>

        <!-- Error -->
        <div v-if="errorMsg" class="mb-6 p-4 bg-error-container text-on-error-container rounded-lg text-sm font-body">
          {{ errorMsg }}
        </div>

        <form class="space-y-6" @submit.prevent="handleLogin">
          <!-- Email -->
          <div>
            <label class="block font-label font-semibold text-xs text-secondary mb-2 px-1" for="email">Correo electrónico</label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-secondary">
                <span class="material-symbols-outlined text-[20px]">mail</span>
              </div>
              <input
                id="email"
                v-model="email"
                type="email"
                placeholder="admin@cepreuna.edu.pe"
                required
                class="w-full bg-surface-container-high border-none rounded-lg py-4 pl-12 pr-4 text-on-surface font-body focus:ring-0 border-b-2 border-transparent transition-all"
              />
              <div class="absolute bottom-0 left-0 h-[2px] w-0 bg-slate-800 transition-all duration-300 group-focus-within:w-full"></div>
            </div>
          </div>

          <!-- Password -->
          <div>
            <label class="block font-label font-semibold text-xs text-secondary mb-2 px-1" for="password">Contraseña</label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-secondary">
                <span class="material-symbols-outlined text-[20px]">lock</span>
              </div>
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                required
                class="w-full bg-surface-container-high border-none rounded-lg py-4 pl-12 pr-12 text-on-surface font-body focus:ring-0 border-b-2 border-transparent transition-all"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 pr-4 flex items-center text-secondary hover:text-slate-800 transition-colors"
                @click="showPassword = !showPassword"
              >
                <span class="material-symbols-outlined text-[20px]">
                  {{ showPassword ? 'visibility_off' : 'visibility' }}
                </span>
              </button>
              <div class="absolute bottom-0 left-0 h-[2px] w-0 bg-slate-800 transition-all duration-300 group-focus-within:w-full"></div>
            </div>
          </div>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-slate-800 text-white font-headline font-bold text-lg py-4 rounded-xl shadow-lg hover:bg-slate-700 active:scale-[0.98] transition-all duration-200 mt-4 disabled:opacity-60"
          >
            {{ loading ? 'Ingresando...' : 'Ingresar' }}
          </button>
        </form>
      </div>

      <!-- Footer -->
      <footer class="mt-12 text-center">
        <p class="text-[10px] text-secondary-fixed-dim font-label uppercase tracking-[0.2em]">
          © 2026 UNIVERSIDAD NACIONAL DEL ALTIPLANO
        </p>
      </footer>
    </div>
  </main>
</template>
