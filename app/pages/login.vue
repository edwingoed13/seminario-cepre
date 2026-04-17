<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { login, user } = useAuth()

const state = reactive({
  dni: '',
  password: '',
  remember: true,
})

const showPassword = ref(false)
const loading = ref(false)
const errorMsg = ref('')

watchEffect(() => {
  if (user.value) navigateTo('/dashboard')
})

const handleLogin = async () => {
  errorMsg.value = ''
  loading.value = true
  try {
    await login(state.dni, state.password, state.remember)
    navigateTo('/dashboard')
  } catch (e: any) {
    errorMsg.value = e?.message || 'Credenciales incorrectas. Verifica tu DNI y contraseña.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="min-h-screen flex items-center justify-center px-4 py-8 md:px-8 md:py-12">
    <div class="max-w-md w-full">
      <!-- Logo -->
      <div class="flex flex-col items-center mb-8 md:mb-10">
        <div class="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-primary to-cepreuna-400 rounded-2xl flex items-center justify-center mb-5 md:mb-6 shadow-lg shadow-primary/20">
          <UIcon name="i-lucide-graduation-cap" class="text-white text-3xl md:text-4xl" />
        </div>
        <h1 class="font-headline font-black text-2xl md:text-3xl tracking-tighter text-primary mb-2">CEPREUNA</h1>
        <p class="font-body text-on-surface-variant text-center text-xs md:text-sm tracking-wide px-4">
          CENTRO PREUNIVERSITARIO DE LA UNIVERSIDAD NACIONAL DEL ALTIPLANO
        </p>
      </div>

      <!-- Card -->
      <UCard :ui="{ body: 'p-6 md:p-8' }">
        <div class="mb-6">
          <span class="font-label font-bold text-[0.7rem] uppercase tracking-widest text-primary block mb-1">Bienvenido al Panel de Idiomas</span>
          <h2 class="font-headline font-bold text-xl md:text-2xl text-on-surface">Acceso de Estudiante</h2>
        </div>

        <UAlert
          v-if="errorMsg"
          icon="i-lucide-triangle-alert"
          color="error"
          variant="soft"
          :title="errorMsg"
          class="mb-5"
        />

        <UForm :state="state" class="space-y-5" @submit="handleLogin">
          <UFormField label="Usuario / DNI" name="dni" required>
            <UInput
              v-model="state.dni"
              placeholder="Ingresa tu documento"
              icon="i-lucide-id-card"
              size="xl"
              class="w-full"
              :ui="{ root: 'w-full' }"
              required
            />
          </UFormField>

          <UFormField label="Contraseña" name="password" required>
            <UInput
              v-model="state.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              icon="i-lucide-lock"
              size="xl"
              class="w-full"
              :ui="{ root: 'w-full' }"
              required
            >
              <template #trailing>
                <UButton
                  :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  color="neutral"
                  variant="link"
                  size="sm"
                  :padded="false"
                  @click="showPassword = !showPassword"
                />
              </template>
            </UInput>
          </UFormField>

          <UCheckbox v-model="state.remember" label="Recordar sesión" />

          <UButton
            type="submit"
            :loading="loading"
            color="primary"
            size="xl"
            block
            :label="loading ? 'Ingresando...' : 'Ingresar'"
          />
        </UForm>
      </UCard>

      <!-- Footer -->
      <footer class="mt-8 md:mt-12 text-center px-4">
        <p class="text-[10px] text-on-surface-variant font-label uppercase tracking-[0.2em]">
          © 2026 UNIVERSIDAD NACIONAL DEL ALTIPLANO
        </p>
      </footer>
    </div>
  </main>
</template>
