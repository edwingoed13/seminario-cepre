-- ============================================
-- CEPREUNA Seminarios - Supabase Schema
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================

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

-- Tabla: respuestas_usuario (para tracking de estudiantes)
CREATE TABLE respuestas_usuario (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  estudiante_dni TEXT NOT NULL,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  respuesta TEXT NOT NULL,
  es_correcta BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(estudiante_dni, quiz_id)
);

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE semanas ENABLE ROW LEVEL SECURITY;
ALTER TABLE materiales ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE respuestas_usuario ENABLE ROW LEVEL SECURITY;

-- Admin (autenticado) puede hacer todo
CREATE POLICY "Admin full access cursos" ON cursos FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access semanas" ON semanas FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access materiales" ON materiales FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access videos" ON videos FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access quizzes" ON quizzes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access respuestas" ON respuestas_usuario FOR ALL USING (auth.role() = 'authenticated');

-- Lectura pública con anon key (para estudiantes via API)
CREATE POLICY "Public read cursos" ON cursos FOR SELECT USING (true);
CREATE POLICY "Public read semanas" ON semanas FOR SELECT USING (true);
CREATE POLICY "Public read materiales" ON materiales FOR SELECT USING (true);
CREATE POLICY "Public read videos" ON videos FOR SELECT USING (true);
CREATE POLICY "Public read quizzes" ON quizzes FOR SELECT USING (true);

-- Estudiantes pueden insertar/leer sus respuestas
CREATE POLICY "Public insert respuestas" ON respuestas_usuario FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read respuestas" ON respuestas_usuario FOR SELECT USING (true);

-- ============================================
-- Datos iniciales
-- ============================================

INSERT INTO cursos (nombre, descripcion, nivel, icono) VALUES
  ('Quechua', 'Aprende la lengua de los Incas, enfocada en gramática andina y conversación.', 'Básico', 'language_pinyin'),
  ('Aimara', 'Estudio profundo de la fonética y estructura social del idioma Aimara contemporáneo.', 'Intermedio', 'translate'),
  ('Inglés', 'Preparación para exámenes internacionales y comunicación global efectiva.', 'Avanzado', 'public');
