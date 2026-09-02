import React from "react";
import { Document, Page, View, Text, Link, StyleSheet } from "@react-pdf/renderer";
import { ResumeData } from "../../types";
import { formatPDFDateRange } from "../pdf-utils";

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingLeft: 44,
    paddingRight: 44,
    fontFamily: "Helvetica",
    fontSize: 9.5,
    lineHeight: 1.4,
    color: "#1E293B",
  },
  header: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#CBD5E1",
    paddingBottom: 10,
  },
  name: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#0F172A",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  headline: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#2563EB",
    marginBottom: 6,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    fontSize: 8.5,
    color: "#475569",
  },
  contactItem: {
    marginRight: 6,
  },
  link: {
    color: "#2563EB",
    textDecoration: "none",
  },
  section: {
    marginTop: 10,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#0F172A",
    textTransform: "uppercase",
    borderBottomWidth: 1,
    borderBottomColor: "#0F172A",
    paddingBottom: 2,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  summaryText: {
    fontSize: 9.5,
    color: "#334155",
    lineHeight: 1.45,
  },
  itemBlock: {
    marginBottom: 7,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 2,
  },
  itemTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#0F172A",
  },
  itemSub: {
    fontSize: 9,
    fontFamily: "Helvetica-Oblique",
    color: "#475569",
  },
  itemDate: {
    fontSize: 8.5,
    color: "#64748B",
  },
  itemDescription: {
    fontSize: 9,
    color: "#334155",
    marginTop: 2,
    lineHeight: 1.4,
  },
  skillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  skillTag: {
    fontSize: 8.5,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 3,
    color: "#334155",
  },
});

interface PDFProps {
  data: ResumeData;
}

export default function ProfessionalPDF({ data }: PDFProps) {
  const { profile, socialLinks, skills, experience, education, projects, settings } = data;

  const showSummary = settings.showSummary && Boolean(profile.summary);
  const showSkills = settings.showSkills && skills.length > 0;
  const showExperience = settings.showExperience && experience.length > 0;
  const showEducation = settings.showEducation && education.length > 0;
  const showProjects = settings.showProjects && projects.length > 0;
  const showSocial = settings.showSocialLinks && socialLinks.length > 0;

  return (
    <Document title={`${profile.name} - Resume`}>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.name}>{profile.name}</Text>
          {profile.headline && <Text style={styles.headline}>{profile.headline}</Text>}

          <View style={styles.contactRow}>
            {profile.email && <Text style={styles.contactItem}>{profile.email}</Text>}
            {profile.phone && <Text style={styles.contactItem}>• {profile.phone}</Text>}
            {profile.location && <Text style={styles.contactItem}>• {profile.location}</Text>}
            {profile.website && (
              <Text style={styles.contactItem}>
                • <Link src={profile.website} style={styles.link}>{profile.website.replace(/^https?:\/\//, "")}</Link>
              </Text>
            )}
            {showSocial &&
              socialLinks.map((s, idx) => (
                <Text key={idx} style={styles.contactItem}>
                  • <Link src={s.url} style={styles.link}>{s.platform}</Link>
                </Text>
              ))}
          </View>
        </View>

        {/* SUMMARY */}
        {showSummary && profile.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.summaryText}>{profile.summary}</Text>
          </View>
        )}

        {/* EXPERIENCE */}
        {showExperience && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {experience.map((exp) => (
              <View key={exp.id} style={styles.itemBlock} wrap={false}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{exp.position}</Text>
                  <Text style={styles.itemDate}>
                    {formatPDFDateRange(exp.startDate, exp.endDate, exp.current)}
                  </Text>
                </View>
                <Text style={styles.itemSub}>
                  {exp.company} {exp.location ? `| ${exp.location}` : ""}
                </Text>
                {exp.description && (
                  <Text style={styles.itemDescription}>{exp.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* EDUCATION */}
        {showEducation && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map((edu) => (
              <View key={edu.id} style={styles.itemBlock} wrap={false}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>
                    {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}
                  </Text>
                  <Text style={styles.itemDate}>
                    {formatPDFDateRange(edu.startDate, edu.endDate, edu.current)}
                  </Text>
                </View>
                <Text style={styles.itemSub}>
                  {edu.institution} {edu.location ? `| ${edu.location}` : ""}
                  {edu.grade ? ` (Grade: ${edu.grade})` : ""}
                </Text>
                {edu.description && (
                  <Text style={styles.itemDescription}>{edu.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* SKILLS */}
        {showSkills && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsWrap}>
              {skills.map((skill) => (
                <Text key={skill.id} style={styles.skillTag}>
                  {skill.name}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* PROJECTS */}
        {showProjects && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {projects.map((proj) => (
              <View key={proj.id} style={styles.itemBlock} wrap={false}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{proj.title}</Text>
                  {proj.liveUrl && (
                    <Link src={proj.liveUrl} style={styles.link}>
                      <Text style={styles.itemDate}>Live Project</Text>
                    </Link>
                  )}
                </View>
                <Text style={styles.itemDescription}>{proj.description}</Text>
                {proj.technologies && proj.technologies.length > 0 && (
                  <Text style={styles.itemSub}>
                    Technologies: {proj.technologies.join(", ")}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
