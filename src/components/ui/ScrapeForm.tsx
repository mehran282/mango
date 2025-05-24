'use client'

import React, { useState, useEffect } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { useToast } from './ToastProvider'

interface Store {
  id: string
  name: string
  baseUrl: string
  productUrls?: string
}

const ScrapeForm = () => {
  const [stores, setStores] = useState<Store[]>([])
  const [selectedStore, setSelectedStore] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [currentUrl, setCurrentUrl] = useState('')
  const [startTime, setStartTime] = useState<number | null>(null)
  const { showSuccess, showError } = useToast()

  useEffect(() => {
    fetchStores()
  }, [])

  // محاسبه زمان باقی‌مانده
  useEffect(() => {
    if (isLoading && startTime && progress > 0) {
      const elapsed = Date.now() - startTime
      const estimatedTotal = elapsed / (progress / 100)
      const remaining = Math.max(0, estimatedTotal - elapsed)
      setTimeRemaining(Math.ceil(remaining / 1000))
    }
  }, [progress, startTime, isLoading])

  const fetchStores = async () => {
    try {
      const response = await fetch('/api/stores')
      if (response.ok) {
        const data = await response.json()
        setStores(data)
      }
    } catch (error) {
      console.error('Error fetching stores:', error)
    }
  }

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStore) return

    setIsLoading(true)
    setProgress(0)
    setTimeRemaining(0)
    setCurrentUrl('')
    setStartTime(Date.now())

    // شبیه‌سازی progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev
        const increment = Math.random() * 10 + 5 // 5-15 درصد افزایش
        return Math.min(95, prev + increment)
      })
    }, 1000)

    try {
      const store = stores.find(s => s.id === selectedStore)
      if (store && store.productUrls) {
        try {
          const urls = JSON.parse(store.productUrls) as string[]
          if (urls.length > 0) {
            setCurrentUrl(urls[0]) // نمایش اولین URL
          }
        } catch (e) {
          // ignore
        }
      }

      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeId: selectedStore,
        }),
      })

      const data = await response.json()

      clearInterval(progressInterval)
      setProgress(100)

      if (response.ok) {
        showSuccess(data.message)
      } else {
        showError(data.error)
      }
    } catch (error) {
      clearInterval(progressInterval)
      setProgress(0)
      console.error('Error scraping:', error)
      showError('خطا در اسکرپ کردن')
    } finally {
      setIsLoading(false)
      setCurrentUrl('')
      setTimeout(() => {
        setProgress(0)
        setTimeRemaining(0)
        setStartTime(null)
      }, 3000) // پنهان کردن progress بعد از 3 ثانیه
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-4">
        <Search className="h-6 w-6 text-blue-600 ml-2" />
        <h2 className="text-xl font-semibold text-gray-900">
          اسکرپ محصولات
        </h2>
      </div>

      <form onSubmit={handleScrape} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
            انتخاب فروشگاه
          </label>
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-right text-gray-700 bg-white"
            required
            dir="rtl"
          >
            <option value="">فروشگاه را انتخاب کنید</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1 text-right">
            همه آدرس‌های محصولات تعریف شده برای این فروشگاه اسکرپ خواهد شد
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading || !selectedStore}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2 space-x-reverse disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>در حال اسکرپ...</span>
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              <span>شروع اسکرپ</span>
            </>
          )}
        </button>

        {/* Progress Bar */}
        {(isLoading || progress > 0) && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>پیشرفت: {Math.round(progress)}%</span>
              {timeRemaining > 0 && (
                <span>زمان باقی‌مانده: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</span>
              )}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            {currentUrl && (
              <div className="text-xs text-gray-500 truncate">
                در حال اسکرپ: {currentUrl}
              </div>
            )}
          </div>
        )}
      </form>

      <div className="mt-6 text-sm text-gray-600 text-right">
        <h3 className="font-medium text-gray-900 mb-2">نکات مهم:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>فروشگاه مورد نظر را انتخاب کنید</li>
          <li>همه آدرس‌های محصولات تعریف شده برای فروشگاه به صورت خودکار اسکرپ می‌شوند</li>
          <li>اسکرپ کردن ممکن است چند دقیقه طول بکشد</li>
          <li>حداکثر ۱۰۰ محصول در هر بار اسکرپ می‌شود</li>
          <li>سیستم تا ۱۰ صفحه اول را بررسی می‌کند و pagination را دنبال می‌کند</li>
          <li>محصولات تکراری به‌روزرسانی می‌شوند</li>
        </ul>
      </div>
    </div>
  )
}

export default ScrapeForm 