"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  className?: string;
}

export function SearchBar({
  placeholder = "Rechercher une personnalité...",
  value: controlledValue,
  onChange,
  onSearch,
  className,
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState(controlledValue || "");
  const value = controlledValue ?? internalValue;

  // Debounce de la recherche (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch && value) {
        onSearch(value);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [value, onSearch]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInternalValue(newValue);
      onChange?.(newValue);
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    setInternalValue("");
    onChange?.("");
    onSearch?.("");
  }, [onChange, onSearch]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch?.(value);
    }
  };

  return (
    <div
      className={cn(
        "relative flex items-center rounded-lg border border-gris-bordure bg-blanc shadow-sm transition-shadow focus-within:shadow-md focus-within:border-primary",
        className
      )}
    >
      <Search className="absolute left-3 h-5 w-5 text-gris-moyen" />

      <input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full rounded-lg bg-transparent py-3 pl-10 pr-10 text-noir placeholder:text-gris-moyen focus:outline-none"
      />

      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 rounded-full p-1 hover:bg-gris-clair transition-colors"
          aria-label="Effacer la recherche"
        >
          <X className="h-4 w-4 text-gris-moyen" />
        </button>
      )}
    </div>
  );
}
