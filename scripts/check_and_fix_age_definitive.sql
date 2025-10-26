-- ============================================================================
-- SCRIPT DÉFINITIF POUR VÉRIFIER ET CORRIGER LA COLONNE AGE
-- ============================================================================

-- ÉTAPE 1: Vérifier l'état actuel de la colonne age
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'screening_records' 
AND column_name = 'age';

-- ÉTAPE 2: Vérifier toutes les contraintes sur age
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
AND kcu.column_name = 'age';

-- ÉTAPE 3: FORCER la modification de la colonne
-- Supprimer d'abord toutes les contraintes CHECK liées à age
ALTER TABLE screening_records 
ALTER COLUMN age DROP NOT NULL;

-- ÉTAPE 4: Ajouter une valeur par défaut NULL explicite
ALTER TABLE screening_records 
ALTER COLUMN age SET DEFAULT NULL;

-- ÉTAPE 5: Vérifier à nouveau
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'screening_records' 
AND column_name = 'age';

-- ÉTAPE 6: Forcer le rechargement du schéma plusieurs fois
NOTIFY pgrst, 'reload schema';
SELECT pg_sleep(0.5);
NOTIFY pgrst, 'reload schema';
SELECT pg_sleep(0.5);
NOTIFY pgrst, 'reload schema';

-- ÉTAPE 7: Vérifier une dernière fois
SELECT 
    column_name, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'screening_records' 
AND column_name = 'age';

