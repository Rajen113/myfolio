export interface EducationOption {
  value: string;
  label: string;
}

export const DEGREE_OPTIONS: EducationOption[] = [
  { value: "HIGH_SCHOOL", label: "High School" },
  { value: "HIGHER_SECONDARY", label: "Higher Secondary / 12th" },
  { value: "DIPLOMA", label: "Diploma" },
  { value: "ASSOCIATE", label: "Associate Degree" },
  { value: "BA", label: "Bachelor of Arts (BA)" },
  { value: "BSC", label: "Bachelor of Science (BSc)" },
  { value: "BCOM", label: "Bachelor of Commerce (BCom)" },
  { value: "BBA", label: "Bachelor of Business Administration (BBA)" },
  { value: "BCA", label: "Bachelor of Computer Applications (BCA)" },
  { value: "BE", label: "Bachelor of Engineering (BE)" },
  { value: "BTECH", label: "Bachelor of Technology (BTech)" },
  { value: "BACHELOR_MECHANICAL", label: "Bachelor of Mechanical Engineering" },
  { value: "BACHELOR_CS", label: "Bachelor of Computer Science" },
  { value: "MA", label: "Master of Arts (MA)" },
  { value: "MSC", label: "Master of Science (MSc)" },
  { value: "MCOM", label: "Master of Commerce (MCom)" },
  { value: "MBA", label: "Master of Business Administration (MBA)" },
  { value: "MCA", label: "Master of Computer Applications (MCA)" },
  { value: "ME", label: "Master of Engineering (ME)" },
  { value: "MTECH", label: "Master of Technology (MTech)" },
  { value: "PHD", label: "Doctor of Philosophy (PhD)" },
  { value: "MD", label: "Doctor of Medicine (MD)" },
  { value: "LLB", label: "Law Degree (LLB)" },
  { value: "OTHER", label: "Other" },
];

export const FIELD_OF_STUDY_OPTIONS: EducationOption[] = [
  { value: "COMPUTER_SCIENCE", label: "Computer Science" },
  { value: "INFORMATION_TECHNOLOGY", label: "Information Technology" },
  { value: "SOFTWARE_ENGINEERING", label: "Software Engineering" },
  { value: "COMPUTER_ENGINEERING", label: "Computer Engineering" },
  { value: "DATA_SCIENCE", label: "Data Science" },
  { value: "ARTIFICIAL_INTELLIGENCE", label: "Artificial Intelligence" },
  { value: "MACHINE_LEARNING", label: "Machine Learning" },
  { value: "CYBER_SECURITY", label: "Cyber Security" },
  { value: "ELECTRONICS", label: "Electronics" },
  { value: "ELECTRICAL_ENGINEERING", label: "Electrical Engineering" },
  { value: "MECHANICAL_ENGINEERING", label: "Mechanical Engineering" },
  { value: "CIVIL_ENGINEERING", label: "Civil Engineering" },
  { value: "CHEMICAL_ENGINEERING", label: "Chemical Engineering" },
  { value: "AUTOMOBILE_ENGINEERING", label: "Automobile Engineering" },
  { value: "BUSINESS_ADMINISTRATION", label: "Business Administration" },
  { value: "FINANCE", label: "Finance" },
  { value: "ACCOUNTING", label: "Accounting" },
  { value: "COMMERCE", label: "Commerce" },
  { value: "ECONOMICS", label: "Economics" },
  { value: "MARKETING", label: "Marketing" },
  { value: "HUMAN_RESOURCES", label: "Human Resources" },
  { value: "PHYSICS", label: "Physics" },
  { value: "CHEMISTRY", label: "Chemistry" },
  { value: "MATHEMATICS", label: "Mathematics" },
  { value: "BIOLOGY", label: "Biology" },
  { value: "BIOTECHNOLOGY", label: "Biotechnology" },
  { value: "MEDICINE", label: "Medicine" },
  { value: "LAW", label: "Law" },
  { value: "PSYCHOLOGY", label: "Psychology" },
  { value: "ENGLISH", label: "English" },
  { value: "ARTS", label: "Arts" },
  { value: "DESIGN", label: "Design" },
  { value: "OTHER", label: "Other" },
];

export function getDegreeLabel(
  degreeValue: string | null | undefined,
  customDegree?: string | null | undefined
): string {
  if (!degreeValue) return "";
  if (degreeValue === "OTHER") {
    return customDegree || "Other";
  }
  const option = DEGREE_OPTIONS.find((opt) => opt.value === degreeValue);
  return option ? option.label : degreeValue;
}

export function getFieldOfStudyLabel(
  fieldValue: string | null | undefined,
  customFieldOfStudy?: string | null | undefined
): string {
  if (!fieldValue) return "";
  if (fieldValue === "OTHER") {
    return customFieldOfStudy || "Other";
  }
  const option = FIELD_OF_STUDY_OPTIONS.find((opt) => opt.value === fieldValue);
  return option ? option.label : fieldValue;
}
