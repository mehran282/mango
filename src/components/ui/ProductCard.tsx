'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink, Package, Loader2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface ProductCardProps {
  id: string
  name: string
  mainImage?: string
  minPrice: number
  maxPrice: number
  storeCount: number
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  mainImage,
  minPrice,
  maxPrice,
  storeCount,
}) => {
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const savings = maxPrice - minPrice

  const handleImageLoad = () => {
    setImageLoading(false)
  }

  const handleImageError = () => {
    setImageLoading(false)
    setImageError(true)
  }

  return (
    <div className="product-card bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-primary-200">
      {/* تصویر محصول */}
      <div className="product-image-container relative w-full bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        <div className="aspect-square relative">
          {mainImage && !imageError ? (
            <>
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              )}
              <Image
                src={mainImage}
                alt={name}
                fill
                className={`object-contain p-4 hover:scale-105 transition-transform duration-300 ${
                  imageLoading ? 'opacity-0' : 'opacity-100'
                }`}
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                quality={85}
                priority={false}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200">
              <Package className="h-16 w-16 mb-3 text-gray-300" />
              <span className="text-sm font-medium text-gray-500">بدون تصویر</span>
            </div>
          )}
        </div>
        
        {/* Badge برای صرفه‌جویی */}
        {savings > 0 && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-lg">
            صرفه‌جویی {formatPrice(savings)}
          </div>
        )}
      </div>

      {/* اطلاعات محصول */}
      <div className="p-5">
        <h3 className="text-base font-semibold text-gray-900 mb-4 line-clamp-2 text-right leading-6 min-h-[3rem]">
          {name}
        </h3>

        {/* قیمت‌ها */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">کمترین قیمت:</span>
            <span className="text-xl font-bold text-green-600">
              {formatPrice(minPrice)}
            </span>
          </div>
          
          {maxPrice > minPrice && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">بیشترین قیمت:</span>
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(maxPrice)}
              </span>
            </div>
          )}
        </div>

        {/* تعداد فروشگاه */}
        <div className="flex items-center justify-center mb-5 bg-gradient-to-r from-blue-50 to-indigo-50 py-2.5 px-4 rounded-lg border border-blue-100">
          <span className="text-sm text-blue-700 font-medium">
            موجود در {storeCount} فروشگاه
          </span>
        </div>

        {/* دکمه مشاهده */}
        <Link
          href={`/product/${id}`}
          className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-4 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 flex items-center justify-center space-x-2 space-x-reverse font-medium shadow-lg hover:shadow-xl"
        >
          <span>مشاهده و مقایسه</span>
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}

export default ProductCard 