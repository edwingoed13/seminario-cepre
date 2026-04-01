<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const supabase = useSupabaseClient()
const quizzes = ref<any[]>([])
const cursos = ref<any[]>([])
const semanas = ref<any[]>([])
const loading = ref(true)
const showForm = ref(false)
const editingId = ref<string | null>(null)
const selectedCursoId = ref('')
const opciones = ref(['', '', '', ''])
const form = ref({ curso_id: '', semana_id: '', pregunta: '', categoria: 'general', respuesta_correcta: '' })

const fetchData = async () => {
  loading.value = true
  const [quizzesRes, cursosRes] = await Promise.all([
    supabase.from('quizzes').select('*, cursos(nombre), semanas(numero_semana)').order('created_at', { ascending: false }),
    supabase.from('cursos').select('*').order('nombre'),
  ])
  quizzes.value = quizzesRes.data || []
  cursos.value = cursosRes.data || []
  loading.value = false
}

const fetchSemanas = async () => {
  if (!selectedCursoId.value) { semanas.value = []; return }
  form.value.curso_id = selectedCursoId.value
  const { data } = await supabase.from('semanas').select('*').eq('curso_id', selectedCursoId.value).order('numero_semana')
  semanas.value = data || []
}

watch(selectedCursoId, fetchSemanas)

const resetForm = () => {
  form.value = { curso_id: '', semana_id: '', pregunta: '', categoria: 'general', respuesta_correcta: '' }
  opciones.value = ['', '', '', '']
  editingId.value = null
  selectedCursoId.value = ''
  showForm.value = false
}

const saveQuiz = async () => {
  const payload = {
    ...form.value,
    semana_id: form.value.semana_id || null,
    opciones: opciones.value.filter(o => o.trim()),
  }
  if (editingId.value) {
    await supabase.from('quizzes').update(payload).eq('id', editingId.value)
  } else {
    await supabase.from('quizzes').insert(payload)
  }
  resetForm()
  await fetchData()
}

const editQuiz = (quiz: any) => {
  selectedCursoId.value = quiz.curso_id
  form.value = {
    curso_id: quiz.curso_id,
    semana_id: quiz.semana_id || '',
    pregunta: quiz.pregunta,
    categoria: quiz.categoria,
    respuesta_correcta: quiz.respuesta_correcta,
  }
  const ops = quiz.opciones || []
  opciones.value = [ops[0] || '', ops[1] || '', ops[2] || '', ops[3] || '']
  editingId.value = quiz.id
  showForm.value = true
}

const deleteQuiz = async (id: string) => {
  if (!confirm('¿Eliminar esta pregunta?')) return
  await supabase.from('quizzes').delete().eq('id', id)
  await fetchData()
}

onMounted(fetchData)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight font-headline">Quizzes</h1>
        <p class="text-slate-500 mt-1">Gestiona las preguntas de evaluación</p>
      </div>
      <button @click="showForm = true" class="flex items-center gap-2 bg-slate-800 text-white px-5 py-3 rounded-lg font-semibold text-sm hover:bg-slate-700 transition-colors">
        <span class="material-symbols-outlined text-[18px]">add</span>
        Nueva Pregunta
      </button>
    </div>

    <!-- Form -->
    <div v-if="showForm" class="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-8">
      <h3 class="font-bold text-lg mb-4">{{ editingId ? 'Editar Pregunta' : 'Nueva Pregunta' }}</h3>
      <form @submit.prevent="saveQuiz" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-semibold text-slate-600 mb-1">Curso</label>
          <select v-model="selectedCursoId" required class="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm">
            <option value="">Seleccionar curso</option>
            <option v-for="c in cursos" :key="c.id" :value="c.id">{{ c.nombre }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-semibold text-slate-600 mb-1">Semana (opcional)</label>
          <select v-model="form.semana_id" class="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm">
            <option value="">General</option>
            <option v-for="s in semanas" :key="s.id" :value="s.id">Semana {{ s.numero_semana }}</option>
          </select>
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-semibold text-slate-600 mb-1">Pregunta</label>
          <textarea v-model="form.pregunta" required rows="2" class="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm resize-none" placeholder="Escribe la pregunta..."></textarea>
        </div>
        <div v-for="(_, i) in opciones" :key="i">
          <label class="block text-sm font-semibold text-slate-600 mb-1">Opción {{ ['A', 'B', 'C', 'D'][i] }}</label>
          <input v-model="opciones[i]" :required="i < 2" class="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm" :placeholder="`Opción ${['A', 'B', 'C', 'D'][i]}`" />
        </div>
        <div>
          <label class="block text-sm font-semibold text-slate-600 mb-1">Respuesta correcta</label>
          <select v-model="form.respuesta_correcta" required class="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm">
            <option value="">Seleccionar</option>
            <option v-for="(op, i) in opciones.filter(o => o.trim())" :key="i" :value="op">{{ op }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-semibold text-slate-600 mb-1">Categoría</label>
          <input v-model="form.categoria" class="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm" placeholder="general" />
        </div>
        <div class="md:col-span-2 flex gap-3">
          <button type="submit" class="bg-slate-800 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-slate-700">
            {{ editingId ? 'Actualizar' : 'Crear' }}
          </button>
          <button type="button" @click="resetForm" class="px-6 py-2.5 rounded-lg font-semibold text-sm border border-slate-200 hover:bg-slate-50">Cancelar</button>
        </div>
      </form>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 border-b border-slate-100">
          <tr>
            <th class="text-left px-6 py-4 font-semibold text-slate-600">Pregunta</th>
            <th class="text-left px-6 py-4 font-semibold text-slate-600">Curso</th>
            <th class="text-left px-6 py-4 font-semibold text-slate-600">Semana</th>
            <th class="text-left px-6 py-4 font-semibold text-slate-600">Respuesta</th>
            <th class="text-right px-6 py-4 font-semibold text-slate-600">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading"><td colspan="5" class="text-center py-12 text-slate-400">Cargando...</td></tr>
          <tr v-else-if="quizzes.length === 0"><td colspan="5" class="text-center py-12 text-slate-400">No hay preguntas registradas</td></tr>
          <tr v-for="quiz in quizzes" :key="quiz.id" class="border-b border-slate-50 hover:bg-slate-50/50">
            <td class="px-6 py-4 font-semibold max-w-xs truncate">{{ quiz.pregunta }}</td>
            <td class="px-6 py-4 text-slate-500">{{ quiz.cursos?.nombre }}</td>
            <td class="px-6 py-4 text-slate-500">{{ quiz.semanas?.numero_semana ? `Sem. ${quiz.semanas.numero_semana}` : 'General' }}</td>
            <td class="px-6 py-4"><span class="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold">{{ quiz.respuesta_correcta }}</span></td>
            <td class="px-6 py-4 text-right">
              <button @click="editQuiz(quiz)" class="text-slate-400 hover:text-slate-800 transition-colors mr-2"><span class="material-symbols-outlined text-[20px]">edit</span></button>
              <button @click="deleteQuiz(quiz.id)" class="text-slate-400 hover:text-red-500 transition-colors"><span class="material-symbols-outlined text-[20px]">delete</span></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
