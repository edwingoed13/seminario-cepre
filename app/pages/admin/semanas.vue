<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const supabase = useSupabaseClient()
const cursos = ref<any[]>([])
const semanas = ref<any[]>([])
const selectedCursoId = ref('')
const loading = ref(true)
const editingId = ref<string | null>(null)
const form = ref({ titulo: '', descripcion: '', fecha: '' })

const fetchCursos = async () => {
  const { data } = await supabase.from('cursos').select('*').order('nombre')
  cursos.value = data || []
  loading.value = false
}

const fetchSemanas = async () => {
  if (!selectedCursoId.value) { semanas.value = []; return }
  const { data } = await supabase.from('semanas').select('*').eq('curso_id', selectedCursoId.value).order('numero_semana')
  semanas.value = data || []
}

watch(selectedCursoId, fetchSemanas)

const editSemana = (semana: any) => {
  form.value = { titulo: semana.titulo || '', descripcion: semana.descripcion || '', fecha: semana.fecha }
  editingId.value = semana.id
}

const saveSemana = async () => {
  if (!editingId.value) return
  await supabase.from('semanas').update(form.value).eq('id', editingId.value)
  editingId.value = null
  form.value = { titulo: '', descripcion: '', fecha: '' }
  await fetchSemanas()
}

const cancelEdit = () => {
  editingId.value = null
  form.value = { titulo: '', descripcion: '', fecha: '' }
}

onMounted(fetchCursos)
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-extrabold tracking-tight font-headline">Semanas</h1>
      <p class="text-slate-500 mt-1">Gestiona el cronograma y temario por semana</p>
    </div>

    <!-- Selector de curso -->
    <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-8">
      <label class="block text-sm font-semibold text-slate-600 mb-2">Seleccionar Curso</label>
      <select v-model="selectedCursoId" class="w-full md:w-96 border border-slate-200 rounded-lg px-4 py-3 text-sm">
        <option value="">-- Seleccionar curso --</option>
        <option v-for="c in cursos" :key="c.id" :value="c.id">{{ c.nombre }}</option>
      </select>
    </div>

    <!-- Lista de semanas -->
    <div v-if="semanas.length > 0" class="space-y-4">
      <div v-for="semana in semanas" :key="semana.id" class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <!-- Editing -->
        <div v-if="editingId === semana.id" class="p-6">
          <h3 class="font-bold text-lg mb-4">Editando Semana {{ semana.numero_semana }}</h3>
          <form @submit.prevent="saveSemana" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-slate-600 mb-1">Título</label>
              <input v-model="form.titulo" class="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm" :placeholder="`Semana ${semana.numero_semana}`" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-600 mb-1">Fecha</label>
              <input v-model="form.fecha" type="date" class="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm" />
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-semibold text-slate-600 mb-1">Temario / Descripción</label>
              <textarea v-model="form.descripcion" rows="3" class="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm resize-none" placeholder="Contenido temático de esta semana..."></textarea>
            </div>
            <div class="md:col-span-2 flex gap-3">
              <button type="submit" class="bg-slate-800 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-slate-700">Guardar</button>
              <button type="button" @click="cancelEdit" class="px-6 py-2.5 rounded-lg font-semibold text-sm border border-slate-200 hover:bg-slate-50">Cancelar</button>
            </div>
          </form>
        </div>

        <!-- Display -->
        <div v-else class="p-6 flex items-start justify-between gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <span class="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">Semana {{ semana.numero_semana }}</span>
              <span class="text-sm text-slate-400">{{ semana.fecha }}</span>
            </div>
            <h4 class="font-semibold text-slate-800 mb-1">{{ semana.titulo || `Semana ${semana.numero_semana}` }}</h4>
            <p class="text-sm text-slate-500">{{ semana.descripcion || 'Sin temario asignado' }}</p>
          </div>
          <button @click="editSemana(semana)" class="text-slate-400 hover:text-slate-800 transition-colors shrink-0" title="Editar">
            <span class="material-symbols-outlined">edit</span>
          </button>
        </div>
      </div>
    </div>

    <div v-else-if="selectedCursoId" class="text-center py-12 text-slate-400">No hay semanas para este curso</div>
    <div v-else-if="!loading" class="text-center py-12 text-slate-400">Selecciona un curso para ver sus semanas</div>
  </div>
</template>
