-- ============================================================================
-- Obtenir le schéma exposé par PostgREST (ce que le client Supabase voit)
-- ============================================================================

-- Méthode 1: Vérifier via information_schema
SELECT 
    table_name,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'screening_records'
ORDER BY ordinal_position;

-- Méthode 2: Test d'insertion via SQL direct
SELECT 'Test insertion SQL directe sans age:' as test;
INSERT INTO screening_records (
    date, last_name, first_name, phone, address,
    vaccination, screening, mammography, gyneco_consultation
) VALUES (
    CURRENT_DATE, 'DIRECT-SQL', 'NO AGE', '000000000', 'Test Direct',
    false, false, 'non', false
);

-- Vérifier l'enregistrement créé
SELECT id, last_name, first_name, age, phone 
FROM screening_records 
WHERE last_name = 'DIRECT-SQL';

-- Nettoyer le test
DELETE FROM screening_records WHERE last_name = 'DIRECT-SQL';

SELECT 'Si cette insertion SQL directe a fonctionné, alors le problème vient du client Supabase JavaScript' as conclusion;

