<script setup lang="ts">
const route = useRoute()
const supabase = useSupabaseClient()
const menuOpen = ref(false)

const menuItems = [
  { to: '/admin/dashboard', icon: 'i-lucide-layout-dashboard', label: 'Dashboard' },
  { to: '/admin/cursos', icon: 'i-lucide-book-open', label: 'Cursos' },
  { to: '/admin/semanas', icon: 'i-lucide-calendar-days', label: 'Semanas' },
  { to: '/admin/videos', icon: 'i-lucide-video', label: 'Videos' },
  { to: '/admin/quizzes', icon: 'i-lucide-clipboard-list', label: 'Quizzes' },
  { to: '/admin/materiales', icon: 'i-lucide-file-text', label: 'Materiales' },
]

const isActive = (to: string) =>
  to === '/admin/dashboard' ? route.path === to : route.path.startsWith(to)

watch(() => route.fullPath, () => { menuOpen.value = false })

const handleLogout = async () => {
  await supabase.auth.signOut()
  navigateTo('/admin/login')
}
</script>

<template>
  <div class="bg-slate-50 text-slate-900 min-h-screen flex">
    <!-- Sidebar desktop -->
    <aside class="w-64 bg-slate-800 text-white flex-col fixed h-full z-40 hidden lg:flex">
      <div class="p-6 border-b border-slate-700">
        <div class="flex items-center gap-3">
          <UIcon name="i-lucide-shield-check" class="text-2xl" />
          <div>
            <h1 class="font-headline font-bold text-lg leading-tight">CEPREUNA</h1>
            <p class="text-[10px] text-slate-400 uppercase tracking-widest">Panel Admin</p>
          </div>
        </div>
      </div>

      <nav class="flex-1 p-3 space-y-1">
        <NuxtLink
          v-for="item in menuItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
          :class="isActive(item.to) ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'"
        >
          <UIcon :name="item.icon" class="text-lg" />
          <span class="text-sm font-semibold">{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <div class="p-3 border-t border-slate-700">
        <button
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors w-full"
          @click="handleLogout"
        >
          <UIcon name="i-lucide-log-out" class="text-lg" />
          <span class="text-sm font-semibold">Cerrar sesión</span>
        </button>
      </div>
    </aside>

    <!-- Mobile header -->
    <header class="lg:hidden fixed top-0 w-full z-50 bg-slate-800 text-white px-4 py-3 flex items-center justify-between shadow-lg">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-shield-check" />
        <span class="font-bold text-sm">CEPREUNA Admin</span>
      </div>
      <UButton
        icon="i-lucide-menu"
        color="neutral"
        variant="ghost"
        size="md"
        :ui="{ base: 'text-white hover:bg-white/10' }"
        aria-label="Abrir menú"
        @click="menuOpen = true"
      />
    </header>

    <!-- Mobile drawer -->
    <UDrawer
      v-model:open="menuOpen"
      direction="left"
      :handle="false"
      :ui="{ content: 'w-[82%] max-w-xs bg-slate-800 text-white' }"
    >
      <template #content>
        <div class="flex flex-col h-full">
          <div class="p-5 border-b border-slate-700 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-shield-check" class="text-xl" />
              <span class="font-bold">CEPREUNA Admin</span>
            </div>
            <UButton
              icon="i-lucide-x"
              color="neutral"
              variant="ghost"
              size="sm"
              :ui="{ base: 'text-white hover:bg-white/10' }"
              @click="menuOpen = false"
            />
          </div>

          <nav class="flex-1 p-3 space-y-1 overflow-y-auto">
            <NuxtLink
              v-for="item in menuItems"
              :key="item.to"
              :to="item.to"
              class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
              :class="isActive(item.to) ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'"
              @click="menuOpen = false"
            >
              <UIcon :name="item.icon" class="text-lg" />
              <span class="text-sm font-semibold">{{ item.label }}</span>
            </NuxtLink>
          </nav>

          <div class="p-3 border-t border-slate-700">
            <button
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white transition-colors w-full"
              @click="handleLogout"
            >
              <UIcon name="i-lucide-log-out" class="text-lg" />
              <span class="text-sm font-semibold">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </template>
    </UDrawer>

    <!-- Main -->
    <main class="flex-1 lg:ml-64 pt-16 lg:pt-0">
      <div class="p-4 md:p-6 lg:p-8 max-w-7xl">
        <slot />
      </div>
    </main>
  </div>
</template>
