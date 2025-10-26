-- Script DÉFINITIF pour rendre age nullable
-- À exécuter dans le SQL Editor de Supabase

-- Étape 1: Sauvegarder les données existantes (optionnel)
-- CREATE TABLE screening_records_backup AS SELECT * FROM screening_records;

-- Étape 2: Supprimer toutes les contraintes et dépendances sur age
-- Trouver et supprimer toutes les contraintes CHECK liées à age
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'screening_records' 
        AND constraint_name LIKE '%age%'
    LOOP
        EXECUTE 'ALTER TABLE screening_records DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name) || ' CASCADE';
    END LOOP;
END $$;

-- Étape 3: Créer une nouvelle colonne temporaire nullable
ALTER TABLE screening_records ADD COLUMN age_new INTEGER;

-- Étape 4: Copier les données de age vers age_new
UPDATE screening_records SET age_new = age;

-- Étape 5: Supprimer l'ancienne colonne age
ALTER TABLE screening_records DROP COLUMN age;

-- Étape 6: Renommer age_new en age
ALTER TABLE screening_records RENAME COLUMN age_new TO age;

-- Étape 7: Forcer le rafraîchissement
NOTIFY pgrst, 'reload schema';

-- Étape 8: Vérifier
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'screening_records' 
AND column_name = 'age';

