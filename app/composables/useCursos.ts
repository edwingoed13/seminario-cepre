const FALLBACK_CURSOS = [
  { id: '1', nombre: 'Quechua', descripcion: 'Aprende la lengua de los Incas, enfocada en gramática andina y conversación.', icono: 'language_pinyin' },
  { id: '2', nombre: 'Aimara', descripcion: 'Estudio profundo de la fonética y estructura social del idioma Aimara contemporáneo.', icono: 'translate' },
  { id: '3', nombre: 'Inglés', descripcion: 'Preparación para exámenes internacionales y comunicación global efectiva.', icono: 'public' },
]

export const useCursos = () => {
  const supabase = useSupabaseClient()
  const cursosState = useState<any[]>('cursos-list', () => FALLBACK_CURSOS)

  const fetchCursos = async () => {
    const { data, error } = await supabase
      .from('cursos')
      .select('*')
      .order('nombre')
    if (error) throw error
    if (data?.length) cursosState.value = data
    return data
  }

  const fetchCurso = async (id: string) => {
    const { data, error } = await supabase
      .from('cursos')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  }

  const fetchSemanas = async (cursoId: string) => {
    const { data, error } = await supabase
      .from('semanas')
      .select('*')
      .eq('curso_id', cursoId)
      .order('numero_semana')
    if (error) throw error
    return data
  }

  const fetchMateriales = async (semanaId: string) => {
    const { data, error } = await supabase
      .from('materiales')
      .select('*')
      .eq('semana_id', semanaId)
    if (error) throw error
    return data
  }

  const fetchVideos = async (semanaId: string) => {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('semana_id', semanaId)
    if (error) throw error
    return data
  }

  return { fetchCursos, fetchCurso, fetchSemanas, fetchMateriales, fetchVideos, cursos: cursosState }
}
