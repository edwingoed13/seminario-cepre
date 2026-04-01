<script setup lang="ts">
const props = defineProps<{
  userName?: string
  userFoto?: string | null
  showNav?: boolean
  activeRoute?: string
}>()

const { logout } = useAuth()
</script>

<template>
  <header class="fixed top-0 w-full z-50 glassmorphic">
    <nav class="flex justify-between items-center w-full px-8 py-4">
      <NuxtLink to="/dashboard" class="flex items-center gap-3">
        <span class="material-symbols-outlined text-primary text-2xl">school</span>
        <span class="text-xl font-black text-primary tracking-tighter">CEPREUNA</span>
      </NuxtLink>

      <div v-if="showNav !== false" class="hidden md:flex items-center gap-8">
        <NuxtLink
          to="/dashboard"
          class="font-headline transition-colors px-4 py-2 rounded-xl"
          :class="activeRoute === 'dashboard' ? 'text-primary font-bold' : 'text-slate-600 hover:bg-surface-container-low'"
        >
          Inicio
        </NuxtLink>
        <NuxtLink
          to="/dashboard"
          class="font-headline transition-colors px-4 py-2 rounded-xl"
          :class="activeRoute === 'cursos' ? 'text-primary font-bold' : 'text-slate-600 hover:bg-surface-container-low'"
        >
          Cursos
        </NuxtLink>
      </div>

      <div class="flex items-center gap-4">
        <div v-if="userName" class="text-right hidden sm:block">
          <p class="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Estudiante</p>
          <p class="text-sm font-bold text-on-surface">{{ userName }}</p>
        </div>
        <img
          v-if="userFoto"
          :src="userFoto"
          :alt="userName"
          class="w-10 h-10 rounded-full object-cover border-2 border-primary/20"
          referrerpolicy="no-referrer"
        />
        <div v-else class="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-white">
          <span class="material-symbols-outlined text-sm">person</span>
        </div>
        <button
          @click="logout"
          class="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-secondary hover:bg-error hover:text-white transition-colors"
          title="Cerrar sesión"
        >
          <span class="material-symbols-outlined text-sm">logout</span>
        </button>
      </div>
    </nav>
  </header>
</template>
