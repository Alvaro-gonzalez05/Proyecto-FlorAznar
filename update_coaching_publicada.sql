-- Agrega flag para que Flor controle cuándo el cliente ve la síntesis y plan de acción
ALTER TABLE coaching_sessions
ADD COLUMN IF NOT EXISTS sintesis_publicada boolean DEFAULT false;
