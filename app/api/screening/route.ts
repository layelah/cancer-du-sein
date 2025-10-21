import { createServerClient } from "@/lib/supabase-server"
import { mockSupabase } from "@/lib/mock-data"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Essayer d'utiliser Supabase d'abord, sinon utiliser les données mockées
    try {
      console.log("Attempting to connect to Supabase...")
      console.log("SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL)
      console.log("SUPABASE_ANON_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY ? "Present" : "Missing")
      
      const supabase = await createServerClient()

      // Générer le numéro de dépistage chronologique automatiquement
      const { data: lastScreening, error: countError } = await supabase
        .from("screening_records")
        .select("screening_number")
        .order("created_at", { ascending: false })
        .limit(1)

      if (countError) {
        throw new Error("Supabase not available")
      }

      // Calculer le prochain numéro chronologique
      let nextScreeningNumber = 1
      if (lastScreening && lastScreening.length > 0) {
        const lastNumber = parseInt(lastScreening[0].screening_number)
        if (!isNaN(lastNumber)) {
          nextScreeningNumber = lastNumber + 1
        }
      }

      const { error } = await supabase.from("screening_records").insert([
        {
          date: data.date,
          screening_number: nextScreeningNumber.toString(),
          last_name: data.lastName,
          first_name: data.firstName,
          age: Number.parseInt(data.age),
          phone: data.phone,
          address: data.address,
          vaccination: data.vaccination === "oui",
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
        },
      ])

      if (error) {
        throw new Error("Supabase insert error")
      }

      return NextResponse.json({ 
        success: true, 
        screeningNumber: nextScreeningNumber.toString() 
      })
    } catch (supabaseError) {
      // Fallback vers les données mockées
      console.log("[DEMO] Using mock data instead of Supabase")
      console.log("Supabase error:", supabaseError)
      
      const { data: result, error } = await mockSupabase.createScreening({
        date: data.date,
        last_name: data.lastName,
        first_name: data.firstName,
        age: Number.parseInt(data.age),
        phone: data.phone,
        address: data.address,
        vaccination: data.vaccination === "oui",
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
      })

      if (error) {
        console.error("[DEMO] Mock error:", error)
        return NextResponse.json({ error: "Erreur lors de l'enregistrement" }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        screeningNumber: result?.screeningNumber || "N/A" 
      })
    }
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: "Erreur lors de l'enregistrement" }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Essayer d'utiliser Supabase d'abord, sinon utiliser les données mockées
    try {
      const supabase = await createServerClient()

      const { data: screenings, error } = await supabase
        .from("screening_records")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        throw new Error("Supabase not available")
      }

      return NextResponse.json({ screenings })
    } catch (supabaseError) {
      // Fallback vers les données mockées
      console.log("[DEMO] Using mock data instead of Supabase")
      
      const { data: screenings, error } = await mockSupabase.getScreenings()

      if (error) {
        console.error("[DEMO] Mock error:", error)
        return NextResponse.json({ error: "Erreur lors de la récupération des données" }, { status: 500 })
      }

      return NextResponse.json({ screenings })
    }
  } catch (error) {
    console.error("[v0] Error fetching screenings:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des données" }, { status: 500 })
  }
}
