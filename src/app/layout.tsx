import type { Metadata } from 'next'
import './globals.css'
import { ToastProvider } from '@/components/ui/ToastProvider'

export const metadata: Metadata = {
  title: 'مقایسه قیمت انبه',
  description: 'اپلیکیشن مقایسه قیمت محصولات از فروشگاه‌های مختلف',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link
          href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css"
          rel="stylesheet"
        />
      </head>
      <body className="font-vazir">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
} 