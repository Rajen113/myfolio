import {
  PortfolioCustomization,
  ThemeModeValue,
  FontFamilyValue,
  ButtonStyleValue,
  BorderRadiusValue,
} from "@/types/portfolio";

export const THEME_MODE_OPTIONS: {
  value: ThemeModeValue;
  label: string;
  description: string;
}[] = [
  { value: "LIGHT", label: "Light", description: "Always light theme" },
  { value: "DARK", label: "Dark", description: "Always dark theme" },
  { value: "SYSTEM", label: "System", description: "Follow operating system theme" },
];

export const PRESET_THEME_COLORS: {
  name: string;
  value: string;
}[] = [
  { name: "Blue", value: "#2563EB" },
  { name: "Purple", value: "#9333EA" },
  { name: "Green", value: "#16A34A" },
  { name: "Orange", value: "#EA580C" },
  { name: "Red", value: "#DC2626" },
  { name: "Indigo", value: "#4F46E5" },
  { name: "Teal", value: "#0D9488" },
];

export const FONT_OPTIONS: {
  value: FontFamilyValue;
  label: string;
  cssFamily: string;
}[] = [
  {
    value: "INTER",
    label: "Inter",
    cssFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  {
    value: "PLUS_JAKARTA_SANS",
    label: "Plus Jakarta Sans",
    cssFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  {
    value: "DM_SANS",
    label: "DM Sans",
    cssFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  {
    value: "MANROPE",
    label: "Manrope",
    cssFamily: "'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
];

export const BUTTON_STYLE_OPTIONS: {
  value: ButtonStyleValue;
  label: string;
  cssClass: string;
}[] = [
  { value: "ROUNDED", label: "Rounded", cssClass: "rounded-xl" },
  { value: "PILL", label: "Pill", cssClass: "rounded-full" },
  { value: "SQUARE", label: "Square", cssClass: "rounded-none" },
];

export const BORDER_RADIUS_OPTIONS: {
  value: BorderRadiusValue;
  label: string;
  cssClass: string;
}[] = [
  { value: "SMALL", label: "Small", cssClass: "rounded-md" },
  { value: "MEDIUM", label: "Medium", cssClass: "rounded-xl" },
  { value: "LARGE", label: "Large", cssClass: "rounded-2xl" },
];

export const DEFAULT_CUSTOMIZATION: PortfolioCustomization = {
  themeMode: "SYSTEM",
  themeColor: "#2563EB",
  fontFamily: "INTER",
  showAbout: true,
  showSkills: true,
  showProjects: true,
  showExperience: true,
  showEducation: true,
  showContact: true,
  showSocialLinks: true,
  buttonStyle: "ROUNDED",
  borderRadius: "MEDIUM",
};

/**
 * Validates that a string is a safe hex color code (#RRGGBB or #RGB)
 * and prevents CSS injection vectors like url(), javascript:, expression(), etc.
 */
export function isValidHexColor(color: string): boolean {
  if (!color || typeof color !== "string") return false;
  const trimmed = color.trim();
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(trimmed);
}

export function getFontFamilyCss(fontFamily: FontFamilyValue | string | undefined): string {
  const found = FONT_OPTIONS.find((f) => f.value === fontFamily);
  return found ? found.cssFamily : FONT_OPTIONS[0].cssFamily;
}

export function getButtonStyleClass(style: ButtonStyleValue | string | undefined): string {
  const found = BUTTON_STYLE_OPTIONS.find((b) => b.value === style);
  return found ? found.cssClass : BUTTON_STYLE_OPTIONS[0].cssClass;
}

export function getBorderRadiusClass(radius: BorderRadiusValue | string | undefined): string {
  const found = BORDER_RADIUS_OPTIONS.find((r) => r.value === radius);
  return found ? found.cssClass : BORDER_RADIUS_OPTIONS[0].cssClass;
}
