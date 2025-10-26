import { createServerClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    try {
      console.log("=".repeat(80))
      console.log("🔵 POST /api/screening - DEBUT")
      console.log("=".repeat(80))
      console.log("📥 Données reçues depuis le formulaire:")
      console.log("   vaccination:", data.vaccination)
      console.log("   screening:", data.screening)
      console.log("   mammography:", data.mammography)
      console.log("   gynecoConsultation:", data.gynecoConsultation)
      console.log("=".repeat(80))
      console.log("📡 Attempting to connect to Supabase...")
      console.log("SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL)
      console.log("SUPABASE_ANON_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY ? "Present" : "Missing")
      
      const supabase = await createServerClient()
      console.log("✅ Supabase client créé avec succès")

      const insertData = {
        date: data.date,
        last_name: data.lastName,
        first_name: data.firstName,
        age: data.age ? Number.parseInt(data.age) : null,
        phone: data.phone,
        address: data.address,
        vaccination: data.vaccination === "oui",
        screening: data.screening === "oui",
        mammography: data.mammography,
        mammography_date: data.mammographyDate,
        gyneco_consultation: data.gynecoConsultation === "oui",
        gyneco_date: data.gynecoDate,
        fcu: data.fcu || false,
        fcu_location: data.fcuLocation,
        has_additional_exams: data.hasAdditionalExams,
        hpv: data.hpv || false,
        mammary_ultrasound: data.mammaryUltrasound || false,
        thermo_ablation: data.thermoAblation || false,
        anapath: data.anapath || false,
      }
      
      console.log("📝 Données insérées dans Supabase:")
      console.log("   vaccination (string):", data.vaccination)
      console.log("   vaccination (bool):", insertData.vaccination)
      console.log("   screening (string):", data.screening)
      console.log("   screening (bool):", insertData.screening)
      console.log("   gyneco_consultation (string):", data.gynecoConsultation)
      console.log("   gyneco_consultation (bool):", insertData.gyneco_consultation)
      console.log("📝 Insert data complète:", JSON.stringify(insertData, null, 2))
      console.log("🔍 Vérification de la structure de la table...")
      
      // Vérifier la structure de la table avant l'insertion
      const { data: tableInfo, error: checkError } = await supabase
        .from("screening_records")
        .select("*")
        .limit(0)
      
      if (checkError) {
        console.error("❌ Erreur lors de la vérification de la table:", checkError)
      } else {
        console.log("✅ Table accessible")
      }

      // Test: Vérifier si la colonne age est vraiment nullable
      console.log("🔍 Vérifions la structure réelle de la table dans Supabase...")
      
      // Essayons d'utiliser une méthode directe pour vérifier
      const verifyAgeColumn = await supabase
        .from("screening_records")
        .select("age")
        .limit(0)
      
      console.log("✅ Colonne age accessible pour SELECT")
      
      // Vérification alternative avec une insertion testée
      console.log("🧪 Testons si la contrainte existe vraiment...")
      
      // ATTENTION: Le problème peut venir du fait que nous passons explicitement age: null
      // Peut-être que Supabase interprète cela différemment que de ne pas inclure la colonne du tout
      console.log("🔍 Analyse de insertData.age:")
      console.log("   - Type:", typeof insertData.age)
      console.log("   - Valeur:", insertData.age)
      console.log("   - null?:", insertData.age === null)
      console.log("   - undefined?:", insertData.age === undefined)
      
      // Option: Ne pas inclure age du tout si c'est null
      const dataToInsert = { ...insertData }
      if (dataToInsert.age === null) {
        console.log("⚠️  Suppression de age du payload car il est null")
        delete dataToInsert.age
      }
      
      console.log("📤 Tentative d'insertion dans Supabase...")
      console.log("📦 Données à insérer:", JSON.stringify(dataToInsert, null, 2))
      const { data: insertedData, error } = await supabase.from("screening_records").insert([dataToInsert])
      
      console.log("📥 Réponse Supabase - insertedData:", insertedData)
      console.log("📥 Réponse Supabase - error:", error)

      if (error) {
        console.error("=".repeat(80))
        console.error("❌ ERREUR D'INSERTION SUPABASE")
        console.error("=".repeat(80))
        console.error("Code:", error.code)
        console.error("Message:", error.message)
        console.error("Details:", error.details)
        console.error("Hint:", error.hint)
        console.error("Full error object:", JSON.stringify(error, null, 2))
        console.error("=".repeat(80))
        throw new Error(`Supabase insert error: ${error.message} (Code: ${error.code})`)
      }

      console.log("✅ Insertion réussie dans Supabase!")
      console.log("📊 Données insérées:", insertedData)
      console.log("=".repeat(80))

      return NextResponse.json({ 
        success: true
      })
    } catch (supabaseError) {
      console.error("[ERROR] Supabase failed:", supabaseError)
      return NextResponse.json({ 
        error: "Erreur de connexion à la base de données. Veuillez réessayer." 
      }, { status: 500 })
    }
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: "Erreur lors de l'enregistrement" }, { status: 500 })
  }
}

export async function GET() {
  try {
    console.log("🔍 GET /api/screening - Starting...")
    console.log("SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL)
    
    try {
      const supabase = await createServerClient()

      const { data: screenings, error } = await supabase
        .from("screening_records")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("❌ Supabase select error:", error)
        console.error("Error details:", JSON.stringify(error, null, 2))
        throw new Error("Supabase not available")
      }

      console.log(`✅ Successfully fetched ${screenings?.length || 0} screenings from Supabase`)
      
      return NextResponse.json({ screenings })
    } catch (supabaseError) {
      console.error("❌ [ERROR] Supabase connection failed:", supabaseError)
      return NextResponse.json({ error: "Erreur de connexion à la base de données" }, { status: 500 })
    }
  } catch (error) {
    console.error("❌ [v0] Error fetching screenings:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des données" }, { status: 500 })
  }
}