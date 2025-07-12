'use client';
import { useState } from 'react';
import { IngredientSidebar } from '@/components/ingredient-sidebar';
import { RecipeGrid } from '@/components/recipe-grid';
import { PantryDrawer } from '@/components/pantry-drawer';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Plus, ChefHat } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePantry } from '@/hooks/usePantry';
import { useIngredientStore } from '@/stores/useIngredientStore';

export default function Home() {
  const { selectedIngredients, setSelectedIngredients } = useIngredientStore();
  const { pantryItems } = usePantry();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Desktop Sidebar */}
        <IngredientSidebar
          className="block sticky top-0 h-screen"
          selectedIngredients={selectedIngredients}
          onIngredientsChange={setSelectedIngredients}
        />

        {/* Main Content */}
        <main className="flex-1 h-full overflow-y-auto p-6 mb-10">
          <RecipeGrid selectedIngredients={selectedIngredients} />
        </main>

        {/* Mobile Ingredient Sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg md:hidden z-40"
              size="icon"
            >
              <Plus className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full max-w-md p-0">
            <IngredientSidebar
              selectedIngredients={selectedIngredients}
              onIngredientsChange={setSelectedIngredients}
            />
          </SheetContent>
        </Sheet>

        {/* Pantry Button */}
        {/* <PantryDrawer>
          <Button
            className="fixed bottom-6 right-20 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg z-40"
            size="icon"
          >
            <ChefHat className="w-6 h-6" />
            {pantryItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                {pantryItems.length}
              </span>
            )}
          </Button>
        </PantryDrawer> */}

        {/* Toast notifications */}
        <Toaster />
      </div>
    </div>
  );
}
