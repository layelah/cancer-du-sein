"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { Loader2, Trash2, Download, ChevronLeft, ChevronRight, Edit } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { ToastContainer } from "@/components/ui/toast"
import Image from "next/image"
import * as XLSX from "xlsx"

interface ToastMessage {
  id: string
  message: string
  type: "success" | "error" | "warning" | "info"
}

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

export default function RecordsPage() {
  const [screenings, setScreenings] = useState<Screening[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  // Editing state
  const [editingScreening, setEditingScreening] = useState<Screening | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  
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
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const router = useRouter()

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

  // Function to show toast
  const showToast = (message: string, type: "success" | "error" | "warning" | "info" = "info") => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, message, type }])
  }

  // Function to remove toast
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  useEffect(() => {
    fetchScreenings()
    // Refresh every 5 seconds for real-time updates
    const interval = setInterval(fetchScreenings, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchScreenings = async () => {
    try {
      const response = await fetch("/api/screening")
      const data = await response.json()

      if (data.screenings) {
        setScreenings(data.screenings)
      }
    } catch (error) {
      console.error("[v0] Error fetching screenings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRowClick = (id: string) => {
    router.push(`/records/${id}`)
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()

    // Show confirmation modal
    showModal(
      "Confirmer la suppression",
      "Êtes-vous sûr de vouloir supprimer cet enregistrement ? Cette action est irréversible.",
      "warning",
      () => {
        performDelete(id)
      }
    )
  }

  const performDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const response = await fetch(`/api/screening/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setScreenings(screenings.filter((s) => s.id !== id))
        showToast(
          "Enregistrement supprimé avec succès",
          "success"
        )
      } else {
        showToast(
          "Erreur lors de la suppression. Veuillez réessayer.",
          "error"
        )
      }
    } catch (error) {
      showToast(
        "Erreur lors de la suppression. Veuillez vérifier votre connexion et réessayer.",
        "error"
      )
    } finally {
      setDeletingId(null)
    }
  }

  // Editing functions
  const handleEdit = (e: React.MouseEvent, screening: Screening) => {
    e.stopPropagation()
    setEditingScreening(screening)
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setEditingScreening(null)
    setIsEditing(false)
  }

  const handleSaveEdit = async () => {
    if (!editingScreening) return

    try {
      // S'assurer que age est 0 si null ou undefined
      const dataToSend = {
        ...editingScreening,
        age: editingScreening.age ?? 0
      }
      
      const response = await fetch(`/api/screening/${editingScreening.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      })

      if (response.ok) {
        setScreenings(screenings.map(s => s.id === editingScreening.id ? editingScreening : s))
        showToast(
          "Enregistrement modifié avec succès",
          "success"
        )
        handleCancelEdit()
      } else {
        showToast(
          "Erreur lors de la modification. Veuillez réessayer.",
          "error"
        )
      }
    } catch (error) {
      showToast(
        "Erreur lors de la modification. Veuillez vérifier votre connexion et réessayer.",
        "error"
      )
    }
  }

  // Export to Excel function
  const exportToExcel = () => {
    const dataToExport = screenings.map((screening, index) => ({
      "N°": index + 1,
      "Date": new Date(screening.date).toLocaleDateString("fr-FR"),
      "Nom": screening.last_name,
      "Prénom": screening.first_name,
      "Âge": screening.age === 0 ? "Non renseigné" : screening.age,
      "Téléphone": screening.phone,
      "Adresse": screening.address,
      "Vaccination": screening.vaccination ? "Oui" : "Non",
      "Dépistage": screening.screening ? "Oui" : "Non",
      "Mammographie": screening.mammography,
      "Date Mammographie": screening.mammography_date ? new Date(screening.mammography_date).toLocaleDateString("fr-FR") : "",
      "Consultation Gynécologique": screening.gyneco_consultation ? "Oui" : "Non",
      "Date Consultation Gynéco": screening.gyneco_date ? new Date(screening.gyneco_date).toLocaleDateString("fr-FR") : "",
      "Examens Complémentaires": screening.has_additional_exams || "",
      "FCU": screening.fcu ? "Oui" : "Non",
      "Lieu FCU": screening.fcu_location || "",
      "HPV": screening.hpv ? "Oui" : "Non",
      "Échographie Mammaire": screening.mammary_ultrasound ? "Oui" : "Non",
      "Thermo Ablation": screening.thermo_ablation ? "Oui" : "Non",
      "Anapath": screening.anapath ? "Oui" : "Non",
      "Date de Création": new Date(screening.created_at).toLocaleDateString("fr-FR")
    }))

    const ws = XLSX.utils.json_to_sheet(dataToExport)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Dépistages")
    
    // Auto-size columns
    const colWidths = Object.keys(dataToExport[0] || {}).map(key => ({
      wch: Math.max(key.length, 15)
    }))
    ws['!cols'] = colWidths

    XLSX.writeFile(wb, `depistages_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  // Pagination functions
  const totalPages = Math.ceil(screenings.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentScreenings = screenings.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(page)
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 py-8">
      <div className="container mx-auto px-4">
        <Card className="border-pink-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50 border-b border-pink-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <Image src="/images/ruban-rose-hands.png" alt="Ruban rose" width={40} height={40} />
                <CardTitle className="text-2xl text-pink-800">
                  Enregistrements de Dépistage
                  <Badge variant="secondary" className="ml-3 bg-pink-100 text-pink-700">
                    {screenings.length} enregistrement{screenings.length > 1 ? "s" : ""}
                  </Badge>
                </CardTitle>
              </div>
              {screenings.length > 0 && (
                <Button
                  onClick={exportToExcel}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Exporter Excel
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {screenings.length === 0 ? (
              <div className="text-center py-12 text-gray-500">Aucun enregistrement pour le moment</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-pink-50 hover:bg-pink-50">
                      <TableHead className="font-semibold text-pink-800">#</TableHead>
                      <TableHead className="font-semibold text-pink-800">Nom</TableHead>
                      <TableHead className="font-semibold text-pink-800">Prénom</TableHead>
                      <TableHead className="font-semibold text-pink-800">Âge</TableHead>
                      <TableHead className="font-semibold text-pink-800">Téléphone</TableHead>
                      <TableHead className="font-semibold text-pink-800">Date</TableHead>
                      <TableHead className="font-semibold text-pink-800">Vaccination</TableHead>
                      <TableHead className="font-semibold text-pink-800">Mammographie</TableHead>
                      <TableHead className="font-semibold text-pink-800">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentScreenings.map((screening, index) => (
                      <TableRow
                        key={screening.id}
                        onClick={() => handleRowClick(screening.id)}
                        className="cursor-pointer hover:bg-pink-50 transition-colors"
                      >
                        <TableCell className="font-medium text-pink-600">{startIndex + index + 1}</TableCell>
                        <TableCell className="font-medium">{screening.last_name}</TableCell>
                        <TableCell>{screening.first_name}</TableCell>
                        <TableCell>{screening.age === 0 ? "Non renseigné" : `${screening.age} ans`}</TableCell>
                        <TableCell className="font-mono text-sm">{screening.phone}</TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {new Date(screening.date).toLocaleDateString("fr-FR")}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={screening.vaccination ? "default" : "secondary"}
                            className={
                              screening.vaccination ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                            }
                          >
                            {screening.vaccination ? "Oui" : "Non"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                            {screening.mammography}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={(e) => handleEdit(e, screening)}
                              variant="ghost"
                              size="sm"
                              className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={(e) => handleDelete(e, screening.id)}
                              disabled={deletingId === screening.id}
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              {deletingId === screening.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            
            {/* Pagination */}
            {screenings.length > itemsPerPage && (
              <div className="flex items-center justify-between mt-6 px-2">
                <div className="text-sm text-gray-600">
                  Affichage de {startIndex + 1} à {Math.min(endIndex, screenings.length)} sur {screenings.length} enregistrements
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Précédent
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        onClick={() => goToPage(page)}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        className={`w-8 h-8 p-0 ${
                          currentPage === page 
                            ? "bg-pink-600 hover:bg-pink-700 text-white" 
                            : "hover:bg-pink-50"
                        }`}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  
                  <Button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    Suivant
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Modal */}
        {isEditing && editingScreening && (
          <Modal
            isOpen={isEditing}
            onClose={handleCancelEdit}
            title="Modifier l'enregistrement"
            message=""
            type="info"
            showCancelButton={true}
            onConfirm={handleSaveEdit}
            confirmText="Enregistrer"
            cancelText="Annuler"
          >
            <div className="space-y-4 sm:space-y-6 overflow-y-auto pr-2">
              {/* Informations personnelles */}
              <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 bg-gradient-to-r from-accent/20 to-accent/10 rounded-2xl border border-primary/10">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-6 gradient-primary rounded-full"></div>
                  <h3 className="text-xl font-bold text-foreground">Coordonnées Personnelles</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="edit-date" className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full pulse-glow"></div>
                      Date
                    </Label>
                    <Input
                      id="edit-date"
                      type="date"
                      value={editingScreening.date}
                      onChange={(e) => setEditingScreening({ ...editingScreening, date: e.target.value })}
                      className="h-12 border-2 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-age" className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <div className="w-2 h-2 bg-chart-3 rounded-full pulse-glow"></div>
                      Âge
                    </Label>
                    <Input
                      id="edit-age"
                      type="number"
                      value={editingScreening.age}
                      onChange={(e) => setEditingScreening({ ...editingScreening, age: parseInt(e.target.value) || 0 })}
                      className="h-12 border-2 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 rounded-xl"
                    />
                </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-last-name" className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <div className="w-2 h-2 bg-chart-1 rounded-full pulse-glow"></div>
                      Nom
                    </Label>
                  <Input
                    id="edit-last-name"
                    value={editingScreening.last_name}
                    onChange={(e) => setEditingScreening({ ...editingScreening, last_name: e.target.value })}
                      className="h-12 border-2 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 rounded-xl"
                  />
                </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-first-name" className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <div className="w-2 h-2 bg-chart-2 rounded-full pulse-glow"></div>
                      Prénom
                    </Label>
                  <Input
                    id="edit-first-name"
                    value={editingScreening.first_name}
                    onChange={(e) => setEditingScreening({ ...editingScreening, first_name: e.target.value })}
                      className="h-12 border-2 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 rounded-xl"
                  />
                </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-phone" className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <div className="w-2 h-2 bg-chart-4 rounded-full pulse-glow"></div>
                      Téléphone
                    </Label>
                  <Input
                    id="edit-phone"
                    value={editingScreening.phone}
                    onChange={(e) => setEditingScreening({ ...editingScreening, phone: e.target.value })}
                      className="h-12 border-2 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 rounded-xl"
                  />
                </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-address" className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <div className="w-2 h-2 bg-chart-5 rounded-full pulse-glow"></div>
                      Adresse
                    </Label>
                  <Input
                    id="edit-address"
                    value={editingScreening.address}
                    onChange={(e) => setEditingScreening({ ...editingScreening, address: e.target.value })}
                      className="h-12 border-2 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 rounded-xl"
                  />
                  </div>
                </div>
              </div>

              {/* Informations médicales */}
              <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 bg-gradient-to-r from-accent/20 to-accent/10 rounded-2xl border border-primary/10">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-6 gradient-primary rounded-full"></div>
                  <h3 className="text-xl font-bold text-foreground">Consultations et Vaccination</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <div className="w-2 h-2 bg-chart-1 rounded-full pulse-glow"></div>
                      Vaccination
                    </Label>
                  <RadioGroup
                    value={editingScreening.vaccination ? "oui" : "non"}
                    onValueChange={(value) => setEditingScreening({ ...editingScreening, vaccination: value === "oui" })}
                    className="flex gap-6 mt-2"
                  >
                      <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg hover:from-pink-100 hover:to-rose-100 hover:border-pink-300 transition-all duration-300">
                        <RadioGroupItem
                          value="oui"
                          id="edit-vaccination-oui"
                          className="w-5 h-5 border-2 border-pink-300 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500 data-[state=checked]:text-white"
                        />
                        <Label htmlFor="edit-vaccination-oui" className="cursor-pointer text-sm font-medium text-pink-800">
                          Oui
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg hover:from-pink-100 hover:to-rose-100 hover:border-pink-300 transition-all duration-300">
                        <RadioGroupItem
                          value="non"
                          id="edit-vaccination-non"
                          className="w-5 h-5 border-2 border-pink-300 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500 data-[state=checked]:text-white"
                        />
                        <Label htmlFor="edit-vaccination-non" className="cursor-pointer text-sm font-medium text-pink-800">
                          Non
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <div className="w-2 h-2 bg-chart-2 rounded-full pulse-glow"></div>
                      Consultation Gynécologique
                    </Label>
                    <RadioGroup
                      value={editingScreening.gyneco_consultation ? "oui" : "non"}
                      onValueChange={(value) => setEditingScreening({ ...editingScreening, gyneco_consultation: value === "oui" })}
                      className="flex gap-6 mt-2"
                    >
                      <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg hover:from-pink-100 hover:to-rose-100 hover:border-pink-300 transition-all duration-300">
                        <RadioGroupItem
                          value="oui"
                          id="edit-gyneco-oui"
                          className="w-5 h-5 border-2 border-pink-300 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500 data-[state=checked]:text-white"
                        />
                        <Label htmlFor="edit-gyneco-oui" className="cursor-pointer text-sm font-medium text-pink-800">
                          Oui
                        </Label>
                    </div>
                      <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg hover:from-pink-100 hover:to-rose-100 hover:border-pink-300 transition-all duration-300">
                        <RadioGroupItem
                          value="non"
                          id="edit-gyneco-non"
                          className="w-5 h-5 border-2 border-pink-300 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500 data-[state=checked]:text-white"
                        />
                        <Label htmlFor="edit-gyneco-non" className="cursor-pointer text-sm font-medium text-pink-800">
                          Non
                        </Label>
                    </div>
                  </RadioGroup>
                </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <div className="w-2 h-2 bg-chart-3 rounded-full pulse-glow"></div>
                      Dépistage
                    </Label>
                  <RadioGroup
                    value={editingScreening.screening ? "oui" : "non"}
                    onValueChange={(value) => setEditingScreening({ ...editingScreening, screening: value === "oui" })}
                    className="flex gap-6 mt-2"
                  >
                      <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg hover:from-pink-100 hover:to-rose-100 hover:border-pink-300 transition-all duration-300">
                        <RadioGroupItem
                          value="oui"
                          id="edit-screening-oui"
                          className="w-5 h-5 border-2 border-pink-300 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500 data-[state=checked]:text-white"
                        />
                        <Label htmlFor="edit-screening-oui" className="cursor-pointer text-sm font-medium text-pink-800">
                          Oui
                        </Label>
                    </div>
                      <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg hover:from-pink-100 hover:to-rose-100 hover:border-pink-300 transition-all duration-300">
                        <RadioGroupItem
                          value="non"
                          id="edit-screening-non"
                          className="w-5 h-5 border-2 border-pink-300 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500 data-[state=checked]:text-white"
                        />
                        <Label htmlFor="edit-screening-non" className="cursor-pointer text-sm font-medium text-pink-800">
                          Non
                        </Label>
                    </div>
                  </RadioGroup>
                </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <div className="w-2 h-2 bg-chart-3 rounded-full pulse-glow"></div>
                      Mammographie
                    </Label>
                    <RadioGroup
                    value={editingScreening.mammography}
                      onValueChange={(value) => setEditingScreening({ ...editingScreening, mammography: value })}
                      className="flex gap-6 mt-2"
                    >
                      <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg hover:from-pink-100 hover:to-rose-100 hover:border-pink-300 transition-all duration-300">
                        <RadioGroupItem
                          value="oui"
                          id="edit-mammography-oui"
                          className="w-5 h-5 border-2 border-pink-300 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500 data-[state=checked]:text-white"
                        />
                        <Label htmlFor="edit-mammography-oui" className="cursor-pointer text-sm font-medium text-pink-800">
                          Oui
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg hover:from-pink-100 hover:to-rose-100 hover:border-pink-300 transition-all duration-300">
                        <RadioGroupItem
                          value="non"
                          id="edit-mammography-non"
                          className="w-5 h-5 border-2 border-pink-300 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500 data-[state=checked]:text-white"
                        />
                        <Label htmlFor="edit-mammography-non" className="cursor-pointer text-sm font-medium text-pink-800">
                          Non
                        </Label>
                </div>
                    </RadioGroup>

                    {editingScreening.mammography === "oui" && (
                      <div className="space-y-2 pl-6 border-l-2 border-primary/30 bg-primary/5 p-4 rounded-xl mt-3">
                        <Label htmlFor="edit-mammography-date" className="text-sm font-semibold text-foreground">
                          Date de Rendez-vous
                        </Label>
                    <Input
                      id="edit-mammography-date"
                      type="date"
                          value={editingScreening.mammography_date || ""}
                      onChange={(e) => setEditingScreening({ ...editingScreening, mammography_date: e.target.value })}
                          className="h-12 border-2 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 rounded-xl max-w-xs"
                    />
                  </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Examens complémentaires */}
              <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 bg-gradient-to-r from-secondary/30 to-secondary/10 rounded-2xl border border-primary/10">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-6 gradient-primary rounded-full"></div>
                  <h3 className="text-xl font-bold text-foreground">Examens Complémentaires</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg hover:from-pink-100 hover:to-rose-100 hover:border-pink-300 transition-all duration-300">
                  <Checkbox
                    id="edit-hpv"
                    checked={editingScreening.hpv}
                    onCheckedChange={(checked) => setEditingScreening({ ...editingScreening, hpv: checked as boolean })}
                      className="w-5 h-5 border-2 border-pink-300 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500 data-[state=checked]:text-white"
                  />
                    <Label htmlFor="edit-hpv" className="cursor-pointer text-sm font-medium text-pink-800">
                      HPV
                    </Label>
                </div>

                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg hover:from-pink-100 hover:to-rose-100 hover:border-pink-300 transition-all duration-300">
                  <Checkbox
                    id="edit-ultrasound"
                    checked={editingScreening.mammary_ultrasound}
                    onCheckedChange={(checked) => setEditingScreening({ ...editingScreening, mammary_ultrasound: checked as boolean })}
                      className="w-5 h-5 border-2 border-pink-300 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500 data-[state=checked]:text-white"
                  />
                    <Label htmlFor="edit-ultrasound" className="cursor-pointer text-sm font-medium text-pink-800">
                      Échographie Mammaire
                    </Label>
                </div>

                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg hover:from-pink-100 hover:to-rose-100 hover:border-pink-300 transition-all duration-300">
                  <Checkbox
                    id="edit-thermo"
                    checked={editingScreening.thermo_ablation}
                    onCheckedChange={(checked) => setEditingScreening({ ...editingScreening, thermo_ablation: checked as boolean })}
                      className="w-5 h-5 border-2 border-pink-300 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500 data-[state=checked]:text-white"
                  />
                    <Label htmlFor="edit-thermo" className="cursor-pointer text-sm font-medium text-pink-800">
                      Thermo Ablation
                    </Label>
                </div>

                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg hover:from-pink-100 hover:to-rose-100 hover:border-pink-300 transition-all duration-300">
                    <Checkbox
                      id="edit-anapath"
                      checked={editingScreening.anapath}
                      onCheckedChange={(checked) => setEditingScreening({ ...editingScreening, anapath: checked as boolean })}
                      className="w-5 h-5 border-2 border-pink-300 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500 data-[state=checked]:text-white"
                    />
                    <Label htmlFor="edit-anapath" className="cursor-pointer text-sm font-medium text-pink-800">
                      Anapath
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg hover:from-pink-100 hover:to-rose-100 hover:border-pink-300 transition-all duration-300">
                    <Checkbox
                      id="edit-fcu"
                      checked={editingScreening.fcu}
                      onCheckedChange={(checked) => {
                        setEditingScreening({ 
                          ...editingScreening, 
                          fcu: checked as boolean,
                          fcu_location: checked ? (editingScreening.fcu_location || "") : undefined
                        })
                      }}
                      className="w-5 h-5 border-2 border-pink-300 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500 data-[state=checked]:text-white"
                    />
                    <Label htmlFor="edit-fcu" className="cursor-pointer text-sm font-medium text-pink-800">
                      FCU (Frottis Cervico-Utérin)
                    </Label>
                  </div>
                </div>

                {editingScreening.fcu && (
                  <div className="space-y-2 p-4 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-xl">
                    <Label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 bg-primary rounded-full pulse-glow"></div>
                      Lieu d'examen FCU
                    </Label>
                    <RadioGroup
                      value={editingScreening.fcu_location || ""}
                      onValueChange={(value) => setEditingScreening({ ...editingScreening, fcu_location: value })}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg hover:from-pink-100 hover:to-rose-100 hover:border-pink-300 transition-all duration-300">
                        <RadioGroupItem
                          value="SAR"
                          id="edit-fcu-sar"
                          className="w-5 h-5 border-2 border-pink-300 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500 data-[state=checked]:text-white"
                        />
                        <Label htmlFor="edit-fcu-sar" className="cursor-pointer text-sm font-medium text-pink-800">
                          SAR
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg hover:from-pink-100 hover:to-rose-100 hover:border-pink-300 transition-all duration-300">
                        <RadioGroupItem
                          value="Ailleurs"
                          id="edit-fcu-ailleurs"
                          className="w-5 h-5 border-2 border-pink-300 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500 data-[state=checked]:text-white"
                        />
                        <Label htmlFor="edit-fcu-ailleurs" className="cursor-pointer text-sm font-medium text-pink-800">
                          Ailleurs
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}
              </div>
            </div>
          </Modal>
        )}

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

        <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      </div>
    </div>
  )
}
