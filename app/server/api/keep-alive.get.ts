import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()

  const supabase = createClient(
    config.public.supabase.url as string,
    config.public.supabase.key as string
  )

  const { error } = await supabase.from('cursos').select('id').limit(1)

  if (error) {
    throw createError({ statusCode: 500, message: `Keep-alive falló: ${error.message}` })
  }

  return {
    ok: true,
    timestamp: new Date().toISOString(),
  }
})
