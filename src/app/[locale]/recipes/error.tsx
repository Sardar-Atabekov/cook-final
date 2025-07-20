'use client';
export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
      <h1 className="text-2xl font-bold text-red-600 mb-4">
        Ошибка загрузки рецептов
      </h1>
      <p className="text-gray-600 mb-4">
        {error.message || 'Что-то пошло не так при загрузке списка рецептов.'}
      </p>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        onClick={() => reset()}
      >
        Попробовать снова
      </button>
    </div>
  );
}
