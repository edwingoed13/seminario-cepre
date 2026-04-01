<script setup lang="ts">
const props = defineProps<{
  id: string
  nombre: string
  descripcion: string
  nivel: string
  icono: string
}>()
</script>

<template>
  <NuxtLink :to="`/curso/${id}`" class="group cursor-pointer block">
    <div class="bg-surface-container-lowest rounded-xl p-6 shadow-[0_8px_24px_rgba(0,0,0,0.02)] hover:shadow-xl hover:shadow-red-900/5 transition-all duration-300 border border-transparent hover:border-outline-variant/30 relative overflow-hidden h-full flex flex-col">
      <div class="w-14 h-14 bg-red-50 rounded-lg flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
        <span class="material-symbols-outlined text-3xl">{{ icono }}</span>
      </div>
      <h3 class="text-2xl font-bold text-on-surface mb-2">{{ nombre }}</h3>
      <p class="text-secondary text-sm mb-6 flex-grow">{{ descripcion }}</p>
      <div class="flex items-center justify-between mt-auto">
        <span class="text-xs font-bold px-3 py-1 bg-surface-container text-secondary rounded-full">{{ nivel }}</span>
        <span class="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all">arrow_forward</span>
      </div>
      <div class="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full translate-x-8 -translate-y-8"></div>
    </div>
  </NuxtLink>
</template>
