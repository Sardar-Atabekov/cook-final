import CookServerPage from './CookServerPage';

export default function Page({ params }: { params: { locale: string } }) {
  return <CookServerPage params={params} />;
}
