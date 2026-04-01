<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const supabase = useSupabaseClient()
const videos = ref<any[]>([])
const semanas = ref<any[]>([])
const cursos = ref<any[]>([])
const loading = ref(true)
const showForm = ref(false)
const editingId = ref<string | null>(null)
const selectedCursoId = ref('')
const form = ref({ semana_id: '', tipo: 'grabado', plataforma: 'youtube', url: '', titulo: '' })

const fetchData = async () => {
  loading.value = true
  const [videosRes, cursosRes] = await Promise.all([
    supabase.from('videos').select('*, semanas(*, cursos(*))').order('created_at', { ascending: false }),
    supabase.from('cursos').select('*').order('nombre'),
  ])
  videos.value = videosRes.data || []
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
  form.value = { semana_id: '', tipo: 'grabado', plataforma: 'youtube', url: '', titulo: '' }
  editingId.value = null
  selectedCursoId.value = ''
  showForm.value = false
}

const saveVideo = async () => {
  if (editingId.value) {
    await supabase.from('videos').update(form.value).eq('id', editingId.value)
  } else {
    await supabase.from('videos').insert(form.value)
  }
  resetForm()
  await fetchData()
}

const editVideo = (video: any) => {
  selectedCursoId.value = video.semanas?.curso_id || ''
  form.value = { semana_id: video.semana_id, tipo: video.tipo, plataforma: video.plataforma, url: video.url, titulo: video.titulo || '' }
  editingId.value = video.id
  showForm.value = true
}

const deleteVideo = async (id: string) => {
  if (!confirm('¿Eliminar este video?')) return
  await supabase.from('videos').delete().eq('id', id)
  await fetchData()
}

onMounted(fetchData)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight font-headline">Videos</h1>
        <p class="text-slate-500 mt-1">Gestiona los videos grabados y en vivo</p>
      </div>
      <button @click="showForm = true" class="flex items-center gap-2 bg-slate-800 text-white px-5 py-3 rounded-lg font-semibold text-sm hover:bg-slate-700 transition-colors">
        <span class="material-symbols-outlined text-[18px]">add</span>
        Nuevo Video
      </button>
    </div>

    <!-- Form -->
    <div v-if="showForm" class="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-8">
      <h3 class="font-bold text-lg mb-4">{{ editingId ? 'Editar Video' : 'Nuevo Video' }}</h3>
      <form @submit.prevent="saveVideo" class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <option v-for="s in semanas" :key="s.id" :value="s.id">Semana {{ s.numero_semana }} - {{ s.titulo || s.fecha }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-semibold text-slate-600 mb-1">Título</label>
          <input v-model="form.titulo" class="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm" placeholder="Título del video" />
        </div>
        <div>
          <label class="block text-sm font-semibold text-slate-600 mb-1">Tipo</label>
          <select v-model="form.tipo" class="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm">
            <option value="grabado">Grabado</option>
            <option value="en_vivo">En Vivo</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-semibold text-slate-600 mb-1">Plataforma</label>
          <select v-model="form.plataforma" class="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm">
            <option value="youtube">YouTube</option>
            <option value="facebook">Facebook</option>
            <option value="tiktok">TikTok</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-semibold text-slate-600 mb-1">URL del video</label>
          <input v-model="form.url" required type="url" class="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm" placeholder="https://..." />
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
            <th class="text-left px-6 py-4 font-semibold text-slate-600">Video</th>
            <th class="text-left px-6 py-4 font-semibold text-slate-600">Curso / Semana</th>
            <th class="text-left px-6 py-4 font-semibold text-slate-600">Tipo</th>
            <th class="text-left px-6 py-4 font-semibold text-slate-600">Plataforma</th>
            <th class="text-right px-6 py-4 font-semibold text-slate-600">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading"><td colspan="5" class="text-center py-12 text-slate-400">Cargando...</td></tr>
          <tr v-else-if="videos.length === 0"><td colspan="5" class="text-center py-12 text-slate-400">No hay videos registrados</td></tr>
          <tr v-for="video in videos" :key="video.id" class="border-b border-slate-50 hover:bg-slate-50/50">
            <td class="px-6 py-4 font-semibold">{{ video.titulo || 'Sin título' }}</td>
            <td class="px-6 py-4 text-slate-500">{{ video.semanas?.cursos?.nombre }} — Sem. {{ video.semanas?.numero_semana }}</td>
            <td class="px-6 py-4">
              <span :class="video.tipo === 'en_vivo' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'" class="px-2.5 py-1 rounded-full text-xs font-semibold">
                {{ video.tipo === 'en_vivo' ? 'En Vivo' : 'Grabado' }}
              </span>
            </td>
            <td class="px-6 py-4 capitalize text-slate-500">{{ video.plataforma }}</td>
            <td class="px-6 py-4 text-right">
              <a :href="video.url" target="_blank" class="text-slate-400 hover:text-blue-500 transition-colors mr-2" title="Ver"><span class="material-symbols-outlined text-[20px]">open_in_new</span></a>
              <button @click="editVideo(video)" class="text-slate-400 hover:text-slate-800 transition-colors mr-2" title="Editar"><span class="material-symbols-outlined text-[20px]">edit</span></button>
              <button @click="deleteVideo(video.id)" class="text-slate-400 hover:text-red-500 transition-colors" title="Eliminar"><span class="material-symbols-outlined text-[20px]">delete</span></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
