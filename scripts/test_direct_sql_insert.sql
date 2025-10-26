-- ============================================================================
-- TEST DIRECT : Insérer un enregistrement SANS age pour voir si ça marche
-- ============================================================================

-- Méthode 1: Tester l'insertion SQL directe
DELETE FROM screening_records WHERE last_name = 'TEST SQL DIRECT' OR last_name = 'DIRECT-SQL';

INSERT INTO screening_records (
    date, 
    last_name, 
    first_name, 
    phone, 
    address,
    vaccination, 
    screening, 
    mammography, 
    gyneco_consultation
) VALUES (
    CURRENT_DATE, 
    'TEST SQL DIRECT', 
    'WITHOUT AGE', 
    '000000000', 
    'Test Direct SQL',
    false, 
    false, 
    'non', 
    false
);

SELECT '✅ INSERTION SQL DIRECTE RÉUSSIE' as result, 
       id, last_name, first_name, age, phone 
FROM screening_records 
WHERE last_name = 'TEST SQL DIRECT';

-- Si cette insertion fonctionne, alors le problème est définitivement dans PostgREST ou le client Supabase

