import React from "react";
import { Body, Container, Head, Heading, Hr, Html, Preview, Text } from "@react-email/components";
import type { TemplateEntry } from "./registry";

interface Props {
  name?: string;
  role?: string;
}

const Email = ({ name, role }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Application received — kalvoteq replies within three working days.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>KALVOTEQ</Text>
        <Heading style={h1}>Thanks for applying{name ? `, ${name}` : ""}</Heading>
        <Text style={text}>
          Application received{role ? ` for ${role}` : ""}. Our talent team replies within three
          working days.
        </Text>
        <Hr style={hr} />
        <Text style={footer}>Kalvoteq Technologies OU · Tallinn, Estonia</Text>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: Email,
  subject: "Application received — kalvoteq",
  displayName: "Career application confirmation",
  previewData: {
    name: "Jane Tamm",
    role: "Senior Full-Stack Engineer",
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
const hr = { borderColor: "#e2e8f0", margin: "24px 0 16px" };
const footer = { fontSize: "12px", color: "#94a3b8", margin: 0 };
