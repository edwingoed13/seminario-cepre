import jwt from 'jsonwebtoken'

export default defineEventHandler((event) => {
  const token = getCookie(event, 'auth_token')

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'No autenticado' })
  }

  try {
    const config = useRuntimeConfig()
    const payload = jwt.verify(token, config.jwtSecret) as any

    return {
      id: payload.id,
      nombres: payload.nombres,
      paterno: payload.paterno,
      materno: payload.materno,
      dni: payload.dni,
      foto: payload.foto
        ? `https://sistemas.cepreuna.edu.pe/storage/fotos/${payload.foto}`
        : null,
    }
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Sesión expirada' })
  }
})
