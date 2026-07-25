import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

const CustomSelect = ({ value, onChange, options, placeholder = 'Select option', className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const selectedOption = options.find((opt) => opt.value === value) || {
    label: placeholder,
    value: '',
  };

  const isScrollable = options.length > 7;

  return (
    <div ref={dropdownRef} className={`relative inline-block w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#FAF8F0] hover:bg-[#EAE7DC] border border-[#C5C2B4] rounded-2xl px-4 py-2.5 text-[#161D18] text-xs font-bold shadow-xs flex items-center justify-between gap-2 transition-all outline-none focus:border-[#2A4B3A]"
      >
        <span className="truncate">{selectedOption.label}</span>
        <ChevronDown
          className={`w-4 h-4 text-stone-600 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-[#2A4B3A]' : ''
          }`}
        />
      </button>

      {/* Floating Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className={`absolute left-0 top-full mt-1.5 w-full bg-[#FAF8F0] border border-[#C5C2B4] rounded-2xl shadow-2xl z-50 p-1.5 ${
              isScrollable ? 'max-h-60 overflow-y-auto' : 'max-h-none overflow-visible'
            }`}
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <div
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl cursor-pointer transition-colors my-0.5 ${
                    isSelected
                      ? 'bg-[#2A4B3A] text-white shadow-xs'
                      : 'text-[#161D18] hover:bg-[#EAE7DC]'
                  }`}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-2" />}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomSelect;
