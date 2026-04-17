<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const supabase = useSupabaseClient()
const toast = useToast()

const cursos = ref<any[]>([])
const loading = ref(true)
const modalOpen = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)
const form = reactive({ nombre: '', descripcion: '', icono: 'language', temario: '' })

const fetchCursos = async () => {
  loading.value = true
  const { data } = await supabase.from('cursos').select('*').order('created_at', { ascending: false })
  cursos.value = data || []
  loading.value = false
}

const resetForm = () => {
  Object.assign(form, { nombre: '', descripcion: '', icono: 'language', temario: '' })
  editingId.value = null
}

const openNew = () => {
  resetForm()
  modalOpen.value = true
}

const saveCurso = async () => {
  saving.value = true
  try {
    if (editingId.value) {
      await supabase.from('cursos').update({ ...form }).eq('id', editingId.value)
      toast.add({ title: 'Curso actualizado', icon: 'i-lucide-check-circle', color: 'success' })
    } else {
      await supabase.from('cursos').insert({ ...form })
      toast.add({ title: 'Curso creado', icon: 'i-lucide-check-circle', color: 'success' })
    }
    modalOpen.value = false
    resetForm()
    await fetchCursos()
  } catch (e: any) {
    toast.add({ title: 'Error al guardar', description: e.message, color: 'error' })
  } finally {
    saving.value = false
  }
}

const editCurso = (curso: any) => {
  Object.assign(form, {
    nombre: curso.nombre,
    descripcion: curso.descripcion || '',
    icono: curso.icono,
    temario: curso.temario || '',
  })
  editingId.value = curso.id
  modalOpen.value = true
}

const deleteCurso = async (id: string) => {
  if (!confirm('¿Eliminar este curso y todo su contenido?')) return
  await supabase.from('cursos').delete().eq('id', id)
  toast.add({ title: 'Curso eliminado', color: 'warning' })
  await fetchCursos()
}

const columns: TableColumn<any>[] = [
  { accessorKey: 'nombre', header: 'Curso' },
  { accessorKey: 'descripcion', header: 'Descripción' },
  { id: 'actions', header: '' },
]

onMounted(fetchCursos)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6 md:mb-8 gap-3">
      <div class="min-w-0">
        <h1 class="text-2xl md:text-3xl font-extrabold tracking-tight font-headline">Cursos</h1>
        <p class="text-slate-500 text-sm mt-1">Gestiona los cursos de idiomas</p>
      </div>
      <UButton
        icon="i-lucide-plus"
        color="neutral"
        size="md"
        :ui="{ base: 'bg-slate-800 hover:bg-slate-700 text-white' }"
        @click="openNew"
      >
        <span class="hidden sm:inline">Nuevo Curso</span>
      </UButton>
    </div>

    <UCard :ui="{ body: 'p-0' }">
      <UTable
        :data="cursos"
        :columns="columns"
        :loading="loading"
        :empty-state="{ icon: 'i-lucide-book-open', label: 'No hay cursos registrados' }"
      >
        <template #nombre-cell="{ row }">
          <div class="flex items-center gap-3">
            <UIcon name="i-lucide-book-open" class="text-slate-400" />
            <span class="font-semibold">{{ row.original.nombre }}</span>
          </div>
        </template>
        <template #descripcion-cell="{ row }">
          <span class="text-slate-500 line-clamp-1 max-w-xs">{{ row.original.descripcion }}</span>
        </template>
        <template #actions-cell="{ row }">
          <div class="flex justify-end gap-1">
            <UButton
              icon="i-lucide-pencil"
              color="neutral"
              variant="ghost"
              size="sm"
              aria-label="Editar"
              @click="editCurso(row.original)"
            />
            <UButton
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              size="sm"
              aria-label="Eliminar"
              @click="deleteCurso(row.original.id)"
            />
          </div>
        </template>
      </UTable>
    </UCard>

    <!-- Modal Form -->
    <UModal v-model:open="modalOpen" :ui="{ content: 'max-w-2xl' }">
      <template #content>
        <UCard :ui="{ body: 'p-5 md:p-6' }">
          <h3 class="font-bold text-xl mb-5 font-headline">{{ editingId ? 'Editar Curso' : 'Nuevo Curso' }}</h3>
          <UForm :state="form" class="grid grid-cols-1 md:grid-cols-2 gap-4" @submit="saveCurso">
            <UFormField label="Nombre" name="nombre" required>
              <UInput v-model="form.nombre" placeholder="Ej: Quechua" class="w-full" :ui="{ root: 'w-full' }" required />
            </UFormField>
            <UFormField label="Ícono" name="icono">
              <UInput v-model="form.icono" placeholder="language" class="w-full" :ui="{ root: 'w-full' }" />
            </UFormField>
            <UFormField label="Descripción" name="descripcion" class="md:col-span-2">
              <UTextarea v-model="form.descripcion" :rows="2" placeholder="Descripción del curso..." class="w-full" :ui="{ root: 'w-full' }" />
            </UFormField>
            <UFormField label="Temario (un tema por línea)" name="temario" class="md:col-span-2">
              <UTextarea v-model="form.temario" :rows="8" placeholder="Verb tenses: Past, present and future..." class="w-full font-mono text-sm" :ui="{ root: 'w-full' }" />
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
