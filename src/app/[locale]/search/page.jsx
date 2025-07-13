import { ingredientsApi } from '@/lib/api';
import { IngredientSidebar } from '@/components/ingredient-sidebar';
import { RecipeGridWrapper } from '@/components/recipe-grid-wrapper';

// SSR/SSG page for /search

// Кэшируем страницу на 1 час для ускорения загрузки
export const revalidate = 36000;

export default async function SearchPage({ params }) {
  const { locale } = await params;
  // Получаем категории на сервере (SSR/SSG)
  let initialGroupedCategories = [];
  try {
    initialGroupedCategories =
      await ingredientsApi.getGroupedIngredients(locale);
  } catch (e) {
    // fallback: пусть будет пусто, если API недоступен
    initialGroupedCategories = [];
  }

  // Note: RecipeGrid and other main content are rendered as before
  // IngredientSidebar gets initialGroupedCategories for instant SSR/SSG hydration

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <IngredientSidebar
          className="block sticky top-0 h-screen"
          initialGroupedCategories={initialGroupedCategories}
        />
        <main className="flex-1 h-full overflow-y-auto p-6 mb-10">
          {/* RecipeGrid gets selectedIngredients from Zustand on the client */}
          <RecipeGridWrapper />
        </main>
      </div>
    </div>
  );
}
