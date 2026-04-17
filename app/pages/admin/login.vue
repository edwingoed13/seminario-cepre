<script setup lang="ts">
definePageMeta({ layout: 'default' })

const supabase = useSupabaseClient()

const state = reactive({
  email: '',
  password: '',
})

const showPassword = ref(false)
const loading = ref(false)
const errorMsg = ref('')

const handleLogin = async () => {
  errorMsg.value = ''
  loading.value = true
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: state.email,
      password: state.password,
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
  <main class="min-h-screen flex items-center justify-center px-4 py-8 md:px-8 md:py-12">
    <div class="max-w-md w-full">
      <!-- Logo -->
      <div class="flex flex-col items-center mb-8 md:mb-10">
        <div class="w-16 h-16 md:w-20 md:h-20 bg-slate-800 rounded-2xl flex items-center justify-center mb-5 md:mb-6 shadow-lg">
          <UIcon name="i-lucide-shield-check" class="text-white text-3xl md:text-4xl" />
        </div>
        <h1 class="font-headline font-black text-2xl md:text-3xl tracking-tighter text-slate-800 mb-2">Panel Admin</h1>
        <p class="font-body text-on-surface-variant text-center text-xs md:text-sm tracking-wide">
          CEPREUNA — Gestión de Seminarios
        </p>
      </div>

      <!-- Card -->
      <UCard :ui="{ body: 'p-6 md:p-8' }">
        <div class="mb-6">
          <span class="font-label font-bold text-[0.7rem] uppercase tracking-widest text-on-surface-variant block mb-1">Administrador</span>
          <h2 class="font-headline font-bold text-xl md:text-2xl text-on-surface">Iniciar Sesión</h2>
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
          <UFormField label="Correo electrónico" name="email" required>
            <UInput
              v-model="state.email"
              type="email"
              placeholder="admin@cepreuna.edu.pe"
              icon="i-lucide-mail"
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

          <UButton
            type="submit"
            :loading="loading"
            color="neutral"
            size="xl"
            block
            :label="loading ? 'Ingresando...' : 'Ingresar'"
            :ui="{ base: 'bg-slate-800 hover:bg-slate-700 text-white' }"
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
