<script setup lang="ts">
definePageMeta({ layout: 'default', middleware: 'auth' })

const route = useRoute()
const cursoId = route.params.cursoId as string
const { fetchQuizzes, submitAnswer } = useQuiz()

const preguntas = ref<any[]>([])
const currentIndex = ref(0)
const selectedAnswer = ref<string | null>(null)
const submitted = ref(false)
const resultCorrect = ref<boolean | null>(null)
const score = ref(0)
const finished = ref(false)
const loading = ref(true)
const timerSeconds = ref(45 * 60)

// Fallback de preguntas estáticas
const fallbackPreguntas = [
  {
    id: '1',
    pregunta: '¿Cómo se dice \'hola\' en quechua?',
    categoria: 'Pregunta de vocabulario',
    opciones: ['Allinllachu', 'Napaykullayki', 'Rimaykullayki', 'Sulpayki'],
    respuesta_correcta: 'Napaykullayki',
  },
  {
    id: '2',
    pregunta: '¿Qué significa \'ñuqa\'?',
    categoria: 'Pronombres',
    opciones: ['Tú', 'Él/Ella', 'Yo', 'Nosotros'],
    respuesta_correcta: 'Yo',
  },
  {
    id: '3',
    pregunta: '¿Cómo se dice \'gracias\' en quechua?',
    categoria: 'Expresiones básicas',
    opciones: ['Allinllachu', 'Sulpayki', 'Rimaykullayki', 'Tupananchiskama'],
    respuesta_correcta: 'Sulpayki',
  },
  {
    id: '4',
    pregunta: '¿Qué sufijo indica posesión en primera persona?',
    categoria: 'Gramática',
    opciones: ['-yki', '-n', '-y', '-nchis'],
    respuesta_correcta: '-y',
  },
  {
    id: '5',
    pregunta: '¿Cómo se dice \'agua\' en quechua?',
    categoria: 'Vocabulario',
    opciones: ['Unu', 'Rumi', 'Sara', 'Allpa'],
    respuesta_correcta: 'Unu',
  },
]

onMounted(() => {
  preguntas.value = fallbackPreguntas
  loading.value = false

  fetchQuizzes(cursoId)
    .then(data => { if (data?.length) preguntas.value = data })
    .catch(() => {})
})

const currentQuestion = computed(() => preguntas.value[currentIndex.value])
const totalQuestions = computed(() => preguntas.value.length)
const progressPercent = computed(() => Math.round(((currentIndex.value + 1) / totalQuestions.value) * 100))
const strokeOffset = computed(() => 100 - progressPercent.value)

const timerDisplay = computed(() => {
  const m = Math.floor(timerSeconds.value / 60)
  const s = timerSeconds.value % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
})

let timerInterval: ReturnType<typeof setInterval>
onMounted(() => {
  timerInterval = setInterval(() => {
    if (timerSeconds.value > 0) timerSeconds.value--
  }, 1000)
})
onUnmounted(() => clearInterval(timerInterval))

const handleSubmit = () => {
  if (!selectedAnswer.value || submitted.value) return

  const isCorrect = selectedAnswer.value === currentQuestion.value.respuesta_correcta
  resultCorrect.value = isCorrect
  submitted.value = true

  if (isCorrect) score.value++
}

const nextQuestion = () => {
  if (currentIndex.value < totalQuestions.value - 1) {
    currentIndex.value++
    selectedAnswer.value = null
    submitted.value = false
    resultCorrect.value = null
  } else {
    finished.value = true
  }
}

const skipQuestion = () => {
  nextQuestion()
}

const goBack = () => {
  navigateTo(`/curso/${cursoId}`)
}
</script>

<template>
  <div class="bg-surface text-on-surface min-h-screen">
    <!-- TopAppBar (Transactional) -->
    <header class="fixed top-0 w-full z-50 glassmorphic">
      <div class="flex justify-between items-center w-full px-8 py-4">
        <div class="flex items-center gap-4">
          <button
            class="flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-container-low transition-colors active:scale-95"
            @click="goBack"
          >
            <span class="material-symbols-outlined text-primary">arrow_back</span>
          </button>
          <div class="flex flex-col">
            <span class="font-label text-[10px] uppercase tracking-widest text-secondary font-bold">Evaluación en curso</span>
            <h1 class="font-headline font-bold text-lg tracking-tight text-primary">Semana 1</h1>
          </div>
        </div>
        <div class="hidden md:flex items-center gap-6">
          <div class="flex items-center gap-2 px-3 py-1.5 bg-surface-container rounded-full">
            <span class="material-symbols-outlined text-primary text-sm" style="font-variation-settings: 'FILL' 1;">timer</span>
            <span class="font-label text-sm font-bold text-on-surface">{{ timerDisplay }}</span>
          </div>
        </div>
      </div>
    </header>

    <main class="pt-24 pb-32 px-6 md:px-0">
      <div v-if="loading" class="flex items-center justify-center h-64">
        <div class="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>

      <!-- Finished State -->
      <div v-else-if="finished" class="max-w-3xl mx-auto space-y-8">
        <section class="bg-surface-container-lowest rounded-[1.5rem] shadow-[0_8px_24px_rgba(26,28,28,0.04)] p-12 text-center">
          <div class="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
            :class="score >= totalQuestions / 2 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-error'"
          >
            <span class="material-symbols-outlined text-5xl" style="font-variation-settings: 'FILL' 1;">
              {{ score >= totalQuestions / 2 ? 'emoji_events' : 'sentiment_dissatisfied' }}
            </span>
          </div>
          <h2 class="font-headline text-3xl font-extrabold mb-2">¡Evaluación Completada!</h2>
          <p class="text-secondary text-lg mb-8">
            Obtuviste <span class="font-bold text-primary">{{ score }}</span> de <span class="font-bold">{{ totalQuestions }}</span> respuestas correctas
          </p>
          <div class="text-6xl font-black font-headline mb-8"
            :class="score >= totalQuestions / 2 ? 'text-green-600' : 'text-error'"
          >
            {{ Math.round((score / totalQuestions) * 100) }}%
          </div>
          <button
            class="bg-primary text-on-primary px-12 py-4 rounded-xl font-headline font-bold text-lg shadow-xl shadow-red-900/20 hover:bg-primary-container transition-all active:scale-95"
            @click="goBack"
          >
            Volver al Curso
          </button>
        </section>
      </div>

      <!-- Quiz Active -->
      <div v-else class="max-w-3xl mx-auto space-y-8">
        <!-- Progress -->
        <section class="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-surface-container-low p-6 rounded-[1.5rem]">
          <div class="md:col-span-2 flex flex-col gap-1">
            <h2 class="font-headline text-xl font-extrabold text-on-surface">Tu Progreso</h2>
            <p class="font-body text-secondary text-sm">Responde con calma. Tienes 4 opciones por cada pregunta.</p>
            <div class="mt-4 flex items-center gap-4">
              <div class="flex-1 h-3 bg-surface-container-high rounded-full overflow-hidden">
                <div class="h-full bg-primary rounded-full shadow-lg shadow-red-900/10 transition-all duration-500" :style="{ width: progressPercent + '%' }"></div>
              </div>
              <span class="font-label text-xs font-bold text-primary whitespace-nowrap">Pregunta {{ currentIndex + 1 }} de {{ totalQuestions }}</span>
            </div>
          </div>
          <div class="flex justify-center">
            <div class="relative w-24 h-24 flex items-center justify-center">
              <svg class="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#eeeeee" stroke-width="3" />
                <path
                  class="transition-all duration-500"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#af101a"
                  stroke-linecap="round"
                  stroke-width="3"
                  :stroke-dasharray="100"
                  :stroke-dashoffset="strokeOffset"
                />
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="font-headline font-black text-primary text-xl tracking-tighter">{{ progressPercent }}%</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Question Card -->
        <article class="bg-surface-container-lowest rounded-[1.5rem] shadow-[0_8px_24px_rgba(26,28,28,0.04)] overflow-hidden">
          <div class="p-8 border-b border-surface-container-low">
            <span class="font-label text-[10px] uppercase tracking-widest text-primary font-bold mb-2 block">{{ currentQuestion.categoria }}</span>
            <h3 class="font-headline text-2xl font-bold leading-tight text-on-surface">
              {{ currentIndex + 1 }}. {{ currentQuestion.pregunta }}
            </h3>
          </div>
          <div class="p-8 space-y-4">
            <UiQuizOption
              v-for="(opcion, idx) in currentQuestion.opciones"
              :key="idx"
              :label="opcion"
              :value="opcion"
              :model-value="selectedAnswer"
              :disabled="submitted"
              :correct="submitted && selectedAnswer === opcion
                ? opcion === currentQuestion.respuesta_correcta
                : submitted && opcion === currentQuestion.respuesta_correcta
                  ? true
                  : null"
              @update:model-value="selectedAnswer = $event"
            />
          </div>

          <!-- Result feedback -->
          <div v-if="submitted" class="px-8 pb-6">
            <div
              class="p-4 rounded-xl text-sm font-bold"
              :class="resultCorrect ? 'bg-green-50 text-green-700' : 'bg-error-container text-on-error-container'"
            >
              <span class="material-symbols-outlined align-middle mr-2" style="font-variation-settings: 'FILL' 1;">
                {{ resultCorrect ? 'check_circle' : 'cancel' }}
              </span>
              {{ resultCorrect
                ? '¡Correcto! Bien hecho.'
                : `Incorrecto. La respuesta correcta es: ${currentQuestion.respuesta_correcta}` }}
            </div>
          </div>
        </article>

        <!-- Actions -->
        <div class="flex flex-col md:flex-row items-center justify-between gap-6 pt-4">
          <button
            v-if="!submitted"
            class="w-full md:w-auto px-8 h-14 flex items-center justify-center font-label text-sm font-bold uppercase tracking-widest text-secondary hover:bg-surface-container-high rounded-xl transition-all active:scale-95"
            @click="skipQuestion"
          >
            Saltar pregunta
          </button>
          <div v-else class="w-full md:w-auto"></div>

          <button
            v-if="!submitted"
            class="w-full md:w-auto px-12 h-14 bg-primary text-on-primary rounded-xl font-headline font-bold text-lg shadow-xl shadow-red-900/20 hover:bg-primary-container transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
            :disabled="!selectedAnswer"
            @click="handleSubmit"
          >
            Enviar respuesta
            <span class="material-symbols-outlined">send</span>
          </button>
          <button
            v-else
            class="w-full md:w-auto px-12 h-14 bg-primary text-on-primary rounded-xl font-headline font-bold text-lg shadow-xl shadow-red-900/20 hover:bg-primary-container transition-all active:scale-95 flex items-center justify-center gap-3"
            @click="nextQuestion"
          >
            {{ currentIndex < totalQuestions - 1 ? 'Siguiente pregunta' : 'Ver resultado' }}
            <span class="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
    </main>

    <!-- Floating Tip -->
    <div class="fixed bottom-10 right-10 hidden lg:block max-w-xs">
      <div class="bg-surface-container-lowest p-5 rounded-[1.5rem] shadow-2xl border border-outline-variant/20 relative overflow-hidden">
        <div class="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full -mr-8 -mt-8"></div>
        <div class="flex items-center gap-3 mb-2">
          <span class="material-symbols-outlined text-tertiary" style="font-variation-settings: 'FILL' 1;">lightbulb</span>
          <span class="font-label text-xs font-bold uppercase tracking-tight text-on-surface">Tip Académico</span>
        </div>
        <p class="font-body text-xs text-secondary leading-relaxed">
          El quechua es una lengua aglutinante. Muchas palabras se forman añadiendo sufijos a una raíz léxica común. ¡Asegúrate de revisar los sufijos de cortesía!
        </p>
      </div>
    </div>

    <!-- Background blobs -->
    <div class="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      <div class="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full"></div>
      <div class="absolute top-[60%] -right-[5%] w-[30%] h-[30%] bg-tertiary/5 blur-[100px] rounded-full"></div>
    </div>
  </div>
</template>
