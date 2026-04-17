<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const supabase = useSupabaseClient()
const toast = useToast()

const cursos = ref<any[]>([])
const semanas = ref<any[]>([])
const selectedCursoId = ref('')
const loading = ref(true)
const editingId = ref<string | null>(null)
const saving = ref(false)
const form = reactive({ titulo: '', descripcion: '', fecha: '', hora_inicio: '', hora_fin: '' })

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
  Object.assign(form, {
    titulo: semana.titulo || '',
    descripcion: semana.descripcion || '',
    fecha: semana.fecha,
    hora_inicio: semana.hora_inicio || '',
    hora_fin: semana.hora_fin || '',
  })
  editingId.value = semana.id
}

const saveSemana = async () => {
  if (!editingId.value) return
  saving.value = true
  try {
    const payload = {
      ...form,
      hora_inicio: form.hora_inicio || null,
      hora_fin: form.hora_fin || null,
    }
    await supabase.from('semanas').update(payload).eq('id', editingId.value)
    toast.add({ title: 'Semana actualizada', icon: 'i-lucide-check-circle', color: 'success' })
    cancelEdit()
    await fetchSemanas()
  } catch (e: any) {
    toast.add({ title: 'Error', description: e.message, color: 'error' })
  } finally {
    saving.value = false
  }
}

const cancelEdit = () => {
  editingId.value = null
  Object.assign(form, { titulo: '', descripcion: '', fecha: '', hora_inicio: '', hora_fin: '' })
}

const cursoOptions = computed(() =>
  cursos.value.map(c => ({ label: c.nombre, value: c.id }))
)

onMounted(fetchCursos)
</script>

<template>
  <div>
    <div class="mb-6 md:mb-8">
      <h1 class="text-2xl md:text-3xl font-extrabold tracking-tight font-headline">Semanas</h1>
      <p class="text-slate-500 text-sm mt-1">Gestiona el cronograma y temario por semana</p>
    </div>

    <UCard class="mb-6 md:mb-8" :ui="{ body: 'p-5 md:p-6' }">
      <UFormField label="Seleccionar Curso" name="curso">
        <USelect
          v-model="selectedCursoId"
          :items="cursoOptions"
          placeholder="-- Seleccionar curso --"
          class="w-full md:w-96"
          :ui="{ root: 'w-full md:w-96' }"
        />
      </UFormField>
    </UCard>

    <div v-if="semanas.length > 0" class="space-y-4">
      <UCard
        v-for="semana in semanas"
        :key="semana.id"
        :ui="{ body: 'p-5 md:p-6' }"
      >
        <div v-if="editingId === semana.id">
          <h3 class="font-bold text-lg mb-4 font-headline">Editando Semana {{ semana.numero_semana }}</h3>
          <UForm :state="form" class="grid grid-cols-1 md:grid-cols-2 gap-4" @submit="saveSemana">
            <UFormField label="Título" name="titulo">
              <UInput v-model="form.titulo" :placeholder="`Semana ${semana.numero_semana}`" class="w-full" :ui="{ root: 'w-full' }" />
            </UFormField>
            <UFormField label="Fecha" name="fecha">
              <UInput v-model="form.fecha" type="date" class="w-full" />
            </UFormField>
            <UFormField label="Hora inicio" name="hora_inicio">
              <UInput v-model="form.hora_inicio" type="time" placeholder="09:00" class="w-full" />
            </UFormField>
            <UFormField label="Hora fin" name="hora_fin">
              <UInput v-model="form.hora_fin" type="time" placeholder="10:20" class="w-full" />
            </UFormField>
            <UFormField label="Temario / Descripción" name="descripcion" class="md:col-span-2">
              <UTextarea v-model="form.descripcion" :rows="3" placeholder="Contenido temático de esta semana..." class="w-full" :ui="{ root: 'w-full' }" />
            </UFormField>
            <div class="md:col-span-2 flex gap-3 justify-end">
              <UButton type="button" color="neutral" variant="outline" @click="cancelEdit">Cancelar</UButton>
              <UButton type="submit" color="primary" :loading="saving">Guardar</UButton>
            </div>
          </UForm>
        </div>

        <div v-else class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-2 flex-wrap">
              <UBadge color="neutral" variant="subtle">Semana {{ semana.numero_semana }}</UBadge>
              <span class="text-sm text-slate-400">{{ semana.fecha }}</span>
              <UBadge v-if="semana.hora_inicio" color="primary" variant="soft" size="sm">
                <UIcon name="i-lucide-clock" class="mr-1" />
                {{ semana.hora_inicio?.slice(0, 5) }} — {{ semana.hora_fin?.slice(0, 5) }}
              </UBadge>
            </div>
            <h4 class="font-semibold text-slate-800 mb-1">{{ semana.titulo || `Semana ${semana.numero_semana}` }}</h4>
            <p class="text-sm text-slate-500">{{ semana.descripcion || 'Sin temario asignado' }}</p>
          </div>
          <UButton
            icon="i-lucide-pencil"
            color="neutral"
            variant="ghost"
            size="sm"
            aria-label="Editar"
            @click="editSemana(semana)"
          />
        </div>
      </UCard>
    </div>

    <UCard v-else-if="selectedCursoId" :ui="{ body: 'p-12 text-center' }">
      <p class="text-slate-400">No hay semanas para este curso</p>
    </UCard>
    <UCard v-else-if="!loading" :ui="{ body: 'p-12 text-center' }">
      <p class="text-slate-400">Selecciona un curso para ver sus semanas</p>
    </UCard>
  </div>
</template>
