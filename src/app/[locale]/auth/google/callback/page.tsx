'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/useAuthStore';
import { useLocale, useTranslations } from 'next-intl';
import { useGoogleAuthMutation } from '@/hooks/use-auth-mutation';
import { LoadingSpinner } from '@/components/loading-spinner';

export default function GoogleCallbackPage() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { login } = useAuthStore();
  const t = useTranslations('auth');
  const locale = useLocale();
  const googleAuthMutation = useGoogleAuthMutation();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (code) {
      googleAuthMutation.mutate(
        { code },
        {
          onSuccess: (data) => {
            login(data.token, data.user);

            // Отправляем сообщение в родительское окно (если это popup)
            if (window.opener) {
              window.opener.postMessage(
                {
                  type: 'GOOGLE_AUTH_SUCCESS',
                  token: data.token,
                  user: data.user,
                },
                '*'
              );
              window.close();
            } else {
              // Если это не popup, показываем уведомление и перенаправляем
              toast({
                title: t('loginSuccess'),
                description: t('loginSuccessDescription'),
              });
              window.location.href = `/${locale}`;
            }
          },
          onError: (error) => {
            // Отправляем сообщение об ошибке в родительское окно (если это popup)
            if (window.opener) {
              window.opener.postMessage(
                {
                  type: 'GOOGLE_AUTH_ERROR',
                  error: t('loginErrorDescription'),
                },
                '*'
              );
              window.close();
            } else {
              // Если это не popup, показываем уведомление и перенаправляем
              toast({
                title: t('loginError'),
                description: t('loginErrorDescription'),
                variant: 'destructive',
              });
              window.location.href = `/${locale}/auth/login`;
            }
          },
        }
      );
    } else if (error) {
      console.error('Google OAuth error:', error);

      // Отправляем сообщение об ошибке в родительское окно (если это popup)
      if (window.opener) {
        window.opener.postMessage(
          {
            type: 'GOOGLE_AUTH_ERROR',
            error: t('loginErrorDescription'),
          },
          '*'
        );
        window.close();
      } else {
        // Если это не popup, показываем уведомление и перенаправляем
        toast({
          title: t('loginError'),
          description: t('loginErrorDescription'),
          variant: 'destructive',
        });
        window.location.href = `/${locale}/auth/login`;
      }
    }
  }, [searchParams, googleAuthMutation, login, toast, locale, t]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">{t('signingInWithGoogle')}</p>
      </div>
    </div>
  );
}
