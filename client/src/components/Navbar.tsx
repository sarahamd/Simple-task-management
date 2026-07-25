import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { CheckSquare, LogOut, Moon, Sun, Languages } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-[1700px] mx-auto px-2.5 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 sm:gap-6 shrink-0">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-purple-600/10 dark:bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-105 transition duration-200">
              <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <span className="text-sm sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {t('appTitle')}
              </span>
            </div>
          </div>
        </div>

        {/* Controls & User Profile */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 text-[11px] sm:text-xs font-semibold transition"
            title={language === 'en' ? 'التحويل إلى العربية' : 'Switch to English'}
            aria-label="Toggle language"
          >
            <Languages className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400" />
            <span className="font-medium">{t('langToggle')}</span>
          </button>

          {/* Theme Toggle (Dark / Light) */}
          <button
            onClick={toggleTheme}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 transition"
            title={theme === 'dark' ? t('themeLight') : t('themeDark')}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />
            )}
          </button>

          {/* User Badge */}
          {user && (
            <div className="flex items-center gap-2 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-purple-600/20 text-purple-600 dark:text-purple-300 flex items-center justify-center font-semibold text-[11px] sm:text-xs">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left rtl:text-right">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                  {user.name}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  {user.email}
                </p>
              </div>
            </div>
          )}

          {/* Sign Out Button */}
          <button
            onClick={logout}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition"
            title={t('signOut')}
            aria-label={t('signOut')}
          >
            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
