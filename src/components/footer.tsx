'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

export default function Footer() {
  const t = useTranslations('footer');
  console.log(t, t);
  return (
    <footer className="bg-slate-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-xl font-bold">
                {t('footer.projectName')}
              </span>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              {t('footer.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">
              {t('footer.explore')}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/recipes"
                  className="text-slate-400 hover:text-white"
                >
                  {t('footer.popularRecipes')}
                </Link>
              </li>
              <li>
                <Link
                  href="/suggested"
                  className="text-slate-400 hover:text-white"
                >
                  {t('footer.suggestedMeals')}
                </Link>
              </li>
              <li>
                <Link
                  href="/recipes?type=quick"
                  className="text-slate-400 hover:text-white"
                >
                  {t('footer.quickMeals')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-slate-400 hover:text-white">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-400 hover:text-white">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-400 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-white mb-4">Stay Updated</h3>
            <p className="text-slate-400 text-sm mb-4">
              Get weekly recipe suggestions and cooking tips.
            </p>
            <Button className="w-full bg-brand-blue hover:bg-blue-700">
              <Link href="/api/login">Sign Up for Updates</Link>
            </Button>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 mt-12 text-center">
          <p className="text-slate-400 text-sm">
            © 2025 RecipeMatch. All rights reserved. Made with ❤️ for food
            lovers.
          </p>
        </div>
      </div>
    </footer>
  );
}
