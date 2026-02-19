"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { trackNavClick, type NavDestination } from "@/lib/analytics";
import { LanguageSwitcher } from "./language-switcher";
import type { Locale, Dictionary } from "@/i18n";

interface HeaderProps {
  locale?: Locale;
  dict?: Dictionary;
}

// Default dictionary values for backward compatibility
const defaultDict = {
  header: {
    about: "About",
    privacy: "Privacy",
  },
};

export function Header({ locale, dict = defaultDict as Dictionary }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Get correct path prefix
  const pathPrefix = locale && locale !== "en" ? `/${locale}` : "";

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleNavClick = (destination: NavDestination) => {
    trackNavClick(destination);
    closeMobileMenu();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href={pathPrefix || "/"} className="flex items-center gap-2" onClick={() => handleNavClick("home")}>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 text-white font-semibold text-sm">
            md
          </div>
          <span className="text-base font-semibold tracking-tight">
            Markdown Free
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
          <Link href={`${pathPrefix}/about`} onClick={() => trackNavClick("about")} className="hover:text-slate-900 transition-colors">
            {dict.header.about}
          </Link>
          <Link href={`${pathPrefix}/privacy`} onClick={() => trackNavClick("privacy")} className="hover:text-slate-900 transition-colors">
            {dict.header.privacy}
          </Link>
          {locale && <LanguageSwitcher currentLocale={locale} />}
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={toggleMobileMenu}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors md:hidden"
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-200 ease-in-out md:hidden",
          isMobileMenuOpen ? "max-h-32 border-t border-slate-100" : "max-h-0"
        )}
      >
        <nav className="flex flex-col gap-1 bg-white px-4 py-3">
          <Link
            href={`${pathPrefix}/about`}
            onClick={() => handleNavClick("about")}
            className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            {dict.header.about}
          </Link>
          <Link
            href={`${pathPrefix}/privacy`}
            onClick={() => handleNavClick("privacy")}
            className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            {dict.header.privacy}
          </Link>
        </nav>
      </div>
    </header>
  );
}
