<script setup lang="ts">
const props = defineProps<{
  active?: 'inicio' | 'cursos' | 'perfil'
}>()
</script>

<template>
  <nav class="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 py-3 bg-[#f9f9f9]/85 backdrop-blur-lg shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-t-[1.5rem] z-50 md:hidden">
    <NuxtLink
      to="/dashboard"
      class="flex flex-col items-center justify-center rounded-[1.5rem] px-6 py-2 active:scale-90 transition-transform duration-300"
      :class="active === 'inicio'
        ? 'bg-primary text-white shadow-lg shadow-red-900/20'
        : 'text-slate-500 hover:bg-surface-container-low'"
    >
      <span
        class="material-symbols-outlined"
        :style="active === 'inicio' ? `font-variation-settings: 'FILL' 1` : ''"
      >home</span>
      <span class="font-body font-semibold text-[10px] uppercase tracking-widest mt-1">Inicio</span>
    </NuxtLink>

    <NuxtLink
      to="/dashboard"
      class="flex flex-col items-center justify-center rounded-[1.5rem] px-4 py-2 active:scale-90 transition-transform duration-300"
      :class="active === 'cursos'
        ? 'bg-primary text-white shadow-lg shadow-red-900/20'
        : 'text-slate-500 hover:bg-surface-container-low'"
    >
      <span
        class="material-symbols-outlined"
        :style="active === 'cursos' ? `font-variation-settings: 'FILL' 1` : ''"
      >menu_book</span>
      <span class="font-body font-semibold text-[10px] uppercase tracking-widest mt-1">Cursos</span>
    </NuxtLink>

    <NuxtLink
      to="/dashboard"
      class="flex flex-col items-center justify-center rounded-[1.5rem] px-4 py-2 active:scale-90 transition-transform duration-300"
      :class="active === 'perfil'
        ? 'bg-primary text-white shadow-lg shadow-red-900/20'
        : 'text-slate-500 hover:bg-surface-container-low'"
    >
      <span class="material-symbols-outlined">person</span>
      <span class="font-body font-semibold text-[10px] uppercase tracking-widest mt-1">Perfil</span>
    </NuxtLink>
  </nav>
</template>
