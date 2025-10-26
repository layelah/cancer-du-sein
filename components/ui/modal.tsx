"use client"

import React from "react"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { Button } from "./button"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message?: string
  type?: "success" | "error" | "warning" | "info"
  showCloseButton?: boolean
  onConfirm?: () => void
  confirmText?: string
  cancelText?: string
  showCancelButton?: boolean
  children?: React.ReactNode
}

export function Modal({
  isOpen,
  onClose,
  title,
  message,
  type = "info",
  showCloseButton = true,
  onConfirm,
  confirmText = "OK",
  cancelText = "Annuler",
  showCancelButton = false,
  children
}: ModalProps) {
  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-8 h-8 text-green-500" />
      case "error":
        return <AlertCircle className="w-8 h-8 text-red-500" />
      case "warning":
        return <AlertTriangle className="w-8 h-8 text-yellow-500" />
      case "info":
      default:
        return <Info className="w-8 h-8 text-blue-500" />
    }
  }

  const getColorClasses = () => {
    switch (type) {
      case "success":
        return "border-green-200 bg-green-50"
      case "error":
        return "border-red-200 bg-red-50"
      case "warning":
        return "border-yellow-200 bg-yellow-50"
      case "info":
      default:
        return "border-blue-200 bg-blue-50"
    }
  }

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-6xl mx-auto">
        <div className={`relative bg-white rounded-lg sm:rounded-2xl shadow-strong border-2 ${getColorClasses()} animate-in fade-in-scale duration-300 max-h-[95vh] overflow-hidden flex flex-col`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              {getIcon()}
              <h3 className="text-base sm:text-lg font-bold text-gray-900">{title}</h3>
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              </button>
            )}
          </div>

          {/* Content */}
          <div className={children ? "" : "p-4 sm:p-6 flex-1 overflow-hidden"}>
            {children ? (
              <>
                <div className="px-4 sm:px-6 pt-4 sm:pt-6 overflow-y-auto max-h-[calc(95vh-180px)]">
                  {children}
                </div>
                {/* Actions */}
                <div className="flex gap-2 sm:gap-3 justify-end px-4 sm:px-6 pb-4 sm:pb-6 pt-3 sm:pt-4 border-t border-gray-200 flex-shrink-0 flex-wrap">
                  {showCancelButton && (
                    <Button
                      variant="outline"
                      onClick={onClose}
                      className="px-4 py-2 sm:px-6 text-sm sm:text-base"
                    >
                      {cancelText}
                    </Button>
                  )}
                  <Button
                    onClick={handleConfirm}
                    className={`px-4 py-2 sm:px-6 text-sm sm:text-base ${
                      type === "success" 
                        ? "gradient-primary text-primary-foreground hover:scale-105" 
                        : type === "error"
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : type === "warning"
                        ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                        : "gradient-primary text-primary-foreground hover:scale-105"
                    }`}
                  >
                    {confirmText}
                  </Button>
                </div>
              </>
            ) : (
              <>
                {message && <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4 sm:mb-6">{message}</p>}
                {/* Actions */}
                <div className="flex gap-2 sm:gap-3 justify-end flex-wrap">
                  {showCancelButton && (
                    <Button
                      variant="outline"
                      onClick={onClose}
                      className="px-4 py-2 sm:px-6 text-sm sm:text-base"
                    >
                      {cancelText}
                    </Button>
                  )}
                  <Button
                    onClick={handleConfirm}
                    className={`px-4 py-2 sm:px-6 text-sm sm:text-base ${
                      type === "success" 
                        ? "gradient-primary text-primary-foreground hover:scale-105" 
                        : type === "error"
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : type === "warning"
                        ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                        : "gradient-primary text-primary-foreground hover:scale-105"
                    }`}
                  >
                    {confirmText}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
