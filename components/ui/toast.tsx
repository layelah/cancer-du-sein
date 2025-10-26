"use client"

import { useEffect, useState } from "react"
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from "lucide-react"

export interface ToastMessage {
  id: string
  message: string
  type: "success" | "error" | "warning" | "info"
}

interface ToastProps {
  message: ToastMessage
  onClose: () => void
}

function Toast({ message, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Wait for animation to complete
    }, 5000) // Auto-close after 5 seconds

    return () => clearTimeout(timer)
  }, [onClose])

  const getConfig = () => {
    switch (message.type) {
      case "success":
        return {
          icon: CheckCircle,
          bgClass: "bg-green-500",
          borderClass: "border-green-600",
          textClass: "text-green-50"
        }
      case "error":
        return {
          icon: AlertCircle,
          bgClass: "bg-red-500",
          borderClass: "border-red-600",
          textClass: "text-red-50"
        }
      case "warning":
        return {
          icon: AlertTriangle,
          bgClass: "bg-yellow-500",
          borderClass: "border-yellow-600",
          textClass: "text-yellow-50"
        }
      case "info":
        return {
          icon: Info,
          bgClass: "bg-blue-500",
          borderClass: "border-blue-600",
          textClass: "text-blue-50"
        }
    }
  }

  const config = getConfig()
  const Icon = config.icon

  return (
    <div
      className={`transform transition-all duration-300 ease-in-out ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div
        className={`${config.bgClass} ${config.textClass} border-l-4 ${config.borderClass} rounded-lg shadow-lg p-4 min-w-[300px] max-w-md`}
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium flex-1">{message.message}</p>
          <button
            onClick={() => {
              setIsVisible(false)
              setTimeout(onClose, 300)
            }}
            className={`${config.textClass} hover:opacity-70 transition-opacity`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function ToastContainer({ toasts, onRemoveToast }: { toasts: ToastMessage[], onRemoveToast: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast message={toast} onClose={() => onRemoveToast(toast.id)} />
        </div>
      ))}
    </div>
  )
}

