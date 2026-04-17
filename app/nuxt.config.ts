export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  srcDir: '.',
  serverDir: 'server',
  devtools: { enabled: false },

  modules: [
    '@nuxt/ui',
    '@nuxtjs/supabase',
    '@nuxtjs/google-fonts',
  ],

  css: ['~/assets/css/main.css'],

  colorMode: {
    preference: 'light',
    fallback: 'light',
    classSuffix: '',
  },

  runtimeConfig: {
    dbHost: process.env.DB_HOST,
    dbUser: process.env.DB_USER,
    dbPassword: process.env.DB_PASSWORD,
    dbName: process.env.DB_NAME,
    dbPort: process.env.DB_PORT || '3306',
    jwtSecret: process.env.JWT_SECRET,
  },

  app: {
    head: {
      htmlAttrs: { lang: 'es', class: 'light' },
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
    clientOptions: {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  },

  ssr: true,

  routeRules: {
    '/': { redirect: '/login' },
  },

})
