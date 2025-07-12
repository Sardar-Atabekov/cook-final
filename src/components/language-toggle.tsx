'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { getAvailableLocales } from '@/lib/locale-utils';
import { useLanguageStore } from '@/stores/useLanguageStore';

const allLanguages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
];

const availableLocales = getAvailableLocales();
const languages = allLanguages.filter((lang) =>
  availableLocales.includes(lang.code)
);

export function LanguageToggle() {
  const currentLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  const switchLanguage = (newLocale: string) => {
    if (newLocale === currentLocale) return; // чтобы не перезапускать зря

    // Обновляем стор, увеличиваем version
    setLanguage(newLocale);

    // Меняем путь, заменяя текущий префикс языка на новый
    const currentPathWithoutLocale = pathname.replace(`/${currentLocale}`, '');
    router.push(`/${newLocale}${currentPathWithoutLocale}`);
  };

  const currentLanguage = languages.find((lang) => lang.code === currentLocale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center space-x-2"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline font-medium">
            {currentLanguage?.flag?.toUpperCase()}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => switchLanguage(language.code)}
          >
            <span className="mr-2">{language.flag}</span>
            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
