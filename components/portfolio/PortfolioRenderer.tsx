"use client";

import { useSyncExternalStore } from "react";
import { PortfolioData, PortfolioCustomization } from "@/types/portfolio";
import { TemplateValue } from "@/lib/constants/portfolio-templates";
import {
  DEFAULT_CUSTOMIZATION,
  getFontFamilyCss,
  isValidHexColor,
} from "@/lib/constants/portfolio-customization";
import ModernTemplate from "./templates/ModernTemplate";
import MinimalTemplate from "./templates/MinimalTemplate";
import ProfessionalTemplate from "./templates/ProfessionalTemplate";

interface PortfolioRendererProps {
  portfolioData: PortfolioData;
  template?: TemplateValue | string;
  customization?: PortfolioCustomization;
}

export interface TemplateProps {
  portfolioData: PortfolioData;
  customization: PortfolioCustomization;
}

// Template Registry mapping
const TEMPLATE_COMPONENTS: Record<
  TemplateValue,
  React.ComponentType<TemplateProps>
> = {
  MODERN: ModernTemplate,
  MINIMAL: MinimalTemplate,
  PROFESSIONAL: ProfessionalTemplate,
};

function subscribeSystemTheme(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getSystemThemeSnapshot() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getServerSystemThemeSnapshot() {
  return true; // SSR default to dark
}

export default function PortfolioRenderer({
  portfolioData,
  template = "MODERN",
  customization = DEFAULT_CUSTOMIZATION,
}: PortfolioRendererProps) {
  // Merge incoming customization with DEFAULT_CUSTOMIZATION for safety
  const safeCustomization: PortfolioCustomization = {
    ...DEFAULT_CUSTOMIZATION,
    ...customization,
  };

  // Validate hex color to prevent CSS injection
  const primaryColor = isValidHexColor(safeCustomization.themeColor)
    ? safeCustomization.themeColor
    : DEFAULT_CUSTOMIZATION.themeColor;

  // Resolve font CSS
  const fontCss = getFontFamilyCss(safeCustomization.fontFamily);

  // System theme hook for hydration safety
  const systemIsDark = useSyncExternalStore(
    subscribeSystemTheme,
    getSystemThemeSnapshot,
    getServerSystemThemeSnapshot
  );

  const resolvedThemeMode: "LIGHT" | "DARK" =
    safeCustomization.themeMode === "SYSTEM"
      ? systemIsDark
        ? "DARK"
        : "LIGHT"
      : safeCustomization.themeMode;

  // Safe lookup with default fallback to MODERN
  const validTemplateKey = (
    template && template in TEMPLATE_COMPONENTS
      ? (template as TemplateValue)
      : "MODERN"
  );

  const SelectedTemplateComponent = TEMPLATE_COMPONENTS[validTemplateKey];

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        resolvedThemeMode === "LIGHT"
          ? "bg-slate-50 text-slate-900"
          : "bg-slate-950 text-slate-100"
      }`}
      style={
        {
          fontFamily: fontCss,
          "--primary-color": primaryColor,
        } as React.CSSProperties
      }
    >
      <SelectedTemplateComponent
        portfolioData={portfolioData}
        customization={{
          ...safeCustomization,
          themeColor: primaryColor,
        }}
      />
    </div>
  );
}
