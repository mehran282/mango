'use client'

import React, { useState } from 'react'
import { Search, ShoppingCart, Home, Settings } from 'lucide-react'
import Link from 'next/link'

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // اینجا منطق جستجو پیاده می‌شود
    console.log('جستجو برای:', searchQuery)
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* لوگو */}
          <Link href="/" className="flex items-center space-x-2 space-x-reverse">
            <ShoppingCart className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">انبه</span>
          </Link>

          {/* جستجو */}
          <div className="flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="relative">
                            <input                type="text"                placeholder="جستجوی محصولات..."                value={searchQuery}                onChange={(e) => setSearchQuery(e.target.value)}                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-right text-gray-700 placeholder-gray-400 bg-white"                dir="rtl"              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <Search className="h-5 w-5 text-gray-400" />
              </button>
            </form>
          </div>

          {/* منو */}
          <nav className="flex items-center space-x-6 space-x-reverse">
            <Link
              href="/"
              className="flex items-center space-x-1 space-x-reverse text-gray-700 hover:text-primary-600 transition-colors"
            >
              <Home className="h-5 w-5" />
              <span>خانه</span>
            </Link>
            <Link
              href="/admin"
              className="flex items-center space-x-1 space-x-reverse text-gray-700 hover:text-primary-600 transition-colors"
            >
              <Settings className="h-5 w-5" />
              <span>مدیریت</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header 