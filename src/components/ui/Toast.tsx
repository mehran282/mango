'use client'

import React, { useEffect, useState } from 'react'
import { CheckCircle, AlertCircle, XCircle, X } from 'lucide-react'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'warning'
  show: boolean
  onClose: () => void
  duration?: number
}

const Toast: React.FC<ToastProps> = ({ message, type, show, onClose, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onClose, 300) // انتظار برای اتمام انیمیشن
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [show, duration, onClose])

  if (!show && !isVisible) return null

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-600" />
      case 'error':
        return <XCircle className="h-6 w-6 text-red-600" />
      case 'warning':
        return <AlertCircle className="h-6 w-6 text-yellow-600" />
    }
  }

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`
          ${getStyles()}
          ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
          transform transition-all duration-300 ease-in-out
          max-w-md w-full border rounded-lg shadow-lg p-4
        `}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0 ml-3">
            {getIcon()}
          </div>
          <div className="flex-1 text-right">
            <p className="text-sm font-medium leading-5">
              {message}
            </p>
          </div>
          <div className="flex-shrink-0 mr-3">
            <button
              onClick={() => {
                setIsVisible(false)
                setTimeout(onClose, 300)
              }}
              className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Toast 