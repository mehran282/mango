'use client'

import React, { useState, useEffect } from 'react'
import { X, Plus, Trash2, Save } from 'lucide-react'
import { useToast } from './ToastProvider'

interface Store {
  id: string
  name: string
  baseUrl: string
  productUrls?: string
}

interface EditStoreModalProps {
  isOpen: boolean
  onClose: () => void
  store: Store | null
  onSave: () => void
}

const EditStoreModal: React.FC<EditStoreModalProps> = ({ isOpen, onClose, store, onSave }) => {
  const [storeName, setStoreName] = useState('')
  const [storeUrl, setStoreUrl] = useState('')
  const [productUrls, setProductUrls] = useState<string[]>([''])
  const [isLoading, setIsLoading] = useState(false)
  const { showSuccess, showError } = useToast()

  useEffect(() => {
    if (store) {
      setStoreName(store.name)
      setStoreUrl(store.baseUrl)
      
      if (store.productUrls) {
        try {
          const urls = JSON.parse(store.productUrls) as string[]
          setProductUrls(urls.length > 0 ? urls : [''])
        } catch (e) {
          setProductUrls([''])
        }
      } else {
        setProductUrls([''])
      }
    }
  }, [store])

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!store) return

    setIsLoading(true)

    try {
      // فیلتر کردن URL های خالی
      const validUrls = productUrls.filter(url => url.trim())
      
      const response = await fetch('/api/stores', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: store.id,
          name: storeName,
          baseUrl: storeUrl,
          productUrls: validUrls.length > 0 ? JSON.stringify(validUrls) : null,
        }),
      })

      if (response.ok) {
        showSuccess('فروشگاه با موفقیت بروزرسانی شد!')
        onSave()
        onClose()
      } else {
        const data = await response.json()
        showError(data.error || 'خطا در بروزرسانی فروشگاه')
      }
    } catch (error) {
      console.error('Error updating store:', error)
      showError('خطا در بروزرسانی فروشگاه')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen || !store) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-right align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <X className="h-6 w-6" />
            </button>
            <h3 className="text-xl font-bold text-gray-900">
              ویرایش فروشگاه
            </h3>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
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

            <div className="flex space-x-3 space-x-reverse pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors duration-200"
              >
                انصراف
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center justify-center space-x-2 space-x-reverse disabled:opacity-50"
              >
                {isLoading ? (
                  <span>در حال بروزرسانی...</span>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>ذخیره تغییرات</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditStoreModal 