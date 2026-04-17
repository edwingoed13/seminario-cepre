<template>
  <div class="bg-surface text-on-surface min-h-screen">
    <UiTopAppBar :show-nav="true" :active-route="activeRoute" :user-name="userName" :user-foto="userFoto" />
    <main class="pt-20 md:pt-28 pb-8 md:pb-16 px-4 md:px-6 max-w-7xl mx-auto">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

const { user } = useAuth()
const userName = computed(() => {
  if (!user.value) return 'Estudiante'
  return user.value.nombres
    ? `${user.value.nombres} ${user.value.paterno}`
    : 'Estudiante'
})

const userFoto = computed(() => user.value?.foto || null)

const activeRoute = computed(() => {
  if (route.path.startsWith('/curso')) return 'cursos'
  return 'dashboard'
})

</script>
