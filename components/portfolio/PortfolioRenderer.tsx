"use client";

import { PortfolioData } from "@/types/portfolio";
import { TemplateValue } from "@/lib/constants/portfolio-templates";
import ModernTemplate from "./templates/ModernTemplate";
import MinimalTemplate from "./templates/MinimalTemplate";
import ProfessionalTemplate from "./templates/ProfessionalTemplate";

interface PortfolioRendererProps {
  portfolioData: PortfolioData;
  template?: TemplateValue | string;
}

// Template Registry mapping
const TEMPLATE_COMPONENTS: Record<
  TemplateValue,
  React.ComponentType<{ portfolioData: PortfolioData }>
> = {
  MODERN: ModernTemplate,
  MINIMAL: MinimalTemplate,
  PROFESSIONAL: ProfessionalTemplate,
};

export default function PortfolioRenderer({
  portfolioData,
  template = "MODERN",
}: PortfolioRendererProps) {
  // Safe lookup with default fallback to MODERN
  const validTemplateKey = (
    template && template in TEMPLATE_COMPONENTS
      ? (template as TemplateValue)
      : "MODERN"
  );

  const SelectedTemplateComponent = TEMPLATE_COMPONENTS[validTemplateKey];

  return <SelectedTemplateComponent portfolioData={portfolioData} />;
}
