'use client'

import React from 'react'
import { X, Package, Search, ShoppingCart, Settings } from 'lucide-react'

interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-right align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <X className="h-6 w-6" />
            </button>
            <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2 space-x-reverse">
              <Package className="h-6 w-6 text-green-600" />
              <span>راهنمای استفاده</span>
            </h3>
          </div>

          <div className="space-y-6 text-sm text-gray-600 text-right">
            {/* مراحل کار */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2 space-x-reverse">
                <Settings className="h-5 w-5 text-blue-600" />
                <span>مراحل کار:</span>
              </h4>
              <ol className="list-decimal list-inside space-y-2 mr-6">
                <li>ابتدا فروشگاه‌های مورد نظر را اضافه کنید</li>
                <li>آدرس صفحات محصولات هر فروشگاه را تعریف کنید</li>
                <li>از فرم اسکرپ برای استخراج محصولات استفاده کنید</li>
                <li>محصولات در صفحه اصلی نمایش داده می‌شوند</li>
              </ol>
            </div>

            {/* ویژگی‌ها */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2 space-x-reverse">
                <ShoppingCart className="h-5 w-5 text-purple-600" />
                <span>ویژگی‌ها:</span>
              </h4>
              <ul className="list-disc list-inside space-y-2 mr-6">
                <li>اسکرپ خودکار محصولات از وب‌سایت‌ها</li>
                <li>مقایسه قیمت‌ها از فروشگاه‌های مختلف</li>
                <li>نمایش بهترین قیمت‌ها</li>
                <li>لینک مستقیم به فروشگاه اصلی</li>
                <li>امکان تعریف چندین صفحه محصولات برای هر فروشگاه</li>
                <li>اسکرپ تا 100 محصول با pagination خودکار</li>
              </ul>
            </div>

            {/* نکات مهم */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2 space-x-reverse">
                <Search className="h-5 w-5 text-orange-600" />
                <span>نکات مهم:</span>
              </h4>
              <ul className="list-disc list-inside space-y-2 mr-6">
                <li>آدرس صفحاتی را وارد کنید که لیست محصولات در آن نمایش داده می‌شود</li>
                <li>می‌توانید چندین آدرس محصولات برای هر فروشگاه تعریف کنید</li>
                <li>اسکرپ کردن ممکن است چند دقیقه طول بکشد</li>
                <li>سیستم تا ۱۰ صفحه اول را بررسی می‌کند و pagination را دنبال می‌کند</li>
                <li>محصولات تکراری به‌روزرسانی می‌شوند</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t">
            <button
              onClick={onClose}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              متوجه شدم
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HelpModal 