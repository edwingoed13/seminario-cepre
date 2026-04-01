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
const temarioAbierto = ref(false)

// Horario en vivo: sábados de 9am a 1pm (hora Perú, UTC-5)
const isEnVivo = computed(() => {
  const now = new Date()
  const peruOffset = -5
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const peruTime = new Date(utc + peruOffset * 3600000)
  const dia = peruTime.getDay() // 6 = sábado
  const hora = peruTime.getHours()
  return dia === 6 && hora >= 9 && hora < 13
})

// Formatear fecha correctamente
const formatFecha = (fechaStr: string) => {
  const fecha = new Date(fechaStr + 'T12:00:00')
  const opciones: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' }
  const diaOpciones: Intl.DateTimeFormatOptions = { weekday: 'long' }
  const fechaFormateada = fecha.toLocaleDateString('es-PE', opciones)
  const diaSemana = fecha.toLocaleDateString('es-PE', diaOpciones)
  return { fecha: fechaFormateada, dia: diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1) }
}

// Determinar semana actual según fecha
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
    // Cargar curso
    const { data: cursoData } = await supabase.from('cursos').select('*').eq('id', cursoId).single()
    curso.value = cursoData

    // Cargar semanas
    const { data: semanasData } = await supabase.from('semanas').select('*').eq('curso_id', cursoId).order('numero_semana')
    semanas.value = semanasData || []

    if (semanas.value.length > 0) {
      semanaActiva.value = semanaActual.value?.id || semanas.value[0].id

      // Cargar videos y materiales de todas las semanas
      const semanaIds = semanas.value.map(s => s.id)

      const [videosRes, materialesRes] = await Promise.all([
        supabase.from('videos').select('*').in('semana_id', semanaIds),
        supabase.from('materiales').select('*').in('semana_id', semanaIds),
      ])

      // Agrupar por semana
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

const semanaSeleccionada = computed(() => semanas.value.find(s => s.id === semanaActiva.value))
const videosActivos = computed(() => videosMap.value[semanaActiva.value || ''] || [])
const materialesActivos = computed(() => materialesMap.value[semanaActiva.value || ''] || [])
const videosGrabados = computed(() => videosActivos.value.filter(v => v.tipo === 'grabado'))
const videosEnVivo = computed(() => videosActivos.value.filter(v => v.tipo === 'en_vivo'))
</script>

<template>
  <div v-if="!loading && curso">
    <!-- Hero Section -->
    <section class="relative overflow-hidden rounded-3xl mb-8 bg-gradient-to-br from-primary to-primary-container p-8 md:p-12 text-on-primary">
      <div class="relative z-10">
        <span class="font-label font-bold uppercase tracking-[0.2em] text-white/70 mb-2 block">Seminario de Idiomas</span>
        <h2 class="font-headline font-extrabold text-4xl md:text-6xl mb-4 leading-tight">
          Curso de {{ curso.nombre }}
        </h2>
        <p class="text-on-primary-container text-lg opacity-90 max-w-md">
          {{ curso.descripcion }}
        </p>
      </div>
      <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
    </section>

    <!-- Temario del Curso (colapsable) -->
    <section v-if="curso.temario" class="bg-surface-container-lowest rounded-3xl shadow-sm mb-6 overflow-hidden">
      <button @click="temarioAbierto = !temarioAbierto" class="w-full flex items-center justify-between p-6 hover:bg-surface-container-low transition-colors">
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-primary">menu_book</span>
          <h3 class="font-headline font-bold text-xl">Temario del Curso</h3>
        </div>
        <span class="material-symbols-outlined text-secondary transition-transform duration-300" :class="temarioAbierto ? 'rotate-180' : ''">expand_more</span>
      </button>
      <div v-show="temarioAbierto" class="px-6 pb-6">
        <ul class="grid grid-cols-1 md:grid-cols-2 gap-2">
          <li
            v-for="(tema, i) in curso.temario.split('\n').filter((t: string) => t.trim())"
            :key="i"
            class="flex items-start gap-3 p-3 rounded-xl bg-surface border border-outline-variant/10"
          >
            <span class="material-symbols-outlined text-primary text-[18px] mt-0.5 shrink-0">check_circle</span>
            <span class="text-sm text-on-surface leading-relaxed">{{ tema }}</span>
          </li>
        </ul>
      </div>
    </section>

    <!-- Main Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left: Cronograma -->
      <div class="lg:col-span-1 space-y-6">
        <section class="bg-surface-container-lowest rounded-3xl p-6 shadow-sm">
          <div class="flex items-center gap-3 mb-6">
            <span class="material-symbols-outlined text-primary">calendar_today</span>
            <h3 class="font-headline font-bold text-xl">Cronograma</h3>
          </div>
          <div class="space-y-2">
            <button
              v-for="semana in semanas"
              :key="semana.id"
              @click="semanaActiva = semana.id"
              class="w-full p-4 rounded-2xl flex justify-between items-center transition-all"
              :class="semanaActiva === semana.id
                ? 'bg-primary text-white shadow-md'
                : semanaActual?.id === semana.id
                  ? 'bg-primary-fixed hover:bg-primary-fixed-dim'
                  : 'hover:bg-surface-container-low'"
            >
              <div class="text-left">
                <span class="text-xs font-bold uppercase tracking-wider block" :class="semanaActiva === semana.id ? 'text-white/70' : 'text-secondary'">
                  Semana {{ semana.numero_semana }}
                </span>
                <span class="font-semibold">{{ formatFecha(semana.fecha).fecha }}</span>
              </div>
              <span class="text-sm font-medium" :class="semanaActiva === semana.id ? 'text-white/80' : 'text-secondary'">
                {{ formatFecha(semana.fecha).dia }}
              </span>
            </button>
          </div>
        </section>
      </div>

      <!-- Right: Live, Recordings, Materials -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Clase en Vivo -->
        <section class="bg-surface-container-lowest rounded-3xl p-6 shadow-sm">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <div v-if="isEnVivo" class="relative flex items-center justify-center w-3 h-3 mr-2">
                <div class="absolute w-full h-full bg-red-500 rounded-full animate-ping opacity-75"></div>
                <div class="relative w-2 h-2 bg-red-500 rounded-full"></div>
              </div>
              <span v-else class="material-symbols-outlined text-secondary mr-2">wifi_off</span>
              <h3 class="font-headline font-bold text-xl">Clase en vivo</h3>
            </div>
            <span
              class="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider"
              :class="isEnVivo ? 'text-red-600 bg-red-50' : 'text-secondary bg-surface-container'"
            >
              {{ isEnVivo ? 'Transmitiendo ahora' : 'Offline — Sábados 9:00 a 13:00' }}
            </span>
          </div>

          <div v-if="videosEnVivo.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              v-for="video in videosEnVivo"
              :key="video.id"
              :href="video.url"
              target="_blank"
              class="flex items-center justify-center gap-3 py-4 text-white rounded-2xl font-bold shadow-lg hover:brightness-110 active:scale-95 transition-all"
              :class="{
                'bg-[#1877F2]': video.plataforma === 'facebook',
                'bg-[#FF0000]': video.plataforma === 'youtube',
                'bg-[#000000]': video.plataforma === 'tiktok',
              }"
            >
              <span class="material-symbols-outlined">
                {{ video.plataforma === 'facebook' ? 'video_library' : video.plataforma === 'youtube' ? 'smart_display' : 'videocam' }}
              </span>
              Ver en {{ video.plataforma === 'facebook' ? 'Facebook' : video.plataforma === 'youtube' ? 'YouTube' : 'TikTok' }}
            </a>
          </div>
          <p v-else class="text-secondary text-sm">No hay enlaces de transmisión para esta semana.</p>
        </section>

        <div class="grid md:grid-cols-2 gap-6">
          <!-- Clases Grabadas -->
          <section class="bg-surface-container-lowest rounded-3xl p-6 shadow-sm">
            <div class="flex items-center gap-3 mb-6">
              <span class="material-symbols-outlined text-primary">movie</span>
              <h3 class="font-headline font-bold text-xl">Clases grabadas</h3>
            </div>
            <div v-if="videosGrabados.length > 0" class="space-y-4">
              <a
                v-for="video in videosGrabados"
                :key="video.id"
                :href="video.url"
                target="_blank"
                class="bg-surface-container p-4 rounded-2xl flex items-center justify-between group hover:bg-surface-container-high transition-colors block"
              >
                <div>
                  <h4 class="font-bold">{{ video.titulo || 'Clase grabada' }}</h4>
                  <p class="text-xs text-secondary capitalize">{{ video.plataforma }}</p>
                </div>
                <span class="text-primary font-bold text-sm bg-white px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  Ver
                </span>
              </a>
            </div>
            <p v-else class="text-secondary text-sm">No hay clases grabadas para esta semana.</p>
          </section>

          <!-- Materiales & Quiz -->
          <div class="space-y-6">
            <!-- Materiales -->
            <section class="bg-surface-container-lowest rounded-3xl p-6 shadow-sm">
              <div class="flex items-center gap-3 mb-6">
                <span class="material-symbols-outlined text-primary">description</span>
                <h3 class="font-headline font-bold text-xl">Guías de Aprendizaje</h3>
              </div>
              <div v-if="materialesActivos.length > 0" class="space-y-3">
                <a
                  v-for="mat in materialesActivos"
                  :key="mat.id"
                  :href="mat.archivo_url"
                  target="_blank"
                  class="flex items-center justify-between p-3 bg-surface rounded-xl border border-outline-variant/10 hover:bg-surface-container-low transition-colors block"
                >
                  <div class="flex items-center gap-3">
                    <span class="material-symbols-outlined text-tertiary">picture_as_pdf</span>
                    <div>
                      <span class="font-medium text-sm block">{{ mat.nombre }}</span>
                      <span class="text-xs text-secondary capitalize">{{ mat.tipo }}</span>
                    </div>
                  </div>
                  <span class="material-symbols-outlined text-primary">download</span>
                </a>
              </div>
              <p v-else class="text-secondary text-sm">No hay guías para esta semana.</p>
            </section>

            <!-- Quiz -->
            <NuxtLink :to="`/quiz/${cursoId}`" class="block">
              <section class="bg-tertiary text-white rounded-3xl p-6 shadow-xl relative overflow-hidden group cursor-pointer hover:shadow-2xl transition-shadow">
                <div class="relative z-10">
                  <div class="flex items-center gap-3 mb-2">
                    <span class="material-symbols-outlined">quiz</span>
                    <h3 class="font-headline font-bold text-xl">Evaluación Semanal</h3>
                  </div>
                  <p class="text-on-tertiary-container text-sm mb-6">Pon a prueba tus conocimientos.</p>
                  <div class="w-full bg-white text-tertiary font-extrabold py-3 rounded-2xl shadow-lg active:scale-95 duration-200 text-center">
                    Iniciar evaluación
                  </div>
                </div>
                <span class="material-symbols-outlined absolute -bottom-6 -right-6 text-9xl opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700">fact_check</span>
              </section>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Loading -->
  <div v-else class="flex items-center justify-center h-64">
    <div class="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
  </div>
</template>
