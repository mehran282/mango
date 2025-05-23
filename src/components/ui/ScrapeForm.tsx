'use client'

import React, { useState, useEffect } from 'react'
import { Search, Loader2 } from 'lucide-react'

interface Store {
  id: string
  name: string
  baseUrl: string
}

const ScrapeForm = () => {
  const [stores, setStores] = useState<Store[]>([])
  const [selectedStore, setSelectedStore] = useState('')
  const [scrapeUrl, setScrapeUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string>('')

  useEffect(() => {
    fetchStores()
  }, [])

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
    if (!selectedStore || !scrapeUrl) return

    setIsLoading(true)
    setResult('')

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeId: selectedStore,
          url: scrapeUrl,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult(`✅ ${data.message}`)
        setScrapeUrl('')
      } else {
        setResult(`❌ ${data.error}`)
      }
    } catch (error) {
      console.error('Error scraping:', error)
      setResult('❌ خطا در اسکرپ کردن')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
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
                    <select            value={selectedStore}            onChange={(e) => setSelectedStore(e.target.value)}            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-right text-gray-700 bg-white"            required            dir="rtl"          >
            <option value="">فروشگاه را انتخاب کنید</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
            آدرس صفحه محصولات
          </label>
                    <input            type="url"            value={scrapeUrl}            onChange={(e) => setScrapeUrl(e.target.value)}            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-700 placeholder-gray-400 bg-white"            placeholder="https://example.com/products"            required            dir="ltr"          />
          <p className="text-xs text-gray-500 mt-1 text-right">
            آدرس صفحه‌ای که محصولات در آن لیست شده‌اند
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading || !selectedStore || !scrapeUrl}
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
      </form>

      {result && (
        <div className="mt-4 p-3 rounded-lg bg-gray-50 text-right">
          <p className="text-sm">{result}</p>
        </div>
      )}

      <div className="mt-6 text-sm text-gray-600 text-right">
        <h3 className="font-medium text-gray-900 mb-2">نکات مهم:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>آدرس صفحه‌ای را وارد کنید که لیست محصولات در آن نمایش داده می‌شود</li>
          <li>اسکرپ کردن ممکن است چند دقیقه طول بکشد</li>
          <li>حداکثر ۲۰ محصول در هر بار اسکرپ می‌شود</li>
          <li>محصولات تکراری به‌روزرسانی می‌شوند</li>
        </ul>
      </div>
    </div>
  )
}

export default ScrapeForm 