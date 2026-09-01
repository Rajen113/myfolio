export type TemplateValue = "MODERN" | "MINIMAL" | "PROFESSIONAL";

export interface TemplateOption {
  value: TemplateValue;
  name: string;
  description: string;
  badge: string;
  features: string[];
}

export const PORTFOLIO_TEMPLATES: TemplateOption[] = [
  {
    value: "MODERN",
    name: "Modern",
    description: "Clean modern portfolio for software developers with vibrant accents, hero showcase, and glassmorphism cards.",
    badge: "Popular",
    features: [
      "Dynamic Hero Banner",
      "Interactive Skill Badges",
      "Card-based Project Showcase",
      "Visual Experience & Education Timeline",
    ],
  },
  {
    value: "MINIMAL",
    name: "Minimal",
    description: "Simple and elegant portfolio with minimal distractions, typography-focused layout, and generous whitespace.",
    badge: "Clean & Fast",
    features: [
      "Typography-First Design",
      "High Contrast & Generous Whitespace",
      "Streamlined Single-Column Content Flow",
      "Clean Line-based Projects & Timeline",
    ],
  },
  {
    value: "PROFESSIONAL",
    name: "Professional",
    description: "Corporate and executive portfolio focused on career experience, qualifications, and structured resume layout.",
    badge: "Executive",
    features: [
      "Executive Resume Header",
      "Career-First Experience Section",
      "Structured Credentials & Qualifications",
      "Contact Summary Action Bar",
    ],
  },
];

export function getTemplateOption(value: string | null | undefined): TemplateOption {
  const found = PORTFOLIO_TEMPLATES.find((t) => t.value === value);
  return found || PORTFOLIO_TEMPLATES[0]; // Default to MODERN
}
