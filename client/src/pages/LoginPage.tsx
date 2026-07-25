import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { CheckSquare, Lock, Mail, AlertCircle, Loader2, Moon, Sun, Languages, ChevronDown } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const [serverError, setServerError] = useState<string | null>(null);
  const [role, setRole] = useState<string>('Student');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setServerError(null);
      await login(data.email, data.password);
      navigate('/');
    } catch (err: unknown) {
      let msg = 'Login failed. Please check your credentials.';
      if (err && typeof err === 'object' && 'response' in err) {
        const res = (err as { response?: { data?: { error?: { message?: string } } } }).response;
        if (res?.data?.error?.message) {
          msg = res.data.error.message;
        }
      }
      setServerError(msg);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col justify-between overflow-x-hidden bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans select-none transition-colors duration-300">
      
      {/* Task Management Background Image with Adaptable Tint Overlay */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-700 scale-105"
        style={{ backgroundImage: `url('/task_management_bg.png')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-slate-900/60 to-slate-950/80 dark:from-slate-950/85 dark:via-slate-950/80 dark:to-slate-950/95 backdrop-blur-[2px]" />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-20 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-white/80 dark:bg-purple-600/20 border border-slate-200 dark:border-purple-500/40 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-md backdrop-blur-md">
            <CheckSquare className="w-5 h-5" />
          </div>
          <span className="text-lg sm:text-xl font-black tracking-tight text-white drop-shadow-md">
            {t('appTitle')}
          </span>
        </div>

        {/* Top Right Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-300 text-xs font-semibold shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer backdrop-blur-md"
            title={language === 'en' ? 'التحويل إلى العربية' : 'Switch to English'}
          >
            <Languages className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>{t('langToggle')}</span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-full bg-white/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-300 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer backdrop-blur-md"
            title={theme === 'dark' ? t('themeLight') : t('themeDark')}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-600" />}
          </button>

          <Link
            to="/register"
            className="px-4 py-1.5 rounded-full bg-purple-600 text-white dark:bg-purple-600/20 hover:bg-purple-700 dark:hover:bg-purple-600 border border-purple-500/60 dark:text-purple-300 dark:hover:text-white text-xs font-bold transition duration-200 shadow-md backdrop-blur-md"
          >
            {t('signUpLink')}
          </Link>
        </div>
      </header>

      {/* Main Centered Login Section */}
      <main className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 flex flex-col items-center justify-center">
        
        {/* Centered Sleek Glass Login Card (Works in Light & Dark Mode) */}
        <div className="w-full max-w-md bg-white/95 dark:bg-[#0f0f15]/90 backdrop-blur-xl border border-slate-200/90 dark:border-purple-500/25 rounded-3xl p-6 sm:p-9 shadow-[0_20px_60px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative transition-all duration-300">
          
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white text-center mb-6 tracking-tight">
            {t('loginHeaderTitle')}
          </h2>

          {serverError && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 dark:bg-red-500/15 border border-red-500/30 flex items-start gap-2.5 text-red-600 dark:text-red-300 text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Role Dropdown Selector (Translated & Adaptable) */}
          <div className="mb-6 flex justify-center">
            <div className="relative w-48">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full appearance-none bg-slate-100 dark:bg-slate-950/80 border border-purple-500/60 dark:border-purple-500/70 text-purple-700 dark:text-purple-300 text-sm font-semibold rounded-xl px-4 py-2 pr-8 rtl:pr-4 rtl:pl-8 focus:outline-none focus:ring-2 focus:ring-purple-500/50 cursor-pointer shadow-inner text-center"
              >
                <option value="Student">{t('roleStudent')}</option>
                <option value="Member">{t('roleMember')}</option>
                <option value="Manager">{t('roleManager')}</option>
                <option value="Admin">{t('roleAdmin')}</option>
              </select>
              <ChevronDown className="w-4 h-4 text-purple-600 dark:text-purple-400 absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1.5 tracking-wide">
                {t('enterYourEmail')}
              </label>
              <div className="relative">
                <input
                  {...register('email')}
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  className="w-full bg-slate-50 dark:bg-slate-950/70 border-b-2 border-slate-300 dark:border-slate-700 focus:border-purple-600 dark:focus:border-purple-500 rounded-lg px-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all duration-200"
                />
                <Mail className="absolute right-3.5 rtl:left-3.5 rtl:right-auto top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
              </div>
              {errors.email && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1.5 tracking-wide">
                {t('enterYourPassword')}
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-950/70 border-b-2 border-slate-300 dark:border-slate-700 focus:border-purple-600 dark:focus:border-purple-500 rounded-lg px-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all duration-200"
                />
                <Lock className="absolute right-3.5 rtl:left-3.5 rtl:right-auto top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
              </div>
              {errors.password && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.password.message}</p>}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl transition duration-200 shadow-lg shadow-purple-600/35 flex items-center justify-center gap-2 cursor-pointer text-sm tracking-wide"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t('signInBtn')}
              </button>
            </div>
          </form>

          {/* Footer inside card */}
          <p className="mt-6 text-center text-xs text-slate-600 dark:text-slate-400">
            {t('noAccount')}{' '}
            <Link to="/register" className="text-purple-600 dark:text-purple-400 hover:underline font-bold transition">
              {t('signUpLink')}
            </Link>
          </p>
        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="relative z-10 max-w-7xl w-full mx-auto px-4 py-4 text-center text-xs text-white/80 dark:text-slate-400/80">
        © {new Date().getFullYear()} Task Flow. All rights reserved.
      </footer>
    </div>
  );
};

export default LoginPage;


