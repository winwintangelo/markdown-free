"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { trackNavClick, trackFeedbackClick, type NavDestination } from "@/lib/analytics";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const handleFeedbackClick = () => {
    trackFeedbackClick();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2" onClick={() => handleNavClick("home")}>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 text-white font-semibold text-sm">
            md
          </div>
          <span className="text-base font-semibold tracking-tight">
            Markdown Free
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
          <Link href="/about" onClick={() => trackNavClick("about")} className="hover:text-slate-900 transition-colors">
            About
          </Link>
          <Link href="/privacy" onClick={() => trackNavClick("privacy")} className="hover:text-slate-900 transition-colors">
            Privacy
          </Link>
          <button onClick={handleFeedbackClick} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-100 transition-colors">
            Feedback
          </button>
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
          isMobileMenuOpen ? "max-h-48 border-t border-slate-100" : "max-h-0"
        )}
      >
        <nav className="flex flex-col gap-1 bg-white px-4 py-3">
          <Link
            href="/about"
            onClick={() => handleNavClick("about")}
            className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            About
          </Link>
          <Link
            href="/privacy"
            onClick={() => handleNavClick("privacy")}
            className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            Privacy
          </Link>
          <button onClick={handleFeedbackClick} className="mt-2 w-full rounded-full border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-100 transition-colors">
            Feedback
          </button>
        </nav>
      </div>
    </header>
  );
}
