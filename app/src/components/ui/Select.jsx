import * as React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';

function useClickAway(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { when: 'beforeChildren', staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: -8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export default function Select({
  label,
  options = [],
  value,
  onChange,
  placeholder,
  className,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const dropdownRef = useRef(null);

  const closeHandler = useCallback(() => setIsOpen(false), []);
  useClickAway(dropdownRef, closeHandler);

  const selectedOption = options.find((o) => o.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder || 'Select...';

  const handleSelect = (opt) => {
    if (onChange) {
      onChange({ target: { value: opt.value } });
    }
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') setIsOpen(false);
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHoveredIndex((prev) => {
        const next = prev === null ? 0 : prev + 1;
        return next >= options.length ? 0 : next;
      });
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHoveredIndex((prev) => {
        const next = prev === null ? options.length - 1 : prev - 1;
        return next < 0 ? options.length - 1 : next;
      });
    }
    if (e.key === 'Enter' && hoveredIndex !== null) {
      e.preventDefault();
      handleSelect(options[hoveredIndex]);
    }
  };

  // Reset hover when dropdown closes
  useEffect(() => {
    if (!isOpen) setHoveredIndex(null);
  }, [isOpen]);

  // Determine active index for highlight positioning
  const activeIndex =
    hoveredIndex !== null
      ? hoveredIndex
      : options.findIndex((o) => o.value === value);

  return (
    <MotionConfig reducedMotion="user">
      <div className={clsx('flex flex-col gap-1.5', className)}>
        {label && (
          <label className="text-sm text-text-secondary font-body">{label}</label>
        )}
        <div className="relative" ref={dropdownRef} onKeyDown={handleKeyDown}>
          {/* Trigger */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={clsx(
              'w-full flex items-center justify-between',
              'bg-bg-input border border-border rounded-none px-3 py-2 text-sm font-body',
              'transition-all duration-200 ease-in-out',
              'focus:outline-none focus:border-accent-cream',
              isOpen
                ? 'bg-bg-tertiary text-text-primary border-accent-cream'
                : 'text-text-primary hover:bg-bg-tertiary hover:border-border-hover'
            )}
            aria-expanded={isOpen}
            aria-haspopup="listbox"
          >
            <span
              className={clsx(
                !selectedOption && 'text-text-tertiary'
              )}
            >
              {displayLabel}
            </span>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center w-4 h-4 ml-2"
            >
              <ChevronDown className="w-4 h-4 text-text-tertiary" />
            </motion.div>
          </button>

          {/* Dropdown Panel */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 1, height: 0 }}
                animate={{
                  opacity: 1,
                  height: 'auto',
                  transition: {
                    type: 'spring',
                    stiffness: 500,
                    damping: 30,
                    mass: 1,
                  },
                }}
                exit={{
                  opacity: 0,
                  height: 0,
                  transition: {
                    type: 'spring',
                    stiffness: 500,
                    damping: 30,
                    mass: 1,
                  },
                }}
                className="absolute left-0 right-0 top-full mt-1 z-50 overflow-hidden"
              >
                <motion.div
                  className="w-full border border-border bg-bg-secondary p-1 shadow-lg shadow-black/30"
                  style={{ transformOrigin: 'top' }}
                  role="listbox"
                >
                  <motion.div
                    className="py-1 relative max-h-[240px] overflow-y-auto"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {/* Sliding highlight */}
                    {activeIndex >= 0 && (
                      <motion.div
                        layoutId={`highlight-${label || 'select'}`}
                        className="absolute inset-x-1 bg-bg-tertiary"
                        animate={{
                          y: activeIndex * 36,
                          height: 36,
                        }}
                        transition={{
                          type: 'spring',
                          bounce: 0.15,
                          duration: 0.4,
                        }}
                      />
                    )}

                    {/* Placeholder/clear option */}
                    {placeholder && (
                      <motion.button
                        type="button"
                        onClick={() => handleSelect({ value: '' })}
                        onMouseEnter={() => setHoveredIndex(-1)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        className={clsx(
                          'relative flex w-full items-center px-3 py-2 text-sm rounded-none',
                          'transition-colors duration-150',
                          'focus:outline-none',
                          !value
                            ? 'text-text-primary'
                            : 'text-text-tertiary'
                        )}
                        whileTap={{ scale: 0.98 }}
                        variants={itemVariants}
                      >
                        {placeholder}
                      </motion.button>
                    )}

                    {/* Options */}
                    {options.map((opt, index) => {
                      const isSelected = opt.value === value;
                      const isHovered = hoveredIndex === index;

                      return (
                        <motion.button
                          key={opt.value}
                          type="button"
                          onClick={() => handleSelect(opt)}
                          onMouseEnter={() => setHoveredIndex(index)}
                          onMouseLeave={() => setHoveredIndex(null)}
                          className={clsx(
                            'relative flex w-full items-center px-3 py-2 text-sm rounded-none',
                            'transition-colors duration-150',
                            'focus:outline-none',
                            isSelected || isHovered
                              ? 'text-text-primary'
                              : 'text-text-secondary'
                          )}
                          whileTap={{ scale: 0.98 }}
                          variants={itemVariants}
                          role="option"
                          aria-selected={isSelected}
                        >
                          <span className="relative z-10 flex items-center gap-2">
                            {isSelected && (
                              <motion.span
                                className="w-1 h-1 bg-accent-cream"
                                layoutId={`dot-${label || 'select'}`}
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                              />
                            )}
                            {opt.label}
                          </span>
                        </motion.button>
                      );
                    })}
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MotionConfig>
  );
}
