-- ACTUALIZACIÓN DE TABLA DE SESIONES PARA DRAG & DROP Y DATOS EXTENDIDOS
-- Ejecuta esto en el SQL Editor de tu proyecto en Supabase.

-- 1. Modificar la tabla 'sesiones' para incluir los nuevos campos
ALTER TABLE sesiones 
ADD COLUMN IF NOT EXISTS apellido TEXT,
ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE,
ADD COLUMN IF NOT EXISTS telefono TEXT;

-- 2. Asegurarse de que el campo fecha_hora pueda ser NULL al crearse (sin fecha asignada)
ALTER TABLE sesiones ALTER COLUMN fecha_hora DROP NOT NULL;

-- 3. Limpiar datos de prueba si es necesario (opcional)
-- DELETE FROM sesiones;
