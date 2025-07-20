'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/useAuthStore';
import { User, LogOut, Utensils, ChefHat, Menu, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageToggle } from '@/components/language-toggle';
import { useState, useEffect } from 'react';

export function Navigation() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations('navigation');
  const { user, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Ensure hydration is complete
  useEffect(() => {
    setIsClient(true);
  }, []);

  const navItems = [
    { href: `/${locale}`, label: t('home'), icon: ChefHat },
    { href: `/${locale}/recipes`, label: t('recipes'), icon: Utensils },
    { href: `/${locale}/suggested`, label: t('suggested'), icon: ChefHat },
  ];

  return (
    <nav
      className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm"
      style={{ contain: 'layout style paint' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <Link
                href={`/${locale}`}
                className="flex items-center space-x-2 group"
              >
                <div className="transition-all duration-300 group-hover:scale-110 group-hover:rotate-5">
                  <ChefHat className="h-8 w-8 text-brand-blue" />
                </div>
                <span className="text-xl font-bold text-slate-900 group-hover:text-brand-blue transition-colors duration-300">
                  SuperCook
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-1">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <div
                    key={item.href}
                    className="transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Link
                      href={item.href}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center space-x-2 relative ${
                        isActive
                          ? 'text-brand-blue bg-blue-50 border border-blue-200 shadow-sm'
                          : 'text-gray-600 hover:text-brand-blue hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                      {isActive && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-blue rounded-full" />
                      )}
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <LanguageToggle />
            <ThemeToggle />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="transition-all duration-200 hover:scale-105 active:scale-95">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 rounded-lg"
                    >
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">{user.name}</span>
                    </Button>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem className="cursor-pointer">
                    <Link
                      href={`/${locale}/favorites`}
                      className="flex items-center w-full"
                    >
                      {t('favorites')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Link
                      href={`/${locale}/cook`}
                      className="flex items-center w-full"
                    >
                      {t('cook')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={logout}
                    className="cursor-pointer text-red-600"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex space-x-2">
                <div className="transition-all duration-200 hover:scale-105 active:scale-95">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/${locale}/auth/login`}>{t('login')}</Link>
                  </Button>
                </div>
                <div className="transition-all duration-200 hover:scale-105 active:scale-95">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-brand-blue to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md"
                    asChild
                  >
                    <Link href={`/${locale}/auth/signup`}>{t('signup')}</Link>
                  </Button>
                </div>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all duration-200 hover:scale-105 active:scale-95"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white transition-all duration-200 ease-out">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item, _index) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <div
                    key={item.href}
                    className="transition-all duration-200 ease-out"
                    style={{
                      animationDelay: `${_index * 50}ms`,
                      opacity: 1,
                      transform: 'translateX(0)',
                    }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                        isActive
                          ? 'text-brand-blue bg-blue-50'
                          : 'text-gray-600 hover:text-brand-blue hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
