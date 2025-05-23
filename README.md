# منگو - سیستم مقایسه قیمت 🥭

یک وب اپلیکیشن پیشرفته برای مقایسه قیمت محصولات از فروشگاه‌های آنلاین مختلف.

## ✨ ویژگی‌ها

### 🛍️ مقایسه قیمت هوشمند
- نمایش کمترین و بیشترین قیمت هر محصول
- محاسبه صرفه‌جویی برای خریداران
- رتبه‌بندی فروشگاه‌ها بر اساس بهترین قیمت

### 🕷️ وب اسکرپ خودکار
- استخراج محصولات از سایت‌های فروشگاهی
- پشتیبانی از سایت‌های فارسی (تکنولایف، دیجی‌کالا و...)
- تبدیل اعداد فارسی و پردازش قیمت‌ها

### 🎨 رابط کاربری فارسی
- طراحی RTL کامل
- فونت Vazirmatn از CDN
- رنگ‌بندی و طراحی مدرن
- Responsive design

### 🗃️ مدیریت داده‌ها
- مدیریت فروشگاه‌ها
- ذخیره و به‌روزرسانی قیمت‌ها
- تاریخچه تغییرات قیمت

## 🛠️ تکنولوژی‌های استفاده شده

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: MariaDB (MySQL Compatible)
- **Web Scraping**: Axios, Cheerio
- **UI Components**: Lucide React Icons

## 📋 پیش‌نیازها

- Node.js 18+ 
- MariaDB یا MySQL database
- Git

## 🚀 نصب و راه‌اندازی

### 1. کلون کردن پروژه
```bash
git clone https://github.com/yourusername/mango-price-compare.git
cd mango-price-compare
```

### 2. نصب dependencies
```bash
npm install
```

### 3. تنظیم پایگاه داده
فایل `.env` ایجاد کنید:
```env
DATABASE_URL="mysql://username:password@host:port/database_name"
```

### 4. اجرای Migration‌ها
```bash
npx prisma migrate deploy
npx prisma generate
```

### 5. اضافه کردن داده‌های نمونه
```bash
npm run seed
```

### 6. اجرای پروژه
```bash
npm run dev
```

پروژه روی `http://localhost:3000` در دسترس خواهد بود.

## 📖 نحوه استفاده

### 1. اضافه کردن فروشگاه
- به صفحه `/admin` بروید
- اطلاعات فروشگاه جدید را وارد کنید
- روی "افزودن فروشگاه" کلیک کنید

### 2. اسکرپ محصولات
- فروشگاه مورد نظر را انتخاب کنید
- آدرس صفحه محصولات را وارد کنید
- "شروع اسکرپ" را کلیک کنید

### 3. مشاهده و مقایسه
- محصولات در صفحه اصلی نمایش داده می‌شوند
- روی هر محصول کلیک کنید تا جزئیات ببینید
- قیمت‌ها از تمام فروشگاه‌ها مقایسه می‌شوند

## 📁 ساختار پروژه

```
src/
├── app/
│   ├── admin/           # صفحه مدیریت
│   ├── api/            # API routes
│   ├── product/        # صفحات محصولات
│   └── page.tsx        # صفحه اصلی
├── components/
│   └── ui/             # کامپوننت‌های UI
├── lib/
│   ├── prisma.ts       # تنظیمات Prisma
│   └── utils.ts        # توابع کمکی
```

## 🗄️ Schema پایگاه داده

### Store (فروشگاه)
- نام فروشگاه
- آدرس وب‌سایت
- تاریخ ایجاد

### Product (محصول)
- نام محصول
- توضیحات
- تصویر اصلی
- مشخصات فنی
- دسته‌بندی

### StoreOffer (پیشنهاد فروشگاه)
- قیمت فعلی
- قیمت اصلی (قبل از تخفیف)
- لینک محصول در فروشگاه
- تاریخ آخرین بررسی
- وضعیت موجودی

## 🤝 مشارکت

1. Fork کنید
2. Feature branch ایجاد کنید (`git checkout -b feature/AmazingFeature`)
3. تغییراتتان را commit کنید (`git commit -m 'Add some AmazingFeature'`)
4. به branch خود push کنید (`git push origin feature/AmazingFeature`)
5. Pull Request ایجاد کنید

## 📄 مجوز

این پروژه تحت مجوز MIT منتشر شده است.

## 🔗 لینک‌های مفید

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

ساخته شده با ❤️ برای جامعه توسعه‌دهندگان فارسی 