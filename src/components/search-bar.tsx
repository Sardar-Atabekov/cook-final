import { useSearchParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { useState, useEffect, useCallback, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

    return (
      <motion.div
        className={cn('relative', className)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <form onSubmit={handleSubmit}>
          <div className="relative flex items-center">
            <motion.div
              className="relative flex-1"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {/* Search Icon */}
              <motion.div
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                animate={{
                  scale: isFocused ? 1.1 : 1,
                  color: isFocused ? '#3b82f6' : '#9ca3af',
                }}
                transition={{ duration: 0.2 }}
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
                  'pl-12 pr-12 h-12 text-lg border-2 transition-all duration-200',
                  isFocused
                    ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                    : 'border-gray-200 hover:border-gray-300',
                  'focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                )}
              />

              {/* Clear Button */}
              <AnimatePresence>
                {showClear && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleClear}
                      className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Focus indicator */}
              <AnimatePresence>
                {isFocused && (
                  <motion.div
                    className="absolute inset-0 rounded-lg border-2 border-blue-500 pointer-events-none"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </AnimatePresence>
            </motion.div>

            {/* Search Button */}
            <motion.div
              className="ml-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                type="submit"
                className="h-12 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Найти
              </Button>
            </motion.div>
          </div>
        </form>

        {/* Suggestions (placeholder for future implementation) */}
        <AnimatePresence>
          {showSuggestions && isFocused && value && (
            <motion.div
              className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-4">
                <p className="text-sm text-gray-500">Популярные запросы:</p>
                <div className="mt-2 space-y-1">
                  {['Паста', 'Салат', 'Супы', 'Десерты'].map(
                    (suggestion, index) => (
                      <motion.button
                        key={suggestion}
                        className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-md transition-colors"
                        onClick={() => setValue(suggestion)}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        {suggestion}
                      </motion.button>
                    )
                  )}
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
