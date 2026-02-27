-- SQL PARA EL MÓDULO DE AGENDA
-- Ejecuta esto en el SQL Editor de tu proyecto en Supabase.

-- 1. Crear tabla de Sesiones
CREATE TABLE IF NOT EXISTS sesiones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    cliente_nombre TEXT NOT NULL,
    tipo_sesion TEXT NOT NULL, -- Ej: 'Carta Natal', 'Revolución Solar', etc.
    fecha_hora TIMESTAMPTZ NOT NULL,
    estado TEXT DEFAULT 'pendiente', -- 'pendiente', 'confirmada', 'cancelada'
    notas TEXT
);

-- 2. Configurar índices para búsquedas por fecha
CREATE INDEX IF NOT EXISTS idx_sesiones_fecha_hora ON sesiones(fecha_hora ASC);

-- 3. Habilitar Seguridad a Nivel de Fila (RLS)
ALTER TABLE sesiones ENABLE ROW LEVEL SECURITY;

-- 4. Políticas (Ajustar según necesidad, aquí permitimos acceso total para desarrollo)
CREATE POLICY "Permitir inserciones de sesiones" 
ON sesiones FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Permitir lectura de sesiones" 
ON sesiones FOR SELECT 
USING (true);

CREATE POLICY "Permitir actualización de sesiones" 
ON sesiones FOR UPDATE 
USING (true);

CREATE POLICY "Permitir eliminación de sesiones" 
ON sesiones FOR DELETE 
USING (true);

-- Insertar datos de prueba opcionales (descomenta si quieres ver algo de entrada)
-- INSERT INTO sesiones (cliente_nombre, tipo_sesion, fecha_hora, estado) VALUES 
-- ('Ana P.', 'Carta Natal', NOW() + INTERVAL '2 days', 'confirmada'),
-- ('Lucas G.', 'Revolución Solar', NOW() + INTERVAL '4 days', 'pendiente'),
-- ('Elena V.', 'Compatibilidad', NOW() + INTERVAL '6 days', 'confirmada');
