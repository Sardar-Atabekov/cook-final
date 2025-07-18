'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/useAuthStore';
import { User, LogOut, Utensils } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageToggle } from '@/components/language-toggle';

export function Navigation() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations('navigation');
  const { user, logout } = useAuthStore();

  const navItems = [
    { href: `/${locale}`, label: t('home') },
    {
      label: t('search'),
      href: `/${locale}/search`,
    },
    { href: `/${locale}/recipes`, label: t('recipes') },
    { href: `/${locale}/suggested`, label: t('suggested') },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <Link href={`/${locale}`} className="flex items-center space-x-2">
                <Utensils className="h-8 w-8 text-brand-blue" />
                <span className="text-xl font-bold text-slate-900">
                  SuperCook
                </span>
              </Link>
            </div>
            <div className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'text-brand-blue border-b-2 border-brand-blue'
                      : 'text-gray-600 hover:text-brand-blue'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <LanguageToggle />
            <ThemeToggle />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <User className="h-4 w-4" />
                    <span>{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Link href={`/${locale}/favorites`}>{t('favorites')}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href={`/${locale}/cook`}>{t('cook')}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/${locale}/auth/login`}>{t('login')}</Link>
                </Button>
                <Button
                  size="sm"
                  className="bg-brand-blue text-white hover:bg-blue-700"
                  asChild
                >
                  <Link href={`/${locale}/auth/signup`}>{t('signup')}</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
