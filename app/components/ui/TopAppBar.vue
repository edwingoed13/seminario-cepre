<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const props = defineProps<{
  userName?: string
  userFoto?: string | null
  showNav?: boolean
  activeRoute?: string
}>()

const route = useRoute()
const { logout } = useAuth()
const { fetchCursos, cursos } = useCursos()

const menuOpen = ref(false)
const cursosMobileOpen = ref(true)

onMounted(() => {
  fetchCursos().catch(() => {})
})

watch(() => route.fullPath, () => { menuOpen.value = false })

const iconForCurso = (nombre?: string) => {
  const n = (nombre || '').toLowerCase()
  if (n.includes('quechua')) return 'i-lucide-mountain'
  if (n.includes('aimara') || n.includes('aymara')) return 'i-lucide-sun'
  if (n.includes('ingl')) return 'i-lucide-globe'
  return 'i-lucide-book-open'
}

const cursosDropdown = computed<DropdownMenuItem[][]>(() => [
  cursos.value.map((curso: any) => ({
    label: curso.nombre,
    icon: iconForCurso(curso.nombre),
    to: `/curso/${curso.id}`,
  })),
])

const handleLogout = async () => {
  menuOpen.value = false
  await logout()
}
</script>

<template>
  <header class="fixed top-0 w-full z-50 glassmorphic">
    <nav class="flex justify-between items-center w-full px-4 md:px-8 py-3 md:py-4 gap-2">
      <!-- Mobile: hamburger -->
      <UButton
        v-if="showNav !== false"
        icon="i-lucide-menu"
        color="neutral"
        variant="ghost"
        size="md"
        class="md:hidden"
        aria-label="Abrir menú"
        @click="menuOpen = true"
      />

      <NuxtLink to="/dashboard" class="flex items-center gap-2 md:gap-3 flex-1 md:flex-initial">
        <UIcon name="i-lucide-graduation-cap" class="text-primary text-2xl" />
        <span class="text-base md:text-xl font-black text-primary tracking-tighter">CEPREUNA</span>
      </NuxtLink>

      <!-- Desktop nav -->
      <div v-if="showNav !== false" class="hidden md:flex items-center gap-2">
        <UButton
          to="/dashboard"
          :variant="activeRoute === 'dashboard' ? 'soft' : 'ghost'"
          :color="activeRoute === 'dashboard' ? 'primary' : 'neutral'"
          size="md"
        >
          Inicio
        </UButton>

        <UDropdownMenu :items="cursosDropdown" :content="{ align: 'end' }">
          <UButton
            :variant="activeRoute === 'cursos' ? 'soft' : 'ghost'"
            :color="activeRoute === 'cursos' ? 'primary' : 'neutral'"
            size="md"
            trailing-icon="i-lucide-chevron-down"
          >
            Cursos
          </UButton>
        </UDropdownMenu>
      </div>

      <!-- Right: user info + logout -->
      <div class="flex items-center gap-2 md:gap-3">
        <div v-if="userName" class="text-right hidden sm:block">
          <p class="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest leading-none mb-1">Estudiante</p>
          <p class="text-sm font-bold text-on-surface">{{ userName }}</p>
        </div>
        <UAvatar
          :src="userFoto || undefined"
          :alt="userName"
          icon="i-lucide-user"
          size="md"
          :ui="{ root: 'ring-2 ring-primary/20' }"
        />
        <UButton
          icon="i-lucide-log-out"
          color="neutral"
          variant="ghost"
          size="md"
          class="hidden md:inline-flex"
          aria-label="Cerrar sesión"
          @click="logout"
        />
      </div>
    </nav>
  </header>

  <!-- Mobile drawer -->
  <UDrawer
    v-model:open="menuOpen"
    direction="left"
    :handle="false"
    :ui="{ content: 'w-[82%] max-w-sm' }"
  >
    <template #content>
      <div class="flex flex-col h-full bg-surface-container-lowest">
        <!-- Header -->
        <div class="px-5 pt-6 pb-5 bg-gradient-to-br from-primary to-cepreuna-400 text-white">
          <div class="flex items-center justify-between mb-5">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-graduation-cap" class="text-2xl" />
              <span class="text-lg font-black tracking-tighter">CEPREUNA</span>
            </div>
            <UButton
              icon="i-lucide-x"
              color="neutral"
              variant="ghost"
              size="sm"
              :ui="{ base: 'bg-white/15 text-white hover:bg-white/25' }"
              aria-label="Cerrar menú"
              @click="menuOpen = false"
            />
          </div>
          <div class="flex items-center gap-3">
            <UAvatar
              :src="userFoto || undefined"
              :alt="userName"
              icon="i-lucide-user"
              size="lg"
              :ui="{ root: 'ring-2 ring-white/30' }"
            />
            <div class="flex-grow min-w-0">
              <p class="text-[10px] font-bold uppercase tracking-widest opacity-80">Estudiante</p>
              <p class="text-sm font-bold truncate">{{ userName }}</p>
            </div>
          </div>
        </div>

        <!-- Nav -->
        <nav class="flex-grow overflow-y-auto p-3 space-y-1">
          <UButton
            to="/dashboard"
            :variant="activeRoute === 'dashboard' ? 'soft' : 'ghost'"
            :color="activeRoute === 'dashboard' ? 'primary' : 'neutral'"
            size="lg"
            icon="i-lucide-home"
            block
            :ui="{ base: 'justify-start' }"
          >
            Inicio
          </UButton>

          <UButton
            :variant="activeRoute === 'cursos' ? 'soft' : 'ghost'"
            :color="activeRoute === 'cursos' ? 'primary' : 'neutral'"
            size="lg"
            icon="i-lucide-book-open"
            block
            :trailing-icon="cursosMobileOpen ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
            :ui="{ base: 'justify-start', trailingIcon: 'ms-auto' }"
            @click="cursosMobileOpen = !cursosMobileOpen"
          >
            Cursos
          </UButton>

          <div v-show="cursosMobileOpen" class="ml-3 pl-3 border-l-2 border-outline-variant space-y-1">
            <UButton
              v-for="curso in cursos"
              :key="curso.id"
              :to="`/curso/${curso.id}`"
              :variant="route.path === `/curso/${curso.id}` ? 'soft' : 'ghost'"
              :color="route.path === `/curso/${curso.id}` ? 'primary' : 'neutral'"
              size="md"
              :icon="iconForCurso(curso.nombre)"
              block
              :ui="{ base: 'justify-start' }"
            >
              {{ curso.nombre }}
            </UButton>
          </div>
        </nav>

        <!-- Footer -->
        <div class="border-t border-outline-variant/30 p-3">
          <UButton
            icon="i-lucide-log-out"
            color="error"
            variant="ghost"
            size="lg"
            block
            :ui="{ base: 'justify-start' }"
            @click="handleLogout"
          >
            Cerrar sesión
          </UButton>
        </div>
      </div>
    </template>
  </UDrawer>
</template>
