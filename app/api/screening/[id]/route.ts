import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase-server"
import { mockSupabase } from "@/lib/mock-data"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    // Essayer d'utiliser Supabase d'abord, sinon utiliser les données mockées
    try {
      const supabase = await createServerClient()

      const { data, error } = await supabase.from("screening_records").select("*").eq("id", id).single()

      if (error) {
        throw new Error("Supabase not available")
      }

      return NextResponse.json({ screening: data })
    } catch (supabaseError) {
      // Fallback vers les données mockées
      console.log("[DEMO] Using mock data instead of Supabase")
      
      const { data: screening, error } = await mockSupabase.getScreeningById(id)

      if (error) {
        console.error("[DEMO] Mock error:", error)
        return NextResponse.json({ error: "Erreur lors de la récupération des données" }, { status: 500 })
      }

      if (!screening) {
        return NextResponse.json({ error: "Enregistrement non trouvé" }, { status: 404 })
      }

      return NextResponse.json({ screening })
    }
  } catch (error) {
    console.error("[v0] Server error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data = await request.json()

    console.log("🔵 PUT /api/screening/[id] - DEBUT")
    console.log("ID:", id)
    console.log("Données reçues:", data)

    try {
      const supabase = await createServerClient()

      const updateData = {
        date: data.date,
        last_name: data.last_name,
        first_name: data.first_name,
        age: data.age ? Number.parseInt(data.age.toString()) : null,
        phone: data.phone,
        address: data.address,
        vaccination: data.vaccination,
        screening: data.screening,
        mammography: data.mammography,
        mammography_date: data.mammography_date,
        gyneco_consultation: data.gyneco_consultation,
        gyneco_date: data.gyneco_date,
        fcu: data.fcu,
        fcu_location: data.fcu_location,
        has_additional_exams: data.has_additional_exams,
        hpv: data.hpv,
        mammary_ultrasound: data.mammary_ultrasound,
        thermo_ablation: data.thermo_ablation,
        anapath: data.anapath,
      }

      console.log("📝 Données à mettre à jour:", updateData)

      const { data: updatedData, error } = await supabase
        .from("screening_records")
        .update(updateData)
        .eq("id", id)
        .select()

      if (error) {
        console.error("❌ Erreur de mise à jour:", error)
        throw new Error("Supabase not available")
      }

      console.log("✅ Mise à jour réussie:", updatedData)

      return NextResponse.json({ success: true, screening: updatedData[0] })
    } catch (supabaseError) {
      console.error("[ERROR] Supabase failed:", supabaseError)
      return NextResponse.json({ 
        error: "Erreur de connexion à la base de données. Veuillez réessayer." 
      }, { status: 500 })
    }
  } catch (error) {
    console.error("[v0] Server error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    // Essayer d'utiliser Supabase d'abord, sinon utiliser les données mockées
    try {
      const supabase = await createServerClient()

      const { error } = await supabase.from("screening_records").delete().eq("id", id)

      if (error) {
        throw new Error("Supabase not available")
      }

      return NextResponse.json({ success: true, message: "Enregistrement supprimé avec succès" })
    } catch (supabaseError) {
      // Fallback vers les données mockées
      console.log("[DEMO] Using mock data instead of Supabase")
      
      const { error } = await mockSupabase.deleteScreening(id)

      if (error) {
        console.error("[DEMO] Mock error:", error)
        return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: "Enregistrement supprimé avec succès" })
    }
  } catch (error) {
    console.error("[v0] Server error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
