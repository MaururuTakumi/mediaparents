'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navLinks = [
    { href: '/articles', label: '記事一覧' },
    { href: '/writers', label: 'ライター一覧' },
    { href: '/seminars', label: 'オンライン座談会' },
    { href: '/about', label: 'このサイトについて' }
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold text-xl">ありがとうお父さんお母さん</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
          <Button asChild variant="outline" size="sm">
            <Link href="/account">ログイン</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/subscription">有料プラン</Link>
          </Button>
        </nav>

        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t">
          <nav className="container py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col space-y-2 pt-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/account">ログイン</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/subscription">有料プラン</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}