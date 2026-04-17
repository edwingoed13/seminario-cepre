<script setup lang="ts">
definePageMeta({ layout: 'auth', middleware: 'auth' })

const { fetchCursos, cursos } = useCursos()
const supabase = useSupabaseClient()

const loading = ref(false)
const proximaSemana = ref<any | null>(null)
const now = ref(new Date())

const getPeruDate = (d = new Date()) => {
  const utc = d.getTime() + d.getTimezoneOffset() * 60000
  return new Date(utc + -5 * 3600000)
}

const proximoVideo = ref<any | null>(null)

const fetchProximaSemana = async () => {
  const hoyStr = getPeruDate().toISOString().slice(0, 10)

  // Buscar semanas desde hoy
  const { data: semanasData } = await supabase
    .from('semanas')
    .select('*, cursos(nombre)')
    .gte('fecha', hoyStr)
    .order('fecha', { ascending: true })
    .limit(1)
  proximaSemana.value = semanasData?.[0] || null

  // Buscar el próximo video en vivo con horario
  if (proximaSemana.value) {
    const { data: videosData } = await supabase
      .from('videos')
      .select('*, semanas(fecha, cursos(nombre))')
      .eq('semana_id', proximaSemana.value.id)
      .eq('tipo', 'en_vivo')
      .not('hora_inicio', 'is', null)
      .order('hora_inicio', { ascending: true })
      .limit(1)
    proximoVideo.value = videosData?.[0] || null
  }
}

const parseFechaHora = (fechaStr: string, horaStr: string) => {
  const [h, m] = horaStr.split(':').map(Number)
  const [y, mo, d] = fechaStr.split('-').map(Number)
  return new Date(Date.UTC(y, mo - 1, d, h + 5, m, 0))
}

onMounted(() => {
  fetchCursos().catch(() => {})
  fetchProximaSemana().catch(() => {})

  const interval = setInterval(() => {
    now.value = new Date()
  }, 1000)
  onUnmounted(() => clearInterval(interval))
})

const seminarioInfo = computed(() => {
  if (!proximaSemana.value) return null

  const fecha = proximaSemana.value.fecha
  const video = proximoVideo.value
  const cursoNombre = video?.semanas?.cursos?.nombre || proximaSemana.value.cursos?.nombre || 'Seminario'

  // Si hay video con horario, usar esos valores
  const horaInicio = video?.hora_inicio || '09:00'
  const horaFin = video?.hora_fin || '13:00'

  const start = parseFechaHora(fecha, horaInicio)
  const end = parseFechaHora(fecha, horaFin)
  const diffMs = start.getTime() - now.value.getTime()
  const endDiffMs = end.getTime() - now.value.getTime()

  if (endDiffMs <= 0) {
    return { status: 'ended', cursoNombre, start, end, diffMs: 0, horaInicio, horaFin }
  }
  if (diffMs <= 0) {
    return { status: 'live', cursoNombre, start, end, diffMs: endDiffMs, horaInicio, horaFin }
  }
  return { status: 'upcoming', cursoNombre, start, end, diffMs, horaInicio, horaFin }
})

const countdown = computed(() => {
  if (!seminarioInfo.value) return ''
  const ms = seminarioInfo.value.diffMs
  if (ms <= 0) return ''

  const totalSec = Math.floor(ms / 1000)
  const days = Math.floor(totalSec / 86400)
  const hours = Math.floor((totalSec % 86400) / 3600)
  const minutes = Math.floor((totalSec % 3600) / 60)
  const seconds = totalSec % 60

  if (days > 0) return `${days}d ${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`
  if (minutes > 0) return `${minutes}m ${seconds}s`
  return `${seconds}s`
})

const fechaLegible = computed(() => {
  if (!seminarioInfo.value) return ''
  const opciones: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' }
  return seminarioInfo.value.start.toLocaleDateString('es-PE', { ...opciones, timeZone: 'America/Lima' })
})

const horaLegible = computed(() => {
  if (!seminarioInfo.value) return ''
  return `${seminarioInfo.value.horaInicio.slice(0, 5)} — ${seminarioInfo.value.horaFin.slice(0, 5)}`
})
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 mb-8 md:mb-12">
      <!-- Welcome Card -->
      <div class="lg:col-span-8 bg-gradient-to-br from-primary to-cepreuna-400 rounded-2xl p-5 md:p-8 text-white flex flex-col justify-between relative overflow-hidden shadow-xl shadow-primary/20">
        <div class="relative z-10">
          <span class="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] opacity-80 mb-2 block">Ciclo Académico marzo-julio 2026</span>
          <h1 class="text-2xl md:text-5xl font-extrabold tracking-tight mb-3 md:mb-4 font-headline">¡Hola de nuevo!</h1>

          <!-- Dinámico: estado del próximo seminario -->
          <div v-if="seminarioInfo" class="mb-5 md:mb-8">
            <p v-if="seminarioInfo.status === 'live'" class="text-sm md:text-lg opacity-90 max-w-md font-body leading-relaxed">
              <span class="inline-flex items-center gap-1.5 font-bold">
                <span class="relative flex w-2 h-2">
                  <span class="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                EN VIVO:
              </span>
              Seminario de <span class="font-bold underline decoration-2 underline-offset-4">{{ seminarioInfo.cursoNombre }}</span> — termina en {{ countdown }}.
            </p>
            <p v-else-if="seminarioInfo.status === 'upcoming'" class="text-sm md:text-lg opacity-90 max-w-md font-body leading-relaxed">
              Tu próximo seminario de <span class="font-bold underline decoration-2 underline-offset-4">{{ seminarioInfo.cursoNombre }}</span> comienza en
              <span class="font-bold">{{ countdown }}</span>.
            </p>
            <p v-else class="text-sm md:text-lg opacity-90 max-w-md font-body leading-relaxed">
              Próximamente se programarán nuevos seminarios.
            </p>
            <p v-if="seminarioInfo.status !== 'ended'" class="text-xs md:text-sm opacity-75 mt-2 capitalize">
              {{ fechaLegible }} · {{ horaLegible }}
            </p>
          </div>
          <p v-else class="text-sm md:text-lg opacity-90 max-w-md font-body leading-relaxed mb-5 md:mb-8">
            No hay seminarios programados en este momento.
          </p>

          <UButton
            color="neutral"
            size="lg"
            :icon="seminarioInfo?.status === 'live' ? 'i-lucide-radio' : 'i-lucide-play-circle'"
            :disabled="seminarioInfo?.status !== 'live'"
            :ui="{
              base: seminarioInfo?.status === 'live'
                ? 'bg-white hover:bg-white/90 text-primary font-bold'
                : 'bg-white/15 hover:bg-white/15 text-white font-bold ring-1 ring-inset ring-white/30 disabled:opacity-100',
            }"
          >
            {{ seminarioInfo?.status === 'live' ? 'Unirme a la Clase en Vivo' : 'Próximamente en vivo' }}
          </UButton>
        </div>
        <div class="absolute -right-16 -bottom-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <!-- Progress Card -->
      <UCard
        :ui="{
          root: 'lg:col-span-4',
          body: 'flex flex-col items-center justify-center text-center p-5 md:p-8',
        }"
      >
        <div class="relative w-28 h-28 md:w-32 md:h-32 mb-5 md:mb-6 flex items-center justify-center">
          <div class="progress-orbit absolute inset-0 opacity-10"></div>
          <div class="absolute inset-0 border-[6px] border-surface-container rounded-full"></div>
          <div class="absolute inset-0 border-[6px] border-primary rounded-full border-t-transparent border-l-transparent rotate-45"></div>
          <span class="text-2xl md:text-3xl font-black text-on-surface">75%</span>
        </div>
        <p class="text-[10px] md:text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Tu Progreso General</p>
        <h3 class="text-lg md:text-xl font-bold text-on-surface font-headline">Cerca de la Meta</h3>
        <p class="text-xs md:text-sm text-on-surface-variant mt-2">Has completado 12 de 16 módulos esta semana.</p>
      </UCard>
    </section>

    <!-- Courses -->
    <div class="mb-5 md:mb-8">
      <span class="text-[10px] md:text-xs font-bold text-primary uppercase tracking-[0.2em] mb-1 md:mb-2 block">Mis Materias</span>
      <h2 class="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight font-headline">Cursos Disponibles</h2>
    </div>

    <section v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      <USkeleton v-for="i in 3" :key="i" class="h-64 rounded-2xl" />
    </section>

    <section v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      <UiCourseCard
        v-for="curso in cursos"
        :key="curso.id"
        :id="curso.id"
        :nombre="curso.nombre"
        :descripcion="curso.descripcion"
        :icono="curso.icono"
      />
    </section>

    <!-- Secondary Info -->
    <section class="mt-8 md:mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
      <!-- Evaluaciones -->
      <UCard :ui="{ body: 'p-5 md:p-6' }">
        <div class="flex items-center justify-between mb-5 md:mb-6">
          <h3 class="font-bold text-lg font-headline">Próximas Evaluaciones</h3>
          <UButton variant="link" color="primary" size="sm" trailing-icon="i-lucide-arrow-right">
            Ver todo
          </UButton>
        </div>
        <div class="space-y-3">
          <div class="flex items-center gap-4 bg-surface-container-low p-3 md:p-4 rounded-xl">
            <div class="flex flex-col items-center justify-center bg-primary/10 px-3 py-2 rounded-lg min-w-[48px]">
              <span class="text-[10px] uppercase font-bold text-primary">Abr</span>
              <span class="text-xl font-black text-primary leading-none">11</span>
            </div>
            <div class="flex-grow min-w-0">
              <h4 class="font-bold text-sm truncate">Evaluación Semana 1 - Quechua</h4>
              <p class="text-xs text-on-surface-variant">10:20 AM - Online</p>
            </div>
            <UIcon name="i-lucide-calendar" class="text-on-surface-variant shrink-0" />
          </div>
          <div class="flex items-center gap-4 bg-surface-container-low p-3 md:p-4 rounded-xl">
            <div class="flex flex-col items-center justify-center bg-surface-container-high px-3 py-2 rounded-lg min-w-[48px]">
              <span class="text-[10px] uppercase font-bold text-on-surface-variant">Abr</span>
              <span class="text-xl font-black text-on-surface leading-none">25</span>
            </div>
            <div class="flex-grow min-w-0">
              <h4 class="font-bold text-sm truncate">Evaluación Semana 2 - Idiomas</h4>
              <p class="text-xs text-on-surface-variant">09:00 AM - Online</p>
            </div>
            <UIcon name="i-lucide-calendar" class="text-on-surface-variant shrink-0" />
          </div>
        </div>
      </UCard>

      <!-- Avisos -->
      <UCard
        :ui="{
          root: 'relative overflow-hidden bg-surface-container-high',
          body: 'p-5 md:p-6',
        }"
      >
        <h3 class="font-bold text-lg mb-4 font-headline">Avisos del Centro</h3>
        <div class="bg-surface-container-lowest/70 backdrop-blur-sm p-4 rounded-xl border border-outline-variant/40 relative z-10">
          <div class="flex items-start gap-3">
            <UIcon name="i-lucide-megaphone" class="text-primary text-xl shrink-0 mt-0.5" />
            <div>
              <p class="font-bold text-sm mb-1">Mantenimiento de Plataforma</p>
              <p class="text-xs text-on-surface-variant leading-relaxed">
                Este domingo el aula virtual estará en mantenimiento desde las 00:00 hasta las 04:00 horas.
              </p>
            </div>
          </div>
        </div>
        <UIcon
          name="i-lucide-graduation-cap"
          class="absolute -bottom-6 -right-6 text-[120px] opacity-[0.04] pointer-events-none"
        />
      </UCard>
    </section>
  </div>
</template>
