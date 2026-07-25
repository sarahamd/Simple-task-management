import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  colorDot?: string;
  icon?: React.ReactNode;
  badgeBg?: string;
  badgeText?: string;
  badgeBorder?: string;
}

interface ColorSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  id?: string;
  name?: string;
}

export const ColorSelect: React.FC<ColorSelectProps> = ({
  options,
  value,
  onChange,
  label,
  placeholder = 'Select option...',
  className = '',
  id,
  name,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${isOpen ? 'z-50' : 'z-10'} ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
          {label}
        </label>
      )}

      {/* Hidden native select for accessibility & form compatibility */}
      <select
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white hover:bg-slate-50 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 flex items-center justify-between shadow-xs transition duration-150 cursor-pointer gap-2"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption?.icon && (
            <span className="shrink-0 flex items-center justify-center">{selectedOption.icon}</span>
          )}
          {selectedOption?.colorDot && !selectedOption?.icon && (
            <span className={`w-2.5 h-2.5 rounded-full ${selectedOption.colorDot} shrink-0`} />
          )}
          <span className="truncate font-medium">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-purple-600 dark:text-purple-400' : ''
          }`}
        />
      </button>

      {/* Custom Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/90 rounded-xl shadow-xl dark:shadow-slate-950/80 overflow-hidden py-1 max-h-60 overflow-y-auto animate-fadeIn">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-xs sm:text-sm flex items-center justify-between transition text-left rtl:text-right cursor-pointer ${
                  isSelected
                    ? 'bg-purple-50 dark:bg-purple-600/30 text-purple-700 dark:text-purple-200 font-semibold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/70 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  {option.icon && (
                    <span className="shrink-0 flex items-center justify-center">{option.icon}</span>
                  )}
                  {option.colorDot && !option.icon && (
                    <span className={`w-2.5 h-2.5 rounded-full ${option.colorDot} shrink-0`} />
                  )}
                  <span className="truncate">{option.label}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
