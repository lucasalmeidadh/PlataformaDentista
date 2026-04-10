import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './Button';

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  error?: string;
  value?: string;
  onChange?: (e: { target: { value: string, name?: string } }) => void;
}

export const Select = ({ className, label, error, children, value, onChange, placeholder, name, disabled, ...props }: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract options from children (expecting <option> elements)
  const options = React.Children.toArray(children)
    .filter((child): child is React.ReactElement => React.isValidElement(child) && child.type === 'option')
    .map(child => ({
      value: child.props.value,
      label: child.props.children,
      disabled: child.props.disabled
    }));

  const selectedOption = options.find(opt => String(opt.value) === String(value));

  const handleToggle = () => {
    if (!disabled) setIsOpen(!isOpen);
  };

  const handleSelect = (optionValue: string) => {
    if (onChange) {
      onChange({ target: { value: optionValue, name } });
    }
    setIsOpen(false);
  };

  // Click outside handler
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
    <div className="flex flex-col gap-1.5 w-full relative" ref={containerRef}>
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={handleToggle}
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm',
            'focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500',
            'transition-all duration-200 ease-in-out text-left mr-9',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 focus:ring-red-500/50 focus:border-red-500',
            className
          )}
          {...props as any}
        >
          <span className={cn('block truncate', !selectedOption && 'text-slate-400')}>
            {selectedOption ? selectedOption.label : placeholder || 'Selecione...'}
          </span>
          <ChevronDown 
            size={16} 
            className={cn('text-slate-400 transition-transform duration-200 ml-2 shrink-0', isOpen && 'rotate-180')} 
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 4, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute z-[110] w-full rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
            >
              <ul className="max-h-60 overflow-auto py-1 focus:outline-none">
                {options.length > 0 ? (
                  options.map((option, idx) => (
                    <li
                      key={idx}
                      onClick={() => !option.disabled && handleSelect(String(option.value))}
                      className={cn(
                        'relative cursor-pointer select-none rounded-md px-3 py-2 text-sm transition-colors',
                        String(option.value) === String(value) 
                          ? 'bg-teal-50 text-teal-700 font-medium' 
                          : 'text-slate-700 hover:bg-slate-50',
                        option.disabled && 'opacity-50 cursor-not-allowed grayscale'
                      )}
                    >
                      {option.label}
                    </li>
                  ))
                ) : (
                  <li className="px-3 py-2 text-sm text-slate-400 italic">Sem opções</li>
                )}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <span className="text-xs text-red-500">{error}</span>
      )}
    </div>
  );
};
