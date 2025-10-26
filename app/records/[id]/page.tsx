"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import {
  ArrowLeft,
  Calendar,
  User,
  Phone,
  MapPin,
  Syringe,
  Activity,
  Stethoscope,
  FileText,
  Loader2,
  Trash2,
} from "lucide-react"
import Image from "next/image"

interface Screening {
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

export default function RecordDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [screening, setScreening] = useState<Screening | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  
  // Modal state
  const [modal, setModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    type: "success" | "error" | "warning" | "info"
    onConfirm?: () => void
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info"
  })

  // Function to show modal
  const showModal = (title: string, message: string, type: "success" | "error" | "warning" | "info" = "info", onConfirm?: () => void) => {
    setModal({
      isOpen: true,
      title,
      message,
      type,
      onConfirm
    })
  }

  // Function to close modal
  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }))
  }

  useEffect(() => {
    fetchScreening()
  }, [params.id])

  const fetchScreening = async () => {
    try {
      const response = await fetch(`/api/screening/${params.id}`)
      const data = await response.json()

      if (data.screening) {
        setScreening(data.screening)
      }
    } catch (error) {
      console.error("[v0] Error fetching screening:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    // Show confirmation modal
    showModal(
      "Confirmer la suppression",
      "Êtes-vous sûr de vouloir supprimer cet enregistrement ? Cette action est irréversible.",
      "warning",
      () => {
        performDelete()
      }
    )
  }

  const performDelete = async () => {
    setDeleting(true)
    try {
      const response = await fetch(`/api/screening/${params.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        showModal(
          "Suppression réussie",
          "L'enregistrement a été supprimé avec succès. Vous allez être redirigé vers la liste des enregistrements.",
          "success",
          () => {
            router.push("/records")
          }
        )
      } else {
        showModal(
          "Erreur de suppression",
          "Une erreur est survenue lors de la suppression. Veuillez réessayer.",
          "error"
        )
      }
    } catch (error) {
      showModal(
        "Erreur de suppression",
        "Une erreur est survenue lors de la suppression. Veuillez vérifier votre connexion et réessayer.",
        "error"
      )
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    )
  }

  if (!screening) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-4">Enregistrement non trouvé</p>
            <Button onClick={() => router.push("/records")} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={() => router.push("/records")}
            variant="outline"
            className="border-pink-200 hover:bg-pink-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux enregistrements
          </Button>

          <Button
            onClick={handleDelete}
            disabled={deleting}
            variant="destructive"
            className="bg-red-500 hover:bg-red-600"
          >
            {deleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Suppression...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </>
            )}
          </Button>
        </div>

        <Card className="border-pink-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50 border-b border-pink-200">
            <div className="flex items-center gap-3">
              <Image src="/images/rapport-medical.png" alt="Rapport médical" width={40} height={40} />
              <div>
                <CardTitle className="text-2xl text-pink-800">Détails du Dépistage</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Enregistré le {new Date(screening.created_at).toLocaleString("fr-FR")}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Informations générales */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-pink-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Date du dépistage</p>
                    <p className="font-medium">{new Date(screening.date).toLocaleDateString("fr-FR")}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-pink-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Numéro de dépistage</p>
                    <p className="font-mono font-medium">{screening.screening_number}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-pink-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Patient</p>
                    <p className="font-medium">
                      {screening.first_name} {screening.last_name}
                    </p>
                    <p className="text-sm text-gray-600">{screening.age} ans</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-pink-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Téléphone</p>
                    <p className="font-mono">{screening.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2">
              <MapPin className="w-5 h-5 text-pink-500 mt-1" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Adresse</p>
                <p className="font-medium">{screening.address}</p>
              </div>
            </div>

            <div className="border-t border-pink-100 pt-6">
              <h3 className="font-semibold text-pink-800 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Examens et Consultations
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Syringe className="w-4 h-4 text-pink-600" />
                    <span className="text-sm font-medium">Vaccination</span>
                  </div>
                  <Badge
                    variant={screening.vaccination ? "default" : "secondary"}
                    className={screening.vaccination ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}
                  >
                    {screening.vaccination ? "Oui" : "Non"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-pink-600" />
                    <span className="text-sm font-medium">Dépistage</span>
                  </div>
                  <Badge
                    variant={screening.screening ? "default" : "secondary"}
                    className={screening.screening ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}
                  >
                    {screening.screening ? "Oui" : "Non"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-pink-600" />
                    <span className="text-sm font-medium">Mammographie</span>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    {screening.mammography}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-pink-600" />
                    <span className="text-sm font-medium">Consultation gynéco</span>
                  </div>
                  <Badge
                    variant={screening.gyneco_consultation ? "default" : "secondary"}
                    className={
                      screening.gyneco_consultation ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    }
                  >
                    {screening.gyneco_consultation ? "Oui" : "Non"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="border-t border-pink-100 pt-6">
              <h3 className="font-semibold text-pink-800 mb-4">Examens Complémentaires</h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { label: "FCU", value: screening.fcu },
                  { label: "HPV", value: screening.hpv },
                  { label: "Échographie mammaire", value: screening.mammary_ultrasound },
                  { label: "Thermo ablation", value: screening.thermo_ablation },
                  { label: "Anapath", value: screening.anapath },
                ].map((exam) => (
                  <div
                    key={exam.label}
                    className={`p-3 rounded-lg border-2 text-center transition-colors ${
                      exam.value ? "border-pink-300 bg-pink-50" : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <p className="text-sm font-medium">{exam.label}</p>
                    <Badge
                      variant={exam.value ? "default" : "secondary"}
                      className={`mt-2 ${exam.value ? "bg-pink-500" : "bg-gray-400"}`}
                    >
                      {exam.value ? "Effectué" : "Non effectué"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modal */}
        <Modal
          isOpen={modal.isOpen}
          onClose={closeModal}
          title={modal.title}
          message={modal.message}
          type={modal.type}
          onConfirm={modal.onConfirm}
          confirmText={modal.type === "warning" ? "Supprimer" : "Compris"}
          cancelText="Annuler"
          showCancelButton={modal.type === "warning"}
        />
      </div>
    </div>
  )
}
