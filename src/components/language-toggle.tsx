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
import { useIngredientStore } from '@/stores/useIngredientStore';

const allLanguages = [
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'bg', name: 'Български', flag: '🇧🇬' },
  { code: 'cs', name: 'Čeština', flag: '🇨🇿' },
  { code: 'da', name: 'Dansk', flag: '🇩🇰' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'el', name: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'fi', name: 'Suomi', flag: '🇫🇮' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'hu', name: 'Magyar', flag: '🇭🇺' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'he', name: 'עִברִית', flag: '🇮🇱' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ro', name: 'Română', flag: '🇷🇴' },
  { code: 'sk', name: 'Slovenčina', flag: '🇸🇰' },
  { code: 'sr', name: 'Српски', flag: '🇷🇸' },
  { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'be', name: 'Беларуская', flag: '🇧🇾' },
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
  const clearIngredientsOnLanguageChange = useIngredientStore(
    (state) => state.clearIngredientsOnLanguageChange
  );

  const switchLanguage = (newLocale: string) => {
    if (newLocale === currentLocale) return; // чтобы не перезапускать зря

    // Очищаем выбранные ингредиенты при смене языка
    clearIngredientsOnLanguageChange(newLocale);

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
      <DropdownMenuContent
        align="end"
        className="w-48 max-h-96 overflow-y-auto"
        side="bottom"
        sideOffset={4}
      >
        <div className="grid grid-cols-1 gap-0">
          {languages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => switchLanguage(language.code)}
              className="flex items-center justify-start px-3 py-2 text-sm cursor-pointer hover:bg-accent focus:bg-accent"
            >
              <span className="mr-3 text-base">{language.flag}</span>
              <span className="truncate">{language.name}</span>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
