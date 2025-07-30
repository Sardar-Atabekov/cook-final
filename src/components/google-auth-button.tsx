'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/useAuthStore';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useGoogleAuthMutation } from '@/hooks/use-auth-mutation';

export function GoogleAuthButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login } = useAuthStore();
  const router = useRouter();
  const t = useTranslations('auth');
  const locale = useLocale();
  const googleAuthMutation = useGoogleAuthMutation();

  const handleGoogleAuth = async () => {
    setIsLoading(true);

    try {
      // Открываем Google OAuth в новом окне
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        `${process.env.NEXT_PUBLIC_SERVER || 'http://localhost:5000'}/auth/google?redirect_uri=${encodeURIComponent(window.location.origin + '/auth/google/callback')}`,
        'googleAuth',
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
      );

      if (!popup) {
        toast({
          title: t('popupBlocked'),
          description: t('popupBlockedDescription'),
          variant: 'destructive',
        });
        return;
      }

      // Слушаем сообщения от popup окна
      const handleMessage = (event: MessageEvent) => {
        if (
          event.origin !==
          (process.env.NEXT_PUBLIC_SERVER || 'http://localhost:5000')
        ) {
          return;
        }

        if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
          const { token, user } = event.data;
          login(token, user);
          toast({
            title: t('loginSuccess'),
            description: t('loginSuccessDescription'),
          });
          router.push(`/${locale}`);
          popup.close();
          window.removeEventListener('message', handleMessage);
        } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
          toast({
            title: t('loginError'),
            description: event.data.error || t('loginErrorDescription'),
            variant: 'destructive',
          });
          popup.close();
          window.removeEventListener('message', handleMessage);
        }
      };

      window.addEventListener('message', handleMessage);

      // Проверяем, закрылось ли окно
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
          setIsLoading(false);
        }
      }, 1000);
    } catch (error) {
      console.error('Google auth error:', error);
      toast({
        title: t('loginError'),
        description: t('loginErrorDescription'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full bg-white hover:bg-gray-50 border-gray-300 text-gray-700"
      onClick={handleGoogleAuth}
      disabled={isLoading || googleAuthMutation.isPending}
    >
      <svg
        className="w-5 h-5 mr-2"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
      {isLoading || googleAuthMutation.isPending
        ? t('signingInWithGoogle')
        : t('signInWithGoogle')}
    </Button>
  );
}
