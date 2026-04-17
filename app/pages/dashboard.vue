<script setup lang="ts">
definePageMeta({ layout: 'auth', middleware: 'auth' })

const supabase = useSupabaseClient()

// ── Helpers ──
const getPeruDate = () => {
  const now = new Date()
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  return new Date(utc - 5 * 3600000)
}

const parseFechaHora = (fecha: string, hora: string) => {
  const [h, m] = hora.split(':').map(Number)
  const [y, mo, d] = fecha.split('-').map(Number)
  return new Date(Date.UTC(y, mo - 1, d, h + 5, m, 0))
}

const iconForCurso = (nombre: string) => {
  const n = nombre.toLowerCase()
  if (n.includes('quechua')) return 'i-lucide-mountain'
  if (n.includes('aimara') || n.includes('aymara')) return 'i-lucide-sun'
  if (n.includes('ingl')) return 'i-lucide-globe'
  return 'i-lucide-book-open'
}

const iconForPlataforma = (p: string) => {
  if (p === 'facebook') return 'i-lucide-facebook'
  if (p === 'youtube') return 'i-lucide-youtube'
  return 'i-lucide-video'
}

const colorForPlataforma = (p: string) => {
  if (p === 'facebook') return 'bg-[#1877F2] hover:bg-[#166FE5]'
  if (p === 'youtube') return 'bg-[#FF0000] hover:bg-[#E60000]'
  return 'bg-black hover:bg-neutral-800'
}

const labelPlataforma = (p: string) => {
  if (p === 'facebook') return 'Facebook'
  if (p === 'youtube') return 'YouTube'
  return 'TikTok'
}

// ── Data (SSR + Cliente) ──
const { data: pageData } = await useAsyncData('dashboard', async () => {
  const hoyStr = getPeruDate().toISOString().slice(0, 10)

  // Cursos
  const { data: cursosData } = await supabase
    .from('cursos')
    .select('*')
    .order('nombre')

  // Próxima fecha con horario
  const { data: primeraSemana } = await supabase
    .from('semanas')
    .select('fecha')
    .gte('fecha', hoyStr)
    .not('hora_inicio', 'is', null)
    .order('fecha', { ascending: true })
    .limit(1)

  let horario: any[] = []
  let links: any[] = []
  let proximaFecha: string | null = null

  if (primeraSemana?.length) {
    proximaFecha = primeraSemana[0].fecha

    const { data: semanasData } = await supabase
      .from('semanas')
      .select('*, cursos(id, nombre)')
      .eq('fecha', proximaFecha)
      .not('hora_inicio', 'is', null)
      .order('hora_inicio', { ascending: true })

    horario = semanasData || []

    if (horario.length) {
      const semanaIds = horario.map((s: any) => s.id)
      const { data: videosData } = await supabase
        .from('videos')
        .select('*')
        .in('semana_id', semanaIds)
        .eq('tipo', 'en_vivo')

      const seen = new Set()
      links = (videosData || []).filter((v: any) => {
        if (seen.has(v.plataforma)) return false
        seen.add(v.plataforma)
        return true
      })
    }
  }

  return {
    cursos: cursosData || [],
    proximaFecha,
    horario,
    links,
  }
})

const cursos = computed(() => pageData.value?.cursos || [])
const proximaFecha = computed(() => pageData.value?.proximaFecha || null)
const horario = computed(() => pageData.value?.horario || [])
const links = computed(() => pageData.value?.links || [])

// ── Timer (solo cliente) ──
const now = ref(new Date())
let timerInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timerInterval = setInterval(() => { now.value = new Date() }, 1000)
})
onUnmounted(() => { if (timerInterval) clearInterval(timerInterval) })

// ── Computed derivados ──
const seminarioInfo = computed(() => {
  if (!horario.value.length || !proximaFecha.value) return null

  const primer = horario.value[0]
  const ultimo = horario.value[horario.value.length - 1]
  const start = parseFechaHora(proximaFecha.value, primer.hora_inicio)
  const end = parseFechaHora(proximaFecha.value, ultimo.hora_fin)
  const diffMs = start.getTime() - now.value.getTime()
  const endDiffMs = end.getTime() - now.value.getTime()

  const peruTime = getPeruDate()
  const minActual = peruTime.getHours() * 60 + peruTime.getMinutes()
  const hoy = peruTime.toISOString().slice(0, 10)
  let cursoEnVivo: string | null = null

  if (hoy === proximaFecha.value) {
    for (const s of horario.value) {
      const [hi, mi] = s.hora_inicio.split(':').map(Number)
      const [hf, mf] = s.hora_fin.split(':').map(Number)
      if (minActual >= hi * 60 + mi && minActual < hf * 60 + mf) {
        cursoEnVivo = s.cursos?.nombre || 'Seminario'
        break
      }
    }
  }

  if (endDiffMs <= 0) return { status: 'ended' as const, cursoEnVivo, diffMs: 0 }
  if (diffMs <= 0) return { status: 'live' as const, cursoEnVivo: cursoEnVivo || primer.cursos?.nombre, diffMs: endDiffMs }
  return { status: 'upcoming' as const, cursoEnVivo: null, diffMs }
})

const countdown = computed(() => {
  const ms = seminarioInfo.value?.diffMs
  if (!ms || ms <= 0) return ''
  const t = Math.floor(ms / 1000)
  const d = Math.floor(t / 86400)
  const h = Math.floor((t % 86400) / 3600)
  const m = Math.floor((t % 3600) / 60)
  const s = t % 60
  if (d > 0) return `${d}d ${h}h ${m}m`
  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
})

const fechaLegible = computed(() => {
  if (!proximaFecha.value) return ''
  return new Date(proximaFecha.value + 'T12:00:00').toLocaleDateString('es-PE', {
    weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Lima',
  })
})
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 mb-8 md:mb-12">
      <div class="lg:col-span-8 bg-gradient-to-br from-primary to-cepreuna-400 rounded-2xl p-5 md:p-8 text-white relative overflow-hidden shadow-xl shadow-primary/20">
        <div class="relative z-10">
          <span class="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] opacity-80 mb-2 block">Ciclo Académico marzo-julio 2026</span>
          <h1 class="text-2xl md:text-5xl font-extrabold tracking-tight mb-3 md:mb-4 font-headline">¡Hola de nuevo!</h1>

          <div class="mb-5 md:mb-8">
            <template v-if="seminarioInfo?.status === 'live'">
              <p class="text-sm md:text-lg opacity-90 max-w-md font-body leading-relaxed">
                <span class="inline-flex items-center gap-1.5 font-bold">
                  <span class="relative flex w-2 h-2"><span class="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping"></span><span class="relative inline-flex rounded-full h-2 w-2 bg-white"></span></span>
                  EN VIVO:
                </span>
                Seminario de <span class="font-bold underline decoration-2 underline-offset-4">{{ seminarioInfo.cursoEnVivo }}</span> — termina en {{ countdown }}.
              </p>
            </template>
            <template v-else-if="seminarioInfo?.status === 'upcoming'">
              <p class="text-sm md:text-lg opacity-90 max-w-md font-body leading-relaxed">
                Próximo seminario comienza en <span class="font-bold">{{ countdown }}</span>.
              </p>
              <p class="text-xs md:text-sm opacity-75 mt-2 capitalize">{{ fechaLegible }}</p>
            </template>
            <template v-else>
              <p class="text-sm md:text-lg opacity-90 max-w-md font-body leading-relaxed">
                No hay seminarios programados en este momento.
              </p>
            </template>
          </div>

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

      <!-- Horario card -->
      <UCard
        v-if="horario.length > 0"
        :ui="{ root: 'lg:col-span-4', body: 'p-5 md:p-6' }"
      >
        <div class="flex items-center gap-2 mb-4">
          <UIcon name="i-lucide-clock" class="text-primary" />
          <h3 class="font-headline font-bold text-base md:text-lg text-on-surface">Horario del día</h3>
        </div>

        <div class="space-y-2 mb-5">
          <div
            v-for="s in horario"
            :key="s.id"
            class="flex items-center gap-3 p-2.5 rounded-lg"
            :class="seminarioInfo?.cursoEnVivo === s.cursos?.nombre ? 'bg-primary/10 ring-1 ring-primary/20' : 'bg-surface-container-low'"
          >
            <UIcon :name="iconForCurso(s.cursos?.nombre || '')" class="text-primary shrink-0" />
            <div class="flex-grow min-w-0">
              <p class="font-semibold text-sm text-on-surface truncate">{{ s.cursos?.nombre }}</p>
              <p class="text-xs text-on-surface-variant">{{ s.hora_inicio.slice(0, 5) }} — {{ s.hora_fin.slice(0, 5) }}</p>
            </div>
            <UBadge v-if="seminarioInfo?.cursoEnVivo === s.cursos?.nombre" color="error" variant="soft" size="xs">EN VIVO</UBadge>
          </div>
        </div>

        <div v-if="links.length > 0" class="space-y-2">
          <p class="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Transmisión en vivo</p>
          <a
            v-for="v in links"
            :key="v.id"
            :href="v.url"
            target="_blank"
            class="flex items-center justify-center gap-2 py-2.5 text-white rounded-lg font-bold shadow active:scale-95 transition-all text-sm"
            :class="colorForPlataforma(v.plataforma)"
          >
            <UIcon :name="iconForPlataforma(v.plataforma)" />
            {{ labelPlataforma(v.plataforma) }}
          </a>
        </div>
      </UCard>

      <!-- Fallback -->
      <UCard
        v-else
        :ui="{ root: 'lg:col-span-4', body: 'flex flex-col items-center justify-center text-center p-5 md:p-8' }"
      >
        <div class="relative w-28 h-28 md:w-32 md:h-32 mb-5 flex items-center justify-center">
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

    <!-- Cursos -->
    <div class="mb-5 md:mb-8">
      <span class="text-[10px] md:text-xs font-bold text-primary uppercase tracking-[0.2em] mb-1 md:mb-2 block">Mis Materias</span>
      <h2 class="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight font-headline">Cursos Disponibles</h2>
    </div>

    <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      <UiCourseCard
        v-for="curso in cursos"
        :key="curso.id"
        :id="curso.id"
        :nombre="curso.nombre"
        :descripcion="curso.descripcion"
        :icono="curso.icono"
      />
    </section>

    <!-- Info secundaria -->
    <section class="mt-8 md:mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
      <UCard :ui="{ body: 'p-5 md:p-6' }">
        <div class="flex items-center justify-between mb-5 md:mb-6">
          <h3 class="font-bold text-lg font-headline">Próximas Evaluaciones</h3>
          <UButton variant="link" color="primary" size="sm" trailing-icon="i-lucide-arrow-right">Ver todo</UButton>
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

      <UCard :ui="{ root: 'relative overflow-hidden', body: 'p-5 md:p-6' }">
        <h3 class="font-bold text-lg mb-4 font-headline">Avisos del Centro</h3>
        <div class="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 relative z-10">
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
        <UIcon name="i-lucide-graduation-cap" class="absolute -bottom-6 -right-6 text-[120px] opacity-[0.04] pointer-events-none" />
      </UCard>
    </section>
  </div>
</template>
