"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Filter } from "lucide-react"

export interface FilterState {
  mealType: string
  country: string
  dietTags: string[]
}

interface RecipeFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
}

const mealTypes = [
  { value: "all", label: "All Meals" },
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snack", label: "Snack" },
]

const countries = [
  { value: "all", label: "All Countries" },
  { value: "Italy", label: "Italian" },
  { value: "China", label: "Chinese" },
  { value: "Mexico", label: "Mexican" },
  { value: "USA", label: "American" },
  { value: "India", label: "Indian" },
  { value: "France", label: "French" },
]

const dietTags = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "gluten-free", label: "Gluten Free" },
  { value: "dairy-free", label: "Dairy Free" },
  { value: "low-carb", label: "Low Carb" },
  { value: "healthy", label: "Healthy" },
]

export function RecipeFilters({ filters, onFiltersChange }: RecipeFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleDietTagChange = (tag: string, checked: boolean) => {
    const newDietTags = checked ? [...filters.dietTags, tag] : filters.dietTags.filter((t) => t !== tag)

    onFiltersChange({ ...filters, dietTags: newDietTags })
  }

  const clearFilters = () => {
    onFiltersChange({
      mealType: "all",
      country: "all",
      dietTags: [],
    })
  }

  const activeFiltersCount = [
    filters.mealType !== "all" ? 1 : 0,
    filters.country !== "all" ? 1 : 0,
    filters.dietTags.length,
  ].reduce((a, b) => a + b, 0)

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      {/* Desktop Filters */}
      <div className="hidden md:flex items-center space-x-4">
        <Select value={filters.mealType} onValueChange={(value) => onFiltersChange({ ...filters, mealType: value })}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Meal Type" />
          </SelectTrigger>
          <SelectContent>
            {mealTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.country} onValueChange={(value) => onFiltersChange({ ...filters, country: value })}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            {countries.map((country) => (
              <SelectItem key={country.value} value={country.value}>
                {country.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {activeFiltersCount > 0 && (
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Clear Filters ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Mobile Filter Sheet */}
      <div className="md:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filter Recipes</SheetTitle>
              <SheetDescription>Narrow down your recipe search with these filters.</SheetDescription>
            </SheetHeader>

            <div className="space-y-6 mt-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Meal Type</label>
                <Select
                  value={filters.mealType}
                  onValueChange={(value) => onFiltersChange({ ...filters, mealType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mealTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Country</label>
                <Select
                  value={filters.country}
                  onValueChange={(value) => onFiltersChange({ ...filters, country: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.value} value={country.value}>
                        {country.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-3 block">Diet Tags</label>
                <div className="space-y-3">
                  {dietTags.map((tag) => (
                    <div key={tag.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={tag.value}
                        checked={filters.dietTags.includes(tag.value)}
                        onCheckedChange={(checked) => handleDietTagChange(tag.value, checked as boolean)}
                      />
                      <label htmlFor={tag.value} className="text-sm">
                        {tag.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={clearFilters} variant="outline" className="w-full bg-transparent">
                Clear All Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
