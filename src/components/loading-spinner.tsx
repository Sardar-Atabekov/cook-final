'use client';

import { motion } from 'framer-motion';
import { Loader2, ChefHat } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  variant?: 'default' | 'recipe' | 'minimal';
  className?: string;
}

export function LoadingSpinner({
  size = 'md',
  text,
  variant = 'default',
  className = '',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const containerClasses = {
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className={sizeClasses[size]}
        >
          <Loader2 className="w-full h-full text-blue-600" />
        </motion.div>
      </div>
    );
  }

  if (variant === 'recipe') {
    return (
      <div
        className={`flex flex-col items-center justify-center ${containerClasses[size]} ${className}`}
      >
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
            scale: { duration: 1, repeat: Infinity, ease: 'easeInOut' },
          }}
          className={`${sizeClasses[size]} text-blue-600`}
        >
          <ChefHat className="w-full h-full" />
        </motion.div>
        {text && (
          <motion.p
            className={`${textSizes[size]} text-gray-600 mt-2 font-medium`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {text}
          </motion.p>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center ${containerClasses[size]} ${className}`}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className={`${sizeClasses[size]} text-blue-600`}
      >
        <Loader2 className="w-full h-full" />
      </motion.div>
      {text && (
        <motion.p
          className={`${textSizes[size]} text-gray-600 mt-2 font-medium`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}

// Скелетон для карточек рецептов
export function RecipeCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
    >
      <div className="w-full h-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4 animate-shimmer" />
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-full animate-shimmer" />
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-2/3 animate-shimmer" />
        <div className="flex justify-between pt-2">
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-16 animate-shimmer" />
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-12 animate-shimmer" />
        </div>
      </div>
    </motion.div>
  );
}

// Скелетон для страницы рецепта
export function RecipePageSkeleton() {
  return (
    <motion.div
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-8 w-3/4" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    </motion.div>
  );
}

// Компонент Skeleton для переиспользования
function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer rounded ${className}`}
    />
  );
}
