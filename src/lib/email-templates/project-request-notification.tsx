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
  name?: string;
  company?: string;
  businessEmail?: string;
  projectType?: string;
  projectDescription?: string;
  currentStage?: string;
  expectedTimeline?: string;
  approximateBudgetRange?: string;
  requiredTechnologies?: string;
  additionalInformation?: string;
}

const Email = (props: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`New project enquiry from ${props.name ?? "a visitor"}${props.company ? ` (${props.company})` : ""}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>KALVOTEQ · START A PROJECT</Text>
        <Heading style={h1}>New project request</Heading>
        <Section style={panel}>
          <Text style={row}>
            <b>Name:</b> {props.name ?? "—"}
          </Text>
          <Text style={row}>
            <b>Company:</b> {props.company ?? "—"}
          </Text>
          <Text style={row}>
            <b>Email:</b> {props.businessEmail ?? "—"}
          </Text>
          <Text style={row}>
            <b>Project type:</b> {props.projectType ?? "—"}
          </Text>
          <Text style={row}>
            <b>Current stage:</b> {props.currentStage ?? "—"}
          </Text>
          <Text style={row}>
            <b>Expected timeline:</b> {props.expectedTimeline ?? "—"}
          </Text>
          <Text style={row}>
            <b>Approximate budget range:</b> {props.approximateBudgetRange ?? "—"}
          </Text>
          {props.requiredTechnologies ? (
            <Text style={row}>
              <b>Required technologies:</b> {props.requiredTechnologies}
            </Text>
          ) : null}
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
    `New project request: ${data["name"] ?? "Website visitor"}${data["company"] ? ` — ${data["company"]}` : ""}`,
  displayName: "Project request notification (internal)",
  previewData: {
    name: "Jane Tamm",
    company: "Acme OU",
    businessEmail: "jane@acme.com",
    projectType: "Custom Software Development",
    projectDescription: "We need to rebuild our internal operations platform.",
    currentStage: "Idea / discovery",
    expectedTimeline: "3-6 months",
    approximateBudgetRange: "€50k-€100k",
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
