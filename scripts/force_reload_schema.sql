-- Script pour forcer le rafraîchissement complet du schéma Supabase
-- À exécuter dans le SQL Editor de Supabase

-- 1. Supprimer et recréer la contrainte pour forcer le refresh
ALTER TABLE screening_records 
ALTER COLUMN age DROP NOT NULL;

-- 2. Vérifier que la colonne est bien nullable
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'screening_records' 
AND column_name = 'age';

-- 3. Forcer le rechargement du schéma PostgREST (plusieurs fois pour être sûr)
NOTIFY pgrst, 'reload schema';
SELECT pg_sleep(1);
NOTIFY pgrst, 'reload schema';
SELECT pg_sleep(1);
NOTIFY pgrst, 'reload schema';

-- 4. Vérifier les contraintes CHECK pour voir si age a encore une contrainte
SELECT 
    constraint_name, 
    constraint_type,
    check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'screening_records'
AND check_clause LIKE '%age%';

