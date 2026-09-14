import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CustomSelect({ 
  options, 
  value, 
  onChange, 
  name, 
  placeholder = 'Select...', 
  theme = 'indigo' 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || options.find(opt => opt.value === '') || options[0];

  const handleSelect = (val) => {
    onChange({ target: { name, value: val } });
    setIsOpen(false);
  };

  const themeClasses = {
    indigo: {
      bg: 'bg-white border border-slate-200 shadow-sm',
      hover: 'hover:bg-slate-50 hover:border-indigo-300',
      focusRing: 'ring-indigo-500/20 border-indigo-500',
      dropdownHover: 'hover:bg-indigo-50',
      textHover: 'hover:text-indigo-700',
      selectedBg: 'bg-indigo-50 text-indigo-700 font-semibold'
    },
    blue: {
      bg: 'bg-white border border-slate-200 shadow-sm',
      hover: 'hover:bg-slate-50 hover:border-blue-300',
      focusRing: 'ring-blue-500/20 border-blue-500',
      dropdownHover: 'hover:bg-blue-50',
      textHover: 'hover:text-blue-700',
      selectedBg: 'bg-blue-50 text-blue-700 font-semibold'
    }
  };

  const currentTheme = themeClasses[theme] || themeClasses.indigo;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between rounded-xl sm:text-sm py-2.5 px-3 transition-all cursor-pointer ${
          isOpen ? `bg-white ring-2 ${currentTheme.focusRing} shadow-md` : currentTheme.bg
        } ${currentTheme.hover}`}
      >
        <span className="block truncate text-slate-700">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1 w-full rounded-xl bg-white/95 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200/60 overflow-hidden"
          >
            <ul className="max-h-60 overflow-auto py-1 text-sm focus:outline-none">
              {options.map((option) => (
                <li
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`relative cursor-pointer select-none py-2.5 pl-3 pr-9 transition-colors ${
                    value === option.value
                      ? currentTheme.selectedBg
                      : `text-slate-700 ${currentTheme.dropdownHover} ${currentTheme.textHover}`
                  }`}
                >
                  <span className="block truncate">{option.label}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
