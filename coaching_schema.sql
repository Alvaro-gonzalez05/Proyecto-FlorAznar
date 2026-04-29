-- ============================================================
-- Tabla: coaching_sessions
-- Ejecutar en Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS coaching_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    consulta_id uuid REFERENCES consultas(id) ON DELETE SET NULL,
    numerology_data jsonb NOT NULL,
    ai_coaching_plan jsonb,           -- Plan generado por IA: contexto + 3 etapas con preguntas
    client_token uuid UNIQUE DEFAULT gen_random_uuid(),
    estado text DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_progreso', 'completado')),
    etapa_actual integer DEFAULT 1 CHECK (etapa_actual BETWEEN 1 AND 3),
    etapas_completadas integer[] DEFAULT ARRAY[]::integer[],
    respuestas_cliente jsonb DEFAULT '{}',  -- { "1": { "pregunta_idx": "respuesta" }, ... }
    notas_flor text DEFAULT '',
    acciones_ia text DEFAULT '',            -- Lista de acciones generadas por IA al final
    nombre_cliente text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_coaching_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER coaching_sessions_updated_at
    BEFORE UPDATE ON coaching_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_coaching_updated_at();

-- Row Level Security
ALTER TABLE coaching_sessions ENABLE ROW LEVEL SECURITY;

-- Flor (usuario autenticado) puede hacer todo
CREATE POLICY "Allow all for authenticated"
    ON coaching_sessions
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Clientes anónimos pueden leer por token (la row completa, filtran en app)
CREATE POLICY "Allow select anon"
    ON coaching_sessions
    FOR SELECT
    TO anon
    USING (true);

-- Clientes anónimos pueden actualizar respuestas y estado
CREATE POLICY "Allow update anon"
    ON coaching_sessions
    FOR UPDATE
    TO anon
    USING (true)
    WITH CHECK (true);
