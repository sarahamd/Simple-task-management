import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';
import { AuthProvider } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';

const TestComponent = () => {
  const { theme, toggleTheme } = useTheme();
  const { language, dir, toggleLanguage, t } = useLanguage();

  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="lang">{language}</span>
      <span data-testid="dir">{dir}</span>
      <span data-testid="translated">{t('dashboardTitle')}</span>
      <button onClick={toggleTheme}>Toggle Theme</button>
      <button onClick={toggleLanguage}>Toggle Lang</button>
    </div>
  );
};

describe('Theme & Language Internationalization System', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  it('toggles theme between dark and light mode', () => {
    render(
      <ThemeProvider>
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      </ThemeProvider>
    );

    const themeSpan = screen.getByTestId('theme');
    expect(themeSpan.textContent).toBe('dark');

    const toggleThemeBtn = screen.getByText('Toggle Theme');
    fireEvent.click(toggleThemeBtn);
    expect(themeSpan.textContent).toBe('light');

    fireEvent.click(toggleThemeBtn);
    expect(themeSpan.textContent).toBe('dark');
  });

  it('toggles language between EN and AR and sets dir rtl', () => {
    render(
      <ThemeProvider>
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      </ThemeProvider>
    );

    const langSpan = screen.getByTestId('lang');
    const dirSpan = screen.getByTestId('dir');
    const translatedSpan = screen.getByTestId('translated');

    expect(langSpan.textContent).toBe('en');
    expect(dirSpan.textContent).toBe('ltr');
    expect(translatedSpan.textContent).toBe('Task Dashboard');

    const toggleLangBtn = screen.getByText('Toggle Lang');
    fireEvent.click(toggleLangBtn);

    expect(langSpan.textContent).toBe('ar');
    expect(dirSpan.textContent).toBe('rtl');
    expect(translatedSpan.textContent).toBe('لوحة التحكم بالمهمات');
  });

  it('renders Navbar with theme toggle and language toggle', () => {
    render(
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <MemoryRouter>
              <Navbar />
            </MemoryRouter>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    );

    expect(screen.getByText('Task Flow')).toBeDefined();
    expect(screen.getByText('العربية')).toBeDefined();

    const langBtn = screen.getByRole('button', { name: /toggle language/i });
    fireEvent.click(langBtn);

    expect(screen.getByText('تاسك فلو')).toBeDefined();
    expect(screen.getByText('English')).toBeDefined();
  });
});
