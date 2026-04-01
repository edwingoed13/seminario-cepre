<template>
  <div class="bg-slate-50 text-slate-900 min-h-screen flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-slate-800 text-white flex flex-col fixed h-full z-40 hidden lg:flex">
      <div class="p-6 border-b border-slate-700">
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-2xl">admin_panel_settings</span>
          <div>
            <h1 class="font-headline font-bold text-lg leading-tight">CEPREUNA</h1>
            <p class="text-[10px] text-slate-400 uppercase tracking-widest">Panel Admin</p>
          </div>
        </div>
      </div>

      <nav class="flex-1 p-4 space-y-1">
        <NuxtLink
          to="/admin/dashboard"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
          :class="route.path === '/admin/dashboard' ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'"
        >
          <span class="material-symbols-outlined text-[20px]">dashboard</span>
          <span class="text-sm font-semibold">Dashboard</span>
        </NuxtLink>
        <NuxtLink
          to="/admin/cursos"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
          :class="route.path.startsWith('/admin/cursos') ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'"
        >
          <span class="material-symbols-outlined text-[20px]">school</span>
          <span class="text-sm font-semibold">Cursos</span>
        </NuxtLink>
        <NuxtLink
          to="/admin/semanas"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
          :class="route.path.startsWith('/admin/semanas') ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'"
        >
          <span class="material-symbols-outlined text-[20px]">date_range</span>
          <span class="text-sm font-semibold">Semanas</span>
        </NuxtLink>
        <NuxtLink
          to="/admin/videos"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
          :class="route.path.startsWith('/admin/videos') ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'"
        >
          <span class="material-symbols-outlined text-[20px]">videocam</span>
          <span class="text-sm font-semibold">Videos</span>
        </NuxtLink>
        <NuxtLink
          to="/admin/quizzes"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
          :class="route.path.startsWith('/admin/quizzes') ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'"
        >
          <span class="material-symbols-outlined text-[20px]">quiz</span>
          <span class="text-sm font-semibold">Quizzes</span>
        </NuxtLink>
        <NuxtLink
          to="/admin/materiales"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
          :class="route.path.startsWith('/admin/materiales') ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'"
        >
          <span class="material-symbols-outlined text-[20px]">description</span>
          <span class="text-sm font-semibold">Materiales</span>
        </NuxtLink>
      </nav>

      <div class="p-4 border-t border-slate-700">
        <button
          @click="handleLogout"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors w-full"
        >
          <span class="material-symbols-outlined text-[20px]">logout</span>
          <span class="text-sm font-semibold">Cerrar Sesión</span>
        </button>
      </div>
    </aside>

    <!-- Mobile header -->
    <header class="lg:hidden fixed top-0 w-full z-50 bg-slate-800 text-white px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined">admin_panel_settings</span>
        <span class="font-bold">CEPREUNA Admin</span>
      </div>
      <button @click="mobileMenu = !mobileMenu">
        <span class="material-symbols-outlined">{{ mobileMenu ? 'close' : 'menu' }}</span>
      </button>
    </header>

    <!-- Mobile menu overlay -->
    <div v-if="mobileMenu" class="lg:hidden fixed inset-0 z-40 bg-black/50" @click="mobileMenu = false">
      <aside class="w-64 bg-slate-800 text-white h-full pt-16 p-4 space-y-1" @click.stop>
        <NuxtLink v-for="item in menuItems" :key="item.to" :to="item.to" class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-colors" @click="mobileMenu = false">
          <span class="material-symbols-outlined text-[20px]">{{ item.icon }}</span>
          <span class="text-sm font-semibold">{{ item.label }}</span>
        </NuxtLink>
        <button @click="handleLogout" class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors w-full mt-4">
          <span class="material-symbols-outlined text-[20px]">logout</span>
          <span class="text-sm font-semibold">Cerrar Sesión</span>
        </button>
      </aside>
    </div>

    <!-- Main content -->
    <main class="flex-1 lg:ml-64 pt-16 lg:pt-0">
      <div class="p-6 lg:p-8 max-w-7xl">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const supabase = useSupabaseClient()
const mobileMenu = ref(false)

const menuItems = [
  { to: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/admin/cursos', icon: 'school', label: 'Cursos' },
  { to: '/admin/semanas', icon: 'date_range', label: 'Semanas' },
  { to: '/admin/videos', icon: 'videocam', label: 'Videos' },
  { to: '/admin/quizzes', icon: 'quiz', label: 'Quizzes' },
  { to: '/admin/materiales', icon: 'description', label: 'Materiales' },
]

const handleLogout = async () => {
  await supabase.auth.signOut()
  navigateTo('/admin/login')
}
</script>
