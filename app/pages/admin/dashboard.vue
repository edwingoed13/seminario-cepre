<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const supabase = useSupabaseClient()

const stats = ref({ cursos: 0, videos: 0, quizzes: 0, materiales: 0 })

onMounted(async () => {
  const [cursos, videos, quizzes, materiales] = await Promise.all([
    supabase.from('cursos').select('*', { count: 'exact', head: true }),
    supabase.from('videos').select('*', { count: 'exact', head: true }),
    supabase.from('quizzes').select('*', { count: 'exact', head: true }),
    supabase.from('materiales').select('*', { count: 'exact', head: true }),
  ])
  stats.value = {
    cursos: cursos.count || 0,
    videos: videos.count || 0,
    quizzes: quizzes.count || 0,
    materiales: materiales.count || 0,
  }
})

const cards = computed(() => [
  { label: 'Cursos', value: stats.value.cursos, icon: 'i-lucide-book-open', color: 'bg-blue-500', to: '/admin/cursos' },
  { label: 'Videos', value: stats.value.videos, icon: 'i-lucide-video', color: 'bg-purple-500', to: '/admin/videos' },
  { label: 'Quizzes', value: stats.value.quizzes, icon: 'i-lucide-clipboard-list', color: 'bg-amber-500', to: '/admin/quizzes' },
  { label: 'Materiales', value: stats.value.materiales, icon: 'i-lucide-file-text', color: 'bg-emerald-500', to: '/admin/materiales' },
])
</script>

<template>
  <div>
    <div class="mb-6 md:mb-8">
      <h1 class="text-2xl md:text-3xl font-extrabold tracking-tight font-headline">Dashboard</h1>
      <p class="text-slate-500 text-sm md:text-base mt-1">Resumen general del panel de administración</p>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
      <NuxtLink v-for="card in cards" :key="card.label" :to="card.to">
        <UCard
          :ui="{
            root: 'h-full transition-shadow hover:shadow-md cursor-pointer',
            body: 'p-4 md:p-6',
          }"
        >
          <div class="flex items-center justify-between mb-3 md:mb-4">
            <div :class="[card.color, 'w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center']">
              <UIcon :name="card.icon" class="text-white text-xl md:text-2xl" />
            </div>
            <UIcon name="i-lucide-arrow-right" class="text-slate-300" />
          </div>
          <p class="text-2xl md:text-3xl font-black text-slate-800">{{ card.value }}</p>
          <p class="text-xs md:text-sm text-slate-500 font-semibold mt-1">{{ card.label }}</p>
        </UCard>
      </NuxtLink>
    </div>
  </div>
</template>
