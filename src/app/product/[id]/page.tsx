import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink, ArrowLeft, Store } from 'lucide-react'
import Header from '@/components/ui/Header'
import { prisma } from '@/lib/prisma'
import { formatPrice, toPersianDate } from '@/lib/utils'

interface ProductPageProps {
  params: Promise<{
    id: string
  }>
}

const getProductDetails = async (id: string) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        offers: {
          where: {
            isAvailable: true,
          },
          include: {
            store: true,
          },
          orderBy: {
            price: 'asc',
          },
        },
      },
    })

    return product
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

const ProductPage = async ({ params }: ProductPageProps) => {
  const { id } = await params
  const product = await getProductDetails(id)

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              محصول یافت نشد
            </h1>
            <Link
              href="/"
              className="text-primary-600 hover:text-primary-700 flex items-center justify-center space-x-2 space-x-reverse"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>بازگشت به صفحه اصلی</span>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const minPrice = product.offers.length > 0 ? Math.min(...product.offers.map(o => o.price)) : 0
  const maxPrice = product.offers.length > 0 ? Math.max(...product.offers.map(o => o.price)) : 0
  const savings = maxPrice - minPrice

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* بازگشت */}
        <div className="mb-6">
          <Link
            href="/"
            className="text-primary-600 hover:text-primary-700 flex items-center space-x-2 space-x-reverse"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>بازگشت به صفحه اصلی</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* تصویر و اطلاعات اصلی */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-64 bg-gray-100">
                {product.mainImage ? (
                  <Image
                    src={product.mainImage}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <span>بدون تصویر</span>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <h1 className="text-xl font-bold text-gray-900 mb-4 text-right">
                  {product.name}
                </h1>
                
                {product.description && (
                  <p className="text-gray-600 text-right mb-4">
                    {product.description}
                  </p>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">کمترین قیمت:</span>
                    <span className="text-lg font-bold text-green-600">
                      {formatPrice(minPrice)}
                    </span>
                  </div>
                  
                  {savings > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">صرفه‌جویی:</span>
                      <span className="text-sm font-medium text-red-500">
                        {formatPrice(savings)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">تعداد فروشگاه:</span>
                    <span className="text-sm font-medium">
                      {product.offers.length} فروشگاه
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* مشخصات فنی */}
            {product.specs && (() => {
              try {
                const parsedSpecs = JSON.parse(product.specs as string) as Record<string, string | number>
                return (
                  <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 text-right">
                      مشخصات فنی
                    </h2>
                    <div className="space-y-2">
                      {Object.entries(parsedSpecs).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                          <span className="text-sm text-gray-500">{key}:</span>
                          <span className="text-sm font-medium text-gray-900">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              } catch (e) {
                return null
              }
            })()}
          </div>

          {/* لیست فروشگاه‌ها */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 text-right">
                  مقایسه قیمت در فروشگاه‌ها
                </h2>
                <p className="text-gray-600 text-right mt-2">
                  قیمت‌ها به ترتیب کم به زیاد مرتب شده‌اند
                </p>
              </div>

              <div className="divide-y divide-gray-200">
                {product.offers.map((offer, index) => (
                  <div key={offer.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                          index === 0 ? 'bg-green-500' : 'bg-gray-400'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Store className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {offer.store.name}
                            </span>
                            {index === 0 && (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                بهترین قیمت
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            آخرین بررسی: {toPersianDate(new Date(offer.lastChecked))}
                          </p>
                        </div>
                      </div>

                      <div className="text-left">
                        <div className="text-lg font-bold text-gray-900">
                          {formatPrice(offer.price)}
                        </div>
                        {offer.originalPrice && offer.originalPrice > offer.price && (
                          <div className="text-sm text-gray-500 line-through">
                            {formatPrice(offer.originalPrice)}
                          </div>
                        )}
                        {index > 0 && (
                          <div className="text-sm text-red-500">
                            +{formatPrice(offer.price - minPrice)} گران‌تر
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <a
                        href={offer.storeProductUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center justify-center space-x-2 space-x-reverse"
                      >
                        <span>خرید از {offer.store.name}</span>
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {product.offers.length === 0 && (
                <div className="p-6 text-center">
                  <p className="text-gray-500">
                    هنوز قیمتی برای این محصول ثبت نشده است
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ProductPage 