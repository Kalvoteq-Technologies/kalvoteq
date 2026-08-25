import React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { TemplateEntry } from "./registry";

interface Props {
  fullName?: string;
  businessEmail?: string;
  company?: string;
  country?: string;
  requiredRole?: string;
  requiredSkills?: string;
  technologyStack?: string;
  numberOfEngineers?: string;
  seniority?: string;
  expectedStartDate?: string;
  expectedEngagementDuration?: string;
  preferredTimezoneOverlap?: string;
  projectDescription?: string;
  additionalInformation?: string;
}

const Email = (props: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`New talent request from ${props.fullName ?? "a visitor"}${props.company ? ` (${props.company})` : ""}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>KALVOTEQ · SCALE YOUR TEAM</Text>
        <Heading style={h1}>New engineering talent request</Heading>
        <Section style={panel}>
          <Text style={row}>
            <b>Name:</b> {props.fullName ?? "—"}
          </Text>
          <Text style={row}>
            <b>Email:</b> {props.businessEmail ?? "—"}
          </Text>
          <Text style={row}>
            <b>Company:</b> {props.company ?? "—"}
          </Text>
          <Text style={row}>
            <b>Country:</b> {props.country ?? "—"}
          </Text>
          <Text style={row}>
            <b>Required role:</b> {props.requiredRole ?? "—"}
          </Text>
          <Text style={row}>
            <b>Required skills:</b> {props.requiredSkills ?? "—"}
          </Text>
          <Text style={row}>
            <b>Technology stack:</b> {props.technologyStack ?? "—"}
          </Text>
          <Text style={row}>
            <b>Number of engineers:</b> {props.numberOfEngineers ?? "—"}
          </Text>
          <Text style={row}>
            <b>Seniority:</b> {props.seniority ?? "—"}
          </Text>
          <Text style={row}>
            <b>Expected start date:</b> {props.expectedStartDate ?? "—"}
          </Text>
          <Text style={row}>
            <b>Expected engagement duration:</b> {props.expectedEngagementDuration ?? "—"}
          </Text>
          <Text style={row}>
            <b>Preferred time-zone overlap:</b> {props.preferredTimezoneOverlap ?? "—"}
          </Text>
        </Section>
        <Text style={label}>Project description</Text>
        <Text style={value}>{props.projectDescription ?? "—"}</Text>
        {props.additionalInformation ? (
          <>
            <Text style={label}>Additional information</Text>
            <Text style={value}>{props.additionalInformation}</Text>
          </>
        ) : null}
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    `New talent request: ${data["fullName"] ?? "Website visitor"}${data["company"] ? ` — ${data["company"]}` : ""}`,
  displayName: "Talent request notification (internal)",
  previewData: {
    fullName: "Jane Tamm",
    businessEmail: "jane@acme.com",
    company: "Acme OU",
    country: "Germany",
    requiredRole: "Senior Backend Engineer",
    requiredSkills: "Node.js, PostgreSQL, event-driven systems",
    technologyStack: "Node.js, NestJS, PostgreSQL, AWS",
    numberOfEngineers: "2",
    seniority: "Senior",
    expectedStartDate: "Within 4 weeks",
    expectedEngagementDuration: "6 months",
    preferredTimezoneOverlap: "CET +/- 2 hours",
    projectDescription: "We need additional backend capacity for a payments platform rebuild.",
  },
} satisfies TemplateEntry;

const main = { backgroundColor: "#ffffff", fontFamily: "Inter, Helvetica, Arial, sans-serif" };
const container = { padding: "32px 28px", maxWidth: "560px" };
const brand = {
  fontSize: "11px",
  letterSpacing: "0.16em",
  color: "#2563eb",
  fontWeight: 700,
  margin: "0 0 14px",
};
const h1 = { fontSize: "22px", color: "#0b1220", margin: "0 0 16px" };
const panel = {
  backgroundColor: "#f8fafc",
  borderRadius: "10px",
  padding: "14px 16px",
  margin: "0 0 16px",
};
const row = { fontSize: "14px", lineHeight: "22px", color: "#0b1220", margin: "0 0 4px" };
const label = {
  fontSize: "11px",
  letterSpacing: "0.12em",
  textTransform: "uppercase" as const,
  color: "#64748b",
  margin: "0 0 4px",
};
const value = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#334155",
  margin: "0 0 16px",
  whiteSpace: "pre-wrap" as const,
};
