'use client'

import React, { useState } from 'react'
import Header from '@/components/ui/Header'
import ScrapeForm from '@/components/ui/ScrapeForm'
import { Plus, Store, Package } from 'lucide-react'

const AdminPage = () => {
  const [storeName, setStoreName] = useState('')
  const [storeUrl, setStoreUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleAddStore = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: storeName,
          baseUrl: storeUrl,
        }),
      })

      if (response.ok) {
        setStoreName('')
        setStoreUrl('')
        alert('فروشگاه با موفقیت اضافه شد!')
      } else {
        alert('خطا در افزودن فروشگاه')
      }
    } catch (error) {
      console.error('Error adding store:', error)
      alert('خطا در افزودن فروشگاه')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            پنل مدیریت
          </h1>
          <p className="text-lg text-gray-600">
            مدیریت فروشگاه‌ها و محصولات
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* افزودن فروشگاه */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <Store className="h-6 w-6 text-primary-600 ml-2" />
              <h2 className="text-xl font-semibold text-gray-900">
                افزودن فروشگاه جدید
              </h2>
            </div>

            <form onSubmit={handleAddStore} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                  نام فروشگاه
                </label>
                                <input                  type="text"                  value={storeName}                  onChange={(e) => setStoreName(e.target.value)}                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-right text-gray-700 placeholder-gray-400 bg-white"                  placeholder="مثال: دیجی‌کالا"                  required                  dir="rtl"                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                  آدرس وب‌سایت
                </label>
                                <input                  type="url"                  value={storeUrl}                  onChange={(e) => setStoreUrl(e.target.value)}                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-700 placeholder-gray-400 bg-white"                  placeholder="https://www.example.com"                  required                  dir="ltr"                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center justify-center space-x-2 space-x-reverse disabled:opacity-50"
              >
                {isLoading ? (
                  <span>در حال افزودن...</span>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>افزودن فروشگاه</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* راهنمای استفاده */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <Package className="h-6 w-6 text-green-600 ml-2" />
              <h2 className="text-xl font-semibold text-gray-900">
                راهنمای استفاده
              </h2>
            </div>

            <div className="space-y-4 text-sm text-gray-600 text-right">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">مراحل کار:</h3>
                <ol className="list-decimal list-inside space-y-1">
                  <li>ابتدا فروشگاه‌های مورد نظر را اضافه کنید</li>
                  <li>از فرم اسکرپ برای استخراج محصولات استفاده کنید</li>
                  <li>محصولات در صفحه اصلی نمایش داده می‌شوند</li>
                </ol>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">ویژگی‌ها:</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>اسکرپ خودکار محصولات از وب‌سایت‌ها</li>
                  <li>مقایسه قیمت‌ها از فروشگاه‌های مختلف</li>
                  <li>نمایش بهترین قیمت‌ها</li>
                  <li>لینک مستقیم به فروشگاه اصلی</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* فرم اسکرپ */}
        <div className="mb-8">
          <ScrapeForm />
        </div>
      </main>
    </div>
  )
}

export default AdminPage 