import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const getInitialTheme = (): Theme => {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
  }
  return 'dark';
};

const applyThemeToDOM = (theme: Theme) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const body = document.body;

  if (theme === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
    if (body) {
      body.classList.add('dark');
      body.classList.remove('light');
    }
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
    if (body) {
      body.classList.add('light');
      body.classList.remove('dark');
    }
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('theme', theme);
  }
};

// Sync DOM on module evaluation
applyThemeToDOM(getInitialTheme());

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      applyThemeToDOM(next);
      return next;
    });
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    applyThemeToDOM(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: typeof document !== 'undefined' && document.documentElement.classList.contains('light') ? 'light' : 'dark',
      toggleTheme: () => {
        const currentIsDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
        const next = currentIsDark ? 'light' : 'dark';
        applyThemeToDOM(next);
      },
      setTheme: (t) => applyThemeToDOM(t),
    };
  }
  return context;
};
