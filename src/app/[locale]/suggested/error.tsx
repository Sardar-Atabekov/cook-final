'use client';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import React from 'react';

export function SuggestedPageError({
  locale,
  variant = 'error',
}: {
  locale: string;
  variant?: 'error' | 'no-data' | 'timeout';
}) {
  const handleRetry = () => {
    window.location.reload();
  };

  const getErrorContent = () => {
    switch (variant) {
      case 'no-data':
        return {
          title: 'No Recipes Available',
          description:
            "We couldn't find any recipes at the moment. This might be temporary.",
          icon: (
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          ),
        };
      case 'timeout':
        return {
          title: 'Loading Timeout',
          description:
            'The request is taking too long. Please check your connection and try again.',
          icon: <RefreshCw className="h-12 w-12 text-blue-500 mx-auto mb-4" />,
        };
      default:
        return {
          title: 'Something went wrong',
          description:
            "We couldn't load the suggested recipes. Please try again.",
          icon: <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />,
        };
    }
  };

  const { title, description, icon } = getErrorContent();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
          {icon}
          <h1 className="text-2xl font-bold text-slate-900 mb-4">{title}</h1>
          <p className="text-slate-600 mb-6">{description}</p>
          <div className="space-y-3">
            <Button
              onClick={handleRetry}
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="w-full"
            >
              Go Back
            </Button>
          </div>

          {/* Helpful links */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-sm text-slate-500 mb-3">
              Or try these alternatives:
            </p>
            <div className="flex flex-col space-y-2">
              <a
                href={`/${locale}/recipes`}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Browse All Recipes
              </a>
              <a
                href={`/${locale}/`}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Go to Homepage
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
