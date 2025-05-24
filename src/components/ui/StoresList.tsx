'use client'

import React, { useState } from 'react'
import { Edit2, Globe, Link } from 'lucide-react'
import EditStoreModal from './EditStoreModal'

interface Store {
  id: string
  name: string
  baseUrl: string
  productUrls?: string
  _count?: {
    offers: number
  }
}

interface StoresListProps {
  stores: Store[]
  onStoreUpdated: () => void
}

const StoresList: React.FC<StoresListProps> = ({ stores, onStoreUpdated }) => {
  const [editingStore, setEditingStore] = useState<Store | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const handleEditClick = (store: Store) => {
    setEditingStore(store)
    setIsEditModalOpen(true)
  }

  const handleEditModalClose = () => {
    setIsEditModalOpen(false)
    setEditingStore(null)
  }

  const getProductUrlsCount = (productUrls?: string) => {
    if (!productUrls) return 0
    try {
      const urls = JSON.parse(productUrls) as string[]
      return urls.length
    } catch (e) {
      return 0
    }
  }

  if (stores.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Globe className="h-12 w-12 mx-auto mb-2 text-gray-300" />
        <p>هنوز فروشگاهی اضافه نشده است</p>
        <p className="text-sm">اولین فروشگاه خود را اضافه کنید</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {stores.map((store) => (
          <div key={store.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 text-right">{store.name}</h3>
                <p className="text-sm text-gray-500 text-left" dir="ltr">{store.baseUrl}</p>
                <div className="flex items-center space-x-4 space-x-reverse mt-2 text-xs text-gray-600">
                  <span className="flex items-center space-x-1 space-x-reverse">
                    <Link className="h-3 w-3" />
                    <span>{getProductUrlsCount(store.productUrls)} صفحه محصولات</span>
                  </span>
                  {store._count && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {store._count.offers} محصول
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleEditClick(store)}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="ویرایش فروشگاه"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <EditStoreModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        store={editingStore}
        onSave={onStoreUpdated}
      />
    </>
  )
}

export default StoresList 