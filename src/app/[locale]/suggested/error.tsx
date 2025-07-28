'use client';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import React from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            Что-то пошло не так
          </h1>
          <p className="text-slate-600 mb-6">
            Не удалось загрузить рекомендованные рецепты. Попробуйте обновить
            страницу.
            <br />
            <span className="text-xs text-slate-400">{error?.message}</span>
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => reset()}
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Попробовать снова
            </Button>
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="w-full"
            >
              Назад
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
