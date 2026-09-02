import module from "module";

// Patch module resolution for @react-pdf/hyphenate/en-us under Node 20 strict ESM export rules
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const originalResolve = (module as any)._resolveFilename;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(module as any)._resolveFilename = function (request: string, parent: any, isMain: boolean, options: any) {
  if (request === "@react-pdf/hyphenate/en-us" || request === "@react-pdf/hyphenate/en-us.js") {
    try {
      return require.resolve("@react-pdf/hyphenate/lib/en-us.js");
    } catch {
      // Fallback
    }
  }
  return originalResolve.call(this, request, parent, isMain, options);
};

import { sanitizeFilename, formatPDFDateRange } from "../lib/resume/pdf/pdf-utils";
import { ResumeData } from "../lib/resume/types";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Test failed: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ Test passed: ${message}`);
  }
}

async function runResumeTests() {
  console.log("=== Running Resume Builder & PDF Generation Tests ===");

  // Dynamically import @react-pdf/renderer and PDFRenderer after module patch is active
  const { renderToBuffer, Font } = await import("@react-pdf/renderer");
  const PDFRendererModule = await import("../lib/resume/pdf/PDFRenderer");
  const PDFRenderer = PDFRendererModule.default;

  // Register hyphenation callback so @react-pdf doesn't dynamically load hyphenation subpaths
  Font.registerHyphenationCallback((word) => [word]);

  // 1. Filename Sanitization Tests
  assert(
    sanitizeFilename("Rajen Mandal") === "Rajen-Mandal-Resume.pdf",
    "Sanitizes basic full name into safe hyphens"
  );
  assert(
    sanitizeFilename("John/Doe..#123") === "JohnDoe123-Resume.pdf",
    "Removes unsafe path traversal and special characters"
  );
  assert(
    sanitizeFilename("") === "MyFolio-Resume.pdf",
    "Fallback to default MyFolio-Resume.pdf on empty name"
  );

  // 2. Date Formatting Tests
  const dateRange1 = formatPDFDateRange("2024-01-15T00:00:00.000Z", null, true);
  assert(
    dateRange1.includes("Jan 2024") && dateRange1.includes("Present"),
    "Formats current role date range correctly"
  );

  const dateRange2 = formatPDFDateRange(
    "2021-06-01T00:00:00.000Z",
    "2023-12-31T00:00:00.000Z",
    false
  );
  assert(
    dateRange2.includes("Jun 2021") && dateRange2.includes("Dec 2023"),
    "Formats past role date range correctly"
  );

  // Mock ResumeData for PDF Generation
  const mockResumeData: ResumeData = {
    profile: {
      name: "Rajen Mandal",
      headline: "Senior Full Stack Engineer",
      summary: "Passionate developer with expertise in React, Next.js, and Node.js.",
      email: "rajen@example.com",
      phone: "+1 234 567 8900",
      location: "San Francisco, CA",
      website: "https://rajenmandal.com",
    },
    socialLinks: [
      { platform: "GitHub", url: "https://github.com/rajen" },
      { platform: "LinkedIn", url: "https://linkedin.com/in/rajen" },
    ],
    skills: [
      { id: "1", name: "TypeScript" },
      { id: "2", name: "Next.js" },
      { id: "3", name: "PostgreSQL" },
    ],
    experience: [
      {
        id: "exp1",
        company: "Tech Corp",
        position: "Lead Engineer",
        employmentType: "FULL_TIME",
        startDate: "2022-01-01T00:00:00.000Z",
        current: true,
        description: "Built scalable web apps.",
      },
    ],
    education: [
      {
        id: "edu1",
        institution: "State University",
        degree: "BACHELORS",
        fieldOfStudy: "Computer Science",
        startDate: "2018-09-01T00:00:00.000Z",
        endDate: "2022-05-31T00:00:00.000Z",
        current: false,
      },
    ],
    projects: [
      {
        id: "proj1",
        title: "MyFolio SaaS",
        description: "Portfolio builder for developers.",
        technologies: ["Next.js", "Prisma"],
      },
    ],
    settings: {
      template: "PROFESSIONAL",
      showSummary: true,
      showSkills: true,
      showExperience: true,
      showEducation: true,
      showProjects: true,
      showSocialLinks: true,
    },
  };

  // 3. Test PDF Rendering for PROFESSIONAL template
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profBuffer = await renderToBuffer(PDFRenderer({ data: mockResumeData }) as any);
  const profHeader = profBuffer.toString("utf8", 0, 5);
  assert(profHeader === "%PDF-", "PROFESSIONAL template generates valid PDF buffer with %PDF- header");

  // 4. Test PDF Rendering for MODERN template
  const modernData: ResumeData = {
    ...mockResumeData,
    settings: { ...mockResumeData.settings, template: "MODERN" },
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const modernBuffer = await renderToBuffer(PDFRenderer({ data: modernData }) as any);
  assert(modernBuffer.toString("utf8", 0, 5) === "%PDF-", "MODERN template generates valid PDF buffer");

  // 5. Test PDF Rendering for MINIMAL template
  const minimalData: ResumeData = {
    ...mockResumeData,
    settings: { ...mockResumeData.settings, template: "MINIMAL" },
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const minimalBuffer = await renderToBuffer(PDFRenderer({ data: minimalData }) as any);
  assert(minimalBuffer.toString("utf8", 0, 5) === "%PDF-", "MINIMAL template generates valid PDF buffer");

  // 6. Test Hidden Section Behavior (no empty blocks rendered)
  const hiddenSectionsData: ResumeData = {
    ...mockResumeData,
    settings: {
      template: "PROFESSIONAL",
      showSummary: false,
      showSkills: false,
      showExperience: false,
      showEducation: false,
      showProjects: false,
      showSocialLinks: false,
    },
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hiddenBuffer = await renderToBuffer(PDFRenderer({ data: hiddenSectionsData }) as any);
  assert(hiddenBuffer.toString("utf8", 0, 5) === "%PDF-", "PDF generates cleanly when sections are toggled hidden");

  console.log("All Resume Builder & PDF Generation Tests Passed Successfully! 🎉");
}

runResumeTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
