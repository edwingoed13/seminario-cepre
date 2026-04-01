<template>
  <div class="bg-surface text-on-surface min-h-screen">
    <UiTopAppBar :show-nav="true" :active-route="activeRoute" :user-name="userName" />
    <main class="pt-28 pb-32 px-6 max-w-7xl mx-auto">
      <slot />
    </main>
    <UiBottomNav :active="bottomActive" />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

const { user } = useAuth()
const userName = computed(() => user.value?.user_metadata?.nombre || 'Estudiante')

const activeRoute = computed(() => {
  if (route.path.startsWith('/curso')) return 'cursos'
  return 'dashboard'
})

const bottomActive = computed<'inicio' | 'cursos' | 'perfil'>(() => {
  if (route.path.startsWith('/curso') || route.path.startsWith('/quiz')) return 'cursos'
  return 'inicio'
})
</script>
