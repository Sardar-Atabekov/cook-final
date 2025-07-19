import { Suspense } from 'react';
import { recipeApi } from '@/lib/api';
import { SuggestedClient } from './SuggestedClient';

export default async function SuggestedPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params.locale;
  // 1. Получаем mealTypes (теги)
  const tags = await recipeApi.getAllTagsSSR();
  const mealTypes = Array.isArray(tags)
    ? tags.filter((t: any) => t.type === 'meal_type')
    : [];
  function getMealTypeId(type: string): string | undefined {
    const found = mealTypes.find(
      (t: any) => t.slug === type || t.name.toLowerCase() === type
    );
    return found ? found.id.toString() : undefined;
  }
  const breakfastId = getMealTypeId('breakfast');
  const lunchId = getMealTypeId('lunch');
  const dinnerId = getMealTypeId('main');

  // 2. Получаем рецепты для каждого типа (без ингредиентов, т.к. на первой загрузке их нет)
  const breakfastRecipes = breakfastId
    ? (await recipeApi.getRecipes(
        [],
        {
          offset: 0,
          limit: 20,
          mealType: breakfastId,
          country: '',
          dietTags: '',
        },
        locale
      )) || []
    : [];
  const lunchRecipes = lunchId
    ? (await recipeApi.getRecipes(
        [],
        { offset: 0, limit: 20, mealType: lunchId, country: '', dietTags: '' },
        locale
      )) || []
    : [];
  const dinnerRecipes = dinnerId
    ? (
        await recipeApi.getRecipes(
          [],
          {
            offset: 0,
            limit: 20,
            mealType: dinnerId,
            country: '',
            dietTags: '',
          },
          locale
        )
      ).recipes || []
    : [];
  // 3. More Inspiration
  const randomRecipes =
    (
      await recipeApi.getRecipes(
        [],
        { offset: 0, limit: 20, mealType: '', country: '', dietTags: '' },
        locale
      )
    ).recipes || [];

  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <SuggestedClient
          locale={locale}
          initialTags={tags}
          initialBreakfast={breakfastRecipes}
          initialLunch={lunchRecipes}
          initialDinner={dinnerRecipes}
          initialRandom={randomRecipes}
        />
      </Suspense>
    </>
  );
}
