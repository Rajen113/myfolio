"use client";

import { useState, useRef, useEffect, useId } from "react";
import { ChevronDown, Search, Check, X } from "lucide-react";
import { EducationOption } from "@/lib/constants/education-options";

interface SearchableSelectProps {
  id?: string;
  name: string;
  options: EducationOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function SearchableSelect({
  id,
  name,
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  required = false,
  disabled = false,
}: SearchableSelectProps) {
  const generatedId = useId();
  const inputId = id || generatedId;

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setSearchQuery("");
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Hidden native input for form validation */}
      <input
        type="text"
        id={inputId}
        name={name}
        value={value}
        required={required}
        onChange={() => {}}
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
      />

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border rounded-xl text-sm transition-all text-left ${
          isOpen
            ? "border-indigo-500 ring-1 ring-indigo-500"
            : "border-slate-700/80 hover:border-slate-600"
        } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span
          className={`truncate ${
            selectedOption ? "text-slate-100 font-medium" : "text-slate-500"
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <div className="flex items-center gap-1 shrink-0 ml-2">
          {value && !required && !disabled && (
            <span
              onClick={handleClear}
              className="p-0.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-indigo-400" : ""
            }`}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 p-2 bg-slate-900/95 border border-slate-700/90 rounded-2xl shadow-2xl backdrop-blur-xl space-y-2 max-h-64 flex flex-col">
          {/* Search Box */}
          <div className="relative shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search options..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Options List */}
          <div className="overflow-y-auto space-y-0.5 max-h-48 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition-colors ${
                      isSelected
                        ? "bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30"
                        : "text-slate-200 hover:bg-slate-800/80"
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0 ml-2" />}
                  </button>
                );
              })
            ) : (
              <div className="py-4 text-center text-xs text-slate-500 font-medium">
                No matching options found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
