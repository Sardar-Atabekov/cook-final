"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function Footer() {
  const locale = useLocale();
  const t = useTranslations("navigation");

  return (
    <footer className="bg-slate-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-xl font-bold">RecipeMatch</span>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              Find delicious recipes based on ingredients you already have at
              home. Cook smarter, waste less, eat better.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/recipes" className="text-slate-400 hover:text-white">
                  Popular Recipes
                </a>
              </li>
              <li>
                <a
                  href="/suggested"
                  className="text-slate-400 hover:text-white"
                >
                  Suggested Meals
                </a>
              </li>
              <li>
                <a
                  href="/recipes?type=quick"
                  className="text-slate-400 hover:text-white"
                >
                  Quick Meals
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-slate-400 hover:text-white">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white">
                  Privacy Policy
                </a>
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
              <a href="/api/login">Sign Up for Updates</a>
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
