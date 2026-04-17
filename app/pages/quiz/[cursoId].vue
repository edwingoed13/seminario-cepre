<script setup lang="ts">
definePageMeta({ layout: 'default', middleware: 'auth' })

const route = useRoute()
const cursoId = route.params.cursoId as string
const supabase = useSupabaseClient()
const { fetchQuizzes, submitAnswer } = useQuiz()
const { user } = useAuth()

const TOTAL_MOSTRAR = 10
const TIMER_SECONDS = 10 * 60

// Estados
const preguntas = ref<any[]>([])
const currentIndex = ref(0)
const selectedAnswer = ref<string | null>(null)
const submitted = ref(false)
const resultCorrect = ref<boolean | null>(null)
const score = ref(0)
const finished = ref(false)
const loading = ref(true)
const savingSession = ref(false)
const timerSeconds = ref(TIMER_SECONDS)
const timerStarted = ref(false)
const ranking = ref<any[]>([])
const yaResolvio = ref(false)
const sesionPrevia = ref<any>(null)

// Curso info
const cursoNombre = ref('')

const fetchCursoNombre = async () => {
  const { data } = await supabase.from('cursos').select('nombre').eq('id', cursoId).single()
  cursoNombre.value = data?.nombre || 'Quiz'
}

// Mezclar array (Fisher-Yates)
const shuffle = <T>(arr: T[]): T[] => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

onMounted(async () => {
  await fetchCursoNombre()

  // Verificar si ya resolvió esta semana
  if (user.value?.dni) {
    const inicioSemana = new Date()
    inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay())
    inicioSemana.setHours(0, 0, 0, 0)

    const { data: sesiones } = await supabase
      .from('quiz_sesiones')
      .select('*')
      .eq('estudiante_dni', user.value.dni)
      .eq('curso_id', cursoId)
      .gte('created_at', inicioSemana.toISOString())
      .order('created_at', { ascending: false })
      .limit(1)

    if (sesiones?.length) {
      yaResolvio.value = true
      sesionPrevia.value = sesiones[0]

      // Cargar ranking
      const { data: rankingData } = await supabase
        .from('quiz_sesiones')
        .select('*')
        .eq('curso_id', cursoId)
        .gte('created_at', inicioSemana.toISOString())
        .order('puntaje', { ascending: false })
        .order('tiempo_segundos', { ascending: true })
        .limit(10)
      ranking.value = rankingData || []

      loading.value = false
      return
    }
  }

  try {
    const all = await fetchQuizzes(cursoId)
    if (all?.length) {
      const shuffled = shuffle(all)
      preguntas.value = shuffled.slice(0, TOTAL_MOSTRAR)
    }
  } catch {
    // fallback vacío
  } finally {
    loading.value = false
  }
})

// Timer
let timerInterval: ReturnType<typeof setInterval> | null = null

const startTimer = () => {
  if (timerStarted.value) return
  timerStarted.value = true
  timerInterval = setInterval(() => {
    if (timerSeconds.value > 0) {
      timerSeconds.value--
    } else {
      finishQuiz()
    }
  }, 1000)
}

onUnmounted(() => { if (timerInterval) clearInterval(timerInterval) })

const currentQuestion = computed(() => preguntas.value[currentIndex.value])
const totalQuestions = computed(() => preguntas.value.length)
const progressPercent = computed(() => Math.round(((currentIndex.value + 1) / totalQuestions.value) * 100))

const timerDisplay = computed(() => {
  const m = Math.floor(timerSeconds.value / 60)
  const s = timerSeconds.value % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
})

const tiempoUsado = computed(() => TIMER_SECONDS - timerSeconds.value)

const timerColor = computed(() => {
  if (timerSeconds.value < 60) return 'error'
  if (timerSeconds.value < 180) return 'warning'
  return 'primary'
})

// Acciones
const handleSubmit = async () => {
  if (!selectedAnswer.value || submitted.value) return

  // Iniciar timer en la primera respuesta
  startTimer()

  const isCorrect = selectedAnswer.value === currentQuestion.value.respuesta_correcta
  resultCorrect.value = isCorrect
  submitted.value = true
  if (isCorrect) score.value++

  if (user.value?.dni) {
    try {
      await submitAnswer(user.value.dni, currentQuestion.value.id, selectedAnswer.value, isCorrect)
    } catch (e) {
      console.error('Error guardando respuesta:', e)
    }
  }
}

const nextQuestion = () => {
  if (currentIndex.value < totalQuestions.value - 1) {
    currentIndex.value++
    selectedAnswer.value = null
    submitted.value = false
    resultCorrect.value = null
  } else {
    finishQuiz()
  }
}

const finishQuiz = async () => {
  if (timerInterval) clearInterval(timerInterval)
  finished.value = true
  savingSession.value = true

  // Guardar sesión
  if (user.value?.dni) {
    try {
      await supabase.from('quiz_sesiones').insert({
        estudiante_dni: user.value.dni,
        estudiante_nombre: `${user.value.nombres} ${user.value.paterno}`,
        curso_id: cursoId,
        puntaje: score.value,
        total_preguntas: totalQuestions.value,
        tiempo_segundos: tiempoUsado.value,
      })
    } catch (e) {
      console.error('Error guardando sesión:', e)
    }
  }

  // Cargar ranking
  try {
    const { data } = await supabase
      .from('quiz_sesiones')
      .select('*')
      .eq('curso_id', cursoId)
      .order('puntaje', { ascending: false })
      .order('tiempo_segundos', { ascending: true })
      .limit(10)
    ranking.value = data || []
  } catch {
    ranking.value = []
  }

  savingSession.value = false
}

const skipQuestion = () => {
  startTimer()
  nextQuestion()
}

const goBack = () => navigateTo(`/curso/${cursoId}`)

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s.toString().padStart(2, '0')}s`
}

const optionClass = (opcion: string) => {
  if (submitted.value) {
    if (opcion === currentQuestion.value.respuesta_correcta) return 'border-success bg-success/10'
    if (opcion === selectedAnswer.value) return 'border-error bg-error/10'
    return 'border-transparent opacity-60'
  }
  if (selectedAnswer.value === opcion) return 'border-primary bg-primary/5'
  return 'border-transparent hover:bg-surface-container-low'
}

const radioClass = (opcion: string) => {
  if (submitted.value) {
    if (opcion === currentQuestion.value.respuesta_correcta) return 'border-success bg-success'
    if (opcion === selectedAnswer.value) return 'border-error bg-error'
    return 'border-outline-variant'
  }
  return selectedAnswer.value === opcion ? 'border-primary bg-primary' : 'border-outline-variant'
}
</script>

<template>
  <div class="bg-surface text-on-surface min-h-screen">
    <!-- Header -->
    <header class="fixed top-0 w-full z-50 glassmorphic">
      <div class="flex justify-between items-center w-full px-4 md:px-8 py-3 md:py-4">
        <div class="flex items-center gap-3 md:gap-4">
          <UButton icon="i-lucide-arrow-left" color="primary" variant="ghost" size="md" @click="goBack" />
          <div class="flex flex-col">
            <span class="font-label text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Evaluación</span>
            <h1 class="font-headline font-bold text-base md:text-lg tracking-tight text-primary">{{ cursoNombre }}</h1>
          </div>
        </div>
        <UBadge :color="timerColor" variant="soft" size="lg" class="gap-2">
          <UIcon name="i-lucide-timer" />
          <span class="font-label text-sm font-bold font-mono">{{ timerDisplay }}</span>
        </UBadge>
      </div>
    </header>

    <main class="pt-16 md:pt-20 pb-8 px-3 md:px-6">
      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center h-48">
        <UIcon name="i-lucide-loader-circle" class="animate-spin text-primary text-3xl" />
      </div>

      <!-- Ya resolvió esta semana -->
      <div v-else-if="yaResolvio && sesionPrevia" class="max-w-2xl mx-auto space-y-4">
        <UCard :ui="{ body: 'p-5 md:p-8 text-center' }">
          <UIcon name="i-lucide-lock" class="text-on-surface-variant text-4xl mb-3" />
          <h2 class="font-headline text-xl md:text-2xl font-extrabold mb-1">Ya completaste esta evaluación</h2>
          <p class="text-on-surface-variant text-sm mb-4">Solo puedes resolver el quiz una vez por semana.</p>
          <div
            class="text-4xl font-black font-headline mb-1"
            :class="sesionPrevia.puntaje >= sesionPrevia.total_preguntas / 2 ? 'text-success' : 'text-error'"
          >
            {{ sesionPrevia.puntaje }}/{{ sesionPrevia.total_preguntas }}
          </div>
          <p class="text-xs text-on-surface-variant mb-4">
            Tiempo: <span class="font-bold">{{ formatTime(sesionPrevia.tiempo_segundos || 0) }}</span>
          </p>
          <UButton color="primary" size="lg" @click="goBack">Volver al Curso</UButton>
        </UCard>

        <UCard v-if="ranking.length > 0" :ui="{ body: 'p-4 md:p-5' }">
          <div class="flex items-center gap-2 mb-3">
            <UIcon name="i-lucide-medal" class="text-primary" />
            <h3 class="font-headline font-bold text-base">Ranking — Top 10</h3>
          </div>
          <div class="space-y-1.5">
            <div
              v-for="(r, i) in ranking"
              :key="r.id"
              class="flex items-center gap-2.5 p-2 rounded-lg text-sm"
              :class="r.estudiante_dni === user?.dni ? 'bg-primary/10 ring-1 ring-primary/20' : 'bg-surface-container-low'"
            >
              <div
                class="w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] shrink-0"
                :class="{
                  'bg-yellow-400 text-yellow-900': i === 0,
                  'bg-gray-300 text-gray-700': i === 1,
                  'bg-amber-600 text-white': i === 2,
                  'bg-surface-container-high text-on-surface-variant': i > 2,
                }"
              >
                {{ i + 1 }}
              </div>
              <div class="flex-grow min-w-0">
                <p class="font-semibold text-xs truncate">
                  {{ r.estudiante_nombre || r.estudiante_dni }}
                  <span v-if="r.estudiante_dni === user?.dni" class="text-primary">(Tú)</span>
                </p>
              </div>
              <span class="text-[10px] text-on-surface-variant">{{ formatTime(r.tiempo_segundos || 0) }}</span>
              <span class="font-black text-sm" :class="r.puntaje >= r.total_preguntas / 2 ? 'text-success' : 'text-error'">
                {{ r.puntaje }}<span class="text-[10px] text-on-surface-variant font-normal">/{{ r.total_preguntas }}</span>
              </span>
            </div>
          </div>
        </UCard>
      </div>

      <!-- No hay preguntas -->
      <div v-else-if="preguntas.length === 0" class="max-w-2xl mx-auto">
        <UCard :ui="{ body: 'p-6 text-center' }">
          <UIcon name="i-lucide-clipboard-x" class="text-on-surface-variant text-4xl mb-3" />
          <h2 class="font-headline text-xl font-bold mb-1">Sin preguntas disponibles</h2>
          <p class="text-on-surface-variant text-sm mb-4">Aún no se han cargado preguntas para este curso.</p>
          <UButton color="primary" size="md" @click="goBack">Volver al curso</UButton>
        </UCard>
      </div>

      <!-- Resultado final -->
      <div v-else-if="finished" class="max-w-2xl mx-auto space-y-4">
        <UCard :ui="{ body: 'p-5 md:p-8 text-center' }">
          <div
            class="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center"
            :class="score >= totalQuestions / 2 ? 'bg-success/15 text-success' : 'bg-error/15 text-error'"
          >
            <UIcon :name="score >= totalQuestions / 2 ? 'i-lucide-trophy' : 'i-lucide-frown'" class="text-3xl" />
          </div>
          <h2 class="font-headline text-xl md:text-2xl font-extrabold mb-1">¡Evaluación Completada!</h2>
          <p class="text-on-surface-variant text-sm mb-3">
            Obtuviste <span class="font-bold text-primary">{{ score }}</span> de <span class="font-bold">{{ totalQuestions }}</span> correctas
          </p>
          <div
            class="text-4xl font-black font-headline mb-1"
            :class="score >= totalQuestions / 2 ? 'text-success' : 'text-error'"
          >
            {{ score }}/{{ totalQuestions }}
          </div>
          <p class="text-xs text-on-surface-variant mb-4">
            Tiempo: <span class="font-bold">{{ formatTime(tiempoUsado) }}</span>
          </p>
          <UButton color="primary" size="lg" @click="goBack">Volver al Curso</UButton>
        </UCard>

        <!-- Ranking -->
        <UCard v-if="ranking.length > 0" :ui="{ body: 'p-4 md:p-5' }">
          <div class="flex items-center gap-2 mb-3">
            <UIcon name="i-lucide-medal" class="text-primary" />
            <h3 class="font-headline font-bold text-base">Ranking — Top 10</h3>
          </div>
          <div class="space-y-1.5">
            <div
              v-for="(r, i) in ranking"
              :key="r.id"
              class="flex items-center gap-2.5 p-2 rounded-lg text-sm"
              :class="r.estudiante_dni === user?.dni ? 'bg-primary/10 ring-1 ring-primary/20' : 'bg-surface-container-low'"
            >
              <div
                class="w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] shrink-0"
                :class="{
                  'bg-yellow-400 text-yellow-900': i === 0,
                  'bg-gray-300 text-gray-700': i === 1,
                  'bg-amber-600 text-white': i === 2,
                  'bg-surface-container-high text-on-surface-variant': i > 2,
                }"
              >
                {{ i + 1 }}
              </div>
              <div class="flex-grow min-w-0">
                <p class="font-semibold text-xs truncate">
                  {{ r.estudiante_nombre || r.estudiante_dni }}
                  <span v-if="r.estudiante_dni === user?.dni" class="text-primary">(Tú)</span>
                </p>
              </div>
              <span class="text-[10px] text-on-surface-variant">{{ formatTime(r.tiempo_segundos || 0) }}</span>
              <span class="font-black text-sm" :class="r.puntaje >= r.total_preguntas / 2 ? 'text-success' : 'text-error'">
                {{ r.puntaje }}<span class="text-[10px] text-on-surface-variant font-normal">/{{ r.total_preguntas }}</span>
              </span>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Quiz activo -->
      <div v-else class="max-w-2xl mx-auto space-y-3 md:space-y-5">
        <!-- Progreso -->
        <div class="flex items-center gap-3">
          <div class="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden">
            <div class="h-full bg-primary rounded-full transition-all duration-500" :style="{ width: progressPercent + '%' }"></div>
          </div>
          <span class="font-label text-[10px] font-bold text-primary whitespace-nowrap">{{ currentIndex + 1 }}/{{ totalQuestions }}</span>
        </div>
        <p v-if="!timerStarted" class="text-[10px] text-on-surface-variant text-center -mt-2">
          El timer inicia cuando respondas
        </p>

        <!-- Pregunta -->
        <UCard :ui="{ body: 'p-0' }">
          <div class="px-4 py-3 md:px-6 md:py-4 border-b border-outline-variant/30">
            <UBadge color="primary" variant="soft" size="xs" class="mb-1.5">{{ currentQuestion.categoria }}</UBadge>
            <h3 class="font-headline text-base md:text-lg font-bold leading-snug text-on-surface">
              {{ currentIndex + 1 }}. {{ currentQuestion.pregunta }}
            </h3>
          </div>
          <div class="p-3 md:p-5 space-y-2">
            <label
              v-for="(opcion, idx) in currentQuestion.opciones"
              :key="idx"
              class="group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 border-2 active:scale-[0.98]"
              :class="[optionClass(opcion), submitted ? 'pointer-events-none' : '']"
            >
              <input v-model="selectedAnswer" type="radio" :value="opcion" class="sr-only" :disabled="submitted" />
              <div class="w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 text-[10px] font-bold" :class="radioClass(opcion)">
                <span v-if="!submitted || (opcion !== currentQuestion.respuesta_correcta && opcion !== selectedAnswer)" class="text-white">
                  {{ ['A','B','C','D','E'][idx] }}
                </span>
                <UIcon v-else-if="opcion === currentQuestion.respuesta_correcta" name="i-lucide-check" class="text-white text-xs" />
                <UIcon v-else name="i-lucide-x" class="text-white text-xs" />
              </div>
              <span class="font-body text-sm transition-all flex-grow" :class="selectedAnswer === opcion ? 'text-on-surface font-bold' : 'text-on-surface-variant group-hover:text-on-surface'">
                {{ opcion }}
              </span>
            </label>
          </div>

          <UAlert
            v-if="submitted"
            :icon="resultCorrect ? 'i-lucide-check-circle-2' : 'i-lucide-x-circle'"
            :color="resultCorrect ? 'success' : 'error'"
            variant="soft"
            :title="resultCorrect ? '¡Correcto! +1 punto' : `Incorrecto. Respuesta: ${currentQuestion.respuesta_correcta}`"
            class="mx-3 md:mx-5 mb-3 md:mb-5"
          />
        </UCard>

        <!-- Acciones -->
        <div class="flex items-center justify-between gap-3">
          <UButton
            v-if="!submitted"
            color="neutral"
            variant="ghost"
            size="md"
            @click="skipQuestion"
          >
            Saltar
          </UButton>
          <div v-else></div>

          <UButton
            v-if="!submitted"
            color="primary"
            size="md"
            trailing-icon="i-lucide-send"
            :disabled="!selectedAnswer"
            @click="handleSubmit"
          >
            Enviar
          </UButton>
          <UButton
            v-else
            color="primary"
            size="md"
            trailing-icon="i-lucide-arrow-right"
            @click="nextQuestion"
          >
            {{ currentIndex < totalQuestions - 1 ? 'Siguiente' : 'Ver resultado' }}
          </UButton>
        </div>
      </div>
    </main>

    <!-- Background -->
    <div class="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      <div class="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full"></div>
      <div class="absolute top-[60%] -right-[5%] w-[30%] h-[30%] bg-tertiary/5 blur-[100px] rounded-full"></div>
    </div>
  </div>
</template>
