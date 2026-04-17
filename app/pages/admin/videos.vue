<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const supabase = useSupabaseClient()
const toast = useToast()

const videos = ref<any[]>([])
const semanas = ref<any[]>([])
const cursos = ref<any[]>([])
const loading = ref(true)
const modalOpen = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)
const selectedCursoId = ref('')
const form = reactive({ semana_id: '', tipo: 'grabado', plataforma: 'youtube', url: '', titulo: '', hora_inicio: '', hora_fin: '' })

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
  Object.assign(form, { semana_id: '', tipo: 'grabado', plataforma: 'youtube', url: '', titulo: '', hora_inicio: '', hora_fin: '' })
  editingId.value = null
  selectedCursoId.value = ''
}

const openNew = () => {
  resetForm()
  modalOpen.value = true
}

const saveVideo = async () => {
  saving.value = true
  try {
    if (editingId.value) {
      await supabase.from('videos').update({ ...form }).eq('id', editingId.value)
      toast.add({ title: 'Video actualizado', icon: 'i-lucide-check-circle', color: 'success' })
    } else {
      await supabase.from('videos').insert({ ...form })
      toast.add({ title: 'Video creado', icon: 'i-lucide-check-circle', color: 'success' })
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

const editVideo = (video: any) => {
  selectedCursoId.value = video.semanas?.curso_id || ''
  Object.assign(form, {
    semana_id: video.semana_id,
    tipo: video.tipo,
    plataforma: video.plataforma,
    url: video.url,
    titulo: video.titulo || '',
    hora_inicio: video.hora_inicio || '',
    hora_fin: video.hora_fin || '',
  })
  editingId.value = video.id
  modalOpen.value = true
}

const deleteVideo = async (id: string) => {
  if (!confirm('¿Eliminar este video?')) return
  await supabase.from('videos').delete().eq('id', id)
  toast.add({ title: 'Video eliminado', color: 'warning' })
  await fetchData()
}

const cursoOptions = computed(() =>
  cursos.value.map(c => ({ label: c.nombre, value: c.id }))
)

const semanaOptions = computed(() =>
  semanas.value.map(s => ({ label: `Semana ${s.numero_semana} - ${s.titulo || s.fecha}`, value: s.id }))
)

const tipoOptions = [
  { label: 'Grabado', value: 'grabado' },
  { label: 'En Vivo', value: 'en_vivo' },
]

const plataformaOptions = [
  { label: 'YouTube', value: 'youtube' },
  { label: 'Facebook', value: 'facebook' },
  { label: 'TikTok', value: 'tiktok' },
]

const columns: TableColumn<any>[] = [
  { accessorKey: 'titulo', header: 'Video' },
  { id: 'curso', header: 'Curso / Semana' },
  { accessorKey: 'tipo', header: 'Tipo' },
  { id: 'horario', header: 'Horario' },
  { accessorKey: 'plataforma', header: 'Plataforma' },
  { id: 'actions', header: '' },
]

onMounted(fetchData)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6 md:mb-8 gap-3">
      <div class="min-w-0">
        <h1 class="text-2xl md:text-3xl font-extrabold tracking-tight font-headline">Videos</h1>
        <p class="text-slate-500 text-sm mt-1">Gestiona los videos grabados y en vivo</p>
      </div>
      <UButton
        icon="i-lucide-plus"
        color="neutral"
        size="md"
        :ui="{ base: 'bg-slate-800 hover:bg-slate-700 text-white' }"
        @click="openNew"
      >
        <span class="hidden sm:inline">Nuevo Video</span>
      </UButton>
    </div>

    <UCard :ui="{ body: 'p-0' }">
      <UTable
        :data="videos"
        :columns="columns"
        :loading="loading"
        :empty-state="{ icon: 'i-lucide-video', label: 'No hay videos registrados' }"
      >
        <template #titulo-cell="{ row }">
          <span class="font-semibold">{{ row.original.titulo || 'Sin título' }}</span>
        </template>
        <template #curso-cell="{ row }">
          <span class="text-slate-500 text-sm">
            {{ row.original.semanas?.cursos?.nombre }} — Sem. {{ row.original.semanas?.numero_semana }}
          </span>
        </template>
        <template #tipo-cell="{ row }">
          <UBadge
            :color="row.original.tipo === 'en_vivo' ? 'error' : 'info'"
            variant="soft"
            size="sm"
          >
            {{ row.original.tipo === 'en_vivo' ? 'En Vivo' : 'Grabado' }}
          </UBadge>
        </template>
        <template #horario-cell="{ row }">
          <span v-if="row.original.hora_inicio" class="text-slate-500 text-sm">
            {{ row.original.hora_inicio?.slice(0, 5) }} — {{ row.original.hora_fin?.slice(0, 5) }}
          </span>
          <span v-else class="text-slate-400 text-xs">—</span>
        </template>
        <template #plataforma-cell="{ row }">
          <span class="capitalize text-slate-500">{{ row.original.plataforma }}</span>
        </template>
        <template #actions-cell="{ row }">
          <div class="flex justify-end gap-1">
            <UButton
              :to="row.original.url"
              target="_blank"
              icon="i-lucide-external-link"
              color="neutral"
              variant="ghost"
              size="sm"
              aria-label="Ver"
            />
            <UButton
              icon="i-lucide-pencil"
              color="neutral"
              variant="ghost"
              size="sm"
              aria-label="Editar"
              @click="editVideo(row.original)"
            />
            <UButton
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              size="sm"
              aria-label="Eliminar"
              @click="deleteVideo(row.original.id)"
            />
          </div>
        </template>
      </UTable>
    </UCard>

    <UModal v-model:open="modalOpen" :ui="{ content: 'max-w-2xl' }">
      <template #content>
        <UCard :ui="{ body: 'p-5 md:p-6' }">
          <h3 class="font-bold text-xl mb-5 font-headline">{{ editingId ? 'Editar Video' : 'Nuevo Video' }}</h3>
          <UForm :state="form" class="grid grid-cols-1 md:grid-cols-2 gap-4" @submit="saveVideo">
            <UFormField label="Curso" required>
              <USelect v-model="selectedCursoId" :items="cursoOptions" placeholder="Seleccionar curso" class="w-full" :ui="{ root: 'w-full' }" required />
            </UFormField>
            <UFormField label="Semana" name="semana_id" required>
              <USelect v-model="form.semana_id" :items="semanaOptions" placeholder="Seleccionar semana" class="w-full" :ui="{ root: 'w-full' }" required />
            </UFormField>
            <UFormField label="Título" name="titulo">
              <UInput v-model="form.titulo" placeholder="Título del video" class="w-full" :ui="{ root: 'w-full' }" />
            </UFormField>
            <UFormField label="Tipo" name="tipo">
              <USelect v-model="form.tipo" :items="tipoOptions" class="w-full" :ui="{ root: 'w-full' }" />
            </UFormField>
            <UFormField label="Plataforma" name="plataforma">
              <USelect v-model="form.plataforma" :items="plataformaOptions" class="w-full" :ui="{ root: 'w-full' }" />
            </UFormField>
            <UFormField label="URL del video" name="url" required class="md:col-span-2">
              <UInput v-model="form.url" type="url" placeholder="https://..." icon="i-lucide-link" class="w-full" required />
            </UFormField>
            <UFormField v-if="form.tipo === 'en_vivo'" label="Hora inicio" name="hora_inicio" required>
              <UInput v-model="form.hora_inicio" type="time" class="w-full" required />
            </UFormField>
            <UFormField v-if="form.tipo === 'en_vivo'" label="Hora fin" name="hora_fin" required>
              <UInput v-model="form.hora_fin" type="time" class="w-full" required />
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
