"use client"

import type { ReactNode } from "react"
import Image from "next/image"
import { CheckCircle2, ChevronLeft, ChevronRight, User, Stethoscope, Microscope } from "lucide-react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Modal } from "@/components/ui/modal"
import { Checkbox } from "@/components/ui/checkbox"

// Define the shape of form data
interface FormData {
  date: string
  lastName: string
  firstName: string
  age: string
  address: string
  phone: string
  vaccination: string
  screening: string
  mammography: string
  mammographyDate: string
  gynecologyConsultation: string
  gynecoDate: string
  fcu: string
  fcuLocation: string
  hasAdditionalExams: string
  hpv: boolean
  echographyMammaire: boolean
  thermoAblation: boolean
  anapath: boolean
}

// Define the shape of modal state
interface ModalState {
  isOpen: boolean
  title: string
  message: string
  type: "success" | "error" | "warning" | "info"
  onConfirm?: () => void
}

export function ScreeningForm() {
  console.log("🔵 ScreeningForm - Composant initialisé")

  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  }

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  })
  const [formData, setFormData] = useState<FormData>({
    date: getTodayDate(),
    lastName: "",
    firstName: "",
    age: "",
    address: "",
    phone: "",
    vaccination: "",
    screening: "",
    mammography: "",
    mammographyDate: getTodayDate(),
    gynecologyConsultation: "",
    gynecoDate: getTodayDate(),
    fcu: "",
    fcuLocation: "",
    hasAdditionalExams: "",
    hpv: false,
    echographyMammaire: false,
    thermoAblation: false,
    anapath: false,
  })
  const [generatedScreeningNumber, setGeneratedScreeningNumber] = useState<string | null>(null)

  const resetForm = () => {
    setFormData({
      date: getTodayDate(),
      lastName: "",
      firstName: "",
      age: "",
      address: "",
      phone: "",
      vaccination: "",
      screening: "",
      mammography: "",
      mammographyDate: getTodayDate(),
      gynecologyConsultation: "",
      gynecoDate: getTodayDate(),
      fcu: "",
      fcuLocation: "",
      hasAdditionalExams: "",
      hpv: false,
      echographyMammaire: false,
      thermoAblation: false,
      anapath: false,
    })
    setCurrentStep(1)
    setCompletedSteps([])
    setGeneratedScreeningNumber(null)
  }

  const showModal = (
    title: string,
    message: string,
    type: "success" | "error" | "warning" | "info" = "info",
    onConfirm?: () => void
  ) => {
    setModal({ isOpen: true, title, message, type, onConfirm })
  }

  const closeModal = () => {
    setModal((prev) => ({ ...prev, isOpen: false }))
  }

  const validateStep1 = () => {
    return (
      formData.date &&
      formData.lastName &&
      formData.firstName &&
      formData.phone &&
      formData.address
    )
  }

  const validateStep2 = () => {
    return (
      formData.vaccination &&
      formData.screening &&
      formData.gynecologyConsultation &&
      formData.mammography &&
      (formData.mammography !== "oui" || formData.mammographyDate)
    )
  }

  const validateStep3 = () => {
    return true // Step 3 is optional
  }

  const validateCurrentStep = () => {
    if (currentStep === 1) return validateStep1()
    if (currentStep === 2) return validateStep2()
    if (currentStep === 3) return validateStep3()
    return false
  }

  const canSubmit = () => {
    return validateStep1() && validateStep2() && currentStep === 3
  }

  const goToNextStep = () => {
    if (currentStep < 3) {
      if (validateCurrentStep()) {
        if (!completedSteps.includes(currentStep)) {
          setCompletedSteps((prev) => [...prev, currentStep])
        }
        setCurrentStep((prev) => prev + 1)
      } else {
        showModal(
          "Champs requis manquants",
          "Veuillez remplir tous les champs requis avant de passer à l'étape suivante.",
          "warning"
        )
      }
    }
  }

  const handleVaccinationChange = (value: string) => {
    setFormData({ ...formData, vaccination: value })

    if (value === "oui") {
      if (validateStep1()) {
        console.log("🔵 FORMULAIRE - Vaccination = 'oui', enregistrement automatique...")
        const autoSubmitData = {
          ...formData,
          vaccination: "oui",
          screening: "",
          mammography: "",
          mammographyDate: "",
          gynecologyConsultation: "",
          gynecoDate: "",
          fcu: "",
          fcuLocation: "",
          hasAdditionalExams: "",
          hpv: false,
          echographyMammaire: false,
          thermoAblation: false,
          anapath: false,
        }
        console.log("🔵 FORMULAIRE - Données avec vaccination=oui et reste vide:", autoSubmitData)
        handleAutoSubmitWithData(autoSubmitData)
      } else {
        showModal(
          "Informations manquantes",
          "Veuillez d'abord compléter les informations personnelles avant de continuer.",
          "warning"
        )
      }
    }
  }

  const handleAdditionalExamsChange = (value: string) => {
    setFormData({ ...formData, hasAdditionalExams: value })

    if (value === "non") {
      if (validateStep1() && validateStep2()) {
        if (!completedSteps.includes(3)) {
          setCompletedSteps((prev) => [...prev, 3])
        }
        handleAutoSubmit()
      } else {
        showModal(
          "Informations manquantes",
          "Veuillez d'abord compléter les étapes précédentes avant de continuer.",
          "warning"
        )
      }
    }
  }

  const handleAutoSubmitWithData = async (customData: FormData) => {
    setIsSubmitting(true)
    try {
      const submitData = {
        date: customData.date,
        lastName: customData.lastName,
        firstName: customData.firstName,
        age: customData.age,
        phone: customData.phone,
        address: customData.address,
        vaccination: customData.vaccination,
        screening: customData.screening,
        mammography: customData.mammography,
        mammographyDate: customData.mammography === "oui" ? customData.mammographyDate : null,
        gynecoConsultation: customData.gynecologyConsultation,
        gynecoDate: customData.gynecologyConsultation === "oui" ? customData.gynecoDate : null,
        fcu: customData.fcu === "oui",
        fcuLocation: customData.fcu === "oui" ? customData.fcuLocation : null,
        hasAdditionalExams: customData.hasAdditionalExams,
        hpv: customData.hpv,
        mammaryUltrasound: customData.echographyMammaire,
        thermoAblation: customData.thermoAblation,
        anapath: customData.anapath,
      }

      console.log("🔵 FORMULAIRE - handleAutoSubmitWithData - Données avant envoi:", submitData)

      const response = await fetch("/api/screening", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) throw new Error("Erreur lors de l'enregistrement")

      const result = await response.json()
      resetForm()
    } catch (error) {
      showModal(
        "Erreur d'enregistrement automatique",
        "Une erreur est survenue lors de l'enregistrement automatique. Veuillez réessayer.",
        "error"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAutoSubmit = async () => {
    setIsSubmitting(true)
    try {
      const submitData = {
        date: formData.date,
        lastName: formData.lastName,
        firstName: formData.firstName,
        age: formData.age,
        phone: formData.phone,
        address: formData.address,
        vaccination: formData.vaccination,
        screening: formData.screening,
        mammography: formData.mammography,
        mammographyDate: formData.mammography === "oui" ? formData.mammographyDate : null,
        gynecoConsultation: formData.gynecologyConsultation,
        gynecoDate: formData.gynecologyConsultation === "oui" ? formData.gynecoDate : null,
        fcu: formData.fcu === "oui",
        fcuLocation: formData.fcu === "oui" ? formData.fcuLocation : null,
        hasAdditionalExams: formData.hasAdditionalExams,
        hpv: formData.hpv,
        mammaryUltrasound: formData.echographyMammaire,
        thermoAblation: formData.thermoAblation,
        anapath: formData.anapath,
      }

      console.log("🔵 FORMULAIRE - Données avant envoi:", submitData)

      const response = await fetch("/api/screening", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) throw new Error("Erreur lors de l'enregistrement")

      const result = await response.json()
      resetForm()
    } catch (error) {
      showModal(
        "Erreur d'enregistrement automatique",
        "Une erreur est survenue lors de l'enregistrement automatique. Veuillez réessayer.",
        "error"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const steps = [
    {
      id: 1,
      title: "Informations Personnelles",
      description: "Vos coordonnées et informations de base",
      icon: User,
      fields: ["date", "lastName", "firstName", "age", "phone", "address"],
    },
    {
      id: 2,
      title: "Informations Médicales",
      description: "Vaccination et consultations médicales",
      icon: Stethoscope,
      fields: ["vaccination", "screening", "gynecologyConsultation", "mammography", "mammographyDate"],
    },
    {
      id: 3,
      title: "Examens Complémentaires",
      description: "Examens supplémentaires et tests",
      icon: Microscope,
      fields: ["hasAdditionalExams", "fcu", "fcuLocation", "hpv", "echographyMammaire", "thermoAblation", "anapath"],
    },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit()) {
      showModal(
        "Formulaire incomplet",
        "Veuillez compléter toutes les étapes requises avant de soumettre le formulaire.",
        "warning"
      )
      return
    }

    setIsSubmitting(true)
    try {
      const submitData = {
        date: formData.date,
        lastName: formData.lastName,
        firstName: formData.firstName,
        age: formData.age,
        phone: formData.phone,
        address: formData.address,
        vaccination: formData.vaccination,
        screening: formData.screening,
        mammography: formData.mammography,
        mammographyDate: formData.mammography === "oui" ? formData.mammographyDate : null,
        gynecoConsultation: formData.gynecologyConsultation,
        gynecoDate: formData.gynecologyConsultation === "oui" ? formData.gynecoDate : null,
        fcu: formData.fcu === "oui",
        fcuLocation: formData.fcu === "oui" ? formData.fcuLocation : null,
        hasAdditionalExams: formData.hasAdditionalExams,
        hpv: formData.hpv,
        mammaryUltrasound: formData.echographyMammaire,
        thermoAblation: formData.thermoAblation,
        anapath: formData.anapath,
      }

      console.log("🔵 FORMULAIRE - handleSubmit - Données avant envoi:", submitData)

      const response = await fetch("/api/screening", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) throw new Error("Erreur lors de l'enregistrement")

      const result = await response.json()

      showModal(
        "Enregistrement réussi !",
        `Votre formulaire de dépistage a été enregistré avec succès. Merci pour votre participation à cette initiative importante.`,
        "success",
        () => {
          resetForm()
          setShowSuccess(false)
        }
      )
    } catch (error) {
      showModal(
        "Erreur d'enregistrement",
        "Une erreur est survenue lors de l'enregistrement de votre formulaire. Veuillez vérifier votre connexion et réessayer.",
        "error"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-6 sm:mb-8 fade-in-up">
        <div className="flex items-center justify-center space-x-2 sm:space-x-4 overflow-x-auto pb-2">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isCompleted = completedSteps.includes(step.id)
            const isCurrent = currentStep === step.id
            const isAccessible = step.id <= currentStep || completedSteps.includes(step.id - 1)

            return (
              <div key={step.id} className="flex items-center flex-shrink-0">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                      isCompleted
                        ? "gradient-primary text-primary-foreground shadow-medium scale-110"
                        : isCurrent
                        ? "bg-primary text-primary-foreground shadow-medium scale-110"
                        : isAccessible
                        ? "bg-accent text-accent-foreground hover:bg-primary hover:text-primary-foreground cursor-pointer"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                    ) : (
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                    )}
                  </div>
                  <div className="mt-1 sm:mt-2 text-center">
                    <p
                      className={`text-xs sm:text-sm font-semibold ${
                        isCurrent || isCompleted ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      <span className="hidden sm:inline">{step.title}</span>
                      <span className="sm:hidden">{step.title.split(" ")[0]}</span>
                    </p>
                    <p className="text-xs text-muted-foreground max-w-16 sm:max-w-24 hidden sm:block">
                      {step.description}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 sm:w-12 lg:w-16 h-1 mx-2 sm:mx-4 rounded-full transition-all duration-500 ${
                      completedSteps.includes(step.id) ? "gradient-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {showSuccess && (
        <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl flex items-center gap-4 shadow-medium fade-in-scale">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center pulse-glow">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-green-800 font-bold text-lg">Formulaire enregistré avec succès !</p>
            <p className="text-green-600 text-sm">Vos données ont été sauvegardées de manière sécurisée.</p>
          </div>
        </div>
      )}

      <Card className="group relative overflow-hidden border-0 shadow-strong hover:shadow-strong transition-all duration-500 fade-in-scale">
        <div className="absolute inset-0 gradient-accent opacity-5 group-hover:opacity-10 transition-opacity duration-500"></div>
        <CardHeader className="relative bg-gradient-to-r from-accent/20 to-accent/10 border-b border-primary/10 py-4"></CardHeader>
        <CardContent className="pt-6 relative">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="fade-in-scale space-y-6">
                <div className="text-center">
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                      validateStep1()
                        ? "bg-green-100 text-green-800 border border-green-200"
                        : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${validateStep1() ? "bg-green-500" : "bg-yellow-500"}`}
                    ></div>
                    {validateStep1() ? "Étape complète - Prêt pour la suite" : "Veuillez remplir tous les champs requis"}
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-accent/20 to-accent/10 rounded-2xl border border-primary/10 hover:border-primary/20 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-6 gradient-primary rounded-full"></div>
                    <h3 className="text-xl font-bold text-foreground">Coordonnées Personnelles</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                    <div className="space-y-4">
                      <Label htmlFor="date" className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full pulse-glow"></div>
                        Date *
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="h-12 border-2 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 rounded-xl"
                      />
                    </div>

                    <div className="space-y-4">
                      <Label htmlFor="firstName" className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <div className="w-2 h-2 bg-chart-2 rounded-full pulse-glow"></div>
                        Prénom(s) *
                      </Label>
                      <Input
                        id="firstName"
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="h-12 border-2 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 rounded-xl"
                      />
                    </div>

                    <div className="space-y-4">
                      <Label htmlFor="lastName" className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <div className="w-2 h-2 bg-chart-1 rounded-full pulse-glow"></div>
                        Nom *
                      </Label>
                      <Input
                        id="lastName"
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="h-12 border-2 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                    <div className="space-y-4">
                      <Label htmlFor="age" className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <div className="w-2 h-2 bg-chart-3 rounded-full pulse-glow"></div>
                        Âge (optionnel)
                      </Label>
                      <Input
                        id="age"
                        type="number"
                        placeholder="Ex: 45"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        className="h-12 border-2 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 rounded-xl"
                      />
                    </div>

                    <div className="space-y-4">
                      <Label htmlFor="phone" className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <div className="w-2 h-2 bg-chart-4 rounded-full pulse-glow"></div>
                        Téléphone *
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="h-12 border-2 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 rounded-xl"
                      />
                    </div>

                    <div className="space-y-4">
                      <Label htmlFor="address" className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <div className="w-2 h-2 bg-chart-5 rounded-full pulse-glow"></div>
                        Adresse *
                      </Label>
                      <Input
                        id="address"
                        type="text"
                        required
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="h-12 border-2 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Medical Information */}
            {currentStep === 2 && (
              <div className="fade-in-scale space-y-6">
                <div className="text-center">
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                      validateStep2()
                        ? "bg-green-100 text-green-800 border border-green-200"
                        : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${validateStep2() ? "bg-green-500" : "bg-yellow-500"}`}
                    ></div>
                    {validateStep2() ? "Étape complète - Prêt pour la suite" : "Veuillez remplir tous les champs requis"}
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-accent/20 to-accent/10 rounded-2xl border border-primary/10 hover:border-primary/20 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-6 gradient-primary rounded-full"></div>
                    <h3 className="text-xl font-bold text-foreground">Consultations et Vaccination</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                    <div className="space-y-4">
                      <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <div className="w-2 h-2 bg-chart-1 rounded-full pulse-glow"></div>
                        Vaccination *
                      </Label>
                      <RadioGroup
                        value={formData.vaccination}
                        onValueChange={handleVaccinationChange}
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg hover:from-pink-100 hover:to-rose-100 hover:border-pink-300 transition-all duration-300">
                          <RadioGroupItem
                            value="oui"
                            id="vaccination-oui"
                            className="w-5 h-5 border-2 border-pink-300 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500 data-[state=checked]:text-white"
                          />
                          <Label
                            htmlFor="vaccination-oui"
                            className="cursor-pointer text-sm font-medium flex items-center gap-2 text-pink-800"
                          >
                            Oui
                            <span className="text-xs text-green-600 font-semibold">(Enregistrement automatique)</span>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg hover:from-pink-100 hover:to-rose-100 hover:border-pink-300 transition-all duration-300">
                          <RadioGroupItem
                            value="non"
                            id="vaccination-non"
                            className="w-5 h-5 border-2 border-pink-300 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500 data-[state=checked]:text-white"
                          />
                          <Label
                            htmlFor="vaccination-non"
                            className="cursor-pointer text-sm font-medium text-pink-800"
                          >
                            Non
                          </Label>
                        </div>
                      </RadioGroup>

                      {formData.vaccination === "oui" && (
                        <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                          <div className="flex items-center gap-2 text-green-700">
                            <div className="w-2 h-2 bg-green-500 rounded-full pulse-glow"></div>
                            <span className="text-sm font-medium">
                              Le formulaire sera enregistré automatiquement si vous sélectionnez "Oui"
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <div className="w-2 h-2 bg-chart-2 rounded-full pulse-glow"></div>
                        Consultation Gynécologique *
                      </Label>
                      <RadioGroup
                        value={formData.gynecologyConsultation}
                        onValueChange={(value) => setFormData({ ...formData, gynecologyConsultation: value })}
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg hover:from-pink-100 hover:to-rose-100 hover:border-pink-300 transition-all duration-300">
                          <RadioGroupItem
                            value="oui"
                            id="gyneco-oui"
                            className="w-5 h-5 border-2 border-pink-300 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500 data-[state=checked]:text-white"
                          />
                          <Label
                            htmlFor="gyneco-oui"
                            className="cursor-pointer text-sm font-medium text-pink-800"
                          >
                            Oui
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg hover:from-pink-100 hover:to-rose-100 hover:border-pink-300 transition-all duration-300">
                          <RadioGroupItem
                            value="non"
                            id="gyneco-non"
                            className="w-5 h-5 border-2 border-pink-300 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500 data-[state=checked]:text-white"
                          />
                          <Label
                            htmlFor="gyneco-non"
                            className="cursor-pointer text-sm font-medium text-pink-800"
                          >
                            Non
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <div className="w-2 h-2 bg-chart-3 rounded-full pulse-glow"></div>
                        Dépistage *
                      </Label>
                      <RadioGroup
                        value={formData.screening}
                        onValueChange={(value) => setFormData({ ...formData, screening: value })}
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg hover:from-pink-100 hover:to-rose-100 hover:border-pink-300 transition-all duration-300">
                          <RadioGroupItem
                            value="oui"
                            id="screening-oui"
                            className="w-5 h-5 border-2 border-pink-300 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500 data-[state=checked]:text-white"
                          />
                          <Label
                            htmlFor="screening-oui"
                            className="cursor-pointer text-sm font-medium text-pink-800"
                          >
                            Oui
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg hover:from-pink-100 hover:to-rose-100 hover:border-pink-300 transition-all duration-300">
                          <RadioGroupItem
                            value="non"
                            id="screening-non"
                            className="w-5 h-5 border-2 border-pink-300 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500 data-[state=checked]:text-white"
                          />
                          <Label
                            htmlFor="screening-non"
                            className="cursor-pointer text-sm font-medium text-pink-800"
                          >
                            Non
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <div className="w-2 h-2 bg-chart-3 rounded-full pulse-glow"></div>
                        Mammographie *
                      </Label>
                      <RadioGroup
                        value={formData.mammography}
                        onValueChange={(value) => setFormData({ ...formData, mammography: value })}
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg hover:from-pink-100 hover:to-rose-100 hover:border-pink-300 transition-all duration-300">
                          <RadioGroupItem
                            value="oui"
                            id="mammography-oui"
                            className="w-5 h-5 border-2 border-pink-300 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500 data-[state=checked]:text-white"
                          />
                          <Label
                            htmlFor="mammography-oui"
                            className="cursor-pointer text-sm font-medium text-pink-800"
                          >
                            Oui
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg hover:from-pink-100 hover:to-rose-100 hover:border-pink-300 transition-all duration-300">
                          <RadioGroupItem
                            value="non"
                            id="mammography-non"
                            className="w-5 h-5 border-2 border-pink-300 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500 data-[state=checked]:text-white"
                          />
                          <Label
                            htmlFor="mammography-non"
                            className="cursor-pointer text-sm font-medium text-pink-800"
                          >
                            Non
                          </Label>
                        </div>
                      </RadioGroup>

                      {formData.mammography === "oui" && (
                        <div className="space-y-3 pl-6 border-l-2 border-primary/30 bg-primary/5 p-4 rounded-xl">
                          <Label
                            htmlFor="mammographyDate"
                            className="text-sm font-semibold text-foreground"
                          >
                            Date de Rendez-vous *
                          </Label>
                          <Input
                            id="mammographyDate"
                            type="date"
                            required
                            value={formData.mammographyDate}
                            onChange={(e) => setFormData({ ...formData, mammographyDate: e.target.value })}
                            className="h-12 border-2 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 rounded-xl max-w-xs"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Additional Exams */}
            {currentStep === 3 && (
              <div className="fade-in-scale space-y-6">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    Étape optionnelle - Vous pouvez passer à l'enregistrement
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-secondary/30 to-secondary/10 rounded-2xl border border-primary/10 hover:border-primary/20 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-6 gradient-primary rounded-full"></div>
                    <h3 className="text-xl font-bold text-foreground">Examens Complémentaires</h3>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <div className="w-2 h-2 bg-chart-1 rounded-full pulse-glow"></div>
                      Y a-t-il des examens complémentaires à effectuer ? *
                    </Label>
                    <RadioGroup
                      value={formData.hasAdditionalExams}
                      onValueChange={handleAdditionalExamsChange}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg hover:from-pink-100 hover:to-rose-100 hover:border-pink-300 transition-all duration-300">
                        <RadioGroupItem
                          value="oui"
                          id="has-exams-oui"
                          className="w-5 h-5 border-2 border-pink-300 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500 data-[state=checked]:text-white"
                        />
                        <Label
                          htmlFor="has-exams-oui"
                          className="cursor-pointer text-sm font-medium text-pink-800"
                        >
                          Oui
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg hover:from-pink-100 hover:to-rose-100 hover:border-pink-300 transition-all duration-300">
                        <RadioGroupItem
                          value="non"
                          id="has-exams-non"
                          className="w-5 h-5 border-2 border-pink-300 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500 data-[state=checked]:text-white"
                        />
                        <Label
                          htmlFor="has-exams-non"
                          className="cursor-pointer text-sm font-medium flex items-center gap-2 text-pink-800"
                        >
                          Non
                          <span className="text-xs text-green-600 font-semibold">(Enregistrement automatique)</span>
                        </Label>
                      </div>
                    </RadioGroup>

                    {formData.hasAdditionalExams === "non" && (
                      <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                        <div className="flex items-center gap-2 text-green-700">
                          <div className="w-2 h-2 bg-green-500 rounded-full pulse-glow"></div>
                          <span className="text-sm font-medium">Enregistrement automatique en cours...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {formData.hasAdditionalExams === "oui" && (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg hover:from-pink-100 hover:to-rose-100 hover:border-pink-300 transition-all duration-300">
                            <Checkbox
                              id="hpv"
                              checked={formData.hpv}
                              onCheckedChange={(checked) => setFormData({ ...formData, hpv: checked as boolean })}
                              className="w-5 h-5 border-2 border-pink-300 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500 data-[state=checked]:text-white"
                            />
                            <Label htmlFor="hpv" className="cursor-pointer text-sm font-medium text-pink-800">
                              HPV
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg hover:from-pink-100 hover:to-rose-100 hover:border-pink-300 transition-all duration-300">
                            <Checkbox
                              id="echography"
                              checked={formData.echographyMammaire}
                              onCheckedChange={(checked) =>
                                setFormData({ ...formData, echographyMammaire: checked as boolean })
                              }
                              className="w-5 h-5 border-2 border-pink-300 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500 data-[state=checked]:text-white"
                            />
                            <Label
                              htmlFor="echography"
                              className="cursor-pointer text-sm font-medium text-pink-800"
                            >
                              Échographie Mammaire
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg hover:from-pink-100 hover:to-rose-100 hover:border-pink-300 transition-all duration-300">
                            <Checkbox
                              id="thermo"
                              checked={formData.thermoAblation}
                              onCheckedChange={(checked) =>
                                setFormData({ ...formData, thermoAblation: checked as boolean })
                              }
                              className="w-5 h-5 border-2 border-pink-300 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500 data-[state=checked]:text-white"
                            />
                            <Label
                              htmlFor="thermo"
                              className="cursor-pointer text-sm font-medium text-pink-800"
                            >
                              Thermo Ablation
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg hover:from-pink-100 hover:to-rose-100 hover:border-pink-300 transition-all duration-300">
                            <Checkbox
                              id="anapath"
                              checked={formData.anapath}
                              onCheckedChange={(checked) => setFormData({ ...formData, anapath: checked as boolean })}
                              className="w-5 h-5 border-2 border-pink-300 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500 data-[state=checked]:text-white"
                            />
                            <Label
                              htmlFor="anapath"
                              className="cursor-pointer text-sm font-medium text-pink-800"
                            >
                              Anapath
                            </Label>
                          </div>
                        </div>

                        <div className="mt-6 space-y-4">
                          <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <div className="w-2 h-2 bg-chart-1 rounded-full pulse-glow"></div>
                            FCU (Frottis Cervico-Utérin)
                          </Label>
                          <RadioGroup
                            value={formData.fcu}
                            onValueChange={(value) => setFormData({ ...formData, fcu: value })}
                            className="flex gap-6"
                          >
                            <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg hover:from-pink-100 hover:to-rose-100 hover:border-pink-300 transition-all duration-300">
                              <RadioGroupItem
                                value="oui"
                                id="fcu-oui"
                                className="w-5 h-5 border-2 border-pink-300 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500 data-[state=checked]:text-white"
                              />
                              <Label
                                htmlFor="fcu-oui"
                                className="cursor-pointer text-sm font-medium text-pink-800"
                              >
                                Oui
                              </Label>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg hover:from-pink-100 hover:to-rose-100 hover:border-pink-300 transition-all duration-300">
                              <RadioGroupItem
                                value="non"
                                id="fcu-non"
                                className="w-5 h-5 border-2 border-pink-300 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500 data-[state=checked]:text-white"
                              />
                              <Label
                                htmlFor="fcu-non"
                                className="cursor-pointer text-sm font-medium text-pink-800"
                              >
                                Non
                              </Label>
                            </div>
                          </RadioGroup>

                          {formData.fcu === "oui" && (
                            <div className="mt-4 p-4 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-xl">
                              <Label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                                <div className="w-2 h-2 bg-primary rounded-full pulse-glow"></div>
                                Lieu d'examen FCU
                              </Label>
                              <RadioGroup
                                value={formData.fcuLocation}
                                onValueChange={(value) => setFormData({ ...formData, fcuLocation: value })}
                                className="flex gap-6"
                              >
                                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg hover:from-pink-100 hover:to-rose-100 hover:border-pink-300 transition-all duration-300">
                                  <RadioGroupItem
                                    value="SAR"
                                    id="fcu-sar"
                                    className="w-5 h-5 border-2 border-pink-300 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500 data-[state=checked]:text-white"
                                  />
                                  <Label
                                    htmlFor="fcu-sar"
                                    className="cursor-pointer text-sm font-medium text-pink-800"
                                  >
                                    SAR
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg hover:from-pink-100 hover:to-rose-100 hover:border-pink-300 transition-all duration-300">
                                  <RadioGroupItem
                                    value="Ailleurs"
                                    id="fcu-ailleurs"
                                    className="w-5 h-5 border-2 border-pink-300 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500 data-[state=checked]:text-white"
                                  />
                                  <Label
                                    htmlFor="fcu-ailleurs"
                                    className="cursor-pointer text-sm font-medium text-pink-800"
                                  >
                                    Ailleurs
                                  </Label>
                                </div>
                              </RadioGroup>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 pt-6 sm:pt-8">
              <Button
                type="button"
                variant="outline"
                onClick={goToPreviousStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                <ChevronLeft className="w-4 h-4" />
                Précédent
              </Button>

              <div className="flex items-center gap-4 w-full sm:w-auto">
                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={goToNextStep}
                    disabled={!validateCurrentStep()}
                    className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 transition-all duration-300 w-full sm:w-auto ${
                      validateCurrentStep()
                        ? "gradient-primary text-primary-foreground hover:scale-105"
                        : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                    }`}
                  >
                    Suivant
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <div className="flex flex-col items-center gap-4 w-full">
                    {canSubmit() && (
                      <div className="text-center p-3 sm:p-4 bg-green-50 border border-green-200 rounded-xl w-full">
                        <div className="flex items-center justify-center gap-2 text-green-700">
                          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="font-semibold text-sm sm:text-base">
                            Formulaire prêt à être enregistré !
                          </span>
                        </div>
                      </div>
                    )}
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isSubmitting || !canSubmit()}
                      className="group relative px-8 sm:px-12 lg:px-16 py-4 sm:py-5 lg:py-6 text-lg sm:text-xl font-bold gradient-primary hover:scale-105 transition-all duration-300 shadow-medium hover:shadow-strong pink-glow disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 w-full sm:w-auto"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-3">
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                            <span>Enregistrement...</span>
                          </>
                        ) : (
                          <>
                            <span>Enregistrer le Formulaire</span>
                            <div className="w-2 h-2 bg-primary-foreground rounded-full pulse-glow"></div>
                          </>
                        )}
                      </span>
                      <div className="absolute inset-0 gradient-primary opacity-0 group-hover:opacity-20 rounded-lg transition-opacity duration-300"></div>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onConfirm={modal.onConfirm}
        confirmText="Compris"
        showCancelButton={false}
      />
    </div>
  )
}