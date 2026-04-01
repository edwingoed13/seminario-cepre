<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const supabase = useSupabaseClient()
const materiales = ref<any[]>([])
const cursos = ref<any[]>([])
const semanas = ref<any[]>([])
const loading = ref(true)
const showForm = ref(false)
const editingId = ref<string | null>(null)
const selectedCursoId = ref('')
const form = ref({ semana_id: '', tipo: 'temario', nombre: '', archivo_url: '' })

const fetchData = async () => {
  loading.value = true
  const [materialesRes, cursosRes] = await Promise.all([
    supabase.from('materiales').select('*, semanas(*, cursos(*))').order('created_at', { ascending: false }),
    supabase.from('cursos').select('*').order('nombre'),
  ])
  materiales.value = materialesRes.data || []
  cursos.value = cursosRes.data || []
  loading.value = false
}

const fetchSemanas = async () => {
  if (!selectedCursoId.value) { semanas.value = []; return }
  const { data } = await supabase.from('semanas').select('*').eq('curso_id', selectedCursoId.value).order('numero_semana')
  semanas.value = data || []
}

watch(selectedCursoId, fetchSemanas)

const resetForm = () => {
  form.value = { semana_id: '', tipo: 'temario', nombre: '', archivo_url: '' }
  editingId.value = null
  selectedCursoId.value = ''
  showForm.value = false
}

const saveMaterial = async () => {
  if (editingId.value) {
    await supabase.from('materiales').update(form.value).eq('id', editingId.value)
  } else {
    await supabase.from('materiales').insert(form.value)
  }
  resetForm()
  await fetchData()
}

const editMaterial = (mat: any) => {
  selectedCursoId.value = mat.semanas?.curso_id || ''
  form.value = { semana_id: mat.semana_id, tipo: mat.tipo, nombre: mat.nombre, archivo_url: mat.archivo_url }
  editingId.value = mat.id
  showForm.value = true
}

const deleteMaterial = async (id: string) => {
  if (!confirm('¿Eliminar este material?')) return
  await supabase.from('materiales').delete().eq('id', id)
  await fetchData()
}

onMounted(fetchData)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight font-headline">Materiales</h1>
        <p class="text-slate-500 mt-1">Gestiona temarios y guías de estudio</p>
      </div>
      <button @click="showForm = true" class="flex items-center gap-2 bg-slate-800 text-white px-5 py-3 rounded-lg font-semibold text-sm hover:bg-slate-700 transition-colors">
        <span class="material-symbols-outlined text-[18px]">add</span>
        Nuevo Material
      </button>
    </div>

    <!-- Form -->
    <div v-if="showForm" class="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-8">
      <h3 class="font-bold text-lg mb-4">{{ editingId ? 'Editar Material' : 'Nuevo Material' }}</h3>
      <form @submit.prevent="saveMaterial" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-semibold text-slate-600 mb-1">Curso</label>
          <select v-model="selectedCursoId" required class="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm">
            <option value="">Seleccionar curso</option>
            <option v-for="c in cursos" :key="c.id" :value="c.id">{{ c.nombre }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-semibold text-slate-600 mb-1">Semana</label>
          <select v-model="form.semana_id" required class="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm">
            <option value="">Seleccionar semana</option>
            <option v-for="s in semanas" :key="s.id" :value="s.id">Semana {{ s.numero_semana }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-semibold text-slate-600 mb-1">Nombre</label>
          <input v-model="form.nombre" required class="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm" placeholder="Ej: Temario Semana 1" />
        </div>
        <div>
          <label class="block text-sm font-semibold text-slate-600 mb-1">Tipo</label>
          <select v-model="form.tipo" class="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm">
            <option value="temario">Temario</option>
            <option value="guia">Guía</option>
          </select>
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-semibold text-slate-600 mb-1">URL del archivo</label>
          <input v-model="form.archivo_url" required type="url" class="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm" placeholder="https://drive.google.com/..." />
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
            <th class="text-left px-6 py-4 font-semibold text-slate-600">Material</th>
            <th class="text-left px-6 py-4 font-semibold text-slate-600">Curso / Semana</th>
            <th class="text-left px-6 py-4 font-semibold text-slate-600">Tipo</th>
            <th class="text-right px-6 py-4 font-semibold text-slate-600">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading"><td colspan="4" class="text-center py-12 text-slate-400">Cargando...</td></tr>
          <tr v-else-if="materiales.length === 0"><td colspan="4" class="text-center py-12 text-slate-400">No hay materiales registrados</td></tr>
          <tr v-for="mat in materiales" :key="mat.id" class="border-b border-slate-50 hover:bg-slate-50/50">
            <td class="px-6 py-4 font-semibold">{{ mat.nombre }}</td>
            <td class="px-6 py-4 text-slate-500">{{ mat.semanas?.cursos?.nombre }} — Sem. {{ mat.semanas?.numero_semana }}</td>
            <td class="px-6 py-4">
              <span :class="mat.tipo === 'temario' ? 'bg-indigo-100 text-indigo-600' : 'bg-teal-100 text-teal-600'" class="px-2.5 py-1 rounded-full text-xs font-semibold capitalize">
                {{ mat.tipo }}
              </span>
            </td>
            <td class="px-6 py-4 text-right">
              <a :href="mat.archivo_url" target="_blank" class="text-slate-400 hover:text-blue-500 transition-colors mr-2"><span class="material-symbols-outlined text-[20px]">download</span></a>
              <button @click="editMaterial(mat)" class="text-slate-400 hover:text-slate-800 transition-colors mr-2"><span class="material-symbols-outlined text-[20px]">edit</span></button>
              <button @click="deleteMaterial(mat.id)" class="text-slate-400 hover:text-red-500 transition-colors"><span class="material-symbols-outlined text-[20px]">delete</span></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
