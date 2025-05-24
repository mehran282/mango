'use client'

import React from 'react'
import { Settings, Cpu, Camera, Battery, HardDrive, Smartphone, Monitor, Wifi, Palette, Weight } from 'lucide-react'

interface ProductSpecsProps {
  specs: Record<string, string | number> | null
}

const ProductSpecs: React.FC<ProductSpecsProps> = ({ specs }) => {
  // اگر specs موجود نیست یا خالی است
  if (!specs || Object.keys(specs).length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 text-right flex items-center">
          <span className="bg-blue-100 text-blue-800 p-2 rounded-lg ml-2">
            <Settings className="h-4 w-4" />
          </span>
          مشخصات فنی
        </h2>
        <div className="text-center py-8 text-gray-500">
          <Settings className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>مشخصات فنی در دسترس نیست</p>
          <p className="text-sm mt-1">اطلاعات تکمیلی پس از اسکرپ بعدی اضافه می‌شود</p>
        </div>
      </div>
    )
  }

  // تعیین آیکن مناسب برای هر مشخصات
  const getSpecIcon = (key: string) => {
    const keyLower = key.toLowerCase()
    
    if (keyLower.includes('پردازنده') || keyLower.includes('cpu') || keyLower.includes('تراشه') || 
        keyLower.includes('پروسسور') || keyLower.includes('chipset')) {
      return <Cpu className="h-4 w-4 text-blue-600" />
    }
    if (keyLower.includes('دوربین') || keyLower.includes('camera') || keyLower.includes('مگاپیکسل') ||
        keyLower.includes('عکس') || keyLower.includes('فیلم')) {
      return <Camera className="h-4 w-4 text-green-600" />
    }
    if (keyLower.includes('باتری') || keyLower.includes('battery') || keyLower.includes('آمپر') ||
        keyLower.includes('شارژ') || keyLower.includes('mah')) {
      return <Battery className="h-4 w-4 text-yellow-600" />
    }
    if (keyLower.includes('حافظه') || keyLower.includes('memory') || keyLower.includes('گیگابایت') || 
        keyLower.includes('رم') || keyLower.includes('ذخیره') || keyLower.includes('storage') ||
        keyLower.includes('gb') || keyLower.includes('mb')) {
      return <HardDrive className="h-4 w-4 text-purple-600" />
    }
    if (keyLower.includes('صفحه') || keyLower.includes('display') || keyLower.includes('نمایش') || 
        keyLower.includes('اینچ') || keyLower.includes('screen') || keyLower.includes('lcd') ||
        keyLower.includes('oled') || keyLower.includes('inch')) {
      return <Monitor className="h-4 w-4 text-indigo-600" />
    }
    if (keyLower.includes('شبکه') || keyLower.includes('اتصال') || keyLower.includes('wifi') || 
        keyLower.includes('bluetooth') || keyLower.includes('4g') || keyLower.includes('5g') ||
        keyLower.includes('lte')) {
      return <Wifi className="h-4 w-4 text-cyan-600" />
    }
    if (keyLower.includes('رنگ') || keyLower.includes('color') || keyLower.includes('colour')) {
      return <Palette className="h-4 w-4 text-pink-600" />
    }
    if (keyLower.includes('وزن') || keyLower.includes('weight') || keyLower.includes('ابعاد') ||
        keyLower.includes('dimension') || keyLower.includes('size')) {
      return <Weight className="h-4 w-4 text-orange-600" />
    }
    if (keyLower.includes('موبایل') || keyLower.includes('phone') || keyLower.includes('گوشی')) {
      return <Smartphone className="h-4 w-4 text-gray-600" />
    }
    
    return <Settings className="h-4 w-4 text-gray-500" />
  }

  // تعیین اولویت مشخصات مهم
  const getSpecPriority = (key: string): number => {
    const keyLower = key.toLowerCase()
    
    if (keyLower.includes('پردازنده') || keyLower.includes('cpu') || keyLower.includes('تراشه')) return 1
    if (keyLower.includes('رم') || keyLower.includes('memory')) return 2
    if (keyLower.includes('ذخیره') || keyLower.includes('storage') || keyLower.includes('حافظه داخلی')) return 3
    if (keyLower.includes('صفحه') || keyLower.includes('display') || keyLower.includes('نمایش')) return 4
    if (keyLower.includes('دوربین') || keyLower.includes('camera')) return 5
    if (keyLower.includes('باتری') || keyLower.includes('battery')) return 6
    if (keyLower.includes('سیستم عامل') || keyLower.includes('os')) return 7
    
    return 10 // سایر مشخصات
  }

  // گروه‌بندی و مرتب‌سازی مشخصات
  const specsEntries = Object.entries(specs)
  
  // مشخصات مهم (اولویت بالا)
  const importantSpecs = specsEntries
    .filter(([key]) => getSpecPriority(key) <= 7)
    .sort(([keyA], [keyB]) => getSpecPriority(keyA) - getSpecPriority(keyB))
  
  // سایر مشخصات
  const otherSpecs = specsEntries
    .filter(([key]) => getSpecPriority(key) > 7)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB, 'fa'))

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6 text-right flex items-center">
        <span className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 p-2 rounded-lg ml-2">
          <Settings className="h-5 w-5" />
        </span>
        مشخصات فنی
        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full mr-2">
          {specsEntries.length} مورد
        </span>
      </h2>

      {/* نمایش خطای debugging اگر specs رشته است */}
      {typeof specs === 'string' && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 text-right">
            ⚠️ مشخصات به صورت رشته ذخیره شده: {String(specs).substring(0, 100)}...
          </p>
        </div>
      )}

      {/* مشخصات مهم */}
      {importantSpecs.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4 text-right flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full ml-2"></span>
            مشخصات کلیدی
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {importantSpecs.map(([key, value], index) => (
              <div 
                key={`important-${key}-${index}`} 
                className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 hover:from-blue-100 hover:to-indigo-100 transition-all"
              >
                <div className="flex items-center space-x-2 space-x-reverse">
                  {getSpecIcon(key)}
                  <span className="text-sm font-medium text-gray-800 text-right">{key}</span>
                </div>
                <span className="text-sm text-gray-900 font-semibold text-left bg-white px-3 py-1 rounded-full border">
                  {String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* سایر مشخصات */}
      {otherSpecs.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-4 text-right flex items-center">
            <span className="w-2 h-2 bg-gray-400 rounded-full ml-2"></span>
            سایر مشخصات
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {otherSpecs.map(([key, value], index) => (
              <div 
                key={`other-${key}-${index}`} 
                className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-2 space-x-reverse">
                  {getSpecIcon(key)}
                  <span className="text-sm text-gray-700 text-right">{key}</span>
                </div>
                <span className="text-sm text-gray-900 font-medium text-left">
                  {String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* اطلاعات اضافی */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>مجموع {specsEntries.length} مشخصات فنی</span>
          <span>آخرین به‌روزرسانی: الان</span>
        </div>
      </div>

      {/* نمایش raw data برای debugging */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4">
          <summary className="text-xs text-gray-400 cursor-pointer">🔧 Raw Data (Dev Only)</summary>
          <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-x-auto">
            {JSON.stringify(specs, null, 2)}
          </pre>
        </details>
      )}
    </div>
  )
}

export default ProductSpecs 