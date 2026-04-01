-- ============================================
-- CEPREUNA - Schema de Base de Datos
-- ============================================

-- Tabla: usuarios
CREATE TABLE usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  dni TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla: cursos
CREATE TABLE cursos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  nivel TEXT DEFAULT 'Básico',
  icono TEXT DEFAULT 'language',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla: semanas
CREATE TABLE semanas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE NOT NULL,
  numero_semana INT NOT NULL,
  fecha DATE NOT NULL,
  titulo TEXT,
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla: materiales
CREATE TABLE materiales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  semana_id UUID REFERENCES semanas(id) ON DELETE CASCADE NOT NULL,
  tipo TEXT CHECK (tipo IN ('temario', 'guia')) NOT NULL,
  nombre TEXT NOT NULL,
  archivo_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla: videos
CREATE TABLE videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  semana_id UUID REFERENCES semanas(id) ON DELETE CASCADE NOT NULL,
  tipo TEXT CHECK (tipo IN ('en_vivo', 'grabado')) NOT NULL,
  plataforma TEXT CHECK (plataforma IN ('facebook', 'youtube', 'tiktok')) NOT NULL,
  url TEXT NOT NULL,
  titulo TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla: quizzes
CREATE TABLE quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE NOT NULL,
  semana_id UUID REFERENCES semanas(id) ON DELETE CASCADE,
  pregunta TEXT NOT NULL,
  categoria TEXT DEFAULT 'general',
  opciones JSONB NOT NULL,
  respuesta_correcta TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla: respuestas_usuario
CREATE TABLE respuestas_usuario (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES usuarios(id) ON DELETE CASCADE NOT NULL,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  respuesta TEXT NOT NULL,
  es_correcta BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, quiz_id)
);

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE semanas ENABLE ROW LEVEL SECURITY;
ALTER TABLE materiales ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE respuestas_usuario ENABLE ROW LEVEL SECURITY;

-- Políticas: cursos, semanas, materiales, videos, quizzes son lectura pública para autenticados
CREATE POLICY "Cursos visibles para autenticados" ON cursos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Semanas visibles para autenticados" ON semanas
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Materiales visibles para autenticados" ON materiales
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Videos visibles para autenticados" ON videos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Quizzes visibles para autenticados" ON quizzes
  FOR SELECT USING (auth.role() = 'authenticated');

-- Usuarios solo ven su propio perfil
CREATE POLICY "Usuarios ven su perfil" ON usuarios
  FOR SELECT USING (auth_id = auth.uid());

-- Respuestas: usuario solo ve/crea las suyas
CREATE POLICY "Usuario ve sus respuestas" ON respuestas_usuario
  FOR SELECT USING (user_id IN (SELECT id FROM usuarios WHERE auth_id = auth.uid()));

CREATE POLICY "Usuario crea sus respuestas" ON respuestas_usuario
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM usuarios WHERE auth_id = auth.uid()));

-- ============================================
-- Datos iniciales
-- ============================================

INSERT INTO cursos (nombre, descripcion, nivel, icono) VALUES
  ('Quechua', 'Aprende la lengua de los Incas, enfocada en gramática andina y conversación.', 'Básico', 'language_pinyin'),
  ('Aimara', 'Estudio profundo de la fonética y estructura social del idioma Aimara contemporáneo.', 'Intermedio', 'translate'),
  ('Inglés', 'Preparación para exámenes internacionales y comunicación global efectiva.', 'Avanzado', 'public');

-- Semanas para cada curso (usando las fechas del cronograma)
DO $$
DECLARE
  curso_rec RECORD;
  fechas DATE[] := ARRAY['2025-04-11', '2025-04-25', '2025-05-09', '2025-05-23', '2025-05-30', '2025-06-06', '2025-06-13', '2025-06-20'];
  i INT;
BEGIN
  FOR curso_rec IN SELECT id, nombre FROM cursos LOOP
    FOR i IN 1..8 LOOP
      INSERT INTO semanas (curso_id, numero_semana, fecha, titulo)
      VALUES (curso_rec.id, i, fechas[i], 'Semana ' || i || ' - ' || curso_rec.nombre);
    END LOOP;
  END LOOP;
END $$;
