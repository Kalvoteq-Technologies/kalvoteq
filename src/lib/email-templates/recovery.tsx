import * as React from "react";

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";
import type { TemplateEntry } from "./registry";

interface RecoveryEmailProps {
  siteName: string;
  confirmationUrl: string;
}

export const RecoveryEmail = ({ siteName, confirmationUrl }: RecoveryEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Reset your password for {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Reset your password</Heading>
        <Text style={text}>
          We received a request to reset your password for {siteName}. Click the button below to
          choose a new password.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Reset Password
        </Button>
        <Text style={footer}>
          If you didn't request a password reset, you can safely ignore this email. Your password
          will not be changed.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default RecoveryEmail;

export const template = {
  component: RecoveryEmail,
  subject: (data: Record<string, any>) => `Reset your password — ${data["siteName"] ?? "kalvoteq"}`,
  displayName: "Auth: password recovery",
  previewData: {
    siteName: "kalvoteq",
    confirmationUrl: "https://kalvoteq.com",
  },
} satisfies TemplateEntry;

const main = {
  backgroundColor: "#ffffff",
  fontFamily: "Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif",
};
const container = {
  padding: "32px 28px",
  maxWidth: "560px",
  border: "1px solid #e2e8f0",
  borderRadius: "14px",
};
const h1 = {
  fontSize: "22px",
  fontWeight: "bold" as const,
  color: "#0b1220",
  letterSpacing: "-0.02em",
  margin: "0 0 20px",
};
const text = {
  fontSize: "14px",
  color: "#55575d",
  lineHeight: "1.5",
  margin: "0 0 25px",
};
const button = {
  backgroundColor: "#2563eb",
  color: "#ffffff",
  fontSize: "14px",
  borderRadius: "8px",
  padding: "12px 20px",
  textDecoration: "none",
};
const footer = { fontSize: "12px", color: "#999999", margin: "30px 0 0" };
