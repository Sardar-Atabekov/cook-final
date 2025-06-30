"use client";

import { Button } from "@/components/ui/button";
import { IngredientInput } from "@/components/ingredient-input";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { ChefHat, Search, Clock, Users } from "lucide-react";

export default function HomePage() {
  const { ingredients } = useStore();
  const router = useRouter();

  const handleFindRecipes = () => {
    if (ingredients.length > 0) {
      const params = new URLSearchParams({
        ingredients: ingredients.join(","),
      });
      router.push(`/recipes?${params.toString()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-blue-100 rounded-full">
                <ChefHat className="h-16 w-16 text-blue-600" />
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Find Recipes with
              <span className="text-blue-600 block">Your Ingredients</span>
            </h1>

            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Turn the ingredients you have at home into delicious meals. No
              more wondering "what can I cook with this?"
            </p>

            <div className="mb-8">
              <IngredientInput />
            </div>

            <Button
              onClick={handleFindRecipes}
              disabled={ingredients.length === 0}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
            >
              <Search className="h-5 w-5 mr-2" />
              Find Recipes ({ingredients.length} ingredients)
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Three simple steps to discover your next favorite meal
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Add Ingredients</h3>
              <p className="text-gray-600">
                Tell us what ingredients you have in your kitchen
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Matches</h3>
              <p className="text-gray-600">
                See recipes ranked by how many ingredients you already have
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Start Cooking</h3>
              <p className="text-gray-600">
                Follow step-by-step instructions to create amazing meals
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-brand-blue py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Cooking?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of home cooks who never run out of meal ideas
          </p>
          <Button
            onClick={() => document.querySelector("input")?.focus()}
            size="lg"
            variant="secondary"
            className="bg-white text-blue-600 hover:bg-gray-100"
          >
            Add Your First Ingredient
          </Button>
        </div>
      </div>
    </div>
  );
}
