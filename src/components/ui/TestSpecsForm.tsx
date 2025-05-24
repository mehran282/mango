'use client'

import React, { useState } from 'react'
import { Search, Loader2, ExternalLink } from 'lucide-react'
import { useToast } from './ToastProvider'

interface DebugInfo {
  pageTitle: string
  productName: string
  foundSelectors: string[]
  allTables: Array<{
    selector: string
    tableIndex: number
    rowCount: number
    tableText: string
  }>
  allSpecs: Record<string, string>
  htmlSnippets: Array<{
    selector: string
    index: number
    text: string
    html: string | undefined
  }>
}

interface TestResult {
  success: boolean
  url: string
  debugInfo: DebugInfo
  specsCount: number
  error?: string
}

const TestSpecsForm: React.FC = () => {
  const [url, setUrl] = useState('https://www.mobile140.com/fa/product/%DA%AF%D9%88%D8%B4%DB%8C-%D9%85%D9%88%D8%A8%D8%A7%DB%8C%D9%84/13651-%DA%AF%D9%88%D8%B4%DB%8C-%D9%85%D9%88%D8%A8%D8%A7%DB%8C%D9%84-%D8%A7%D9%BE%D9%84-%D9%85%D8%AF%D9%84-Iphone-16-%D8%B8%D8%B1%D9%81%DB%8C%D8%AA-128-%DA%AF%DB%8C%DA%AF%D8%A7%D8%A8%D8%A7%DB%8C%D8%AA-%D8%B1%D9%85-8-%DA%AF%DB%8C%DA%AF%D8%A7%D8%A8%D8%A7%DB%8C%D8%AA---%D9%86%D8%A7%D9%86-%D8%A7%DA%A9%D8%AA%DB%8C%D9%88-|-%D9%BE%D8%A7%D8%B1%D8%AA-%D9%86%D8%A7%D9%85%D8%A8%D8%B1-CH-A.html')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TestResult | null>(null)
  const { showToast, showSuccess, showError } = useToast()

  const handleTest = async () => {
    if (!url.trim()) {
      showError('لطفاً آدرس URL را وارد کنید')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/test-specs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
        showSuccess(`✅ تست تکمیل شد - ${data.specsCount} مشخصات یافت شد`)
      } else {
        showError(`❌ ${data.error || 'خطا در تست'}`)
        setResult(null)
      }
    } catch (error) {
      console.error('Test error:', error)
      showError('❌ خطا در اتصال به سرور')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* فرم تست */}
      <div className="space-y-4">
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 text-right mb-2">
            آدرس URL محصول
          </label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-right"
            placeholder="https://example.com/product/..."
            dir="ltr"
          />
        </div>

        <button
          onClick={handleTest}
          disabled={loading}
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2 space-x-reverse"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>در حال تست...</span>
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              <span>تست استخراج مشخصات</span>
            </>
          )}
        </button>
      </div>

      {/* نتایج تست */}
      {result && (
        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">نتایج تست</h3>
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:text-purple-700 flex items-center space-x-1 space-x-reverse"
            >
              <span className="text-sm">مشاهده صفحه</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          {/* اطلاعات کلی */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2 text-right">عنوان صفحه</h4>
              <p className="text-sm text-gray-600 text-right">{result.debugInfo.pageTitle || 'یافت نشد'}</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2 text-right">نام محصول</h4>
              <p className="text-sm text-gray-600 text-right">{result.debugInfo.productName || 'یافت نشد'}</p>
            </div>
          </div>

          {/* سلکتورهای یافت شده */}
          {result.debugInfo.foundSelectors.length > 0 && (
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2 text-right">سلکتورهای یافت شده</h4>
              <ul className="space-y-1">
                {result.debugInfo.foundSelectors.map((selector, index) => (
                  <li key={index} className="text-sm text-gray-600 text-right font-mono">
                    {selector}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* جداول یافت شده */}
          {result.debugInfo.allTables.length > 0 && (
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2 text-right">جداول یافت شده</h4>
              <div className="space-y-2">
                {result.debugInfo.allTables.map((table, index) => (
                  <div key={index} className="bg-gray-50 p-2 rounded">
                    <p className="text-sm font-medium text-gray-700 text-right">
                      {table.selector} (ردیف {table.rowCount})
                    </p>
                    <p className="text-xs text-gray-500 text-right mt-1">
                      {table.tableText}...
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* مشخصات استخراج شده */}
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2 text-right">
              مشخصات استخراج شده ({result.specsCount} مورد)
            </h4>
            {result.specsCount > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {Object.entries(result.debugInfo.allSpecs).map(([key, value], index) => (
                  <div key={index} className="flex justify-between items-start bg-gray-50 p-2 rounded">
                    <span className="text-sm text-gray-700 text-right flex-1">{key}</span>
                    <span className="text-sm text-gray-900 font-medium text-left flex-1">{value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-right">هیچ مشخصاتی یافت نشد</p>
            )}
          </div>

          {/* نمونه HTML */}
          {result.debugInfo.htmlSnippets.length > 0 && (
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2 text-right">نمونه محتوای HTML</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {result.debugInfo.htmlSnippets.slice(0, 3).map((snippet, index) => (
                  <div key={index} className="bg-gray-50 p-2 rounded">
                    <p className="text-xs text-gray-700 text-right font-mono mb-1">
                      {snippet.selector}
                    </p>
                    <p className="text-sm text-gray-600 text-right">
                      {snippet.text}...
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TestSpecsForm 