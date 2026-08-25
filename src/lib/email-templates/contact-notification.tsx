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
  email?: string;
  companyName?: string;
  interest?: string;
  message?: string;
}

const Email = ({ name, email, companyName, interest, message }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`New enquiry from ${name ?? "a visitor"}${companyName ? ` (${companyName})` : ""}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>KALVOTEQ · WEBSITE ENQUIRY</Text>
        <Heading style={h1}>New contact form submission</Heading>
        <Section style={panel}>
          <Text style={row}>
            <b>Name:</b> {name ?? "—"}
          </Text>
          <Text style={row}>
            <b>Email:</b> {email ?? "—"}
          </Text>
          <Text style={row}>
            <b>Company:</b> {companyName ?? "—"}
          </Text>
          <Text style={row}>
            <b>Interest:</b> {interest ?? "—"}
          </Text>
        </Section>
        <Text style={label}>Message</Text>
        <Text style={value}>{message ?? "—"}</Text>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    `New enquiry: ${data["name"] ?? "Website visitor"}${data["companyName"] ? ` — ${data["companyName"]}` : ""}`,
  displayName: "Contact form notification (internal)",
  previewData: {
    name: "Jane Tamm",
    email: "jane@acme.com",
    companyName: "Acme OU",
    interest: "Cloud Engineering & DevOps",
    message: "We need help migrating our platform.",
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
  margin: 0,
  whiteSpace: "pre-wrap" as const,
};
