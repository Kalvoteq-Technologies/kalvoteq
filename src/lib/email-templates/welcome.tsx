import React from 'react'
import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

export type WelcomeRole = 'admin' | 'client' | 'developer' | 'member'

interface Props {
  name?: string
  role?: WelcomeRole
  siteUrl?: string
  temporaryPassword?: string
}

interface RoleCopy {
  headline: string
  intro: string
  steps: string[]
  ctaLabel: string
  ctaPath: string
}

const ROLE_COPY: Record<WelcomeRole, RoleCopy> = {
  admin: {
    headline: 'Your kalvoteq admin access is ready',
    intro:
      'You have full access to the kalvoteq workspace — content, delivery, and team administration all run from the admin console.',
    steps: [
      'Open the admin console and review the team & access panel.',
      'Publish or schedule insights articles from the editorial section.',
      'Set up client projects, deliverables, and invoices under delivery.',
    ],
    ctaLabel: 'Open the admin console',
    ctaPath: '/admin',
  },
  client: {
    headline: 'Welcome to your kalvoteq client portal',
    intro:
      'Your portal is where project progress, deliverables, invoices, and messages with our engineering team live in one place.',
    steps: [
      'Complete your company profile so we can tailor your engagement.',
      'Upload your company logo and add your billing details.',
      'Review your active projects and raise your first request.',
    ],
    ctaLabel: 'Go to your portal',
    ctaPath: '/portal',
  },
  developer: {
    headline: 'Welcome to the kalvoteq engineering workspace',
    intro:
      'Your workspace holds your engineering profile, documents, and the client contexts you are assigned to.',
    steps: [
      'Complete your developer profile — stack, seniority, and availability.',
      'Upload your CV or portfolio documents for review.',
      'Check your assigned client projects and deliverables.',
    ],
    ctaLabel: 'Open your workspace',
    ctaPath: '/workspace-profile',
  },
  member: {
    headline: 'Welcome to kalvoteq',
    intro:
      'Your account is active. Once an administrator assigns your role, the matching workspace unlocks automatically.',
    steps: [
      'Add your name and profile picture in account settings.',
      'Wait for an administrator to assign your access level.',
      'Reply to this email if you expected access you cannot see.',
    ],
    ctaLabel: 'Open account settings',
    ctaPath: '/account',
  },
}

const Email = ({ name, role = 'member', siteUrl = 'https://kalvoteq.com', temporaryPassword }: Props) => {
  const copy = ROLE_COPY[role] ?? ROLE_COPY.member
  const base = siteUrl.replace(/\/$/, '')

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{copy.headline}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={brand}>KALVOTEQ</Text>
          <Heading style={h1}>{copy.headline}</Heading>
          <Text style={text}>
            {name ? `Hi ${name}, ` : 'Hi there, '}
            {copy.intro}
          </Text>

          {temporaryPassword ? (
            <Section style={panel}>
              <Text style={label}>Temporary password</Text>
              <Text style={value}>{temporaryPassword}</Text>
              <Text style={hint}>Change it from account settings after your first sign-in.</Text>
            </Section>
          ) : null}

          <Section style={panel}>
            <Text style={label}>Next steps</Text>
            {copy.steps.map((step, index) => (
              <Text key={step} style={value}>
                {index + 1}. {step}
              </Text>
            ))}
          </Section>

          <Button href={`${base}${copy.ctaPath}`} style={button}>
            {copy.ctaLabel}
          </Button>

          <Hr style={hr} />
          <Text style={footer}>Kalvoteq Technologies OU · Tallinn, Estonia</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    (ROLE_COPY[(data['role'] as WelcomeRole) ?? 'member'] ?? ROLE_COPY.member).headline,
  displayName: 'Welcome (role-aware)',
  previewData: { name: 'Jane Tamm', role: 'client', siteUrl: 'https://kalvoteq.com' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Helvetica, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const brand = { fontSize: '12px', letterSpacing: '0.18em', color: '#2563eb', fontWeight: 700, margin: '0 0 16px' }
const h1 = { fontSize: '24px', color: '#0b1220', margin: '0 0 12px' }
const text = { fontSize: '15px', lineHeight: '24px', color: '#334155', margin: '0 0 16px' }
const panel = { backgroundColor: '#f8fafc', borderRadius: '10px', padding: '14px 16px', margin: '0 0 16px' }
const label = {
  fontSize: '11px',
  letterSpacing: '0.12em',
  textTransform: 'uppercase' as const,
  color: '#64748b',
  margin: '0 0 8px',
}
const value = { fontSize: '14px', lineHeight: '22px', color: '#0b1220', margin: '0 0 6px' }
const hint = { fontSize: '12px', color: '#64748b', margin: '6px 0 0' }
const button = {
  backgroundColor: '#2563eb',
  color: '#ffffff',
  borderRadius: '8px',
  padding: '12px 20px',
  fontSize: '14px',
  fontWeight: 600,
  textDecoration: 'none',
  display: 'inline-block',
}
const hr = { borderColor: '#e2e8f0', margin: '24px 0 16px' }
const footer = { fontSize: '12px', color: '#94a3b8', margin: 0 }
