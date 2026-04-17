import jwt from 'jsonwebtoken'
import { getPool } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { dni, password, remember = true } = body

  if (!dni || !password) {
    throw createError({ statusCode: 400, message: 'DNI y contraseña son requeridos' })
  }

  // Limpiar: si ingresó email completo, extraer solo el DNI
  const dniLimpio = dni.replace(/@.*$/, '').trim()

  const config = useRuntimeConfig()

  let rows: any[]
  try {
    const pool = getPool()
    const [result] = await pool.query(
      'SELECT id, nombres, paterno, materno, nro_documento, foto, usuario, estado FROM estudiantes WHERE (nro_documento = ? OR usuario = ?) AND password = ? LIMIT 1',
      [dniLimpio, dni, password]
    )
    rows = result as any[]
  } catch (err: any) {
    console.error('[LOGIN] Error MySQL:', err.message)
    throw createError({ statusCode: 500, message: `Error de conexión a la base de datos: ${err.message}` })
  }

  if (rows.length === 0) {
    throw createError({ statusCode: 401, message: 'DNI o contraseña incorrectos' })
  }

  const estudiante = rows[0]

  if (estudiante.estado === '0') {
    throw createError({ statusCode: 403, message: 'Tu cuenta está inactiva. Contacta a soporte.' })
  }

  const tokenExpiry = remember ? '60d' : '24h'
  const cookieMaxAge = remember ? 60 * 60 * 24 * 60 : undefined

  const token = jwt.sign(
    {
      id: estudiante.id,
      nombres: estudiante.nombres,
      paterno: estudiante.paterno,
      materno: estudiante.materno,
      dni: estudiante.nro_documento,
      foto: estudiante.foto,
    },
    config.jwtSecret,
    { expiresIn: tokenExpiry }
  )

  setCookie(event, 'auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    ...(cookieMaxAge ? { maxAge: cookieMaxAge } : {}),
    path: '/',
  })

  return {
    id: estudiante.id,
    nombres: estudiante.nombres,
    paterno: estudiante.paterno,
    materno: estudiante.materno,
    dni: estudiante.nro_documento,
    foto: estudiante.foto
      ? `https://sistemas.cepreuna.edu.pe/storage/fotos/${estudiante.foto}`
      : null,
  }
})
