<script setup lang="ts">
definePageMeta({ layout: 'auth', middleware: 'auth' })

const route = useRoute()
const cursoId = route.params.id as string
const { fetchCurso, fetchSemanas, fetchMateriales, fetchVideos } = useCursos()

const curso = ref<any>(null)
const semanas = ref<any[]>([])
const materiales = ref<any[]>([])
const videos = ref<any[]>([])
const loading = ref(true)

// Datos de cronograma estáticos (del diseño Stitch)
const cronograma = [
  { fecha: '11 de abril', dia: 'Jueves', actual: true },
  { fecha: '25 abril', dia: '', actual: false },
  { fecha: '9 mayo', dia: '', actual: false },
  { fecha: '23 mayo', dia: '', actual: false },
  { fecha: '30 mayo', dia: '', actual: false },
  { fecha: '6 junio', dia: '', actual: false, bloqueado: true },
  { fecha: '13 junio', dia: '', actual: false, bloqueado: true },
  { fecha: '20 junio', dia: '', actual: false, bloqueado: true },
]

const horarios = [
  { curso: 'Aimara', hora: '9:00 – 10:20', activo: false },
  { curso: 'Quechua', hora: '10:20 – 11:40', activo: true },
  { curso: 'Inglés', hora: '11:40 – 13:00', activo: false },
]

const clasesGrabadas = [
  { semana: 'Semana 1', titulo: 'Introducción al Quechua Collao' },
  { semana: 'Semana 2', titulo: 'Pronombres y Saludos' },
  { semana: 'Semana 3', titulo: 'Sufijos posesivos' },
]

// Fallback de cursos estáticos
const cursosMap: Record<string, any> = {
  '1': { nombre: 'Quechua', descripcion: 'Explora la riqueza del Runa Simi. Domina la comunicación, gramática y cosmovisión andina.' },
  '2': { nombre: 'Aimara', descripcion: 'Estudio profundo de la fonética y estructura social del idioma Aimara contemporáneo.' },
  '3': { nombre: 'Inglés', descripcion: 'Preparación para exámenes internacionales y comunicación global efectiva.' },
}

onMounted(() => {
  // Usar datos estáticos directamente (Supabase se conecta cuando esté configurado)
  curso.value = cursosMap[cursoId] || { nombre: 'Curso', descripcion: 'Descripción del curso.' }

  // Intentar cargar desde Supabase en segundo plano
  fetchCurso(cursoId)
    .then(data => { if (data) curso.value = data })
    .catch(() => {})

  fetchSemanas(cursoId)
    .then(data => { if (data?.length) semanas.value = data })
    .catch(() => {})

  loading.value = false
})
</script>

<template>
  <div v-if="!loading">
    <!-- Hero Section -->
    <section class="relative overflow-hidden rounded-3xl mb-8 bg-gradient-to-br from-primary to-primary-container p-8 md:p-12 text-on-primary">
      <div class="relative z-10 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <span class="font-label font-bold uppercase tracking-[0.2em] text-white/70 mb-2 block">Idioma Nativo</span>
          <h2 class="font-headline font-extrabold text-4xl md:text-6xl mb-4 leading-tight">
            Curso de {{ curso?.nombre }}
          </h2>
          <p class="text-on-primary-container text-lg opacity-90 max-w-md">
            {{ curso?.descripcion }}
          </p>
          <div class="mt-8 flex gap-4">
            <button class="bg-surface-container-lowest text-primary font-bold px-8 py-4 rounded-xl flex items-center gap-2 active:scale-95 duration-200 shadow-xl">
              <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">play_circle</span>
              Continuar Clase
            </button>
          </div>
        </div>
        <div class="hidden md:flex justify-end">
          <div class="relative">
            <div class="absolute -top-4 -left-4 bg-tertiary text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 z-10">
              <span class="material-symbols-outlined text-sm">verified</span>
              Oficial CEPREUNA
            </div>
            <img
              alt="Cultura andina"
              class="rounded-2xl shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500 w-80 h-auto"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuANKW4uPPQ-xrq3FfZsDi2drjRvuvKV3IbnML3KLYjhvRqg6TvYL4UXIasdMbtGvo9jnS2zyA8mp5lOhBVyccA1w5vVs70mbjv--XYO8IpalC09ew8vo5lmZfXNJKaAOmtV8qzO0AjxJxj2TF_gcWVsNMKhLKwy1dpsSACSU5-hT3FGwnePT2QRcX6IJrX2zhgUw0_Pq1vglUbi8Ig9FaYYbsXr4S1QNIg9d5LQ_skUVvhos9cPl8DoChGzcQ2HveOq1Zrn1M45Gnc"
            />
          </div>
        </div>
      </div>
      <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
      <div class="absolute bottom-0 left-0 w-48 h-48 bg-primary-container/30 rounded-full -ml-24 -mb-24 blur-2xl"></div>
    </section>

    <!-- Main Bento Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left: Cronograma -->
      <div class="lg:col-span-1 space-y-6">
        <section class="bg-surface-container-lowest rounded-3xl p-6 shadow-sm">
          <div class="flex items-center gap-3 mb-6">
            <span class="material-symbols-outlined text-primary">calendar_today</span>
            <h3 class="font-headline font-bold text-xl">Cronograma</h3>
          </div>
          <div class="space-y-3">
            <!-- Próxima sesión -->
            <div class="bg-primary-fixed p-4 rounded-2xl">
              <span class="font-label text-xs font-bold text-primary block mb-1">PRÓXIMA SESIÓN</span>
              <div class="flex justify-between items-center">
                <span class="font-bold">{{ cronograma[0].fecha }}</span>
                <span class="text-sm font-medium text-secondary">{{ cronograma[0].dia }}</span>
              </div>
            </div>

            <!-- Resto de fechas -->
            <div class="mt-4 space-y-2">
              <div
                v-for="(item, idx) in cronograma.slice(1)"
                :key="idx"
                class="p-4 hover:bg-surface-container-low rounded-xl transition-colors flex justify-between items-center group"
              >
                <span class="font-medium" :class="item.bloqueado ? 'text-secondary/50' : ''">{{ item.fecha }}</span>
                <span v-if="item.bloqueado" class="material-symbols-outlined text-outline-variant">lock</span>
                <span v-else class="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">chevron_right</span>
              </div>
            </div>
          </div>

          <!-- Horario General -->
          <div class="mt-8 p-5 bg-primary-fixed rounded-2xl">
            <h4 class="font-bold text-on-primary-fixed mb-4 flex items-center gap-2">
              <span class="material-symbols-outlined">schedule</span>
              Horario General
            </h4>
            <div class="space-y-3">
              <div
                v-for="h in horarios"
                :key="h.curso"
                class="flex justify-between items-center p-2 rounded-lg"
                :class="h.activo
                  ? 'bg-primary text-white shadow-md scale-105'
                  : 'bg-white/50'"
              >
                <span class="text-xs font-bold uppercase" :class="h.activo ? '' : 'text-on-primary-fixed-variant'">{{ h.curso }}</span>
                <span class="text-sm font-semibold">{{ h.hora }}</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Right: Live, Recordings, Materials -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Clase en Vivo -->
        <section class="bg-surface-container-lowest rounded-3xl p-6 shadow-sm">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <div class="relative flex items-center justify-center w-3 h-3 mr-2">
                <div class="absolute w-full h-full bg-primary rounded-full animate-ping opacity-75"></div>
                <div class="relative w-2 h-2 bg-primary rounded-full"></div>
              </div>
              <h3 class="font-headline font-bold text-xl">Clase en vivo</h3>
            </div>
            <span class="text-xs font-bold text-primary bg-primary-fixed px-3 py-1 rounded-full uppercase tracking-wider">Transmitiendo ahora</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="#" target="_blank" class="flex items-center justify-center gap-3 py-4 bg-[#1877F2] text-white rounded-2xl font-bold shadow-lg hover:brightness-110 active:scale-95 transition-all">
              <span class="material-symbols-outlined">video_library</span>
              Ver en Facebook
            </a>
            <a href="#" target="_blank" class="flex items-center justify-center gap-3 py-4 bg-[#FF0000] text-white rounded-2xl font-bold shadow-lg hover:brightness-110 active:scale-95 transition-all">
              <span class="material-symbols-outlined">smart_display</span>
              Ver en YouTube
            </a>
            <a href="#" target="_blank" class="flex items-center justify-center gap-3 py-4 bg-[#000000] text-white rounded-2xl font-bold shadow-lg hover:brightness-110 active:scale-95 transition-all">
              <span class="material-symbols-outlined">videocam</span>
              Ver en TikTok
            </a>
          </div>
        </section>

        <div class="grid md:grid-cols-2 gap-6">
          <!-- Clases Grabadas -->
          <section class="bg-surface-container-lowest rounded-3xl p-6 shadow-sm">
            <div class="flex items-center gap-3 mb-6">
              <span class="material-symbols-outlined text-primary">movie</span>
              <h3 class="font-headline font-bold text-xl">Clases grabadas</h3>
            </div>
            <div class="space-y-4">
              <div
                v-for="clase in clasesGrabadas"
                :key="clase.semana"
                class="bg-surface-container p-4 rounded-2xl flex items-center justify-between group hover:bg-surface-container-high transition-colors"
              >
                <div>
                  <h4 class="font-bold">{{ clase.semana }}</h4>
                  <p class="text-xs text-secondary">{{ clase.titulo }}</p>
                </div>
                <button class="text-primary font-bold text-sm bg-white px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  Ver grabación
                </button>
              </div>
            </div>
          </section>

          <!-- Materiales & Quiz -->
          <div class="space-y-6">
            <!-- Materiales -->
            <section class="bg-surface-container-lowest rounded-3xl p-6 shadow-sm">
              <div class="flex items-center gap-3 mb-6">
                <span class="material-symbols-outlined text-primary">description</span>
                <h3 class="font-headline font-bold text-xl">Materiales</h3>
              </div>
              <div class="space-y-3">
                <div class="flex items-center justify-between p-3 bg-surface rounded-xl border border-outline-variant/10">
                  <div class="flex items-center gap-3">
                    <span class="material-symbols-outlined text-tertiary">picture_as_pdf</span>
                    <span class="font-medium text-sm">Temario</span>
                  </div>
                  <button class="text-secondary hover:text-primary">
                    <span class="material-symbols-outlined">download</span>
                  </button>
                </div>
                <div class="flex items-center justify-between p-3 bg-surface rounded-xl border border-outline-variant/10">
                  <div class="flex items-center gap-3">
                    <span class="material-symbols-outlined text-tertiary">picture_as_pdf</span>
                    <span class="font-medium text-sm">Guía PDF</span>
                  </div>
                  <button class="text-primary font-bold text-xs bg-primary-fixed px-3 py-1 rounded-lg">
                    Descargar
                  </button>
                </div>
              </div>
            </section>

            <!-- Quiz -->
            <NuxtLink :to="`/quiz/${cursoId}`" class="block">
              <section class="bg-tertiary text-white rounded-3xl p-6 shadow-xl relative overflow-hidden group cursor-pointer hover:shadow-2xl transition-shadow">
                <div class="relative z-10">
                  <div class="flex items-center gap-3 mb-2">
                    <span class="material-symbols-outlined">quiz</span>
                    <h3 class="font-headline font-bold text-xl">Evaluación Semanal</h3>
                  </div>
                  <p class="text-on-tertiary-container text-sm mb-6">Pon a prueba tus conocimientos sobre la Semana 3.</p>
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
