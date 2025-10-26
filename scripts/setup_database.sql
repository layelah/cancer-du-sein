-- ============================================================================
-- SCRIPT COMPLET DE CRÉATION DE LA TABLE SCREENING_RECORDS
-- À exécuter une seule fois dans le SQL Editor de Supabase
-- ============================================================================

-- Supprimer la table existante si elle existe
DROP TABLE IF EXISTS screening_records CASCADE;

-- Créer la table screening_records avec tous les champs
CREATE TABLE screening_records (
  -- Identifiants
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  screening_number VARCHAR(50),
  
  -- Informations personnelles
  date DATE NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  age INTEGER,  -- OPTIONNEL : peut être null pour les patients qui ne connaissent pas leur âge
  phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  
  -- Informations médicales
  vaccination BOOLEAN NOT NULL,
  screening BOOLEAN NOT NULL,
  mammography VARCHAR(20) NOT NULL,
  mammography_date DATE,
  gyneco_consultation BOOLEAN NOT NULL,
  gyneco_date DATE,
  
  -- Examens complémentaires
  fcu BOOLEAN DEFAULT FALSE,
  fcu_location VARCHAR(50),
  has_additional_exams VARCHAR(20),
  hpv BOOLEAN DEFAULT FALSE,
  mammary_ultrasound BOOLEAN DEFAULT FALSE,
  thermo_ablation BOOLEAN DEFAULT FALSE,
  anapath BOOLEAN DEFAULT FALSE,
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer Row Level Security
ALTER TABLE screening_records ENABLE ROW LEVEL SECURITY;

-- Créer une politique pour permettre toutes les opérations
CREATE POLICY "Allow all operations on screening_records" 
ON screening_records 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Créer des index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_screening_date ON screening_records(date);
CREATE INDEX IF NOT EXISTS idx_screening_created_at ON screening_records(created_at);
CREATE INDEX IF NOT EXISTS idx_screening_number ON screening_records(screening_number);
CREATE INDEX IF NOT EXISTS idx_screening_last_name ON screening_records(last_name);
CREATE INDEX IF NOT EXISTS idx_screening_first_name ON screening_records(first_name);

-- Créer une fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Créer un trigger pour updated_at
CREATE TRIGGER update_screening_records_updated_at 
    BEFORE UPDATE ON screening_records 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Forcer le rafraîchissement du cache Supabase pour appliquer les changements immédiatement
NOTIFY pgrst, 'reload schema';

-- Vérifier la structure de la table
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'screening_records' 
ORDER BY ordinal_position;

-- ============================================================================
-- FIN DU SCRIPT
-- Exécutez ce script dans le SQL Editor de Supabase
-- Une fois exécuté, votre application devrait fonctionner correctement
-- ============================================================================

