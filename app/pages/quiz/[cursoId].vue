<script setup lang="ts">
definePageMeta({ layout: 'default', middleware: 'auth' })

const route = useRoute()
const cursoId = route.params.cursoId as string
const { fetchQuizzes } = useQuiz()

const preguntas = ref<any[]>([])
const currentIndex = ref(0)
const selectedAnswer = ref<string | null>(null)
const submitted = ref(false)
const resultCorrect = ref<boolean | null>(null)
const score = ref(0)
const finished = ref(false)
const loading = ref(true)
const timerSeconds = ref(45 * 60)

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

const skipQuestion = () => nextQuestion()

const goBack = () => navigateTo(`/curso/${cursoId}`)

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
  const isSelected = selectedAnswer.value === opcion
  if (submitted.value) {
    if (opcion === currentQuestion.value.respuesta_correcta) return 'border-success bg-success'
    if (opcion === selectedAnswer.value) return 'border-error bg-error'
    return 'border-outline-variant'
  }
  return isSelected ? 'border-primary bg-primary' : 'border-outline-variant'
}
</script>

<template>
  <div class="bg-surface text-on-surface min-h-screen">
    <!-- TopAppBar -->
    <header class="fixed top-0 w-full z-50 glassmorphic">
      <div class="flex justify-between items-center w-full px-4 md:px-8 py-3 md:py-4">
        <div class="flex items-center gap-3 md:gap-4">
          <UButton
            icon="i-lucide-arrow-left"
            color="primary"
            variant="ghost"
            size="md"
            aria-label="Volver"
            @click="goBack"
          />
          <div class="flex flex-col">
            <span class="font-label text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Evaluación en curso</span>
            <h1 class="font-headline font-bold text-base md:text-lg tracking-tight text-primary">Semana 1</h1>
          </div>
        </div>
        <UBadge color="primary" variant="soft" size="lg" class="gap-2">
          <UIcon name="i-lucide-timer" />
          <span class="font-label text-sm font-bold">{{ timerDisplay }}</span>
        </UBadge>
      </div>
    </header>

    <main class="pt-20 md:pt-24 pb-12 px-4 md:px-6">
      <div v-if="loading" class="flex items-center justify-center h-64">
        <UIcon name="i-lucide-loader-circle" class="animate-spin text-primary text-4xl" />
      </div>

      <!-- Finished State -->
      <div v-else-if="finished" class="max-w-3xl mx-auto">
        <UCard :ui="{ body: 'p-8 md:p-12 text-center' }">
          <div
            class="w-20 h-20 md:w-24 md:h-24 mx-auto mb-5 md:mb-6 rounded-full flex items-center justify-center"
            :class="score >= totalQuestions / 2 ? 'bg-success/15 text-success' : 'bg-error/15 text-error'"
          >
            <UIcon
              :name="score >= totalQuestions / 2 ? 'i-lucide-trophy' : 'i-lucide-frown'"
              class="text-4xl md:text-5xl"
            />
          </div>
          <h2 class="font-headline text-2xl md:text-3xl font-extrabold mb-2">¡Evaluación Completada!</h2>
          <p class="text-on-surface-variant text-base md:text-lg mb-6 md:mb-8">
            Obtuviste <span class="font-bold text-primary">{{ score }}</span> de <span class="font-bold">{{ totalQuestions }}</span> respuestas correctas
          </p>
          <div
            class="text-5xl md:text-6xl font-black font-headline mb-6 md:mb-8"
            :class="score >= totalQuestions / 2 ? 'text-success' : 'text-error'"
          >
            {{ Math.round((score / totalQuestions) * 100) }}%
          </div>
          <UButton color="primary" size="xl" @click="goBack">
            Volver al Curso
          </UButton>
        </UCard>
      </div>

      <!-- Quiz Active -->
      <div v-else class="max-w-3xl mx-auto space-y-5 md:space-y-8">
        <!-- Progress -->
        <UCard
          :ui="{
            root: 'bg-surface-container-low',
            body: 'p-5 md:p-6',
          }"
        >
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-center">
            <div class="md:col-span-2 flex flex-col gap-1">
              <h2 class="font-headline text-lg md:text-xl font-extrabold text-on-surface">Tu Progreso</h2>
              <p class="font-body text-on-surface-variant text-xs md:text-sm">Responde con calma. Tienes 4 opciones por cada pregunta.</p>
              <div class="mt-3 md:mt-4 flex items-center gap-3 md:gap-4">
                <div class="flex-1 h-2 md:h-3 bg-surface-container-high rounded-full overflow-hidden">
                  <div class="h-full bg-primary rounded-full transition-all duration-500" :style="{ width: progressPercent + '%' }"></div>
                </div>
                <span class="font-label text-[10px] md:text-xs font-bold text-primary whitespace-nowrap">{{ currentIndex + 1 }} de {{ totalQuestions }}</span>
              </div>
            </div>
            <div class="hidden md:flex justify-center">
              <div class="relative w-24 h-24 flex items-center justify-center">
                <svg class="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--color-surface-container-high)" stroke-width="3" />
                  <path
                    class="transition-all duration-500"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="var(--color-primary)"
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
          </div>
        </UCard>

        <!-- Question Card -->
        <UCard :ui="{ body: 'p-0' }">
          <div class="p-5 md:p-8 border-b border-outline-variant/30">
            <span class="font-label text-[10px] uppercase tracking-widest text-primary font-bold mb-2 block">{{ currentQuestion.categoria }}</span>
            <h3 class="font-headline text-xl md:text-2xl font-bold leading-tight text-on-surface">
              {{ currentIndex + 1 }}. {{ currentQuestion.pregunta }}
            </h3>
          </div>
          <div class="p-5 md:p-8 space-y-3">
            <label
              v-for="(opcion, idx) in currentQuestion.opciones"
              :key="idx"
              class="group relative flex items-center gap-4 p-4 md:p-5 rounded-xl cursor-pointer transition-all duration-200 border-2 active:scale-[0.98]"
              :class="[optionClass(opcion), submitted ? 'pointer-events-none' : '']"
            >
              <input
                v-model="selectedAnswer"
                type="radio"
                :value="opcion"
                class="sr-only"
                :disabled="submitted"
              />
              <div
                class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0"
                :class="radioClass(opcion)"
              >
                <div
                  v-if="selectedAnswer === opcion || (submitted && opcion === currentQuestion.respuesta_correcta)"
                  class="w-2.5 h-2.5 rounded-full bg-white"
                ></div>
              </div>
              <span
                class="font-body text-base md:text-lg transition-all flex-grow"
                :class="selectedAnswer === opcion ? 'text-on-surface font-bold' : 'text-on-surface-variant group-hover:text-on-surface'"
              >{{ opcion }}</span>
              <UIcon
                v-if="submitted && opcion === currentQuestion.respuesta_correcta"
                name="i-lucide-check"
                class="text-success text-xl"
              />
              <UIcon
                v-else-if="submitted && opcion === selectedAnswer"
                name="i-lucide-x"
                class="text-error text-xl"
              />
            </label>
          </div>

          <UAlert
            v-if="submitted"
            :icon="resultCorrect ? 'i-lucide-check-circle-2' : 'i-lucide-x-circle'"
            :color="resultCorrect ? 'success' : 'error'"
            variant="soft"
            :title="resultCorrect ? '¡Correcto! Bien hecho.' : `Incorrecto. La respuesta correcta es: ${currentQuestion.respuesta_correcta}`"
            class="mx-5 md:mx-8 mb-5 md:mb-6"
          />
        </UCard>

        <!-- Actions -->
        <div class="flex flex-col-reverse md:flex-row items-center justify-between gap-3 md:gap-6 pt-2">
          <UButton
            v-if="!submitted"
            color="neutral"
            variant="ghost"
            size="xl"
            block
            class="md:w-auto uppercase tracking-widest"
            @click="skipQuestion"
          >
            Saltar pregunta
          </UButton>
          <div v-else class="w-full md:w-auto"></div>

          <UButton
            v-if="!submitted"
            color="primary"
            size="xl"
            block
            trailing-icon="i-lucide-send"
            :disabled="!selectedAnswer"
            class="md:w-auto md:px-12"
            @click="handleSubmit"
          >
            Enviar respuesta
          </UButton>
          <UButton
            v-else
            color="primary"
            size="xl"
            block
            trailing-icon="i-lucide-arrow-right"
            class="md:w-auto md:px-12"
            @click="nextQuestion"
          >
            {{ currentIndex < totalQuestions - 1 ? 'Siguiente pregunta' : 'Ver resultado' }}
          </UButton>
        </div>
      </div>
    </main>

    <!-- Floating Tip -->
    <UCard
      :ui="{
        root: 'fixed bottom-10 right-10 hidden lg:block max-w-xs z-40 relative overflow-hidden',
        body: 'p-5',
      }"
      class="fixed bottom-10 right-10 hidden lg:block max-w-xs z-40"
    >
      <div class="flex items-center gap-3 mb-2">
        <UIcon name="i-lucide-lightbulb" class="text-tertiary" />
        <span class="font-label text-xs font-bold uppercase tracking-tight text-on-surface">Tip Académico</span>
      </div>
      <p class="font-body text-xs text-on-surface-variant leading-relaxed">
        El quechua es una lengua aglutinante. Muchas palabras se forman añadiendo sufijos a una raíz léxica común. ¡Asegúrate de revisar los sufijos de cortesía!
      </p>
    </UCard>

    <!-- Background blobs -->
    <div class="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      <div class="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full"></div>
      <div class="absolute top-[60%] -right-[5%] w-[30%] h-[30%] bg-tertiary/5 blur-[100px] rounded-full"></div>
    </div>
  </div>
</template>
