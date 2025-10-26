-- Script pour corriger la colonne age et forcer le rafraîchissement
-- À exécuter dans le SQL Editor de Supabase

-- Étape 1: Modifier la colonne age pour retirer la contrainte NOT NULL
ALTER TABLE screening_records 
ALTER COLUMN age DROP NOT NULL;

-- Étape 2: Vérifier immédiatement
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'screening_records' 
AND column_name = 'age';

-- Étape 3: Forcer le rafraîchissement du cache PostgREST
NOTIFY pgrst, 'reload schema';

-- Étape 4: Vérifier toutes les contraintes sur la table
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'screening_records'
ORDER BY tc.constraint_type;

