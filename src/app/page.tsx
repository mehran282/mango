import React from 'react'
import Header from '@/components/ui/Header'
import ProductCard from '@/components/ui/ProductCard'
import { prisma } from '@/lib/prisma'

// تابع برای دریافت محصولات با کمترین و بیشترین قیمت
const getProducts = async () => {
  try {
    const products = await prisma.product.findMany({
      include: {
        offers: {
          where: {
            isAvailable: true,
          },
          include: {
            store: true,
          },
        },
      },
    })

    // محاسبه قیمت‌ها برای هر محصول
    const productsWithPrices = products.map((product) => {
      const prices = product.offers.map((offer) => offer.price)
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0
      const storeCount = product.offers.length

      return {
        id: product.id,
        name: product.name,
        mainImage: product.mainImage,
        minPrice,
        maxPrice,
        storeCount,
      }
    })

    return productsWithPrices.filter(product => product.storeCount > 0)
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

const HomePage = async () => {
  const products = await getProducts()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* عنوان */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            مقایسه قیمت محصولات
          </h1>
          <p className="text-lg text-gray-600">
            بهترین قیمت‌ها را از فروشگاه‌های مختلف پیدا کنید
          </p>
        </div>

                {/* محصولات */}        {products.length > 0 ? (          <div className="products-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                mainImage={product.mainImage || undefined}
                minPrice={product.minPrice}
                maxPrice={product.maxPrice}
                storeCount={product.storeCount}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-24 w-24"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1"
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              هنوز محصولی وجود ندارد
            </h3>
            <p className="text-gray-500">
              ابتدا از بخش مدیریت، فروشگاه‌ها و محصولات را اضافه کنید
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

export default HomePage 