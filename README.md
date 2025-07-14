# Cook Front - Recipe Search Application

A Next.js 15.2.4 application for searching and discovering recipes based on available ingredients. Built with TypeScript, Tailwind CSS, and TanStack Query.

## Features

- 🌍 **Internationalization**: Support for multiple languages (EN, RU, DE, ES, ZH, FR)
- 🔍 **Recipe Search**: Search recipes by ingredients or text
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎨 **Modern UI**: Built with shadcn/ui components
- ⚡ **Fast Performance**: Optimized with Next.js 15 and TanStack Query
- 🗂️ **Ingredient Management**: Select and manage ingredients with categories

## Tech Stack

- **Framework**: Next.js 15.2.4
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Internationalization**: next-intl
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Установка

1. Клонируйте репозиторий:

```bash
git clone <repository-url>
cd cook-front
```

2. Установите зависимости:

```bash
npm install
```

3. Настройте переменные окружения:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add:

```env
NEXT_PUBLIC_DEFAULT_LOCALE=en
NEXT_PUBLIC_AVAILABLE_LOCALES=en,ru,de,es,zh,fr
```

4. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── [locale]/          # Localized routes
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configurations
├── locales/              # Translation files
├── stores/               # Zustand stores
└── types/                # TypeScript type definitions
```

## Internationalization

The app supports multiple languages with automatic locale detection:

- **English** (`/en`) - Default
- **Russian** (`/ru`)
- **German** (`/de`)
- **Spanish** (`/es`)
- **Chinese** (`/zh`)
- **French** (`/fr`)

### Adding New Languages

1. Add the locale to `NEXT_PUBLIC_AVAILABLE_LOCALES` in `.env.local`
2. Create a translation file in `src/locales/[locale].json`
3. Update the middleware and i18n configuration

## API Integration

The app is designed to work with a backend API running on `http://localhost:5005`. When the backend is not available, the app gracefully shows error messages instead of crashing.

### API Endpoints

- `GET /api/ingredients/grouped` - Get grouped ingredients by category
- `GET /api/recipes/recipes` - Search recipes by ingredients or text
- `GET /api/recipes/recipes/:id` - Get recipe details

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Code Style

The project uses:

- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety
- **Husky** for git hooks

## Recent Fixes

### ✅ Resolved Issues

1. **TanStack Query Module Resolution**: Fixed module import issues by centralizing QueryClient configuration
2. **Event Handler Errors**: Replaced onClick handlers with proper anchor tags in server components
3. **API Connection Errors**: Added graceful error handling when backend is unavailable
4. **Infinite Re-rendering**: Implemented proper retry logic to prevent connection loops
5. **Internationalization**: Fixed locale detection and routing issues
6. **Hydration Mismatches**: Resolved server/client component conflicts

### 🔧 Current State

- ✅ App runs successfully on port 3000
- ✅ TanStack Query works without module errors
- ✅ Graceful error handling for missing backend
- ✅ Proper internationalization setup
- ✅ No hydration mismatches
- ✅ Clean error pages and fallback UI

## Troubleshooting

### Common Issues

1. **Port 3000 in use**: The app will automatically try port 3001
2. **Backend not available**: The app shows appropriate error messages
3. **Module resolution errors**: Clear `.next` cache and restart dev server

### Cache Issues

If you encounter strange behavior, clear the Next.js cache:

```bash
# Windows
Remove-Item -Recurse -Force .next

# Linux/Mac
rm -rf .next
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Тестирование

В проекте используется [Vitest](https://vitest.dev/) для юнит-тестирования React-компонентов.

### Запуск тестов

```bash
npm test
```

Пример теста находится в `src/components/ui/button.test.tsx`.

---

## CI/CD (GitHub Actions)

В проекте настроен CI через GitHub Actions:

- Проверка кода линтером (ESLint)
- Проверка форматирования (Prettier)
- Проверка стилей (Stylelint)
- Type-check (TypeScript)
- Запуск тестов (Vitest)
- Сборка проекта

Файл workflow: `.github/workflows/ci.yml`

---

## Деплой на Railway через GitHub

1. Зарегистрируйтесь на [Railway](https://railway.app/).
2. Создайте новый проект и выберите опцию "Deploy from GitHub repo".
3. Подключите ваш репозиторий.
4. Railway автоматически определит Next.js и настроит деплой.
5. В разделе **Variables** добавьте переменные окружения из `.env.local` (например, `NEXT_PUBLIC_DEFAULT_LOCALE`, `NEXT_PUBLIC_AVAILABLE_LOCALES`).
6. После каждого пуша в ветку `main` или `master` Railway будет автоматически собирать и деплоить приложение.

Если при установке зависимостей возникает ошибка, убедитесь, что:

- В репозитории присутствует актуальный `package-lock.json`.
- Все зависимости корректно указаны в `package.json`.
- В настройках Railway выбран **Build Command**: `npm install && npm run build`
- В настройках Railway выбран **Start Command**: `npm start`

---
