<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const supabase = useSupabaseClient()
const toast = useToast()

const quizzes = ref<any[]>([])
const cursos = ref<any[]>([])
const semanas = ref<any[]>([])
const loading = ref(true)
const modalOpen = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)
const selectedCursoId = ref('')
const opciones = ref(['', '', '', '', ''])
const form = reactive({ curso_id: '', semana_id: '', pregunta: '', categoria: 'general', respuesta_correcta: '' })

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
  form.curso_id = selectedCursoId.value
  const { data } = await supabase.from('semanas').select('*').eq('curso_id', selectedCursoId.value).order('numero_semana')
  semanas.value = data || []
}

watch(selectedCursoId, fetchSemanas)

const resetForm = () => {
  Object.assign(form, { curso_id: '', semana_id: '', pregunta: '', categoria: 'general', respuesta_correcta: '' })
  opciones.value = ['', '', '', '', '']
  editingId.value = null
  selectedCursoId.value = ''
}

const openNew = () => {
  resetForm()
  modalOpen.value = true
}

const saveQuiz = async () => {
  saving.value = true
  try {
    const payload = {
      ...form,
      semana_id: form.semana_id || null,
      opciones: opciones.value.filter(o => o.trim()),
    }
    if (editingId.value) {
      await supabase.from('quizzes').update(payload).eq('id', editingId.value)
      toast.add({ title: 'Pregunta actualizada', icon: 'i-lucide-check-circle', color: 'success' })
    } else {
      await supabase.from('quizzes').insert(payload)
      toast.add({ title: 'Pregunta creada', icon: 'i-lucide-check-circle', color: 'success' })
    }
    modalOpen.value = false
    resetForm()
    await fetchData()
  } catch (e: any) {
    toast.add({ title: 'Error', description: e.message, color: 'error' })
  } finally {
    saving.value = false
  }
}

const editQuiz = (quiz: any) => {
  selectedCursoId.value = quiz.curso_id
  Object.assign(form, {
    curso_id: quiz.curso_id,
    semana_id: quiz.semana_id || '',
    pregunta: quiz.pregunta,
    categoria: quiz.categoria,
    respuesta_correcta: quiz.respuesta_correcta,
  })
  const ops = quiz.opciones || []
  opciones.value = [ops[0] || '', ops[1] || '', ops[2] || '', ops[3] || '', ops[4] || '']
  editingId.value = quiz.id
  modalOpen.value = true
}

const deleteQuiz = async (id: string) => {
  if (!confirm('¿Eliminar esta pregunta?')) return
  await supabase.from('quizzes').delete().eq('id', id)
  toast.add({ title: 'Pregunta eliminada', color: 'warning' })
  await fetchData()
}

const cursoOptions = computed(() =>
  cursos.value.map(c => ({ label: c.nombre, value: c.id }))
)

const semanaOptions = computed(() =>
  semanas.value.map(s => ({ label: `Semana ${s.numero_semana}`, value: s.id }))
)

const respuestaOptions = computed(() =>
  opciones.value.filter(o => o.trim()).map(op => ({ label: op, value: op }))
)

const columns: TableColumn<any>[] = [
  { accessorKey: 'pregunta', header: 'Pregunta' },
  { id: 'curso', header: 'Curso' },
  { id: 'semana', header: 'Semana' },
  { accessorKey: 'respuesta_correcta', header: 'Respuesta' },
  { id: 'actions', header: '' },
]

const letters = ['A', 'B', 'C', 'D', 'E']

onMounted(fetchData)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6 md:mb-8 gap-3">
      <div class="min-w-0">
        <h1 class="text-2xl md:text-3xl font-extrabold tracking-tight font-headline">Quizzes</h1>
        <p class="text-slate-500 text-sm mt-1">Gestiona las preguntas de evaluación</p>
      </div>
      <UButton
        icon="i-lucide-plus"
        color="neutral"
        size="md"
        :ui="{ base: 'bg-slate-800 hover:bg-slate-700 text-white' }"
        @click="openNew"
      >
        <span class="hidden sm:inline">Nueva Pregunta</span>
      </UButton>
    </div>

    <UCard :ui="{ body: 'p-0' }">
      <UTable
        :data="quizzes"
        :columns="columns"
        :loading="loading"
        :empty-state="{ icon: 'i-lucide-clipboard-list', label: 'No hay preguntas registradas' }"
      >
        <template #pregunta-cell="{ row }">
          <span class="font-semibold line-clamp-1 max-w-xs block">{{ row.original.pregunta }}</span>
        </template>
        <template #curso-cell="{ row }">
          <span class="text-slate-500 text-sm">{{ row.original.cursos?.nombre }}</span>
        </template>
        <template #semana-cell="{ row }">
          <span class="text-slate-500 text-sm">
            {{ row.original.semanas?.numero_semana ? `Sem. ${row.original.semanas.numero_semana}` : 'General' }}
          </span>
        </template>
        <template #respuesta_correcta-cell="{ row }">
          <UBadge color="success" variant="soft" size="sm">{{ row.original.respuesta_correcta }}</UBadge>
        </template>
        <template #actions-cell="{ row }">
          <div class="flex justify-end gap-1">
            <UButton
              icon="i-lucide-pencil"
              color="neutral"
              variant="ghost"
              size="sm"
              aria-label="Editar"
              @click="editQuiz(row.original)"
            />
            <UButton
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              size="sm"
              aria-label="Eliminar"
              @click="deleteQuiz(row.original.id)"
            />
          </div>
        </template>
      </UTable>
    </UCard>

    <UModal v-model:open="modalOpen" :ui="{ content: 'max-w-2xl' }">
      <template #content>
        <UCard :ui="{ body: 'p-5 md:p-6' }">
          <h3 class="font-bold text-xl mb-5 font-headline">{{ editingId ? 'Editar Pregunta' : 'Nueva Pregunta' }}</h3>
          <UForm :state="form" class="grid grid-cols-1 md:grid-cols-2 gap-4" @submit="saveQuiz">
            <UFormField label="Curso" required>
              <USelect v-model="selectedCursoId" :items="cursoOptions" placeholder="Seleccionar curso" class="w-full" :ui="{ root: 'w-full' }" required />
            </UFormField>
            <UFormField label="Semana (opcional)" name="semana_id">
              <USelect v-model="form.semana_id" :items="semanaOptions" placeholder="General" class="w-full" :ui="{ root: 'w-full' }" />
            </UFormField>
            <UFormField label="Pregunta" name="pregunta" class="md:col-span-2" required>
              <UTextarea v-model="form.pregunta" :rows="2" placeholder="Escribe la pregunta..." class="w-full" :ui="{ root: 'w-full' }" required />
            </UFormField>
            <UFormField
              v-for="(_, i) in opciones"
              :key="i"
              :label="`Opción ${letters[i]}`"
            >
              <UInput
                v-model="opciones[i]"
                :placeholder="`Opción ${letters[i]}`"
                :required="i < 2"
                class="w-full"
                :ui="{ root: 'w-full' }"
              />
            </UFormField>
            <UFormField label="Respuesta correcta" name="respuesta_correcta" required>
              <USelect v-model="form.respuesta_correcta" :items="respuestaOptions" placeholder="Seleccionar" class="w-full" :ui="{ root: 'w-full' }" required />
            </UFormField>
            <UFormField label="Categoría" name="categoria">
              <UInput v-model="form.categoria" placeholder="general" class="w-full" :ui="{ root: 'w-full' }" />
            </UFormField>
            <div class="md:col-span-2 flex gap-3 justify-end">
              <UButton type="button" color="neutral" variant="outline" @click="modalOpen = false">Cancelar</UButton>
              <UButton type="submit" color="primary" :loading="saving">
                {{ editingId ? 'Actualizar' : 'Crear' }}
              </UButton>
            </div>
          </UForm>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
