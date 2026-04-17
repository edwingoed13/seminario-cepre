<script setup lang="ts">
definePageMeta({ layout: 'auth', middleware: 'auth' })

const route = useRoute()
const cursoId = route.params.id as string
const supabase = useSupabaseClient()

const curso = ref<any>(null)
const semanas = ref<any[]>([])
const videosMap = ref<Record<string, any[]>>({})
const materialesMap = ref<Record<string, any[]>>({})
const loading = ref(true)
const semanaActiva = ref<string | null>(null)
const now = ref(new Date())

onMounted(() => {
  const interval = setInterval(() => { now.value = new Date() }, 30000)
  onUnmounted(() => clearInterval(interval))
})

const getPeruTime = () => {
  const utc = now.value.getTime() + now.value.getTimezoneOffset() * 60000
  return new Date(utc + -5 * 3600000)
}

// Detectar si está en vivo basándose en hora_inicio/hora_fin de la SEMANA
const isEnVivo = computed(() => {
  const semana = semanas.value.find(s => s.id === semanaActiva.value)
  if (!semana || !semana.hora_inicio || !semana.hora_fin) return false

  const peruTime = getPeruTime()
  const hoy = peruTime.toISOString().slice(0, 10)
  if (semana.fecha !== hoy) return false

  const horaActual = peruTime.getHours() * 60 + peruTime.getMinutes()
  const [hi, mi] = semana.hora_inicio.split(':').map(Number)
  const [hf, mf] = semana.hora_fin.split(':').map(Number)
  return horaActual >= hi * 60 + mi && horaActual < hf * 60 + mf
})

// Horario de la clase de este curso (desde semana activa)
const horarioClase = computed(() => {
  const semana = semanas.value.find(s => s.id === semanaActiva.value)
  if (!semana?.hora_inicio || !semana?.hora_fin) return null
  return `${semana.hora_inicio.slice(0, 5)} — ${semana.hora_fin.slice(0, 5)}`
})

const formatFecha = (fechaStr: string) => {
  const fecha = new Date(fechaStr + 'T12:00:00')
  const opciones: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' }
  const diaOpciones: Intl.DateTimeFormatOptions = { weekday: 'long' }
  const fechaFormateada = fecha.toLocaleDateString('es-PE', opciones)
  const diaSemana = fecha.toLocaleDateString('es-PE', diaOpciones)
  return { fecha: fechaFormateada, dia: diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1) }
}

const semanaActual = computed(() => {
  const hoy = new Date()
  for (let i = semanas.value.length - 1; i >= 0; i--) {
    const fechaSemana = new Date(semanas.value[i].fecha + 'T12:00:00')
    if (hoy >= fechaSemana) return semanas.value[i]
  }
  return semanas.value[0] || null
})

onMounted(async () => {
  try {
    const { data: cursoData } = await supabase.from('cursos').select('*').eq('id', cursoId).single()
    curso.value = cursoData

    const { data: semanasData } = await supabase.from('semanas').select('*').eq('curso_id', cursoId).order('numero_semana')
    semanas.value = semanasData || []

    if (semanas.value.length > 0) {
      semanaActiva.value = semanaActual.value?.id || semanas.value[0].id

      const semanaIds = semanas.value.map(s => s.id)

      const [videosRes, materialesRes] = await Promise.all([
        supabase.from('videos').select('*').in('semana_id', semanaIds),
        supabase.from('materiales').select('*').in('semana_id', semanaIds),
      ])

      for (const v of (videosRes.data || [])) {
        if (!videosMap.value[v.semana_id]) videosMap.value[v.semana_id] = []
        videosMap.value[v.semana_id].push(v)
      }
      for (const m of (materialesRes.data || [])) {
        if (!materialesMap.value[m.semana_id]) materialesMap.value[m.semana_id] = []
        materialesMap.value[m.semana_id].push(m)
      }
    }
  } catch (e) {
    console.error('Error cargando curso:', e)
  } finally {
    loading.value = false
  }
})

const videosActivos = computed(() => videosMap.value[semanaActiva.value || ''] || [])
const materialesActivos = computed(() => materialesMap.value[semanaActiva.value || ''] || [])
const videosGrabados = computed(() => videosActivos.value.filter(v => v.tipo === 'grabado'))
const videosEnVivo = computed(() => videosActivos.value.filter(v => v.tipo === 'en_vivo'))

const temarioItems = computed(() => {
  if (!curso.value?.temario) return []
  return [{
    label: 'Temario del Curso',
    icon: 'i-lucide-book-open',
    slot: 'temario' as const,
  }]
})

const temarioList = computed(() => {
  if (!curso.value?.temario) return []
  return curso.value.temario.split('\n').filter((t: string) => t.trim())
})

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
</script>

<template>
  <div v-if="!loading && curso">
    <!-- Hero -->
    <section class="relative overflow-hidden rounded-2xl md:rounded-3xl mb-5 md:mb-8 bg-gradient-to-br from-primary to-cepreuna-400 p-5 md:p-12 text-white shadow-xl shadow-primary/20">
      <div class="relative z-10">
        <span class="font-label font-bold uppercase tracking-[0.2em] text-white/70 mb-1 md:mb-2 block text-[10px] md:text-xs">Seminario de Idiomas</span>
        <h2 class="font-headline font-extrabold text-3xl md:text-6xl leading-tight uppercase">
          {{ curso.nombre }}
        </h2>
      </div>
      <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
    </section>

    <!-- Temario -->
    <UAccordion
      v-if="curso.temario"
      :items="temarioItems"
      class="mb-4 md:mb-6"
      :ui="{
        item: 'bg-surface-container-lowest rounded-2xl md:rounded-3xl shadow-sm border border-outline-variant/10 mb-0',
        trigger: 'p-4 md:p-6 font-headline font-bold text-lg md:text-xl',
        content: 'px-4 md:px-6 pb-4 md:pb-6',
      }"
    >
      <template #temario>
        <ul class="grid grid-cols-1 md:grid-cols-2 gap-2">
          <li
            v-for="(tema, i) in temarioList"
            :key="i"
            class="flex items-start gap-3 p-3 rounded-xl bg-surface border border-outline-variant/20"
          >
            <UIcon name="i-lucide-check-circle-2" class="text-primary text-lg mt-0.5 shrink-0" />
            <span class="text-sm text-on-surface leading-relaxed">{{ tema }}</span>
          </li>
        </ul>
      </template>
    </UAccordion>

    <!-- Main Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
      <!-- Left: Cronograma -->
      <div class="lg:col-span-1 space-y-4 md:space-y-6">
        <UCard :ui="{ body: 'p-4 md:p-6' }">
          <div class="flex items-center gap-3 mb-4 md:mb-6">
            <UIcon name="i-lucide-calendar" class="text-primary text-xl" />
            <h3 class="font-headline font-bold text-lg md:text-xl">Cronograma</h3>
          </div>
          <div class="space-y-2">
            <button
              v-for="semana in semanas"
              :key="semana.id"
              type="button"
              class="w-full p-3 md:p-4 rounded-xl flex justify-between items-center transition-all"
              :class="semanaActiva === semana.id
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : semanaActual?.id === semana.id
                  ? 'bg-primary/10 hover:bg-primary/15 text-on-surface'
                  : 'hover:bg-surface-container-low text-on-surface'"
              @click="semanaActiva = semana.id"
            >
              <div class="text-left">
                <span class="text-xs font-bold uppercase tracking-wider block" :class="semanaActiva === semana.id ? 'text-white/70' : 'text-on-surface-variant'">
                  Semana {{ semana.numero_semana }}
                </span>
                <span class="font-semibold text-sm md:text-base">{{ formatFecha(semana.fecha).fecha }}</span>
                <span v-if="semana.hora_inicio" class="block text-[10px] md:text-xs mt-0.5" :class="semanaActiva === semana.id ? 'text-white/60' : 'text-on-surface-variant'">
                  {{ semana.hora_inicio.slice(0, 5) }} — {{ semana.hora_fin?.slice(0, 5) }}
                </span>
              </div>
              <span class="text-xs md:text-sm font-medium" :class="semanaActiva === semana.id ? 'text-white/80' : 'text-on-surface-variant'">
                {{ formatFecha(semana.fecha).dia }}
              </span>
            </button>
          </div>
        </UCard>
      </div>

      <!-- Right -->
      <div class="lg:col-span-2 space-y-4 md:space-y-6">
        <!-- Clase en vivo -->
        <UCard :ui="{ body: 'p-4 md:p-6' }">
          <div class="flex items-center justify-between mb-4 md:mb-6 flex-wrap gap-2">
            <div class="flex items-center gap-3">
              <div v-if="isEnVivo" class="relative flex items-center justify-center w-3 h-3">
                <div class="absolute w-full h-full bg-red-500 rounded-full animate-ping opacity-75"></div>
                <div class="relative w-2 h-2 bg-red-500 rounded-full"></div>
              </div>
              <UIcon v-else name="i-lucide-wifi-off" class="text-on-surface-variant" />
              <h3 class="font-headline font-bold text-lg md:text-xl">Clase en vivo</h3>
            </div>
            <UBadge
              :color="isEnVivo ? 'error' : 'neutral'"
              :variant="isEnVivo ? 'soft' : 'subtle'"
              size="md"
              class="font-bold"
            >
              {{ isEnVivo ? 'Transmitiendo ahora' : horarioClase ? `Offline — ${horarioClase}` : 'Sin programar' }}
            </UBadge>
          </div>

          <div v-if="horarioClase" class="mb-4 p-3 bg-primary/5 rounded-xl flex items-center gap-2">
            <UIcon name="i-lucide-clock" class="text-primary" />
            <span class="text-sm font-semibold text-on-surface">Tu clase: <span class="text-primary">{{ horarioClase }}</span></span>
          </div>

          <div v-if="videosEnVivo.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <a
              v-for="video in videosEnVivo"
              :key="video.id"
              :href="video.url"
              target="_blank"
              class="flex items-center justify-center gap-2 py-3 md:py-4 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-all text-sm md:text-base"
              :class="colorForPlataforma(video.plataforma)"
            >
              <UIcon :name="iconForPlataforma(video.plataforma)" />
              {{ video.plataforma === 'facebook' ? 'Facebook' : video.plataforma === 'youtube' ? 'YouTube' : 'TikTok' }}
            </a>
          </div>
          <p v-else class="text-on-surface-variant text-sm">No hay enlaces de transmisión para esta semana.</p>
        </UCard>

        <div class="grid md:grid-cols-2 gap-4 md:gap-6">
          <!-- Clases grabadas -->
          <UCard :ui="{ body: 'p-4 md:p-6' }">
            <div class="flex items-center gap-3 mb-4 md:mb-6">
              <UIcon name="i-lucide-film" class="text-primary text-xl" />
              <h3 class="font-headline font-bold text-lg md:text-xl">Clases grabadas</h3>
            </div>
            <div v-if="videosGrabados.length > 0" class="space-y-3">
              <a
                v-for="video in videosGrabados"
                :key="video.id"
                :href="video.url"
                target="_blank"
                class="bg-surface-container-low p-3 md:p-4 rounded-xl flex items-center justify-between hover:bg-surface-container transition-colors"
              >
                <div class="min-w-0">
                  <h4 class="font-bold truncate">{{ video.titulo || 'Clase grabada' }}</h4>
                  <p class="text-xs text-on-surface-variant capitalize">{{ video.plataforma }}</p>
                </div>
                <UButton
                  color="primary"
                  variant="solid"
                  size="sm"
                  trailing-icon="i-lucide-play"
                >
                  Ver
                </UButton>
              </a>
            </div>
            <p v-else class="text-on-surface-variant text-sm">No hay clases grabadas para esta semana.</p>
          </UCard>

          <div class="space-y-4 md:space-y-6">
            <!-- Materiales -->
            <UCard :ui="{ body: 'p-4 md:p-6' }">
              <div class="flex items-center gap-3 mb-4 md:mb-6">
                <UIcon name="i-lucide-file-text" class="text-primary text-xl" />
                <h3 class="font-headline font-bold text-lg md:text-xl">Guías de Aprendizaje</h3>
              </div>
              <div v-if="materialesActivos.length > 0" class="space-y-2">
                <a
                  v-for="mat in materialesActivos"
                  :key="mat.id"
                  :href="mat.archivo_url"
                  target="_blank"
                  class="flex items-center justify-between gap-3 p-3 bg-surface rounded-xl border border-outline-variant/20 hover:bg-surface-container-low transition-colors"
                >
                  <div class="flex items-center gap-3 min-w-0">
                    <UIcon name="i-lucide-file-text" class="text-tertiary text-lg shrink-0" />
                    <div class="min-w-0">
                      <span class="font-medium text-sm block truncate">{{ mat.nombre }}</span>
                      <span class="text-xs text-on-surface-variant capitalize">{{ mat.tipo }}</span>
                    </div>
                  </div>
                  <UIcon name="i-lucide-download" class="text-primary shrink-0" />
                </a>
              </div>
              <p v-else class="text-on-surface-variant text-sm">No hay guías para esta semana.</p>
            </UCard>

            <!-- Quiz -->
            <NuxtLink :to="`/quiz/${cursoId}`" class="block">
              <div class="bg-tertiary text-white rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-xl shadow-tertiary/20 relative overflow-hidden group cursor-pointer hover:shadow-2xl transition-shadow">
                <div class="relative z-10">
                  <div class="flex items-center gap-3 mb-2">
                    <UIcon name="i-lucide-clipboard-check" class="text-xl" />
                    <h3 class="font-headline font-bold text-lg md:text-xl">Evaluación Semanal</h3>
                  </div>
                  <p class="text-white/80 text-sm mb-5">Pon a prueba tus conocimientos.</p>
                  <div class="w-full bg-white text-tertiary font-extrabold py-2.5 md:py-3 rounded-xl shadow-lg active:scale-95 duration-200 text-center text-sm md:text-base">
                    Iniciar evaluación
                  </div>
                </div>
                <UIcon
                  name="i-lucide-file-check"
                  class="absolute -bottom-6 -right-6 text-9xl opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700 pointer-events-none"
                />
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Loading -->
  <div v-else class="flex items-center justify-center h-64">
    <UIcon name="i-lucide-loader-circle" class="animate-spin text-primary text-4xl" />
  </div>
</template>
