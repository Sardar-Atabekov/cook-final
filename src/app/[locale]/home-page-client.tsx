'use client';

import { useMemo, useRef } from 'react';
import Footer from '@/components/footer';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useLocale, useTranslations } from 'next-intl';
import { IngredientInput } from '@/components/ingredient-input';
import { QuickActionCard } from '@/components/quick-action-card';
import { useIngredientStore } from '@/stores/useIngredientStore';

import { ChefHat, Search, Clock, Users, Star, Dice6 } from 'lucide-react';

type QuickAction = 'quick' | 'popular' | 'random' | 'suggested';

const quickActions: {
  icon: React.ElementType;
  color: string;
  titleKey: string;
  descriptionKey: string;
  action: QuickAction;
}[] = [
  {
    icon: Clock,
    color: 'text-brand-green',
    titleKey: 'recommended',
    descriptionKey: 'recommendedDescription',
    action: 'suggested',
  },
  {
    icon: Clock,
    color: 'text-brand-green',
    titleKey: 'quickMeals',
    descriptionKey: 'quickMealsDescription',
    action: 'quick',
  },
  {
    icon: Star,
    color: 'text-amber-500',
    titleKey: 'popularToday',
    descriptionKey: 'trendingRecipes',
    action: 'popular',
  },
  {
    icon: Dice6,
    color: 'text-purple-500',
    titleKey: 'surpriseMe',
    descriptionKey: 'randomRecipe',
    action: 'random',
  },
];

export function HomePageClient() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('home');
  const { selectedIngredients: ingredients } = useIngredientStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const joinedIngredients = useMemo(() => ingredients.join(','), [ingredients]);

  const handleFindRecipes = () => {
    if (joinedIngredients) {
      const searchParams = new URLSearchParams({
        ingredients: joinedIngredients,
      });
      router.push(`/${locale}/recipes?${searchParams.toString()}`);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    const paths: Record<QuickAction, string> = {
      quick: `/${locale}/recipes?sort=quick`,
      popular: `/${locale}/recipes?sort=popular`,
      random: `/${locale}/recipes?sort=random`,
    };
    router.push(paths[action]);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50">
      <section className="relative overflow-hidden">
        <div className="max-w-4xl  mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-blue-100 rounded-full">
                <ChefHat className="h-16 w-16 text-blue-600" />
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              {t('title')}
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              {t('subtitle')}
            </p>

            {/* <div className="mb-8">
              <IngredientInput ref={inputRef} />
            </div> */}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mt-5">
            {quickActions.map(
              ({ icon, color, titleKey, descriptionKey, action }) => (
                <QuickActionCard
                  key={action}
                  icon={icon}
                  color={color}
                  title={t(titleKey)}
                  description={t(descriptionKey)}
                  onClick={() => handleQuickAction(action)}
                />
              )
            )}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('howItWorks')}
            </h2>
            <p className="text-lg text-gray-600">{t('howItWorksSubtitle')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[Search, Clock, Users].map((Icon, idx) => (
              <div className="text-center" key={idx}>
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {t(`step${idx + 1}Title`)}
                </h3>
                <p className="text-gray-600">
                  {t(`step${idx + 1}Description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-blue-600 py-16 mb-12 mt-6">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            {t('readyToCook')}
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            {t('readyToCookSubtitle')}
          </p>
          <Button
            onClick={() => inputRef.current?.focus()}
            size="lg"
            variant="secondary"
            className="bg-white text-blue-600 hover:bg-gray-100"
          >
            {t('addFirstIngredient')}
          </Button>
        </div>
      </section>

      <Footer />
    </main>
  );
}
