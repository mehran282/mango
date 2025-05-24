import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, baseUrl, productUrls } = body

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
        // @ts-ignore - productUrls field exists in schema but Prisma client not updated yet
        productUrls,
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
      include: {
        _count: {
          select: {
            offers: true
          }
        }
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

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, storeId } = body

    if (action === 'delete-store-products') {
      if (!storeId) {
        return NextResponse.json(
          { error: 'شناسه فروشگاه الزامی است' },
          { status: 400 }
        )
      }

      // حذف همه پیشنهادات فروشگاه مشخص
      const deletedOffers = await prisma.storeOffer.deleteMany({
        where: { storeId }
      })

      // حذف محصولاتی که دیگر پیشنهادی ندارند
      const productsWithoutOffers = await prisma.product.findMany({
        where: {
          offers: {
            none: {}
          }
        }
      })

      await prisma.product.deleteMany({
        where: {
          id: {
            in: productsWithoutOffers.map(p => p.id)
          }
        }
      })

      return NextResponse.json({
        message: `✅ ${deletedOffers.count} محصول از فروشگاه حذف شد و ${productsWithoutOffers.length} محصول بدون پیشنهاد حذف شد`
      })

    } else if (action === 'delete-all-products') {
      // حذف همه پیشنهادات و محصولات
      const deletedOffers = await prisma.storeOffer.deleteMany()
      const deletedProducts = await prisma.product.deleteMany()

      return NextResponse.json({
        message: `✅ همه محصولات حذف شدند (${deletedProducts.count} محصول و ${deletedOffers.count} پیشنهاد)`
      })

    } else {
      return NextResponse.json(
        { error: 'نوع عملیات نامعتبر است' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Error deleting products:', error)
    return NextResponse.json(
      { error: 'خطا در حذف محصولات' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, baseUrl, productUrls } = body

    if (!id || !name || !baseUrl) {
      return NextResponse.json(
        { error: 'شناسه، نام فروشگاه و آدرس وب‌سایت الزامی است' },
        { status: 400 }
      )
    }

    const store = await prisma.store.update({
      where: { id },
      data: {
        name,
        baseUrl,
        // @ts-ignore - productUrls field exists in schema but Prisma client not updated yet
        productUrls,
      },
    })

    return NextResponse.json(store)
  } catch (error) {
    console.error('Error updating store:', error)
    return NextResponse.json(
      { error: 'خطا در بروزرسانی فروشگاه' },
      { status: 500 }
    )
  }
} 