'use client'

import React, { useState, useEffect } from 'react'
import Header from '@/components/ui/Header'
import ScrapeForm from '@/components/ui/ScrapeForm'
import StoresList from '@/components/ui/StoresList'
import HelpModal from '@/components/ui/HelpModal'
import { Plus, Store, AlertTriangle, HelpCircle, Package, Trash2, Settings } from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'
import TestSpecsForm from '@/components/ui/TestSpecsForm'

interface Store {
  id: string
  name: string
  baseUrl: string
  productUrls?: string
  _count?: {
    offers: number
  }
}

const AdminPage = () => {
  const [storeName, setStoreName] = useState('')
  const [storeUrl, setStoreUrl] = useState('')
  const [productUrls, setProductUrls] = useState<string[]>([''])
  const [isLoading, setIsLoading] = useState(false)
  const [stores, setStores] = useState<Store[]>([])
  const [deleteLoading, setDeleteLoading] = useState('')
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)
  const { showSuccess, showError } = useToast()

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

  const addProductUrl = () => {
    setProductUrls([...productUrls, ''])
  }

  const removeProductUrl = (index: number) => {
    if (productUrls.length > 1) {
      setProductUrls(productUrls.filter((_, i) => i !== index))
    }
  }

  const updateProductUrl = (index: number, value: string) => {
    const updated = [...productUrls]
    updated[index] = value
    setProductUrls(updated)
  }

  const handleAddStore = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // فیلتر کردن URL های خالی
      const validUrls = productUrls.filter(url => url.trim())
      
      const response = await fetch('/api/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: storeName,
          baseUrl: storeUrl,
          productUrls: validUrls.length > 0 ? JSON.stringify(validUrls) : null,
        }),
      })

      if (response.ok) {
        setStoreName('')
        setStoreUrl('')
        setProductUrls([''])
        showSuccess('فروشگاه با موفقیت اضافه شد!')
        fetchStores() // بروزرسانی لیست فروشگاه‌ها
      } else {
        showError('خطا در افزودن فروشگاه')
      }
    } catch (error) {
      console.error('Error adding store:', error)
      showError('خطا در افزودن فروشگاه')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteStoreProducts = async (storeId: string, storeName: string) => {
    if (!confirm(`آیا از حذف همه محصولات فروشگاه "${storeName}" اطمینان دارید؟`)) {
      return
    }

    setDeleteLoading(storeId)
    try {
      const response = await fetch('/api/stores', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete-store-products',
          storeId,
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        showSuccess(data.message)
        fetchStores() // بروزرسانی تعداد محصولات
      } else {
        showError(data.error || 'خطا در حذف محصولات')
      }
    } catch (error) {
      console.error('Error deleting store products:', error)
      showError('خطا در حذف محصولات')
    } finally {
      setDeleteLoading('')
    }
  }

  const handleDeleteAllProducts = async () => {
    if (!confirm('⚠️ هشدار: این عمل همه محصولات و پیشنهادات را حذف خواهد کرد. آیا اطمینان دارید؟')) {
      return
    }

    if (!confirm('آیا واقعاً از حذف کامل همه اطلاعات اطمینان دارید؟ این عمل غیرقابل بازگشت است!')) {
      return
    }

    setDeleteLoading('all')
    try {
      const response = await fetch('/api/stores', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete-all-products',
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        showSuccess(data.message)
        fetchStores() // بروزرسانی تعداد محصولات
      } else {
        showError(data.error || 'خطا در حذف محصولات')
      }
    } catch (error) {
      console.error('Error deleting all products:', error)
      showError('خطا در حذف محصولات')
    } finally {
      setDeleteLoading('')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setIsHelpModalOpen(true)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="راهنمای استفاده"
              >
                <HelpCircle className="h-5 w-5" />
              </button>
              <div className="flex items-center">
                <Store className="h-6 w-6 text-primary-600 ml-2" />
                <h2 className="text-xl font-semibold text-gray-900">
                  افزودن فروشگاه جدید
                </h2>
              </div>
            </div>

            <form onSubmit={handleAddStore} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                  نام فروشگاه
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-right text-gray-700 placeholder-gray-400 bg-white"
                  placeholder="مثال: دیجی‌کالا"
                  required
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                  آدرس وب‌سایت
                </label>
                <input
                  type="url"
                  value={storeUrl}
                  onChange={(e) => setStoreUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-700 placeholder-gray-400 bg-white"
                  placeholder="https://www.example.com"
                  required
                  dir="ltr"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 text-right">
                    آدرس صفحات محصولات
                  </label>
                  <button
                    type="button"
                    onClick={addProductUrl}
                    className="text-primary-600 hover:text-primary-700 text-sm flex items-center space-x-1 space-x-reverse"
                  >
                    <Plus className="h-4 w-4" />
                    <span>افزودن</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {productUrls.map((url, index) => (
                    <div key={index} className="flex items-center space-x-2 space-x-reverse">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => updateProductUrl(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-700 placeholder-gray-400 bg-white"
                        placeholder="https://example.com/products"
                        dir="ltr"
                      />
                      {productUrls.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeProductUrl(index)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1 text-right">
                  آدرس صفحاتی که محصولات در آن لیست شده‌اند (می‌توانید چند آدرس اضافه کنید)
                </p>
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

          {/* فرم اسکرپ */}
          <div className="bg-white rounded-lg shadow-md">
            <ScrapeForm />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* لیست فروشگاه‌ها */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <Store className="h-6 w-6 text-blue-600 ml-2" />
              <h2 className="text-xl font-semibold text-gray-900">
                فروشگاه‌های موجود
              </h2>
            </div>
            <StoresList stores={stores} onStoreUpdated={fetchStores} />
          </div>

          {/* بخش حذف محصولات */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600 ml-2" />
              <h2 className="text-xl font-semibold text-gray-900">
                حذف محصولات
              </h2>
            </div>

            <div className="space-y-4">
              {/* حذف محصولات یک فروشگاه */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2 text-right">حذف محصولات فروشگاه خاص:</h3>
                {stores.filter(store => store._count && store._count.offers > 0).length > 0 ? (
                  <div className="space-y-2">
                    {stores
                      .filter(store => store._count && store._count.offers > 0)
                      .map((store) => (
                      <div key={store.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <span className="text-gray-700">{store.name}</span>
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {store._count?.offers || 0} محصول
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteStoreProducts(store.id, store.name)}
                          disabled={deleteLoading === store.id}
                          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors duration-200 flex items-center space-x-1 space-x-reverse disabled:opacity-50"
                        >
                          {deleteLoading === store.id ? (
                            <>
                              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                              <span>در حال حذف...</span>
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4" />
                              <span>حذف محصولات</span>
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>هیچ فروشگاهی محصول ندارد</p>
                    <p className="text-sm">ابتدا محصولاتی را اسکرپ کنید</p>
                  </div>
                )}
              </div>

              {/* حذف همه محصولات */}
              <div className="border-t pt-4">
                <h3 className="font-medium text-red-700 mb-2 text-right">حذف همه محصولات:</h3>
                <button
                  onClick={handleDeleteAllProducts}
                  disabled={deleteLoading === 'all'}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center justify-center space-x-2 space-x-reverse disabled:opacity-50"
                >
                  {deleteLoading === 'all' ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>در حال حذف...</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4" />
                      <span>حذف همه محصولات</span>
                    </>
                  )}
                </button>
                <p className="text-xs text-red-500 mt-1 text-right">
                  ⚠️ این عمل همه محصولات و پیشنهادات را حذف می‌کند و غیرقابل بازگشت است
                </p>
              </div>
            </div>
          </div>

          {/* Test Specs Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 text-right flex items-center">
              <span className="bg-purple-100 text-purple-800 p-2 rounded-lg ml-2">
                <Settings className="h-5 w-5" />
              </span>
              تست استخراج مشخصات
            </h2>
            
            <TestSpecsForm />
          </div>
        </div>
      </main>

      {/* Help Modal */}
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  )
}

export default AdminPage 