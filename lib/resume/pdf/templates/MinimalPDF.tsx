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
    fontSize: 9,
    lineHeight: 1.35,
    color: "#0F172A",
  },
  header: {
    marginBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#94A3B8",
    paddingBottom: 8,
  },
  name: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#0F172A",
    marginBottom: 2,
  },
  headline: {
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#475569",
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    fontSize: 8,
    color: "#64748B",
  },
  contactItem: {
    marginRight: 4,
  },
  link: {
    color: "#0F172A",
    textDecoration: "underline",
  },
  section: {
    marginTop: 8,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: "#0F172A",
    textTransform: "uppercase",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  summaryText: {
    fontSize: 9,
    color: "#334155",
    lineHeight: 1.4,
  },
  itemBlock: {
    marginBottom: 6,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  itemTitle: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: "#0F172A",
  },
  itemSub: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Oblique",
    color: "#475569",
  },
  itemDate: {
    fontSize: 8,
    color: "#64748B",
  },
  itemDescription: {
    fontSize: 8.5,
    color: "#334155",
    marginTop: 1,
    lineHeight: 1.35,
  },
  skillsText: {
    fontSize: 8.5,
    color: "#334155",
    lineHeight: 1.4,
  },
});

interface PDFProps {
  data: ResumeData;
}

export default function MinimalPDF({ data }: PDFProps) {
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
            {profile.phone && <Text style={styles.contactItem}>| {profile.phone}</Text>}
            {profile.location && <Text style={styles.contactItem}>| {profile.location}</Text>}
            {profile.website && (
              <Text style={styles.contactItem}>
                | <Link src={profile.website} style={styles.link}>{profile.website.replace(/^https?:\/\//, "")}</Link>
              </Text>
            )}
            {showSocial &&
              socialLinks.map((s, idx) => (
                <Text key={idx} style={styles.contactItem}>
                  | <Link src={s.url} style={styles.link}>{s.platform}</Link>
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
            <Text style={styles.sectionTitle}>Experience</Text>
            {experience.map((exp) => (
              <View key={exp.id} style={styles.itemBlock} wrap={false}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>
                    {exp.position} — {exp.company}
                  </Text>
                  <Text style={styles.itemDate}>
                    {formatPDFDateRange(exp.startDate, exp.endDate, exp.current)}
                  </Text>
                </View>
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
                    {edu.institution} — {edu.degree} {edu.fieldOfStudy ? `(${edu.fieldOfStudy})` : ""}
                  </Text>
                  <Text style={styles.itemDate}>
                    {formatPDFDateRange(edu.startDate, edu.endDate, edu.current)}
                  </Text>
                </View>
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
            <Text style={styles.skillsText}>
              {skills.map((s) => s.name).join(" · ")}
            </Text>
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
                      <Text style={styles.itemDate}>Link</Text>
                    </Link>
                  )}
                </View>
                <Text style={styles.itemDescription}>{proj.description}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
