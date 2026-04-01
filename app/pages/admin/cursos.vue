<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const supabase = useSupabaseClient()
const cursos = ref<any[]>([])
const loading = ref(true)
const showForm = ref(false)
const editingId = ref<string | null>(null)
const form = ref({ nombre: '', descripcion: '', icono: 'language', temario: '' })

const fetchCursos = async () => {
  loading.value = true
  const { data } = await supabase.from('cursos').select('*').order('created_at', { ascending: false })
  cursos.value = data || []
  loading.value = false
}

const resetForm = () => {
  form.value = { nombre: '', descripcion: '', icono: 'language', temario: '' }
  editingId.value = null
  showForm.value = false
}

const saveCurso = async () => {
  if (editingId.value) {
    await supabase.from('cursos').update(form.value).eq('id', editingId.value)
  } else {
    await supabase.from('cursos').insert(form.value)
  }
  resetForm()
  await fetchCursos()
}

const editCurso = (curso: any) => {
  form.value = { nombre: curso.nombre, descripcion: curso.descripcion || '', icono: curso.icono, temario: curso.temario || '' }
  editingId.value = curso.id
  showForm.value = true
}

const deleteCurso = async (id: string) => {
  if (!confirm('¿Eliminar este curso y todo su contenido?')) return
  await supabase.from('cursos').delete().eq('id', id)
  await fetchCursos()
}

onMounted(fetchCursos)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight font-headline">Cursos</h1>
        <p class="text-slate-500 mt-1">Gestiona los cursos de idiomas</p>
      </div>
      <button
        @click="showForm = true"
        class="flex items-center gap-2 bg-slate-800 text-white px-5 py-3 rounded-lg font-semibold text-sm hover:bg-slate-700 transition-colors"
      >
        <span class="material-symbols-outlined text-[18px]">add</span>
        Nuevo Curso
      </button>
    </div>

    <!-- Form -->
    <div v-if="showForm" class="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-8">
      <h3 class="font-bold text-lg mb-4">{{ editingId ? 'Editar Curso' : 'Nuevo Curso' }}</h3>
      <form @submit.prevent="saveCurso" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-semibold text-slate-600 mb-1">Nombre</label>
          <input v-model="form.nombre" required class="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-slate-300 focus:border-transparent" placeholder="Ej: Quechua" />
        </div>
        <div>
          <label class="block text-sm font-semibold text-slate-600 mb-1">Ícono (Material Symbols)</label>
          <input v-model="form.icono" class="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-slate-300" placeholder="language" />
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-semibold text-slate-600 mb-1">Descripción</label>
          <textarea v-model="form.descripcion" rows="2" class="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-slate-300 resize-none" placeholder="Descripción del curso..."></textarea>
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-semibold text-slate-600 mb-1">Temario (un tema por línea)</label>
          <textarea v-model="form.temario" rows="8" class="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-slate-300 resize-none font-mono" placeholder="Verb tenses: Past, present and future...&#10;Short answers: Modal verbs...&#10;..."></textarea>
        </div>
        <div class="md:col-span-2 flex gap-3">
          <button type="submit" class="bg-slate-800 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-slate-700">
            {{ editingId ? 'Actualizar' : 'Crear' }}
          </button>
          <button type="button" @click="resetForm" class="px-6 py-2.5 rounded-lg font-semibold text-sm border border-slate-200 hover:bg-slate-50">
            Cancelar
          </button>
        </div>
      </form>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 border-b border-slate-100">
          <tr>
            <th class="text-left px-6 py-4 font-semibold text-slate-600">Curso</th>
            <th class="text-left px-6 py-4 font-semibold text-slate-600">Descripción</th>
            <th class="text-right px-6 py-4 font-semibold text-slate-600">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="4" class="text-center py-12 text-slate-400">Cargando...</td>
          </tr>
          <tr v-else-if="cursos.length === 0">
            <td colspan="4" class="text-center py-12 text-slate-400">No hay cursos registrados</td>
          </tr>
          <tr v-for="curso in cursos" :key="curso.id" class="border-b border-slate-50 hover:bg-slate-50/50">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-slate-400">{{ curso.icono }}</span>
                <span class="font-semibold">{{ curso.nombre }}</span>
              </div>
            </td>
            <td class="px-6 py-4 text-slate-500 max-w-xs truncate">{{ curso.descripcion }}</td>
            <td class="px-6 py-4 text-right">
              <button @click="editCurso(curso)" class="text-slate-400 hover:text-slate-800 transition-colors mr-2" title="Editar">
                <span class="material-symbols-outlined text-[20px]">edit</span>
              </button>
              <button @click="deleteCurso(curso.id)" class="text-slate-400 hover:text-red-500 transition-colors" title="Eliminar">
                <span class="material-symbols-outlined text-[20px]">delete</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
