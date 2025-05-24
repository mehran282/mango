import { NextRequest, NextResponse } from 'next/server'

// تابع کمکی برای استخراج قیمت (کپی از فایل scrape)
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { priceText } = body

    if (!priceText) {
      return NextResponse.json(
        { error: 'priceText الزامی است' },
        { status: 400 }
      )
    }

    const extractedPrice = extractPrice(priceText)

    return NextResponse.json({
      input: priceText,
      output: extractedPrice,
      formatted: `${extractedPrice.toLocaleString('fa-IR')} تومان`
    })

  } catch (error) {
    console.error('Error testing price extraction:', error)
    return NextResponse.json(
      { error: 'خطا در تست استخراج قیمت' },
      { status: 500 }
    )
  }
} 