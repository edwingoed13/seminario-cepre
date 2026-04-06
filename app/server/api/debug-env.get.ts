export default defineEventHandler(() => {
  const config = useRuntimeConfig()
  return {
    dbHost: config.dbHost ? `${String(config.dbHost).substring(0, 6)}...` : 'NO DEFINIDO',
    dbUser: config.dbUser || 'NO DEFINIDO',
    dbName: config.dbName || 'NO DEFINIDO',
    dbPort: config.dbPort || 'NO DEFINIDO',
    hasPassword: !!config.dbPassword,
    // También verificar directo de process.env
    envDbHost: process.env.DB_HOST ? `${process.env.DB_HOST.substring(0, 6)}...` : 'NO DEFINIDO',
    envNuxtDbHost: process.env.NUXT_DB_HOST ? `${process.env.NUXT_DB_HOST.substring(0, 6)}...` : 'NO DEFINIDO',
  }
})
