-- SQL DE SUPABASE PARA EL GESTOR DE CARTAS NATALES
-- Ejecuta esto en el SQL Editor de tu proyecto en Supabase.

-- 1. Crear tabla principal de Consultas
CREATE TABLE IF NOT EXISTS consultas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    nombre_completo TEXT NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    apellidos_completos TEXT NOT NULL,
    
    -- Almacenará todo el resultado del motor numérico (primeraParte, segundaParte, linajes, etc)
    numerologia_data JSONB NOT NULL,
    
    -- Almacenará el mapeo de todas las interpretaciones de la IA generadas
    explicaciones_ia JSONB NOT NULL
);

-- 2. Configurar índices para búsquedasrápidas de historial
CREATE INDEX IF NOT EXISTS idx_consultas_created_at ON consultas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_consultas_nombre ON consultas(nombre_completo);

-- 3. Habilitar Seguridad a Nivel de Fila (RLS) opcional pero recomendado
ALTER TABLE consultas ENABLE ROW LEVEL SECURITY;

-- Por ahora, permitimos inserciones y lecturas sin auth real localmente
-- Permitir escritura anónima
CREATE POLICY "Permitir inserciones de consultas" 
ON consultas FOR INSERT 
WITH CHECK (true);

-- Permitir lectura pública/anónima del historial
CREATE POLICY "Permitir lectura de consultas" 
ON consultas FOR SELECT 
USING (true);

-- Si deseas usar Storage para los PDFs:
-- Esto crea el bucket de Supabase Storage para alojar las cartas natales PDF y poder enviar los links por WhatsApp.
insert into storage.buckets (id, name, public) 
values ('cartas-natales', 'cartas-natales', true) 
on conflict do nothing;

create policy "Acceso público de lectura a cartas natales" 
on storage.objects for select 
using (bucket_id = 'cartas-natales');

create policy "Permitir subida anónima a cartas natales" 
on storage.objects for insert 
with check (bucket_id = 'cartas-natales');
