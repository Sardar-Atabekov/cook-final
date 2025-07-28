import React from 'react';
import { HomePageClient } from './home-page-client';

const locales = [
  'en',
  'ru',
  'de',
  'es',
  'zh',
  'fr',
  'ro',
  'sk',
  'tr',
  'sv',
  'sr',
  'pt',
  'pl',
  'nl',
  'ja',
  'it',
  'id',
  'hu',
  'hi',
  'he',
  'fi',
  'el',
  'da',
  'cs',
  'bg',
  'be',
];

// Generate static params for all locales
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function HomePage() {
  return <HomePageClient />;
}
