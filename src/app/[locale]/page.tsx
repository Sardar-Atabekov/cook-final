import { HomePageClient } from './home-page-client';

const locales = ['en', 'ru', 'de', 'es', 'zh', 'fr'];

// Generate static params for all locales
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function HomePage() {
  return <HomePageClient />;
}
