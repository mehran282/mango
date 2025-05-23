import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import axios from 'axios'
import * as cheerio from 'cheerio'

interface ScrapedProduct {
  name: string
  price: number
  originalPrice?: number
  image?: string
  url: string
  specs?: Record<string, string>
}

// تابع اسکرپ بهبود یافته برای سایت‌های فارسی
const scrapeWithCheerio = async (url: string): Promise<ScrapedProduct[]> => {
  try {
    console.log('Starting scrape for URL:', url)
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'fa-IR,fa;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 15000,
      maxRedirects: 3
    })

    const $ = cheerio.load(response.data)
    const products: ScrapedProduct[] = []

    console.log('HTML loaded, searching for products...')

    // الگوهای مخصوص تکنولایف و سایت‌های مشابه
    const productSelectors = [
      // تکنولایف
      '[data-product-id]',
      '.product-box',
      '.product-item-container',
      '.product-list-item',
      '.product-card-container',
      // دیجی‌کالا
      '[data-testid="product-card"]',
      '.product-list_ProductList__item__LiiNI',
      // عمومی
      '.product-item',
      '.product-card',
      '.product',
      '.item-product',
      '.product-container',
      '.listing-item',
      '[class*="product"]',
      '[class*="item"]'
    ]

    let foundProducts = 0

    for (const selector of productSelectors) {
      console.log(`Trying selector: ${selector}`)
      const elements = $(selector)
      console.log(`Found ${elements.length} elements with selector: ${selector}`)

      elements.each((_, element) => {
        const $el = $(element)
        
        // استخراج نام محصول با الگوهای مختلف
        const nameSelectors = [
          'h1', 'h2', 'h3', 'h4',
          '.product-title',
          '.product-name', 
          '.title',
          '.name',
          '[class*="title"]',
          '[class*="name"]',
          'a[title]',
          '.product-card-name',
          '.item-title'
        ]
        
        let name = ''
        for (const nameSelector of nameSelectors) {
          const nameEl = $el.find(nameSelector).first()
          if (nameEl.length) {
            name = nameEl.text().trim() || nameEl.attr('title')?.trim() || ''
            if (name && name.length > 10) break // نام معقول
          }
        }

        // اگر نام در لینک است
        if (!name) {
          const linkTitle = $el.find('a').first().attr('title')
          if (linkTitle) name = linkTitle.trim()
        }

        // استخراج قیمت با الگوهای مختلف
        const priceSelectors = [
          '.price',
          '.cost', 
          '.amount',
          '[data-price]',
          '.price-current',
          '.current-price',
          '.final-price',
          '[class*="price"]',
          '.product-price',
          '.item-price',
          'span[class*="price"]',
          'div[class*="price"]'
        ]
        
        let priceText = ''
        for (const priceSelector of priceSelectors) {
          const priceEl = $el.find(priceSelector).first()
          if (priceEl.length) {
            priceText = priceEl.text().trim()
            if (priceText && /\d/.test(priceText)) break
          }
        }

        // تبدیل قیمت فارسی به انگلیسی و استخراج عدد
        const persianNumbers = '۰۱۲۳۴۵۶۷۸۹'
        const englishNumbers = '0123456789'
        let cleanPriceText = priceText
        
        for (let i = 0; i < persianNumbers.length; i++) {
          cleanPriceText = cleanPriceText.replace(new RegExp(persianNumbers[i], 'g'), englishNumbers[i])
        }
        
        // حذف کاما، تومان، ریال و سایر کاراکترهای غیرضروری
        const priceMatch = cleanPriceText.replace(/[^\d]/g, '')
        const price = parseInt(priceMatch) || 0

        // استخراج تصویر
        const imgSelectors = ['img', '.image img', '.product-image img', '.item-image img']
        let image = ''
        for (const imgSelector of imgSelectors) {
          const imgEl = $el.find(imgSelector).first()
          if (imgEl.length) {
            const imgSrc = imgEl.attr('src') || imgEl.attr('data-src') || imgEl.attr('data-lazy')
            if (imgSrc) {
              image = imgSrc.startsWith('http') ? imgSrc : new URL(imgSrc, url).href
              break
            }
          }
        }

        // استخراج لینک محصول
        const linkSelectors = ['a', '.product-link', '.item-link']
        let productUrl = url
        for (const linkSelector of linkSelectors) {
          const linkEl = $el.find(linkSelector).first()
          if (linkEl.length) {
            const href = linkEl.attr('href')
            if (href) {
              productUrl = href.startsWith('http') ? href : new URL(href, url).href
              break
            }
          }
        }

        console.log(`Product found: name="${name}", price="${priceText}" -> ${price}`)

        if (name && name.length > 5 && price && price > 1000) {
          products.push({
            name: name.slice(0, 200), // محدود کردن طول نام
            price,
            image,
            url: productUrl,
          })
          foundProducts++
        }
      })

      if (foundProducts > 0) {
        console.log(`Found ${foundProducts} products with selector: ${selector}`)
        break
      }
    }

    console.log(`Total products found: ${products.length}`)
    return products.slice(0, 20) // محدود کردن به ۲۰ محصول
    
  } catch (error) {
    console.error('Error scraping with Cheerio:', error)
    throw new Error(`خطا در اسکرپ: ${error instanceof Error ? error.message : 'خطای نامشخص'}`)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { storeId, url } = body

    console.log('Scrape request:', { storeId, url })

    if (!storeId || !url) {
      return NextResponse.json(
        { error: 'شناسه فروشگاه و آدرس URL الزامی است' },
        { status: 400 }
      )
    }

    // بررسی وجود فروشگاه
    const store = await prisma.store.findUnique({
      where: { id: storeId }
    })

    if (!store) {
      return NextResponse.json(
        { error: 'فروشگاه یافت نشد' },
        { status: 404 }
      )
    }

    // اسکرپ محصولات
    const scrapedProducts = await scrapeWithCheerio(url)

    if (scrapedProducts.length === 0) {
      return NextResponse.json(
        { error: 'هیچ محصولی یافت نشد. لطفاً آدرس صفحه محصولات را بررسی کنید.' },
        { status: 404 }
      )
    }

    const savedProducts = []

    for (const scrapedProduct of scrapedProducts) {
      try {
        // جستجو یا ایجاد محصول
        let product = await prisma.product.findFirst({
          where: {
            name: {
              contains: scrapedProduct.name.substring(0, 50)
            }
          }
        })

        if (!product) {
          product = await prisma.product.create({
            data: {
              name: scrapedProduct.name,
              mainImage: scrapedProduct.image,
              specs: scrapedProduct.specs ? JSON.stringify(scrapedProduct.specs) : undefined,
            }
          })
        }

        // ایجاد یا به‌روزرسانی پیشنهاد فروشگاه
        const existingOffer = await prisma.storeOffer.findUnique({
          where: {
            productId_storeId: {
              productId: product.id,
              storeId: store.id
            }
          }
        })

        if (existingOffer) {
          await prisma.storeOffer.update({
            where: { id: existingOffer.id },
            data: {
              price: scrapedProduct.price,
              originalPrice: scrapedProduct.originalPrice,
              storeProductUrl: scrapedProduct.url,
              lastChecked: new Date(),
            }
          })
        } else {
          await prisma.storeOffer.create({
            data: {
              productId: product.id,
              storeId: store.id,
              price: scrapedProduct.price,
              originalPrice: scrapedProduct.originalPrice,
              storeProductUrl: scrapedProduct.url,
            }
          })
        }

        savedProducts.push({
          product: product.name,
          price: scrapedProduct.price,
          store: store.name
        })
      } catch (error) {
        console.error('Error saving product:', scrapedProduct.name, error)
      }
    }

    return NextResponse.json({
      message: `✅ ${savedProducts.length} محصول با موفقیت ذخیره شد از ${scrapedProducts.length} محصول یافت شده`,
      products: savedProducts.slice(0, 5) // نمایش ۵ محصول اول
    })

  } catch (error) {
    console.error('Error in scrape API:', error)
    return NextResponse.json(
      { error: `خطا در اسکرپ محصولات: ${error instanceof Error ? error.message : 'خطای نامشخص'}` },
      { status: 500 }
    )
  }
} 