"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin } from "lucide-react";
import type { Recipe } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";

interface RecipeCardProps {
  recipe: Recipe;
  userIngredients?: string[];
}

export function RecipeCard({ recipe, userIngredients = [] }: RecipeCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-100 text-green-800";
    if (percentage >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <Link href={`/${locale}/recipes/${recipe.id}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer">
        <div className="relative">
          <Image
            src={recipe.image || "/images/images/placeholder.svg"}
            alt={recipe.title}
            width={300}
            height={200}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 right-2">
            <Badge
              className={cn(
                "text-xs font-medium",
                getMatchColor(recipe.matchPercentage)
              )}
            >
              {recipe.matchPercentage}% Match
            </Badge>
          </div>
          {recipe.dietTags.length > 0 && (
            <div className="absolute top-2 left-2">
              <Badge
                variant="secondary"
                className="text-xs bg-white/90 text-gray-700"
              >
                {recipe.dietTags[0]}
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {recipe.title}
          </h3>

          <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{recipe.cookingTime} mins</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>{recipe.country}</span>
            </div>
          </div>

          {recipe.missingIngredients.length > 0 && (
            <div className="text-xs text-gray-500">
              <span className="font-medium">Missing: </span>
              <span>{recipe.missingIngredients.slice(0, 3).join(", ")}</span>
              {recipe.missingIngredients.length > 3 && (
                <span> +{recipe.missingIngredients.length - 3} more</span>
              )}
            </div>
          )}

          {recipe.missingIngredients.length === 0 &&
            userIngredients.length > 0 && (
              <div className="text-xs text-green-600 font-medium">
                ✓ You have all ingredients!
              </div>
            )}
        </CardContent>
      </Card>
    </Link>
  );
}
