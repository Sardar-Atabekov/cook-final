import type { MetadataRoute } from "next"

const locales = ["en", "ru", "de", "es", "zh", "ar", "fr"]
const baseUrl = "https://recipefinder.com"

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/recipes", "/suggested", "/auth/login", "/auth/signup"]

  const sitemapEntries: MetadataRoute.Sitemap = []

  locales.forEach((locale) => {
    routes.forEach((route) => {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === "" ? "daily" : "weekly",
        priority: route === "" ? 1 : 0.8,
        alternates: {
          languages: Object.fromEntries(locales.map((loc) => [loc, `${baseUrl}/${loc}${route}`])),
        },
      })
    })
  })

  return sitemapEntries
}
