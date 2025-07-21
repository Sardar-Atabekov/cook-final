import { useSearchParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Sparkles, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { useState, useEffect, useCallback, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
  showSuggestions?: boolean;
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      placeholder = 'Поиск рецептов...',
      className,
      onSearch,
      showSuggestions = false,
    },
    ref
  ) => {
    const t = useTranslations('ux.input');
    const searchParams = useSearchParams();
    const router = useRouter();
    const urlValue = searchParams.get('q') || '';
    const [value, setValue] = useState(urlValue);
    const [isFocused, setIsFocused] = useState(false);
    const [showClear, setShowClear] = useState(false);

    // Debounce обновления URL
    useEffect(() => {
      const handler = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) params.set('q', value);
        else params.delete('q');
        params.delete('page');
        if (value !== urlValue) {
          router.replace(`?${params.toString()}`, { scroll: false });
          onSearch?.(value);
        }
      }, 300);
      return () => clearTimeout(handler);
    }, [value, urlValue, searchParams, router, onSearch]);

    // Синхронизация value с urlValue при смене фильтров/URL
    useEffect(() => {
      setValue(urlValue);
    }, [urlValue]);

    // Показывать кнопку очистки только если есть значение
    useEffect(() => {
      setShowClear(!!value);
    }, [value]);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
      },
      []
    );

    const handleClear = useCallback(() => {
      setValue('');
      const params = new URLSearchParams(searchParams.toString());
      params.delete('q');
      params.delete('page');
      router.replace(`?${params.toString()}`, { scroll: false });
      onSearch?.('');
    }, [searchParams, router, onSearch]);

    const handleFocus = useCallback(() => {
      setIsFocused(true);
    }, []);

    const handleBlur = useCallback(() => {
      setIsFocused(false);
    }, []);

    const handleSubmit = useCallback(
      (e: React.FormEvent) => {
        e.preventDefault();
        onSearch?.(value);
      },
      [value, onSearch]
    );

    const popularSearches = [
      { text: 'Паста', icon: '🍝' },
      { text: 'Салат', icon: '🥗' },
      { text: 'Супы', icon: '🍲' },
      { text: 'Десерты', icon: '🍰' },
      { text: 'Завтрак', icon: '🥞' },
      { text: 'Ужин', icon: '🍽️' },
    ];

    return (
      <motion.div
        className={cn('relative', className)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <form onSubmit={handleSubmit}>
          <div className="relative flex items-center h-14">
            <motion.div
              className="relative flex-1 flex items-center"
              whileHover={{ scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {/* Search Icon */}
              <motion.div
                className="absolute left-4 -translate-y-1/2 text-gray-400 z-10"
                animate={{
                  scale: isFocused ? 1.2 : 1,
                  color: isFocused ? '#3b82f6' : '#9ca3af',
                }}
                transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
              >
                <Search className="w-5 h-5" />
              </motion.div>

              {/* Input */}
              <Input
                ref={ref}
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className={cn(
                  'pl-12 pr-12 h-14 text-lg border-2 transition-all duration-300 rounded-2xl bg-white/80 backdrop-blur-sm',
                  isFocused
                    ? 'border-blue-500 shadow-xl shadow-blue-500/20 ring-4 ring-blue-500/10'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-lg',
                  'focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:shadow-xl focus:shadow-blue-500/20'
                )}
              />

              {/* Clear Button */}
              <AnimatePresence>
                {showClear && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0, rotate: -90 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0, rotate: 90 }}
                    transition={{
                      duration: 0.3,
                      type: 'spring',
                      stiffness: 300,
                    }}
                    className="absolute right-3 -translate-y-1/2"
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleClear}
                      className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 rounded-full transition-all duration-300 flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Animated focus ring */}
              <AnimatePresence>
                {isFocused && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl border-2 border-blue-500 pointer-events-none"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </AnimatePresence>
            </motion.div>

            {/* Search Button */}
            <motion.div
              className="ml-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                type="submit"
                className="h-14 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl font-medium"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                {t('search')}
              </Button>
            </motion.div>
          </div>
        </form>

        {/* Enhanced Suggestions */}
        <AnimatePresence>
          {showSuggestions && isFocused && (
            <motion.div
              className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-2xl shadow-2xl z-50 overflow-hidden"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <TrendingUp className="w-4 h-4 text-blue-500 mr-2" />
                  <p className="text-sm font-medium text-gray-700">
                    Популярные запросы:
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {popularSearches.map((suggestion, index) => (
                    <motion.button
                      key={suggestion.text}
                      className="flex items-center w-full text-left px-4 py-3 text-sm hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-300 border border-transparent hover:border-blue-200"
                      onClick={() => setValue(suggestion.text)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ x: 5, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="text-lg mr-3">{suggestion.icon}</span>
                      <span className="font-medium text-gray-700">
                        {suggestion.text}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }
);

SearchBar.displayName = 'SearchBar';
