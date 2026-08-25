import React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { TemplateEntry } from "./registry";

interface Props {
  name?: string;
  projectType?: string;
  projectDescription?: string;
}

const Email = ({ name, projectType, projectDescription }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>We received your project request — kalvoteq replies within one business day.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>KALVOTEQ</Text>
        <Heading style={h1}>Thanks for reaching out{name ? `, ${name}` : ""}</Heading>
        <Text style={text}>
          Your project request landed with our engineering leadership in Tallinn. We reply within
          one business day with next steps.
        </Text>
        {projectType ? (
          <Section style={panel}>
            <Text style={label}>Project type</Text>
            <Text style={value}>{projectType}</Text>
          </Section>
        ) : null}
        {projectDescription ? (
          <Section style={panel}>
            <Text style={label}>Your project description</Text>
            <Text style={value}>{projectDescription}</Text>
          </Section>
        ) : null}
        <Hr style={hr} />
        <Text style={footer}>Kalvoteq Technologies OU · Tallinn, Estonia</Text>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: Email,
  subject: "We received your project request — kalvoteq",
  displayName: "Project request confirmation",
  previewData: {
    name: "Jane Tamm",
    projectType: "Custom Software Development",
    projectDescription: "We need to rebuild our internal operations platform.",
  },
} satisfies TemplateEntry;

const main = { backgroundColor: "#ffffff", fontFamily: "Inter, Helvetica, Arial, sans-serif" };
const container = { padding: "32px 28px", maxWidth: "560px" };
const brand = {
  fontSize: "12px",
  letterSpacing: "0.18em",
  color: "#2563eb",
  fontWeight: 700,
  margin: "0 0 16px",
};
const h1 = { fontSize: "24px", color: "#0b1220", margin: "0 0 12px" };
const text = { fontSize: "15px", lineHeight: "24px", color: "#334155", margin: "0 0 16px" };
const panel = {
  backgroundColor: "#f8fafc",
  borderRadius: "10px",
  padding: "14px 16px",
  margin: "0 0 12px",
};
const label = {
  fontSize: "11px",
  letterSpacing: "0.12em",
  textTransform: "uppercase" as const,
  color: "#64748b",
  margin: "0 0 4px",
};
const value = { fontSize: "14px", lineHeight: "22px", color: "#0b1220", margin: 0 };
const hr = { borderColor: "#e2e8f0", margin: "24px 0 16px" };
const footer = { fontSize: "12px", color: "#94a3b8", margin: 0 };
