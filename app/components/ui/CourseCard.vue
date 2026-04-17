<script setup lang="ts">
const props = defineProps<{
  id: string
  nombre: string
  descripcion: string
  icono?: string
}>()

const iconForCurso = (nombre: string) => {
  const n = nombre.toLowerCase()
  if (n.includes('quechua')) return 'i-lucide-mountain'
  if (n.includes('aimara') || n.includes('aymara')) return 'i-lucide-sun'
  if (n.includes('ingl')) return 'i-lucide-globe'
  return 'i-lucide-book-open'
}
</script>

<template>
  <NuxtLink :to="`/curso/${id}`" class="group block h-full">
    <UCard
      :ui="{
        root: 'h-full flex flex-col relative overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-0.5 group-hover:ring-primary/30',
        body: 'flex-grow flex flex-col',
      }"
    >
      <div class="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
        <UIcon :name="iconForCurso(nombre)" class="text-3xl" />
      </div>
      <h3 class="text-xl md:text-2xl font-bold text-on-surface mb-2 font-headline">{{ nombre }}</h3>
      <p v-if="descripcion" class="text-on-surface-variant text-sm mb-5 flex-grow leading-relaxed">{{ descripcion }}</p>
      <div class="flex items-center justify-between mt-auto pt-2">
        <span class="text-xs font-bold uppercase tracking-widest text-primary">Ver curso</span>
        <UIcon
          name="i-lucide-arrow-right"
          class="text-primary opacity-0 group-hover:opacity-100 translate-x-[-8px] group-hover:translate-x-0 transition-all"
        />
      </div>
      <div class="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full translate-x-8 -translate-y-8 pointer-events-none"></div>
    </UCard>
  </NuxtLink>
</template>
