-- ============================================================================
-- SCRIPT DÉFINITIF : SUPPRIMER, CRÉER, ET TESTER AVEC DES DONNÉES RÉELLES
-- ============================================================================

-- ÉTAPE 1: Supprimer complètement la table existante
DROP TABLE IF EXISTS screening_records CASCADE;

-- ÉTAPE 2: Recréer la table avec age explicitement nullable (pas de NOT NULL)
CREATE TABLE screening_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  screening_number VARCHAR(50),
  date DATE NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  age INTEGER NULL,  -- NULL explicite pour rendre sure que c'est nullable
  phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  vaccination BOOLEAN NOT NULL,
  screening BOOLEAN NOT NULL,
  mammography VARCHAR(20) NOT NULL,
  mammography_date DATE,
  gyneco_consultation BOOLEAN NOT NULL,
  gyneco_date DATE,
  fcu BOOLEAN DEFAULT FALSE,
  fcu_location VARCHAR(50),
  has_additional_exams VARCHAR(20),
  hpv BOOLEAN DEFAULT FALSE,
  mammary_ultrasound BOOLEAN DEFAULT FALSE,
  thermo_ablation BOOLEAN DEFAULT FALSE,
  anapath BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ÉTAPE 3: Vérifier que age est bien nullable
SELECT column_name, is_nullable, data_type
FROM information_schema.columns 
WHERE table_name = 'screening_records' 
AND column_name = 'age';

-- ÉTAPE 4: TEST - Insérer un enregistrement SANS age (ne pas inclure la colonne du tout)
INSERT INTO screening_records (
  date, last_name, first_name, phone, address,
  vaccination, screening, mammography, gyneco_consultation, fcu
) VALUES (
  '2025-10-26', 'TEST', 'Without Age', '123456789', 'Test Address',
  true, false, 'non', false, false
);

SELECT 'TEST 1 RÉUSSI: Enregistrement créé SANS age' AS result;

-- ÉTAPE 5: TEST - Insérer un enregistrement AVEC age
INSERT INTO screening_records (
  date, last_name, first_name, age, phone, address,
  vaccination, screening, mammography, gyneco_consultation, fcu
) VALUES (
  '2025-10-26', 'TEST2', 'With Age', 45, '123456789', 'Test Address',
  true, false, 'non', false, false
);

SELECT 'TEST 2 RÉUSSI: Enregistrement créé AVEC age' AS result;

-- ÉTAPE 6: Activer RLS et politique
ALTER TABLE screening_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on screening_records" 
ON screening_records 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- ÉTAPE 7: Créer les index
CREATE INDEX IF NOT EXISTS idx_screening_date ON screening_records(date);
CREATE INDEX IF NOT EXISTS idx_screening_created_at ON screening_records(created_at);

-- ÉTAPE 8: Forcer le reload du schéma
NOTIFY pgrst, 'reload schema';

-- ÉTAPE 9: Vérifier les enregistrements créés
SELECT id, last_name, first_name, age, phone, vaccination, created_at
FROM screening_records
ORDER BY created_at DESC;

SELECT 'SCRIPT TERMINÉ - Les enregistrements TEST ont été créés avec succès!' AS result;

