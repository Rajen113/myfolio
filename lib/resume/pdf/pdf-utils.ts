export function formatPDFDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}

export function formatPDFDateRange(
  startStr?: string | null,
  endStr?: string | null,
  isCurrent?: boolean
): string {
  const startFormatted = formatPDFDate(startStr);
  if (isCurrent) {
    return `${startFormatted} – Present`;
  }
  const endFormatted = formatPDFDate(endStr);
  if (!endFormatted) return startFormatted;
  return `${startFormatted} – ${endFormatted}`;
}

export function sanitizeFilename(name: string): string {
  if (!name) return "MyFolio-Resume.pdf";
  const clean = name
    .replace(/[^a-zA-Z0-9\s_-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  return clean ? `${clean}-Resume.pdf` : "MyFolio-Resume.pdf";
}
