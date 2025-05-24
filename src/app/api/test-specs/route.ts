import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import * as cheerio from 'cheerio'

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json(
        { error: 'URL الزامی است' },
        { status: 400 }
      )
    }

    console.log('Testing specs extraction for URL:', url)

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
    
    // تست سلکتورهای مختلف برای mobile140.com
    const debugInfo: DebugInfo = {
      pageTitle: $('title').text(),
      productName: '',
      foundSelectors: [],
      allTables: [],
      allSpecs: {},
      htmlSnippets: []
    }

    // جستجوی نام محصول
    const productSelectors = ['h1', '.product-title', '.product-name', '[class*="title"]']
    for (const selector of productSelectors) {
      const text = $(selector).first().text().trim()
      if (text && text.length > 10) {
        debugInfo.productName = text
        break
      }
    }

    // تست سلکتورهای جداول
    const tableSelectors = [
      'table',
      '.specification-table',
      '.specs-table', 
      '.product-specifications',
      '.features-table',
      '[class*="spec"]',
      '[class*="feature"]',
      '.product-details table',
      '.product-info table'
    ]

    for (const selector of tableSelectors) {
      const tables = $(selector)
      if (tables.length > 0) {
        debugInfo.foundSelectors.push(`${selector}: ${tables.length} tables`)
        
        tables.each((i, table) => {
          const rows = $(table).find('tr')
          if (rows.length > 0) {
            debugInfo.allTables.push({
              selector: selector,
              tableIndex: i,
              rowCount: rows.length,
              tableText: $(table).text().substring(0, 200)
            })
          }
        })
      }
    }

    // تست سلکتورهای div و span
    const divSelectors = [
      '.specification',
      '.spec-item',
      '.feature-item',
      '.product-specification',
      '.product-features',
      '[class*="spec"]',
      '[class*="feature"]',
      '.product-details div',
      '.technical-specs'
    ]

    for (const selector of divSelectors) {
      const elements = $(selector)
      if (elements.length > 0) {
        debugInfo.foundSelectors.push(`${selector}: ${elements.length} elements`)
        
        elements.slice(0, 3).each((i, elem) => {
          const text = $(elem).text().trim()
          if (text && text.length > 10) {
            debugInfo.htmlSnippets.push({
              selector: selector,
              index: i,
              text: text.substring(0, 150),
              html: $(elem).html()?.substring(0, 200)
            })
          }
        })
      }
    }

    // تست استخراج مشخصات با الگوهای مختلف
    const extractSpecsAdvanced = () => {
      const specs: Record<string, string> = {}

      // الگو 1: جداول با td
      $('table tr').each((_, row) => {
        const cells = $(row).find('td')
        if (cells.length >= 2) {
          const key = $(cells[0]).text().trim()
          const value = $(cells[1]).text().trim()
          if (key && value && key.length < 100 && value.length < 200) {
            specs[`table_${key}`] = value
          }
        }
      })

      // الگو 2: لیست‌ها
      $('ul li, ol li').each((_, item) => {
        const text = $(item).text().trim()
        const colonIndex = text.indexOf(':')
        if (colonIndex > 0 && colonIndex < text.length - 1) {
          const key = text.substring(0, colonIndex).trim()
          const value = text.substring(colonIndex + 1).trim()
          if (key && value && key.length < 100 && value.length < 200) {
            specs[`list_${key}`] = value
          }
        }
      })

      // الگو 3: div ها با کلاس‌های خاص
      $('[class*="spec"], [class*="feature"], [class*="detail"]').each((_, elem) => {
        const text = $(elem).text().trim()
        if (text.length > 5 && text.length < 300) {
          const colonIndex = text.indexOf(':')
          if (colonIndex > 0) {
            const key = text.substring(0, colonIndex).trim()
            const value = text.substring(colonIndex + 1).trim()
            if (key && value && key.length < 100 && value.length < 200) {
              specs[`div_${key}`] = value
            }
          }
        }
      })

      return specs
    }

    debugInfo.allSpecs = extractSpecsAdvanced()

    return NextResponse.json({
      success: true,
      url: url,
      debugInfo: debugInfo,
      specsCount: Object.keys(debugInfo.allSpecs).length
    })

  } catch (error) {
    console.error('Error in test-specs API:', error)
    return NextResponse.json(
      { error: `خطا در تست: ${error instanceof Error ? error.message : 'خطای نامشخص'}` },
      { status: 500 }
    )
  }
} 