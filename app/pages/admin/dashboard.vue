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
  { label: 'Cursos', value: stats.value.cursos, icon: 'school', color: 'bg-blue-500', to: '/admin/cursos' },
  { label: 'Videos', value: stats.value.videos, icon: 'videocam', color: 'bg-purple-500', to: '/admin/videos' },
  { label: 'Quizzes', value: stats.value.quizzes, icon: 'quiz', color: 'bg-amber-500', to: '/admin/quizzes' },
  { label: 'Materiales', value: stats.value.materiales, icon: 'description', color: 'bg-emerald-500', to: '/admin/materiales' },
])
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-extrabold tracking-tight font-headline">Dashboard</h1>
      <p class="text-slate-500 mt-1">Resumen general del panel de administración</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <NuxtLink
        v-for="card in cards"
        :key="card.label"
        :to="card.to"
        class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-slate-100"
      >
        <div class="flex items-center justify-between mb-4">
          <div :class="[card.color, 'w-12 h-12 rounded-lg flex items-center justify-center']">
            <span class="material-symbols-outlined text-white">{{ card.icon }}</span>
          </div>
          <span class="material-symbols-outlined text-slate-300">arrow_forward</span>
        </div>
        <p class="text-3xl font-black text-slate-800">{{ card.value }}</p>
        <p class="text-sm text-slate-500 font-semibold mt-1">{{ card.label }}</p>
      </NuxtLink>
    </div>
  </div>
</template>
