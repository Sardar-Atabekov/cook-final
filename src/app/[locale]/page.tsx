"use client";

import { Button } from "@/components/ui/button";
import { IngredientInput } from "@/components/ingredient-input";
import { useStore } from "@/lib/store";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChefHat, Search, Clock, Users } from "lucide-react";

export default function HomePage() {
  const { ingredients } = useStore();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations("home");

  const handleFindRecipes = () => {
    if (ingredients.length > 0) {
      const searchParams = new URLSearchParams({
        ingredients: ingredients.join(","),
      });
      router.push(`/${locale}/recipes?${searchParams.toString()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-orange-100 rounded-full">
                <ChefHat className="h-16 w-16 text-orange-600" />
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              {t("title")}
            </h1>

            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              {t("subtitle")}
            </p>

            <div className="mb-8">
              <IngredientInput />
            </div>

            <Button
              onClick={handleFindRecipes}
              disabled={ingredients.length === 0}
              size="lg"
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 text-lg"
            >
              <Search className="h-5 w-5 mr-2" />
              {t("findRecipes")} (
              {t("ingredientsCount", { count: ingredients.length })})
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t("howItWorks")}
            </h2>
            <p className="text-lg text-gray-600">{t("howItWorksSubtitle")}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("step1Title")}</h3>
              <p className="text-gray-600">{t("step1Description")}</p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("step2Title")}</h3>
              <p className="text-gray-600">{t("step2Description")}</p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("step3Title")}</h3>
              <p className="text-gray-600">{t("step3Description")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-orange-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            {t("readyToCook")}
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            {t("readyToCookSubtitle")}
          </p>
          <Button
            onClick={() => document.querySelector("input")?.focus()}
            size="lg"
            variant="secondary"
            className="bg-white text-orange-600 hover:bg-gray-100"
          >
            {t("addFirstIngredient")}
          </Button>
        </div>
      </div>
    </div>
  );
}
