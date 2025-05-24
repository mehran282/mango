'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import Toast from './Toast'

interface ToastMessage {
  id: string
  message: string
  type: 'success' | 'error' | 'warning'
}

interface ToastContextType {
  showToast: (message: string, type: 'success' | 'error' | 'warning') => void
  showSuccess: (message: string) => void
  showError: (message: string) => void
  showWarning: (message: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: ReactNode
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const showToast = (message: string, type: 'success' | 'error' | 'warning') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type }])
  }

  const showSuccess = (message: string) => showToast(message, 'success')
  const showError = (message: string) => showToast(message, 'error')
  const showWarning = (message: string) => showToast(message, 'warning')

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showWarning }}>
      {children}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          show={true}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  )
} 