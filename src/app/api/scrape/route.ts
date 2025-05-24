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

// تابع کمکی برای استخراج مشخصات محصول
const extractSpecs = ($el: any, $: any): Record<string, string> => {
  const specs: Record<string, string> = {}
  
  console.log('Extracting product specifications...')
  
  // الگوهای مختلف برای پیدا کردن مشخصات - بهینه شده برای mobile140.com
  const specSelectors = [
    // جداول مشخصات عمومی
    '.specifications table tr',
    '.specs table tr', 
    '.product-specs tr',
    '.specification-table tr',
    '.features table tr',
    '.product-details table tr',
    '.technical-specs table tr',
    'table.specs tr',
    'table.specifications tr',
    'table.product-info tr',
    
    // لیست‌های مشخصات
    '.specifications li',
    '.specs li',
    '.product-specs li',
    '.specification-list li',
    '.features li',
    '.attributes li',
    '.product-features li',
    '.tech-specs li',
    
    // div های مشخصات
    '.spec-item',
    '.specification-item',
    '.feature-item',
    '.attribute-item',
    '.product-attribute',
    '.product-feature',
    '.tech-spec',
    
    // سلکتورهای خاص mobile140.com
    '.product-info .row',
    '.product-details .row',
    '.specification .row',
    '.specs .row',
    '.product-specification .item',
    '.product-features .item',
    '.technical-info .item',
    
    // سلکتورهای کلی
    '[class*="spec"]',
    '[class*="feature"]',
    '[class*="attribute"]',
    '[class*="detail"]',
    '[class*="info"]'
  ]
  
  // جستجو در المان محصول و کل صفحه
  const searchContexts = [
    { name: 'element', context: $el },
    { name: 'page', context: $ }
  ]
  
  for (const { name, context } of searchContexts) {
    // بررسی صحت context
    if (!context || typeof context !== 'function') {
      console.log(`Invalid context for ${name}, skipping...`)
      continue
    }
    
    for (const selector of specSelectors) {
      let elements
      
      try {
        if (name === 'element' && context.find) {
          elements = context.find(selector)
        } else {
          elements = context(selector)
        }
        
        if (!elements || !elements.each) {
          continue
        }
        
        elements.each((_: number, element: any) => {
          const $elem = $(element)
          
          // برای جداول
          if (element.tagName === 'tr') {
            const cells = $elem.find('td, th')
            if (cells.length >= 2) {
              const key = $(cells[0]).text().trim()
              const value = $(cells[1]).text().trim()
              if (key && value && key.length < 100 && value.length < 200) {
                specs[key] = value
              }
            }
          }
          
          // برای لیست‌ها
          else if (element.tagName === 'li') {
            const text = $elem.text().trim()
            const colonIndex = text.indexOf(':')
            const dashIndex = text.indexOf('-')
            const separatorIndex = colonIndex !== -1 ? colonIndex : dashIndex
            
            if (separatorIndex !== -1) {
              const key = text.substring(0, separatorIndex).trim()
              const value = text.substring(separatorIndex + 1).trim()
              if (key && value && key.length < 100 && value.length < 200) {
                specs[key] = value
              }
            }
          }
          
          // برای div ها و row ها
          else {
            // تلاش برای پیدا کردن label و value در ساختارهای مختلف
            const labelSelectors = ['.label', '.key', '.name', '.title', 'dt', '.col-md-6:first-child', '.col-sm-6:first-child', '.spec-name', '.attr-name']
            const valueSelectors = ['.value', '.val', '.content', 'dd', '.col-md-6:last-child', '.col-sm-6:last-child', '.spec-value', '.attr-value']
            
            let label = ''
            let value = ''
            
            // جستجو برای label
            for (const labelSel of labelSelectors) {
              const labelEl = $elem.find(labelSel).first()
              if (labelEl.length) {
                label = labelEl.text().trim()
                if (label) break
              }
            }
            
            // جستجو برای value
            for (const valueSel of valueSelectors) {
              const valueEl = $elem.find(valueSel).first()
              if (valueEl.length) {
                value = valueEl.text().trim()
                if (value) break
              }
            }
            
            // اگر label و value پیدا نشد، تلاش برای استخراج از متن
            if (!label || !value) {
              const text = $elem.text().trim()
              const colonIndex = text.indexOf(':')
              const dashIndex = text.indexOf('-')
              const equalIndex = text.indexOf('=')
              
              let separatorIndex = -1
              if (colonIndex !== -1) separatorIndex = colonIndex
              else if (dashIndex !== -1) separatorIndex = dashIndex
              else if (equalIndex !== -1) separatorIndex = equalIndex
              
              if (separatorIndex !== -1) {
                const key = text.substring(0, separatorIndex).trim()
                const val = text.substring(separatorIndex + 1).trim()
                if (key && val && key.length < 100 && val.length < 200) {
                  specs[key] = val
                }
              }
            } else if (label.length < 100 && value.length < 200) {
              specs[label] = value
            }
          }
        })
        
        if (Object.keys(specs).length > 0) {
          console.log(`Found ${Object.keys(specs).length} specifications using selector: ${selector} in ${name}`)
          break
        }
      } catch (error) {
        console.log(`Error with selector ${selector} in ${name}:`, error)
        continue
      }
    }
    
    if (Object.keys(specs).length > 5) break // اگر مشخصات کافی پیدا شد، از جستجو خارج شو
  }
  
  // اگر هنوز مشخصاتی پیدا نشد، تلاش برای استخراج از تمام متن صفحه
  if (Object.keys(specs).length === 0) {
    console.log('No specs found with standard selectors, trying text-based extraction...')
    
    try {
      // جستجو در تمام div ها و span ها
      $('div, span, p').each((_: number, element: any) => {
        const text = $(element).text().trim()
        if (text.length > 10 && text.length < 200) {
          const lines = text.split('\n').map((line: string) => line.trim()).filter((line: string) => line.length > 0)
          
          for (const line of lines) {
            const colonIndex = line.indexOf(':')
            if (colonIndex > 0 && colonIndex < line.length - 1) {
              const key = line.substring(0, colonIndex).trim()
              const value = line.substring(colonIndex + 1).trim()
              
              // فیلتر کردن کلیدهای مفید
              if (key && value && 
                  key.length >= 2 && key.length <= 50 &&
                  value.length >= 1 && value.length <= 100 &&
                  (key.includes('پردازنده') || key.includes('حافظه') || key.includes('دوربین') || 
                   key.includes('باتری') || key.includes('صفحه') || key.includes('نمایش') ||
                   key.includes('رم') || key.includes('ذخیره') || key.includes('سیستم') ||
                   key.includes('وزن') || key.includes('ابعاد') || key.includes('رنگ') ||
                   key.includes('شبکه') || key.includes('اتصال') || key.includes('سنسور'))) {
                specs[key] = value
              }
            }
          }
        }
      })
    } catch (error) {
      console.log('Error in text-based extraction:', error)
    }
  }
  
  // تمیز کردن و فیلتر کردن مشخصات
  const cleanSpecs: Record<string, string> = {}
  for (const [key, value] of Object.entries(specs)) {
    // حذف کاراکترهای غیرضروری
    const cleanKey = key.replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\w\s]/g, '').trim()
    const cleanValue = value.replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\w\s.,()]/g, '').trim()
    
    if (cleanKey && cleanValue && 
        cleanKey.length >= 2 && cleanKey.length <= 50 &&
        cleanValue.length >= 1 && cleanValue.length <= 100 &&
        !cleanKey.toLowerCase().includes('javascript') &&
        !cleanValue.toLowerCase().includes('javascript') &&
        !cleanKey.toLowerCase().includes('function') &&
        !cleanValue.toLowerCase().includes('function')) {
      cleanSpecs[cleanKey] = cleanValue
    }
  }
  
  console.log(`Extracted ${Object.keys(cleanSpecs).length} clean specifications:`, Object.keys(cleanSpecs).slice(0, 5))
  
  return cleanSpecs
}

// تابع کمکی برای استخراج قیمت
const extractPrice = (priceText: string): number => {
  if (!priceText) return 0
  
  console.log(`Extracting price from: "${priceText}"`)
  
  // تبدیل قیمت فارسی به انگلیسی
  const persianNumbers = '۰۱۲۳۴۵۶۷۸۹'
  const englishNumbers = '0123456789'
  let cleanPriceText = priceText
  
  for (let i = 0; i < persianNumbers.length; i++) {
    cleanPriceText = cleanPriceText.replace(new RegExp(persianNumbers[i], 'g'), englishNumbers[i])
  }
  
  // حذف واحدهای پولی و کاراکترهای اضافی، ولی حفظ کاما و نقطه و فاصله
  cleanPriceText = cleanPriceText
    .replace(/تومان|ریال|درهم/gi, '')
    .replace(/[^\d,.\s]/g, '')
    .trim()
  
  console.log(`After cleaning: "${cleanPriceText}"`)
  
  // اگر متن شامل چندین عدد است، هر کدام را جداگانه بررسی کن
  const segments = cleanPriceText.split(/\s+/).filter(s => s.length > 0)
  let price = 0
  
  for (const segment of segments) {
    const cleanNumber = segment
      .replace(/,/g, '') // حذف کاما (جداکننده هزارگان)
      .replace(/\./g, '') // حذف نقطه
    
    const candidatePrice = parseInt(cleanNumber) || 0
    console.log(`Candidate price: ${candidatePrice} from segment "${segment}"`)
    
    // انتخاب اولین عدد معقول (بیشتر از 1000 تومان و کمتر از 1 میلیارد تومان)
    if (candidatePrice >= 1000 && candidatePrice <= 1000000000) {
      price = candidatePrice
      console.log(`Selected price: ${price}`)
      break
    }
  }
  
  // اگر هیچ عدد معقولی پیدا نشد، تلاش کن کل رشته را تبدیل کنی
  if (price === 0 && cleanPriceText) {
    const allNumbers = cleanPriceText
      .replace(/,/g, '')
      .replace(/\s/g, '')
      .replace(/\./g, '')
    
    price = parseInt(allNumbers) || 0
    console.log(`Fallback price extraction: ${price}`)
    
    // اگر عدد خیلی بزرگ است، احتمالاً ریال است یا اشتباه استخراج شده
    if (price > 1000000000) {
      // تلاش برای تقسیم بر 10 (ریال به تومان)
      const convertedPrice = Math.floor(price / 10)
      if (convertedPrice >= 1000 && convertedPrice <= 1000000000) {
        price = convertedPrice
        console.log(`Large number converted from Rial to Toman: ${price}`)
      } else {
        // اگر هنوز خیلی بزرگ است، احتمالاً خطا در استخراج
        price = 0
        console.log(`Number too large, rejecting: ${price}`)
      }
    }
  }
  
  // اگر عدد خیلی کوچک است و متن شامل "ریال" است، تبدیل به تومان
  if (price > 0 && price < 100000 && priceText.toLowerCase().includes('ریال')) {
    price = Math.floor(price / 10)
    console.log(`Small number with Rial detected, converted to Toman: ${price}`)
  }
  
  console.log(`Final price: ${price}`)
  return price
}

// تابع اسکرپ بهبود یافته برای سایت‌های فارسی با pagination
const scrapeWithCheerio = async (baseUrl: string, maxProducts: number = 10): Promise<ScrapedProduct[]> => {
  try {
    console.log('Starting scrape for URL:', baseUrl, 'Max products:', maxProducts)
    
    const allProducts: ScrapedProduct[] = []
    let currentUrl = baseUrl
    let page = 1
    
    while (allProducts.length < maxProducts) {
      console.log(`Scraping page ${page}: ${currentUrl}`)
      
      const response = await axios.get(currentUrl, {
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
      const pageProducts: ScrapedProduct[] = []

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

      let foundProductsOnPage = 0

      for (const selector of productSelectors) {
        console.log(`Trying selector: ${selector}`)
        const elements = $(selector)
        console.log(`Found ${elements.length} elements with selector: ${selector}`)

        // Convert elements to array and process sequentially
        const elementsArray = elements.toArray()
        
        for (let i = 0; i < elementsArray.length && allProducts.length + pageProducts.length < maxProducts; i++) {
          const element = elementsArray[i]
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

          // استخراج قیمت با استفاده از تابع کمکی
          const price = extractPrice(priceText)

          // استخراج لینک محصول
          const linkSelectors = ['a', '.product-link', '.item-link']
          let productUrl = currentUrl
          for (const linkSelector of linkSelectors) {
            const linkEl = $el.find(linkSelector).first()
            if (linkEl.length) {
              const href = linkEl.attr('href')
              if (href) {
                productUrl = href.startsWith('http') ? href : new URL(href, currentUrl).href
                break
              }
            }
          }

          // استخراج مشخصات محصول - استفاده از الگوی موفق test-specs
          let specs: Record<string, string> = {}
          
          // برای mobile140.com، مشخصات در صفحه تک محصول هستند، نه در لیست
          if (productUrl && productUrl.includes('mobile140.com')) {
            try {
              console.log(`Fetching detailed specs from: ${productUrl}`)
              const productResponse = await axios.get(productUrl, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                  'Accept-Language': 'fa-IR,fa;q=0.9,en;q=0.8',
                },
                timeout: 10000,
              })
              
              const productPage$ = cheerio.load(productResponse.data)
              specs = extractSpecs(productPage$('body'), productPage$)
              console.log(`Found ${Object.keys(specs).length} specs from product page`)
              
            } catch (error) {
              console.log(`Error fetching product details for ${productUrl}:`, error)
              // fallback به استخراج از المان فعلی
              specs = extractSpecs($el, $)
            }
          } else {
            // برای سایر سایت‌ها، از المان فعلی استخراج کن
            specs = extractSpecs($el, $)
          }
          
          console.log(`Extracted ${Object.keys(specs).length} specs for product: ${name}`)
          
          // استخراج تصویر
          const imgSelectors = ['img', '.image img', '.product-image img', '.item-image img']
          let image = ''
          for (const imgSelector of imgSelectors) {
            const imgEl = $el.find(imgSelector).first()
            if (imgEl.length) {
              const imgSrc = imgEl.attr('src') || imgEl.attr('data-src') || imgEl.attr('data-lazy')
              if (imgSrc) {
                image = imgSrc.startsWith('http') ? imgSrc : new URL(imgSrc, currentUrl).href
                break
              }
            }
          }

          console.log(`Product found: name="${name}", price="${priceText}" -> ${price}, specs: ${Object.keys(specs).length}`)

          if (name && name.length > 5 && price && price > 1000) {
            // بررسی تکراری نبودن
            const isDuplicate = allProducts.some(p => p.name === name || p.url === productUrl)
            if (!isDuplicate) {
              pageProducts.push({
                name: name.slice(0, 200), // محدود کردن طول نام
                price,
                image,
                url: productUrl,
                specs: specs,
              })
              foundProductsOnPage++
            }
          }
        }

        if (foundProductsOnPage > 0) {
          console.log(`Found ${foundProductsOnPage} products with selector: ${selector}`)
          break
        }
      }

      allProducts.push(...pageProducts)
      console.log(`Page ${page}: Found ${pageProducts.length} products, Total: ${allProducts.length}`)

      // اگر محصول جدیدی پیدا نشد یا به حد کافی رسیدیم، توقف کن
      if (pageProducts.length === 0 || allProducts.length >= maxProducts) {
        break
      }

      // تلاش برای پیدا کردن لینک صفحه بعد
      const nextPageSelectors = [
        'a[rel="next"]',
        '.next',
        '.pagination-next',
        '[class*="next"]',
        'a:contains("بعدی")',
        'a:contains(">")',
        '.page-numbers.next',
        '.pagination .next'
      ]

      let nextPageUrl = null
      for (const selector of nextPageSelectors) {
        const nextLink = $(selector).attr('href')
        if (nextLink) {
          nextPageUrl = nextLink.startsWith('http') ? nextLink : new URL(nextLink, currentUrl).href
          break
        }
      }

      // اگر لینک صفحه بعد پیدا نشد، تلاش برای ساخت URL پایه صفحه بعد
      if (!nextPageUrl) {
        const urlObj = new URL(currentUrl)
        const currentPageParam = urlObj.searchParams.get('page') || urlObj.searchParams.get('p')
        
        if (currentPageParam) {
          urlObj.searchParams.set('page', String(parseInt(currentPageParam) + 1))
          nextPageUrl = urlObj.toString()
        } else {
          // اگر پارامتر صفحه وجود نداشت، اضافه کن
          urlObj.searchParams.set('page', String(page + 1))
          nextPageUrl = urlObj.toString()
        }
      }

      if (nextPageUrl && nextPageUrl !== currentUrl) {
        currentUrl = nextPageUrl
        page++
        
        // محدودیت صفحات برای جلوگیری از حلقه بی‌نهایت
        if (page > 5) { // کاهش محدودیت صفحات نیز
          console.log('Reached maximum page limit (5)')
          break
        }
      } else {
        console.log('No next page found, stopping pagination')
        break
      }
    }

    console.log(`Total products found: ${allProducts.length}`)
    return allProducts.slice(0, maxProducts) // محدود کردن به حداکثر تعداد درخواستی
    
  } catch (error) {
    console.error('Error scraping with Cheerio:', error)
    throw new Error(`خطا در اسکرپ: ${error instanceof Error ? error.message : 'خطای نامشخص'}`)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { storeId } = body

    console.log('Scrape request:', { storeId })

    if (!storeId) {
      return NextResponse.json(
        { error: 'شناسه فروشگاه الزامی است' },
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

    // دریافت آدرس‌های محصولات فروشگاه
    let productUrls: string[] = []
    // @ts-ignore - productUrls field exists in schema but Prisma client not updated yet
    if (store.productUrls) {
      try {
        // @ts-ignore - productUrls field exists in schema but Prisma client not updated yet
        productUrls = JSON.parse(store.productUrls as string)
      } catch (e) {
        console.error('Error parsing productUrls:', e)
      }
    }

    if (productUrls.length === 0) {
      return NextResponse.json(
        { error: 'هیچ آدرس محصولاتی برای این فروشگاه تعریف نشده است. لطفاً از بخش مدیریت، آدرس‌های محصولات را اضافه کنید.' },
        { status: 400 }
      )
    }

    console.log(`Found ${productUrls.length} product URLs for store: ${store.name}`)

    const allScrapedProducts: ScrapedProduct[] = []
    const savedProducts = []

    // اسکرپ همه آدرس‌های محصولات
    for (let i = 0; i < productUrls.length; i++) {
      const url = productUrls[i]
      console.log(`Scraping URL ${i + 1}/${productUrls.length}: ${url}`)

      try {
        // محدودیت 10 محصول برای هر URL
        const productsPerUrl = Math.max(1, Math.floor(10 / productUrls.length))
        console.log(`Scraping ${productsPerUrl} products from: ${url}`)
        
        const scrapedProducts = await scrapeWithCheerio(url, productsPerUrl)
        console.log(`✅ Found ${scrapedProducts.length} products from ${url}`)
        
        // نمایش مشخصات یافت شده
        scrapedProducts.forEach((product, index) => {
          const specsCount = product.specs ? Object.keys(product.specs).length : 0
          console.log(`  ${index + 1}. ${product.name.substring(0, 50)}... - ${specsCount} specs`)
        })
        
        allScrapedProducts.push(...scrapedProducts)
        
        // اگر به 10 محصول رسیدیم، توقف کن
        if (allScrapedProducts.length >= 10) {
          console.log(`Reached limit of 10 products, stopping scrape`)
          break
        }
        
      } catch (error) {
        console.error(`❌ Error scraping ${url}:`, error)
        // ادامه اسکرپ سایر آدرس‌ها حتی اگر یکی خطا داشته باشد
      }
    }

    // محدود کردن به 10 محصول
    const limitedProducts = allScrapedProducts.slice(0, 10)
    console.log(`Processing ${limitedProducts.length} products for saving...`)

    if (limitedProducts.length === 0) {
      return NextResponse.json(
        { error: 'هیچ محصولی از آدرس‌های تعریف شده یافت نشد. لطفاً آدرس‌های محصولات را بررسی کنید.' },
        { status: 404 }
      )
    }

    // ذخیره محصولات
    for (const scrapedProduct of limitedProducts) {
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

    // آمار نهایی
    const totalSpecsFound = savedProducts.reduce((acc, product) => {
      const specs = limitedProducts.find(p => p.name === product.product)?.specs
      return acc + (specs ? Object.keys(specs).length : 0)
    }, 0)

    console.log(`✅ Scraping completed: ${savedProducts.length} products saved with ${totalSpecsFound} total specifications`)

    return NextResponse.json({
      message: `✅ ${savedProducts.length} محصول با موفقیت ذخیره شد (محدودیت ۱۰ محصول)`,
      details: {
        totalFound: limitedProducts.length,
        totalSaved: savedProducts.length,
        totalSpecs: totalSpecsFound,
        urlsScraped: productUrls.length
      },
      products: savedProducts.map(product => {
        const specs = limitedProducts.find(p => p.name === product.product)?.specs
        return {
          ...product,
          specsCount: specs ? Object.keys(specs).length : 0
        }
      }).slice(0, 5) // نمایش ۵ محصول اول با تعداد مشخصات
    })

  } catch (error) {
    console.error('Error in scrape API:', error)
    return NextResponse.json(
      { error: `خطا در اسکرپ محصولات: ${error instanceof Error ? error.message : 'خطای نامشخص'}` },
      { status: 500 }
    )
  }
} 