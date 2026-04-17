<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const supabase = useSupabaseClient()
const toast = useToast()

const materiales = ref<any[]>([])
const cursos = ref<any[]>([])
const semanas = ref<any[]>([])
const loading = ref(true)
const modalOpen = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)
const selectedCursoId = ref('')
const form = reactive({ semana_id: '', tipo: 'temario', nombre: '', archivo_url: '' })

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
  Object.assign(form, { semana_id: '', tipo: 'temario', nombre: '', archivo_url: '' })
  editingId.value = null
  selectedCursoId.value = ''
}

const openNew = () => {
  resetForm()
  modalOpen.value = true
}

const saveMaterial = async () => {
  saving.value = true
  try {
    if (editingId.value) {
      await supabase.from('materiales').update({ ...form }).eq('id', editingId.value)
      toast.add({ title: 'Material actualizado', icon: 'i-lucide-check-circle', color: 'success' })
    } else {
      await supabase.from('materiales').insert({ ...form })
      toast.add({ title: 'Material creado', icon: 'i-lucide-check-circle', color: 'success' })
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

const editMaterial = (mat: any) => {
  selectedCursoId.value = mat.semanas?.curso_id || ''
  Object.assign(form, {
    semana_id: mat.semana_id,
    tipo: mat.tipo,
    nombre: mat.nombre,
    archivo_url: mat.archivo_url,
  })
  editingId.value = mat.id
  modalOpen.value = true
}

const deleteMaterial = async (id: string) => {
  if (!confirm('¿Eliminar este material?')) return
  await supabase.from('materiales').delete().eq('id', id)
  toast.add({ title: 'Material eliminado', color: 'warning' })
  await fetchData()
}

const cursoOptions = computed(() =>
  cursos.value.map(c => ({ label: c.nombre, value: c.id }))
)

const semanaOptions = computed(() =>
  semanas.value.map(s => ({ label: `Semana ${s.numero_semana}`, value: s.id }))
)

const tipoOptions = [
  { label: 'Temario', value: 'temario' },
  { label: 'Guía', value: 'guia' },
]

const columns: TableColumn<any>[] = [
  { accessorKey: 'nombre', header: 'Material' },
  { id: 'curso', header: 'Curso / Semana' },
  { accessorKey: 'tipo', header: 'Tipo' },
  { id: 'actions', header: '' },
]

onMounted(fetchData)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6 md:mb-8 gap-3">
      <div class="min-w-0">
        <h1 class="text-2xl md:text-3xl font-extrabold tracking-tight font-headline">Materiales</h1>
        <p class="text-slate-500 text-sm mt-1">Gestiona temarios y guías de estudio</p>
      </div>
      <UButton
        icon="i-lucide-plus"
        color="neutral"
        size="md"
        :ui="{ base: 'bg-slate-800 hover:bg-slate-700 text-white' }"
        @click="openNew"
      >
        <span class="hidden sm:inline">Nuevo Material</span>
      </UButton>
    </div>

    <UCard :ui="{ body: 'p-0' }">
      <UTable
        :data="materiales"
        :columns="columns"
        :loading="loading"
        :empty-state="{ icon: 'i-lucide-file-text', label: 'No hay materiales registrados' }"
      >
        <template #nombre-cell="{ row }">
          <span class="font-semibold">{{ row.original.nombre }}</span>
        </template>
        <template #curso-cell="{ row }">
          <span class="text-slate-500 text-sm">
            {{ row.original.semanas?.cursos?.nombre }} — Sem. {{ row.original.semanas?.numero_semana }}
          </span>
        </template>
        <template #tipo-cell="{ row }">
          <UBadge
            :color="row.original.tipo === 'temario' ? 'primary' : 'secondary'"
            variant="soft"
            size="sm"
            class="capitalize"
          >
            {{ row.original.tipo }}
          </UBadge>
        </template>
        <template #actions-cell="{ row }">
          <div class="flex justify-end gap-1">
            <UButton
              :to="row.original.archivo_url"
              target="_blank"
              icon="i-lucide-download"
              color="neutral"
              variant="ghost"
              size="sm"
              aria-label="Descargar"
            />
            <UButton
              icon="i-lucide-pencil"
              color="neutral"
              variant="ghost"
              size="sm"
              aria-label="Editar"
              @click="editMaterial(row.original)"
            />
            <UButton
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              size="sm"
              aria-label="Eliminar"
              @click="deleteMaterial(row.original.id)"
            />
          </div>
        </template>
      </UTable>
    </UCard>

    <UModal v-model:open="modalOpen" :ui="{ content: 'max-w-2xl' }">
      <template #content>
        <UCard :ui="{ body: 'p-5 md:p-6' }">
          <h3 class="font-bold text-xl mb-5 font-headline">{{ editingId ? 'Editar Material' : 'Nuevo Material' }}</h3>
          <UForm :state="form" class="grid grid-cols-1 md:grid-cols-2 gap-4" @submit="saveMaterial">
            <UFormField label="Curso" required>
              <USelect v-model="selectedCursoId" :items="cursoOptions" placeholder="Seleccionar curso" class="w-full" :ui="{ root: 'w-full' }" required />
            </UFormField>
            <UFormField label="Semana" name="semana_id" required>
              <USelect v-model="form.semana_id" :items="semanaOptions" placeholder="Seleccionar semana" class="w-full" :ui="{ root: 'w-full' }" required />
            </UFormField>
            <UFormField label="Nombre" name="nombre" required>
              <UInput v-model="form.nombre" placeholder="Ej: Temario Semana 1" class="w-full" :ui="{ root: 'w-full' }" required />
            </UFormField>
            <UFormField label="Tipo" name="tipo">
              <USelect v-model="form.tipo" :items="tipoOptions" class="w-full" :ui="{ root: 'w-full' }" />
            </UFormField>
            <UFormField label="URL del archivo" name="archivo_url" class="md:col-span-2" required>
              <UInput v-model="form.archivo_url" type="url" placeholder="https://drive.google.com/..." icon="i-lucide-link" class="w-full" :ui="{ root: 'w-full' }" required />
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
