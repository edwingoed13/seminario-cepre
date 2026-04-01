<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { login, user } = useAuth()

const dni = ref('')
const password = ref('')
const showPassword = ref(false)
const remember = ref(false)
const loading = ref(false)
const errorMsg = ref('')

watchEffect(() => {
  if (user.value) navigateTo('/dashboard')
})

const handleLogin = async () => {
  errorMsg.value = ''
  loading.value = true
  try {
    await login(dni.value, password.value)
    navigateTo('/dashboard')
  } catch (e: any) {
    errorMsg.value = e?.message || 'Credenciales incorrectas. Verifica tu DNI y contraseña.'
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
        <div class="w-20 h-20 bg-primary-container rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
          <span class="material-symbols-outlined text-white text-4xl">school</span>
        </div>
        <h1 class="font-headline font-black text-3xl tracking-tighter text-primary mb-2">CEPREUNA</h1>
        <p class="font-body text-secondary text-center text-sm tracking-wide">
          CENTRO PREUNIVERSITARIO DE LA UNIVERSIDAD NACIONAL DEL ALTIPLANO
        </p>
      </div>

      <!-- Card -->
      <div class="bg-surface-container-lowest p-8 md:p-10 rounded-[1.5rem] shadow-[0_8px_24px_rgba(26,28,28,0.06)]">
        <div class="mb-8">
          <span class="font-label font-bold text-[0.75rem] uppercase tracking-widest text-primary block mb-1">Bienvenido</span>
          <h2 class="font-headline font-bold text-2xl text-on-surface">Acceso de Estudiante</h2>
        </div>

        <!-- Error -->
        <div v-if="errorMsg" class="mb-6 p-4 bg-error-container text-on-error-container rounded-lg text-sm font-body">
          {{ errorMsg }}
        </div>

        <form class="space-y-6" @submit.prevent="handleLogin">
          <!-- DNI -->
          <div>
            <label class="block font-label font-semibold text-xs text-secondary mb-2 px-1" for="dni">Usuario / DNI</label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-secondary">
                <span class="material-symbols-outlined text-[20px]">badge</span>
              </div>
              <input
                id="dni"
                v-model="dni"
                type="text"
                placeholder="Ingresa tu documento"
                required
                class="w-full bg-surface-container-high border-none rounded-lg py-4 pl-12 pr-4 text-on-surface font-body focus:ring-0 border-b-2 border-transparent transition-all"
              />
              <div class="absolute bottom-0 left-0 h-[2px] w-0 bg-primary transition-all duration-300 group-focus-within:w-full"></div>
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
                class="absolute inset-y-0 right-0 pr-4 flex items-center text-secondary hover:text-primary transition-colors"
                @click="showPassword = !showPassword"
              >
                <span class="material-symbols-outlined text-[20px]">
                  {{ showPassword ? 'visibility_off' : 'visibility' }}
                </span>
              </button>
              <div class="absolute bottom-0 left-0 h-[2px] w-0 bg-primary transition-all duration-300 group-focus-within:w-full"></div>
            </div>
          </div>

          <!-- Remember + Forgot -->
          <div class="flex items-center justify-between pt-2">
            <div class="flex items-center">
              <input
                id="remember"
                v-model="remember"
                type="checkbox"
                class="h-4 w-4 text-primary focus:ring-primary border-outline-variant rounded-sm"
              />
              <label class="ml-2 block text-sm text-secondary font-body" for="remember">Recordar sesión</label>
            </div>
            <a class="text-sm font-semibold text-primary hover:text-primary-container transition-colors font-body" href="#">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-primary text-on-primary font-headline font-bold text-lg py-4 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-container active:scale-[0.98] transition-all duration-200 mt-4 disabled:opacity-60"
          >
            {{ loading ? 'Ingresando...' : 'Ingresar' }}
          </button>
        </form>

        <!-- Support -->
        <div class="mt-8 pt-8 border-t border-surface-variant flex flex-col items-center gap-4">
          <p class="text-sm text-secondary font-body">¿Problemas con tu acceso?</p>
          <button class="flex items-center gap-2 px-6 py-2 rounded-full border border-outline-variant text-on-surface-variant font-label font-semibold text-xs uppercase tracking-wider hover:bg-surface-container transition-colors">
            <span class="material-symbols-outlined text-sm">support_agent</span>
            Contactar Soporte
          </button>
        </div>
      </div>

      <!-- Footer info -->
      <div class="mt-12 grid grid-cols-2 gap-4">
        <div class="bg-surface-container-low p-4 rounded-xl flex items-center gap-3">
          <div class="w-10 h-10 bg-tertiary/10 rounded-lg flex items-center justify-center text-tertiary">
            <span class="material-symbols-outlined">calendar_month</span>
          </div>
          <div>
            <p class="text-[10px] text-secondary font-label uppercase tracking-tighter">Ciclo Actual</p>
            <p class="text-xs font-bold text-on-surface">2024 - II</p>
          </div>
        </div>
        <div class="bg-surface-container-low p-4 rounded-xl flex items-center gap-3">
          <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
            <span class="material-symbols-outlined">hub</span>
          </div>
          <div>
            <p class="text-[10px] text-secondary font-label uppercase tracking-tighter">Sede Central</p>
            <p class="text-xs font-bold text-on-surface">Puno, Perú</p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <footer class="mt-12 text-center">
        <p class="text-[10px] text-secondary-fixed-dim font-label uppercase tracking-[0.2em] mb-4">
          © 2024 UNIVERSIDAD NACIONAL DEL ALTIPLANO
        </p>
        <div class="flex justify-center gap-6">
          <a class="text-secondary hover:text-primary transition-colors" href="#">
            <span class="material-symbols-outlined text-[20px]">language</span>
          </a>
          <a class="text-secondary hover:text-primary transition-colors" href="#">
            <span class="material-symbols-outlined text-[20px]">social_leaderboard</span>
          </a>
          <a class="text-secondary hover:text-primary transition-colors" href="#">
            <span class="material-symbols-outlined text-[20px]">help</span>
          </a>
        </div>
      </footer>
    </div>

    <!-- Decorative -->
    <div class="fixed top-0 right-0 p-8 hidden lg:block opacity-20 pointer-events-none">
      <span class="material-symbols-outlined text-[240px] text-primary" style="font-variation-settings: 'FILL' 1;">school</span>
    </div>
  </main>
</template>
