import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}

// تبدیل اعداد انگلیسی به فارسی
export const toPersianNumbers = (str: string | number): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return str.toString().replace(/\d/g, (digit) => persianDigits[parseInt(digit)])
}

// فرمت کردن قیمت با کاما و تومان
export const formatPrice = (price: number): string => {
  return toPersianNumbers(price.toLocaleString('fa-IR')) + ' تومان'
}

// تبدیل تاریخ به شمسی
export const toPersianDate = (date: Date): string => {
  return new Intl.DateTimeFormat('fa-IR').format(date)
}

// تابع برای بهینه‌سازی URL تصاویر
export const optimizeImageUrl = (url: string): string => {
  if (!url) return ''
  
  // اگر URL نسبی است، آن را مطلق کنیم
  try {
    const absoluteUrl = new URL(url)
    return absoluteUrl.href
  } catch {
    // اگر URL معتبر نیست، string خالی برگردانیم
    return ''
  }
}

// تابع برای تولید placeholder image
export const getImagePlaceholder = (text: string): string => {
  const encodedText = encodeURIComponent(text.slice(0, 30))
  return `https://via.placeholder.com/400x400/f3f4f6/6b7280?text=${encodedText}`
}

// تابع برای بررسی معتبر بودن URL تصویر
export const isValidImageUrl = (url: string): boolean => {
  if (!url) return false
  
  try {
    const parsedUrl = new URL(url)
    const validDomains = ['https:', 'http:']
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']
    
    return validDomains.includes(parsedUrl.protocol) && 
           (imageExtensions.some(ext => parsedUrl.pathname.toLowerCase().includes(ext)) || 
            parsedUrl.hostname.includes('placeholder') ||
            parsedUrl.hostname.includes('via.placeholder') ||
            parsedUrl.searchParams.has('text'))
  } catch {
    return false
  }
} 