"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { recipeApi } from "@/lib/api";
import { Search, X, Plus } from "lucide-react";

export function IngredientInput() {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { ingredients, addIngredient, removeIngredient } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations("home");

  const { data: suggestions = [] } = useQuery({
    queryKey: ["ingredient-suggestions", query],
    queryFn: () => recipeApi.getIngredientSuggestions(query),
    enabled: query.length > 1,
  });

  const handleAddIngredient = (ingredient: string) => {
    addIngredient(ingredient);
    setQuery("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim()) {
      handleAddIngredient(query.trim());
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={t("searchPlaceholder")}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            className="pl-10 pr-12 h-12 text-lg"
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAddIngredient(query.trim())}
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 mt-1">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleAddIngredient(suggestion)}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-md last:rounded-b-md"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {ingredients.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {ingredients.map((ingredient) => (
            <Badge
              key={ingredient}
              variant="secondary"
              className="px-3 py-1 text-sm bg-orange-100 text-orange-800 hover:bg-orange-200"
            >
              {ingredient}
              <button
                onClick={() => removeIngredient(ingredient)}
                className="ml-2 hover:text-orange-900"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
