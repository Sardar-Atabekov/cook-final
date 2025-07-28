import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import HomePage from '../[locale]/page';

// Мокаем next-intl
vi.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: () => (key: string) => {
    // Простая заглушка для переводов
    if (key === 'title') return 'Welcome to Cook!';
    if (key === 'subtitle') return 'Find the best recipes for every day.';
    if (key === 'addFirstIngredient') return 'Add First Ingredient';
    if (key === 'howItWorks') return 'How it works';
    if (key === 'howItWorksSubtitle') return 'Just three steps!';
    if (key === 'readyToCook') return 'Ready to cook?';
    if (key === 'readyToCookSubtitle') return 'Start your cooking journey now!';
    return key;
  },
}));

// Глобальный мок push и useRouter
const push = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

// Мокаем IntersectionObserver для тестов
(global as any).IntersectionObserver = class {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('рендерит заголовок и кнопку', () => {
    render(<HomePage />);
    expect(screen.getByText('Welcome to Cook!')).toBeInTheDocument();
    expect(screen.getByText('Add First Ingredient')).toBeInTheDocument();
  });

  it('рендерит подзаголовок', () => {
    render(<HomePage />);
    expect(
      screen.getByText('Find the best recipes for every day.')
    ).toBeInTheDocument();
  });

  it('рендерит карточки быстрых действий', () => {
    render(<HomePage />);
    expect(screen.getByText('recommended')).toBeInTheDocument();
    expect(screen.getByText('popularToday')).toBeInTheDocument();
    expect(screen.getByText('surpriseMe')).toBeInTheDocument();
  });

  it('вызывает router.push при клике по кнопке "Add First Ingredient"', () => {
    render(<HomePage />);
    const button = screen.getByText('Add First Ingredient');
    button.click();
    expect(push).toHaveBeenCalled();
  });

  it('рендерит футер', () => {
    render(<HomePage />);
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });
});
