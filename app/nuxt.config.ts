export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/supabase',
    '@nuxtjs/google-fonts',
  ],

  app: {
    head: {
      htmlAttrs: { lang: 'es' },
    },
  },

  googleFonts: {
    families: {
      Manrope: [400, 600, 700, 800],
      Inter: [400, 500, 600, 700],
    },
    display: 'swap',
    download: true,
    inject: true,
    overwriting: true,
  },

  supabase: {
    redirect: false,
  },

  ssr: true,

  routeRules: {
    '/': { redirect: '/login' },
  },

  tailwindcss: {
    cssPath: '~/assets/css/main.css',
  },
})
