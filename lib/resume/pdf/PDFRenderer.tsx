import React from "react";
import { Font } from "@react-pdf/renderer";
import { ResumeData } from "../types";
import ProfessionalPDF from "./templates/ProfessionalPDF";
import ModernPDF from "./templates/ModernPDF";
import MinimalPDF from "./templates/MinimalPDF";

// Register hyphenation callback to prevent hyphenate module export resolution issues in Node
Font.registerHyphenationCallback((word) => [word]);

interface PDFRendererProps {
  data: ResumeData;
}

export default function PDFRenderer({ data }: PDFRendererProps) {
  const template = data.settings?.template || "PROFESSIONAL";

  switch (template) {
    case "MODERN":
      return <ModernPDF data={data} />;
    case "MINIMAL":
      return <MinimalPDF data={data} />;
    case "PROFESSIONAL":
    default:
      return <ProfessionalPDF data={data} />;
  }
}
