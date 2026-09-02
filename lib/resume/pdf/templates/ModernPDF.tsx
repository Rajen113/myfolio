import React from "react";
import { Document, Page, View, Text, Link, StyleSheet } from "@react-pdf/renderer";
import { ResumeData } from "../../types";
import { formatPDFDateRange } from "../pdf-utils";

const styles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingBottom: 32,
    paddingLeft: 40,
    paddingRight: 40,
    fontFamily: "Helvetica",
    fontSize: 9.5,
    lineHeight: 1.4,
    color: "#1E293B",
  },
  accentBar: {
    height: 4,
    backgroundColor: "#3B82F6",
    marginBottom: 12,
    borderRadius: 2,
  },
  header: {
    marginBottom: 14,
  },
  name: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: "#0F172A",
    marginBottom: 2,
  },
  headline: {
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#3B82F6",
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    fontSize: 8.5,
    color: "#475569",
    backgroundColor: "#F8FAFC",
    padding: 8,
    borderRadius: 4,
  },
  contactItem: {
    marginRight: 8,
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
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: "#1E3A8A",
    textTransform: "uppercase",
    marginBottom: 6,
    letterSpacing: 0.8,
  },
  summaryText: {
    fontSize: 9.5,
    color: "#334155",
    lineHeight: 1.45,
  },
  itemBlock: {
    marginBottom: 8,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: "#E2E8F0",
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
    fontFamily: "Helvetica-Bold",
    color: "#3B82F6",
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
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 3,
    color: "#1E40AF",
  },
});

interface PDFProps {
  data: ResumeData;
}

export default function ModernPDF({ data }: PDFProps) {
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
        <View style={styles.accentBar} />

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
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.summaryText}>{profile.summary}</Text>
          </View>
        )}

        {/* EXPERIENCE */}
        {showExperience && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Experience</Text>
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
            <Text style={styles.sectionTitle}>Technical Skills</Text>
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
                      <Text style={styles.itemDate}>Live Link</Text>
                    </Link>
                  )}
                </View>
                <Text style={styles.itemDescription}>{proj.description}</Text>
                {proj.technologies && proj.technologies.length > 0 && (
                  <Text style={styles.itemSub}>
                    Tech: {proj.technologies.join(" • ")}
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
