import { redirect } from 'next/navigation';

export default function RootPage() {
  // Этот компонент не должен рендериться, так как middleware должен перехватить запрос
  // Но на всякий случай добавим fallback редирект на русский язык
  redirect('/ru');
}
