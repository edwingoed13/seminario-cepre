export const useCursos = () => {
  const supabase = useSupabaseClient()

  const fetchCursos = async () => {
    const { data, error } = await supabase
      .from('cursos')
      .select('*')
      .order('nombre')
    if (error) throw error
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

  return { fetchCursos, fetchCurso, fetchSemanas, fetchMateriales, fetchVideos }
}
