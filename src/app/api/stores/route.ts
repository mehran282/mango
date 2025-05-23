import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, baseUrl } = body

    if (!name || !baseUrl) {
      return NextResponse.json(
        { error: 'نام فروشگاه و آدرس وب‌سایت الزامی است' },
        { status: 400 }
      )
    }

    const store = await prisma.store.create({
      data: {
        name,
        baseUrl,
      },
    })

    return NextResponse.json(store, { status: 201 })
  } catch (error) {
    console.error('Error creating store:', error)
    return NextResponse.json(
      { error: 'خطا در ایجاد فروشگاه' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const stores = await prisma.store.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(stores)
  } catch (error) {
    console.error('Error fetching stores:', error)
    return NextResponse.json(
      { error: 'خطا در دریافت فروشگاه‌ها' },
      { status: 500 }
    )
  }
} 