-- Script para crear la tabla de prompts en Supabase

CREATE TABLE IF NOT EXISTS public.prompts (
    id TEXT PRIMARY KEY,
    prompt_text TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

-- Crear políticas para permitir lectura universal (acceso anónimo)
CREATE POLICY "Permitir lectura a todos" 
ON public.prompts 
FOR SELECT 
USING (true);

-- Crear política para permitir escritura temporal universal (acceso anónimo)
-- NOTA: Esto permite que cualquier usuario edite los prompts. En un sistema en producción con roles,
-- deberás cambiar true por una validación de auth.uid()
CREATE POLICY "Permitir escritura universal" 
ON public.prompts 
FOR ALL 
USING (true) 
WITH CHECK (true);
