export const useQuiz = () => {
  const supabase = useSupabaseClient()

  const fetchQuizzes = async (cursoId: string, semanaId?: string) => {
    let query = supabase
      .from('quizzes')
      .select('*')
      .eq('curso_id', cursoId)

    if (semanaId) {
      query = query.eq('semana_id', semanaId)
    }

    const { data, error } = await query.order('created_at')
    if (error) throw error
    return data
  }

  const submitAnswer = async (userId: string, quizId: string, respuesta: string, esCorrecta: boolean) => {
    const { data, error } = await supabase
      .from('respuestas_usuario')
      .upsert({
        user_id: userId,
        quiz_id: quizId,
        respuesta,
        es_correcta: esCorrecta,
      })
    if (error) throw error
    return data
  }

  const fetchUserAnswers = async (userId: string, cursoId: string) => {
    const { data, error } = await supabase
      .from('respuestas_usuario')
      .select('*, quizzes!inner(curso_id)')
      .eq('user_id', userId)
      .eq('quizzes.curso_id', cursoId)
    if (error) throw error
    return data
  }

  return { fetchQuizzes, submitAnswer, fetchUserAnswers }
}
