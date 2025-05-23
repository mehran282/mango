import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'مقایسه قیمت منگو',
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
        {children}
      </body>
    </html>
  )
} 