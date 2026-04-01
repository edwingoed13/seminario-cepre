<script setup lang="ts">
definePageMeta({ layout: 'auth', middleware: 'auth' })

const { fetchCursos } = useCursos()

const fallbackCursos = [
  { id: '1', nombre: 'Quechua', descripcion: 'Aprende la lengua de los Incas, enfocada en gramática andina y conversación.', nivel: 'Básico', icono: 'language_pinyin' },
  { id: '2', nombre: 'Aimara', descripcion: 'Estudio profundo de la fonética y estructura social del idioma Aimara contemporáneo.', nivel: 'Intermedio', icono: 'translate' },
  { id: '3', nombre: 'Inglés', descripcion: 'Preparación para exámenes internacionales y comunicación global efectiva.', nivel: 'Avanzado', icono: 'public' },
]

const cursos = ref<any[]>(fallbackCursos)
const loading = ref(false)

onMounted(() => {
  fetchCursos()
    .then(data => { if (data?.length) cursos.value = data })
    .catch(() => {})
})
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
      <!-- Welcome Card -->
      <div class="lg:col-span-8 bg-gradient-to-br from-primary to-primary-container rounded-xl p-8 text-on-primary flex flex-col justify-between relative overflow-hidden shadow-xl">
        <div class="relative z-10">
          <span class="text-xs font-bold uppercase tracking-[0.2em] opacity-80 mb-2 block">Ciclo Académico 2024-II</span>
          <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 font-headline">¡Hola de nuevo!</h1>
          <p class="text-lg opacity-90 max-w-md font-body leading-relaxed mb-8">
            Tienes una clase de <span class="font-bold underline decoration-2 underline-offset-4">Quechua Intermedio</span> comenzando en 15 minutos.
          </p>
          <button class="bg-surface-container-lowest text-primary px-8 py-4 rounded-xl font-bold flex items-center gap-2 active:scale-95 transition-transform duration-200">
            <span class="material-symbols-outlined">play_circle</span>
            Unirme a la Clase en Vivo
          </button>
        </div>
        <div class="absolute -right-16 -bottom-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <!-- Progress Card -->
      <div class="lg:col-span-4 bg-surface-container-lowest rounded-xl p-8 shadow-[0_8px_24px_rgba(26,28,28,0.04)] border border-outline-variant/10 flex flex-col items-center justify-center text-center">
        <div class="relative w-32 h-32 mb-6 flex items-center justify-center">
          <div class="progress-orbit absolute inset-0 opacity-10"></div>
          <div class="absolute inset-0 border-[6px] border-surface-container rounded-full"></div>
          <div class="absolute inset-0 border-[6px] border-primary rounded-full border-t-transparent border-l-transparent rotate-45"></div>
          <span class="text-3xl font-black text-on-surface">75%</span>
        </div>
        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Tu Progreso General</p>
        <h3 class="text-xl font-bold text-on-surface font-headline">Cerca de la Meta</h3>
        <p class="text-sm text-secondary mt-2">Has completado 12 de 16 módulos esta semana.</p>
      </div>
    </section>

    <!-- Courses -->
    <div class="mb-8">
      <span class="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-2 block">Mis Materias</span>
      <h2 class="text-3xl font-extrabold text-on-surface tracking-tight font-headline">Cursos Disponibles</h2>
    </div>

    <section v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 3" :key="i" class="bg-surface-container-lowest rounded-xl p-6 h-64 animate-pulse">
        <div class="w-14 h-14 bg-surface-container rounded-lg mb-6"></div>
        <div class="h-6 bg-surface-container rounded w-1/2 mb-2"></div>
        <div class="h-4 bg-surface-container rounded w-3/4"></div>
      </div>
    </section>

    <section v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UiCourseCard
        v-for="curso in cursos"
        :key="curso.id"
        :id="curso.id"
        :nombre="curso.nombre"
        :descripcion="curso.descripcion"
        :nivel="curso.nivel"
        :icono="curso.icono"
      />
    </section>

    <!-- Secondary Info -->
    <section class="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Evaluaciones -->
      <div class="bg-surface-container-low rounded-xl p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="font-bold text-lg font-headline">Próximas Evaluaciones</h3>
          <span class="text-primary font-bold text-sm cursor-pointer hover:underline">Ver Todo</span>
        </div>
        <div class="space-y-4">
          <div class="flex items-center gap-4 bg-surface-container-lowest p-4 rounded-lg">
            <div class="flex flex-col items-center justify-center bg-red-50 px-3 py-2 rounded">
              <span class="text-[10px] uppercase font-bold text-primary">Abr</span>
              <span class="text-xl font-black text-on-surface leading-none">11</span>
            </div>
            <div class="flex-grow">
              <h4 class="font-bold text-sm">Evaluación Semana 1 - Quechua</h4>
              <p class="text-xs text-secondary">10:20 AM - Online</p>
            </div>
            <span class="material-symbols-outlined text-slate-300">event</span>
          </div>
          <div class="flex items-center gap-4 bg-surface-container-lowest p-4 rounded-lg">
            <div class="flex flex-col items-center justify-center bg-slate-50 px-3 py-2 rounded">
              <span class="text-[10px] uppercase font-bold text-slate-400">Abr</span>
              <span class="text-xl font-black text-on-surface leading-none">25</span>
            </div>
            <div class="flex-grow">
              <h4 class="font-bold text-sm">Evaluación Semana 2 - Aimara</h4>
              <p class="text-xs text-secondary">09:00 AM - Online</p>
            </div>
            <span class="material-symbols-outlined text-slate-300">event</span>
          </div>
        </div>
      </div>

      <!-- Avisos -->
      <div class="bg-surface-container-high rounded-xl p-6 relative overflow-hidden">
        <h3 class="font-bold text-lg mb-4 font-headline">Avisos del Centro</h3>
        <div class="bg-surface-container-lowest/60 backdrop-blur-sm p-5 rounded-lg border border-white/40">
          <div class="flex items-start gap-3">
            <span class="material-symbols-outlined text-primary">campaign</span>
            <div>
              <p class="font-bold text-sm mb-1">Mantenimiento de Plataforma</p>
              <p class="text-xs text-secondary leading-relaxed">
                Este domingo el aula virtual estará en mantenimiento desde las 00:00 hasta las 04:00 horas.
              </p>
            </div>
          </div>
        </div>
        <div class="absolute -bottom-8 -right-8 opacity-5">
          <span class="material-symbols-outlined text-[120px]">school</span>
        </div>
      </div>
    </section>
  </div>
</template>
