'use client';

import { useMemo, useRef, useEffect, useState } from 'react';
import Footer from '@/components/footer';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useLocale, useTranslations } from 'next-intl';
import { IngredientInput } from '@/components/ingredient-input';
import { QuickActionCard } from '@/components/quick-action-card';
import { useIngredientStore } from '@/stores/useIngredientStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChefHat,
  Search,
  Clock,
  Users,
  Star,
  Dice6,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

type QuickAction = 'quick' | 'popular' | 'random' | 'suggested';

const quickActions: {
  icon: React.ElementType;
  color: string;
  titleKey: string;
  descriptionKey: string;
  action: QuickAction;
  gradient: string;
}[] = [
  {
    icon: Clock,
    color: 'text-brand-green',
    titleKey: 'recommended',
    descriptionKey: 'recommendedDescription',
    action: 'suggested',
    gradient: 'from-green-400 to-emerald-500',
  },
  {
    icon: Star,
    color: 'text-amber-500',
    titleKey: 'popularToday',
    descriptionKey: 'trendingRecipes',
    action: 'popular',
    gradient: 'from-amber-400 to-orange-500',
  },
  {
    icon: Dice6,
    color: 'text-purple-500',
    titleKey: 'surpriseMe',
    descriptionKey: 'randomRecipe',
    action: 'random',
    gradient: 'from-purple-400 to-pink-500',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

export function HomePageClient() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('home');
  const { selectedIngredients: ingredients } = useIngredientStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const joinedIngredients = useMemo(() => ingredients.join(','), [ingredients]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

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
      suggested: `/${locale}/suggested`,
    };
    router.push(paths[action]);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50">
      <motion.section
        className="relative overflow-hidden"
        initial="hidden"
        animate={isVisible ? 'visible' : 'hidden'}
        variants={containerVariants}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 relative z-10">
          <motion.div className="text-center" variants={itemVariants}>
            <motion.div
              className="flex justify-center mb-6"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="p-4 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full shadow-lg">
                <ChefHat className="h-16 w-16 text-blue-600" />
              </div>
            </motion.div>

            <motion.h1
              className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent"
              variants={itemVariants}
            >
              {t('title')}
            </motion.h1>

            <motion.p
              className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed"
              variants={itemVariants}
            >
              {t('subtitle')}
            </motion.p>

            {ingredients.length > 0 && (
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  onClick={handleFindRecipes}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Search className="w-5 h-5 mr-2" />
                  {t('findRecipes')}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-8"
            variants={containerVariants}
          >
            {quickActions.map(
              (
                { icon, color, titleKey, descriptionKey, action, gradient },
                index
              ) => (
                <motion.div
                  key={action}
                  variants={itemVariants}
                  whileHover={{
                    scale: 1.05,
                    transition: { type: 'spring', stiffness: 300 },
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <QuickActionCard
                    icon={icon}
                    color={color}
                    title={t(titleKey)}
                    description={t(descriptionKey)}
                    onClick={() => handleQuickAction(action)}
                    gradient={gradient}
                  />
                </motion.div>
              )
            )}
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        className="bg-white py-16 relative"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-blue-600 mr-3" />
              {t('howItWorks')}
            </h2>
            <p className="text-lg text-gray-600">{t('howItWorksSubtitle')}</p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[Search, Clock, Users].map((Icon, idx) => (
              <motion.div
                className="text-center group"
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -10 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="bg-gradient-to-r from-blue-100 to-blue-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-all duration-300">
                  <Icon className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  {t(`step${idx + 1}Title`)}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t(`step${idx + 1}Description`)}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        className="bg-gradient-to-r from-blue-600 to-blue-700 py-16 mb-12 mt-6 relative overflow-hidden"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.h2
            className="text-3xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            {t('readyToCook')}
          </motion.h2>
          <motion.p
            className="text-xl text-blue-100 mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            viewport={{ once: true }}
          >
            {t('readyToCookSubtitle')}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            viewport={{ once: true }}
          >
            <Button
              onClick={() => inputRef.current?.focus()}
              size="lg"
              variant="secondary"
              className="bg-white text-blue-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              {t('addFirstIngredient')}
            </Button>
          </motion.div>
        </div>
      </motion.section>

      <Footer />
    </main>
  );
}
