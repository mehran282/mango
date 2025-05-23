import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // پاک کردن داده‌های موجود
  await prisma.storeOffer.deleteMany()
  await prisma.product.deleteMany()
  await prisma.store.deleteMany()

  // اضافه کردن فروشگاه‌های نمونه
  const digikala = await prisma.store.create({
    data: {
      name: 'دیجی‌کالا',
      baseUrl: 'https://www.digikala.com',
    },
  })

  const technolife = await prisma.store.create({
    data: {
      name: 'تکنولایف',
      baseUrl: 'https://www.technolife.ir',
    },
  })

  const emalls = await prisma.store.create({
    data: {
      name: 'ایمالز',
      baseUrl: 'https://www.emalls.ir',
    },
  })

  // اضافه کردن محصولات نمونه
  const iphone15 = await prisma.product.create({
    data: {
      name: 'گوشی موبایل اپل iPhone 15 - ظرفیت 128 گیگابایت',
      description: 'آیفون 15 با تراشه A16 Bionic و دوربین 48 مگاپیکسلی',
      mainImage: 'https://dkstatics-public.digikala.com/digikala-products/121339203.jpg',
      category: 'گوشی موبایل',
            specs: JSON.stringify({        'حافظه داخلی': '128 گیگابایت',        'RAM': '6 گیگابایت',         'دوربین': '48 مگاپیکسل',        'باتری': '3349 میلی‌آمپر ساعت',        'سیستم عامل': 'iOS 17'      }),
    },
  })

  const samsungS24 = await prisma.product.create({
    data: {
      name: 'گوشی موبایل سامسونگ Galaxy S24 - ظرفیت 256 گیگابایت',
      description: 'گلکسی S24 با تراشه Exynos 2400 و هوش مصنوعی',
      mainImage: 'https://dkstatics-public.digikala.com/digikala-products/121516203.jpg',
      category: 'گوشی موبایل',
            specs: JSON.stringify({        'حافظه داخلی': '256 گیگابایت',        'RAM': '8 گیگابایت',        'دوربین': '50 مگاپیکسل',         'باتری': '4000 میلی‌آمپر ساعت',        'سیستم عامل': 'Android 14'      }),
    },
  })

  const macbookAir = await prisma.product.create({
    data: {
      name: 'لپ‌تاپ اپل MacBook Air M2 - 13 اینچ - ظرفیت 256 گیگابایت',
      description: 'مک‌بوک ایر با تراشه M2 و نمایشگر Liquid Retina',
      mainImage: 'https://dkstatics-public.digikala.com/digikala-products/119874203.jpg',
      category: 'لپ‌تاپ',
            specs: JSON.stringify({        'پردازنده': 'Apple M2',        'حافظه داخلی': '256 گیگابایت SSD',        'RAM': '8 گیگابایت',        'نمایشگر': '13.6 اینچ Liquid Retina',        'باتری': 'تا 18 ساعت'      }),
    },
  })

  // اضافه کردن قیمت‌ها
  await prisma.storeOffer.createMany({
    data: [
      // iPhone 15
      {
        productId: iphone15.id,
        storeId: digikala.id,
        price: 32500000,
        originalPrice: 35000000,
        storeProductUrl: 'https://www.digikala.com/product/dkp-12121212',
      },
      {
        productId: iphone15.id,
        storeId: technolife.id,
        price: 32800000,
        storeProductUrl: 'https://www.technolife.ir/product/iphone-15',
      },
      {
        productId: iphone15.id,
        storeId: emalls.id,
        price: 31900000,
        originalPrice: 34000000,
        storeProductUrl: 'https://www.emalls.ir/product/iphone-15',
      },

      // Samsung S24
      {
        productId: samsungS24.id,
        storeId: digikala.id,
        price: 28500000,
        storeProductUrl: 'https://www.digikala.com/product/dkp-13131313',
      },
      {
        productId: samsungS24.id,
        storeId: technolife.id,
        price: 29200000,
        originalPrice: 31000000,
        storeProductUrl: 'https://www.technolife.ir/product/galaxy-s24',
      },

      // MacBook Air
      {
        productId: macbookAir.id,
        storeId: digikala.id,
        price: 65000000,
        originalPrice: 68000000,
        storeProductUrl: 'https://www.digikala.com/product/dkp-14141414',
      },
      {
        productId: macbookAir.id,
        storeId: technolife.id,
        price: 64500000,
        storeProductUrl: 'https://www.technolife.ir/product/macbook-air-m2',
      },
      {
        productId: macbookAir.id,
        storeId: emalls.id,
        price: 66200000,
        storeProductUrl: 'https://www.emalls.ir/product/macbook-air-m2',
      },
    ],
  })

  console.log('✅ داده‌های نمونه با موفقیت اضافه شدند!')
  console.log(`📱 ${await prisma.product.count()} محصول`)
  console.log(`🏪 ${await prisma.store.count()} فروشگاه`)
  console.log(`💰 ${await prisma.storeOffer.count()} پیشنهاد قیمت`)
}

main()
  .catch((e) => {
    console.error('❌ خطا در اضافه کردن داده‌ها:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 