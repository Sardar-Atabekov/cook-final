import { useSearchParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { useState, useEffect } from 'react';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  placeholder = 'Поиск рецептов...',
  className,
}: SearchBarProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlValue = searchParams.get('q') || '';
  const [value, setValue] = useState(urlValue);

  // Debounce обновления URL
  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set('q', value);
      else params.delete('q');
      params.delete('page');
      if (value !== urlValue) {
        router.replace(`?${params.toString()}`, { scroll: false });
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [value]);

  // Синхронизация value с urlValue при смене фильтров/URL
  useEffect(() => {
    setValue(urlValue);
  }, [urlValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleClear = () => {
    setValue('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    params.delete('page');
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className={cn('relative flex items-center', className)}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          className="pl-10 pr-10"
        />
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
