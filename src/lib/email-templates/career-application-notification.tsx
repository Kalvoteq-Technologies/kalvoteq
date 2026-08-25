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
  role?: string;
  message?: string;
}

const Email = ({ name, email, role, message }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`New application from ${name ?? "a candidate"}${role ? ` for ${role}` : ""}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>KALVOTEQ · CAREERS</Text>
        <Heading style={h1}>New job application</Heading>
        <Section style={panel}>
          <Text style={row}>
            <b>Name:</b> {name ?? "—"}
          </Text>
          <Text style={row}>
            <b>Email:</b> {email ?? "—"}
          </Text>
          <Text style={row}>
            <b>Role:</b> {role ?? "—"}
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
    `New application: ${data["name"] ?? "Candidate"}${data["role"] ? ` — ${data["role"]}` : ""}`,
  displayName: "Career application notification (internal)",
  previewData: {
    name: "Jane Tamm",
    email: "jane@example.com",
    role: "Senior Full-Stack Engineer",
    message:
      "I have six years of experience building React and Node.js platforms. Portfolio: janetamm.dev",
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
