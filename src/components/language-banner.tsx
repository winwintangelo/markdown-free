"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  locales, 
  localeNames, 
  getPathWithoutLocale, 
  getLocalizedPath,
  type Locale,
  type Dictionary
} from "@/i18n";
import { trackEvent } from "@/lib/analytics";

interface LanguageBannerProps {
  currentLocale: Locale;
  dict: Dictionary;
}

// Map browser language codes to supported locales
function getBrowserLocale(): Locale | null {
  if (typeof navigator === "undefined") return null;
  
  const browserLang = navigator.language.toLowerCase();
  
  // Check exact match first (e.g., "it-IT" -> "it")
  for (const locale of locales) {
    if (browserLang.startsWith(locale)) {
      return locale;
    }
  }
  
  return null;
}

export function LanguageBanner({ currentLocale, dict }: LanguageBannerProps) {
  const [suggestedLocale, setSuggestedLocale] = useState<Locale | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if user has already set a preference
    const preferredLocale = localStorage.getItem("preferred-locale");
    if (preferredLocale) {
      // User has already chosen, don't show banner
      return;
    }
    
    // Check if we've already dismissed for this session
    const dismissed = sessionStorage.getItem("language-banner-dismissed");
    if (dismissed) {
      return;
    }

    // Get browser locale preference
    const browserLocale = getBrowserLocale();
    
    // Show suggestion if browser locale differs from current page locale
    if (browserLocale && browserLocale !== currentLocale) {
      setSuggestedLocale(browserLocale);
      // Track that we showed the suggestion
      trackEvent("language_suggestion_shown", { 
        suggested: browserLocale, 
        current: currentLocale 
      });
    }
  }, [currentLocale]);

  const handleSwitch = () => {
    if (!suggestedLocale) return;
    
    // Save preference
    localStorage.setItem("preferred-locale", suggestedLocale);
    
    // Track the switch
    trackEvent("language_switched", { 
      from: currentLocale, 
      to: suggestedLocale,
      via: "banner"
    });
    
    // Navigate to suggested locale
    const pathWithoutLocale = getPathWithoutLocale(pathname);
    const newPath = getLocalizedPath(pathWithoutLocale, suggestedLocale);
    router.push(newPath);
  };

  const handleDismiss = () => {
    // Remember dismissal for this session
    sessionStorage.setItem("language-banner-dismissed", "true");
    setIsDismissed(true);
    
    // Track dismissal
    if (suggestedLocale) {
      trackEvent("language_suggestion_dismissed", { 
        suggested: suggestedLocale, 
        current: currentLocale 
      });
    }
  };

  // Don't show if no suggestion or dismissed
  if (!suggestedLocale || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-300 sm:left-auto sm:right-4">
      <div className={cn(
        "flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg",
        "sm:rounded-lg"
      )}>
        <div className="flex-1 text-sm">
          <span className="text-slate-600">
            {dict.languageBanner.prefer} <strong>{localeNames[suggestedLocale]}</strong>?
          </span>
        </div>
        <button
          type="button"
          onClick={handleSwitch}
          className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-emerald-700"
        >
          {dict.languageBanner.switch}
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

