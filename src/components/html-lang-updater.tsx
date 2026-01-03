"use client";

import { useEffect } from "react";
import type { Locale } from "@/i18n";

interface HtmlLangUpdaterProps {
  locale: Locale;
}

/**
 * Client-side component to update the html lang attribute
 * for localized pages. This is needed because nested layouts
 * can't override the root layout's html tag.
 */
export function HtmlLangUpdater({ locale }: HtmlLangUpdaterProps) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}

