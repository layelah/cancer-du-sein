import { createServerClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    try {
      const supabase = await createServerClient()

      const insertDataBase = {
        date: data.date,
        last_name: data.lastName,
        first_name: data.firstName,
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
      
      // Si age n'est pas fourni, mettre 0 par défaut
      const insertData = data.age && data.age.trim() !== ""
        ? { ...insertDataBase, age: Number.parseInt(data.age) }
        : { ...insertDataBase, age: 0 }
      
      console.log("📝 Age à insérer:", insertData.age)
      
      const { data: insertedData, error } = await supabase
        .from("screening_records")
        .insert([insertData])
        .select()

      if (error) {
        console.error("❌ Erreur insertion Supabase:", error.message)
        throw new Error(`Erreur lors de l'enregistrement en base de données`)
      }

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
    const supabase = await createServerClient()

    const { data: screenings, error } = await supabase
      .from("screening_records")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("❌ Erreur récupération Supabase:", error.message)
      return NextResponse.json({ error: "Erreur de connexion à la base de données" }, { status: 500 })
    }

    return NextResponse.json({ screenings })
  } catch (error) {
    console.error("❌ Erreur récupération données:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des données" }, { status: 500 })
  }
}