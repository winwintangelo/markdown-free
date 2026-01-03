"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Globe, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { trackLanguageSwitch, type SupportedLocale } from "@/lib/analytics";
import { 
  locales, 
  localeNames, 
  getPathWithoutLocale, 
  getLocalizedPath,
  type Locale 
} from "@/i18n";

interface LanguageSwitcherProps {
  currentLocale: Locale;
}

export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleLanguageChange = (locale: Locale) => {
    // Track the switch
    trackLanguageSwitch(currentLocale as SupportedLocale, locale as SupportedLocale);
    
    // Save preference to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("preferred-locale", locale);
    }
    
    // Navigate to the new locale path
    const pathWithoutLocale = getPathWithoutLocale(pathname);
    const newPath = getLocalizedPath(pathWithoutLocale, locale);
    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition",
          "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100"
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe className="h-3.5 w-3.5" />
        <span>{localeNames[currentLocale]}</span>
        <ChevronDown className={cn(
          "h-3 w-3 transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[120px] rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          {locales.map((locale) => (
            <button
              key={locale}
              type="button"
              onClick={() => handleLanguageChange(locale)}
              className={cn(
                "flex w-full items-center px-3 py-1.5 text-left text-sm transition",
                locale === currentLocale
                  ? "bg-emerald-50 font-medium text-emerald-700"
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              {localeNames[locale]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

