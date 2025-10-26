// Données de démonstration pour tester l'application sans Supabase

export interface MockScreening {
  id: string
  date: string
  screening_number: string
  last_name: string
  first_name: string
  age: number
  phone: string
  address: string
  vaccination: boolean
  screening: boolean
  mammography: string
  mammography_date?: string
  gyneco_consultation: boolean
  gyneco_date?: string
  fcu: boolean
  fcu_location?: string
  has_additional_exams?: string
  hpv: boolean
  mammary_ultrasound: boolean
  thermo_ablation: boolean
  anapath: boolean
  created_at: string
}

// Stockage local des données (simulation de base de données)
let mockScreenings: MockScreening[] = [
  {
    id: "1",
    date: "2024-01-15",
    screening_number: "1",
    last_name: "Dupont",
    first_name: "Marie",
    age: 45,
    phone: "0123456789",
    address: "123 Rue de la Paix, Paris",
    vaccination: true,
    screening: true,
    mammography: "oui",
    mammography_date: "2024-01-20",
    gyneco_consultation: true,
    gyneco_date: "2024-01-10",
    fcu: true,
    fcu_location: "SAR",
    has_additional_exams: "oui",
    hpv: false,
    mammary_ultrasound: true,
    thermo_ablation: false,
    anapath: false,
    created_at: "2024-01-15T10:00:00Z"
  },
  {
    id: "2",
    date: "2024-01-16",
    screening_number: "2",
    last_name: "Martin",
    first_name: "Sophie",
    age: 38,
    phone: "0987654321",
    address: "456 Avenue des Champs, Lyon",
    vaccination: false,
    screening: false,
    mammography: "non",
    gyneco_consultation: true,
    gyneco_date: "2024-01-12",
    fcu: false,
    has_additional_exams: "oui",
    hpv: true,
    mammary_ultrasound: false,
    thermo_ablation: true,
    anapath: false,
    created_at: "2024-01-16T14:30:00Z"
  }
]

let nextScreeningNumber = 3

// Fonctions pour simuler l'API Supabase
export const mockSupabase = {
  // Récupérer tous les dépistages
  async getScreenings(): Promise<{ data: MockScreening[] | null, error: any }> {
    try {
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 500))
      return { data: mockScreenings, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Récupérer un dépistage par ID
  async getScreeningById(id: string): Promise<{ data: MockScreening | null, error: any }> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      const screening = mockScreenings.find(s => s.id === id)
      return { data: screening || null, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Créer un nouveau dépistage
  async createScreening(screeningData: Omit<MockScreening, 'id' | 'screening_number' | 'created_at'>): Promise<{ data: { screeningNumber: string } | null, error: any }> {
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const newScreening: MockScreening = {
        id: Date.now().toString(),
        screening_number: nextScreeningNumber.toString(),
        created_at: new Date().toISOString(),
        ...screeningData
      }
      
      mockScreenings.push(newScreening)
      nextScreeningNumber++
      
      return { 
        data: { screeningNumber: newScreening.screening_number }, 
        error: null 
      }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Supprimer un dépistage
  async deleteScreening(id: string): Promise<{ error: any }> {
    try {
      await new Promise(resolve => setTimeout(resolve, 400))
      mockScreenings = mockScreenings.filter(s => s.id !== id)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }
}
