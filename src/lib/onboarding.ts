import type { WelcomeRole } from "@/lib/email-templates/welcome";

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  /** Internal app path the step leads to. */
  to: string;
  ctaLabel: string;
  /** Steps that the app can verify on its own (e.g. profile fields). */
  auto?: "display_name" | "avatar";
}

export interface OnboardingTrack {
  headline: string;
  intro: string;
  steps: OnboardingStep[];
}

const accountSteps: OnboardingStep[] = [
  {
    id: "name",
    title: "Add your name",
    description: "Your display name appears across the portals, workspace, and delivery notes.",
    to: "/account",
    ctaLabel: "Account settings",
    auto: "display_name",
  },
  {
    id: "avatar",
    title: "Upload a profile picture",
    description: "A square photo helps teammates recognise you in messages and reviews.",
    to: "/account",
    ctaLabel: "Upload picture",
    auto: "avatar",
  },
];

export const ONBOARDING_TRACKS: Record<WelcomeRole, OnboardingTrack> = {
  admin: {
    headline: "Set up your admin console",
    intro: "You have full access to content, delivery, and team administration.",
    steps: [
      ...accountSteps,
      {
        id: "team",
        title: "Review team & access",
        description: "Invite colleagues and assign admin, client, or developer roles.",
        to: "/admin/team",
        ctaLabel: "Open team & access",
      },
      {
        id: "editorial",
        title: "Publish your first insight",
        description: "Draft, schedule, and publish articles from the editorial workspace.",
        to: "/admin",
        ctaLabel: "Open editorial",
      },
      {
        id: "delivery",
        title: "Set up client delivery",
        description: "Create client projects, deliverables, and invoices.",
        to: "/admin/delivery",
        ctaLabel: "Open delivery",
      },
    ],
  },
  client: {
    headline: "Get your client portal ready",
    intro: "Project progress, deliverables, invoices, and messages all live in your portal.",
    steps: [
      ...accountSteps,
      {
        id: "company",
        title: "Complete your company profile",
        description: "Add company details and billing information so we can tailor your engagement.",
        to: "/portal-profile",
        ctaLabel: "Company profile",
      },
      {
        id: "logo",
        title: "Upload your company logo",
        description: "Your logo brands the portal and the documents we share with you.",
        to: "/portal-profile",
        ctaLabel: "Upload logo",
      },
      {
        id: "request",
        title: "Review projects and raise a request",
        description: "Check active projects and send your first request to the engineering team.",
        to: "/portal",
        ctaLabel: "Open portal",
      },
    ],
  },
  developer: {
    headline: "Set up your engineering workspace",
    intro: "Your workspace holds your engineering profile, documents, and client assignments.",
    steps: [
      ...accountSteps,
      {
        id: "profile",
        title: "Complete your developer profile",
        description: "Add your stack, seniority, and availability so we can match you well.",
        to: "/workspace-profile",
        ctaLabel: "Developer profile",
      },
      {
        id: "documents",
        title: "Upload your CV or portfolio",
        description: "Documents are private — only kalvoteq admins can review them.",
        to: "/workspace-profile",
        ctaLabel: "Upload documents",
      },
      {
        id: "assignments",
        title: "Check your assignments",
        description: "See the client projects and deliverables you are assigned to.",
        to: "/workspace",
        ctaLabel: "Open workspace",
      },
    ],
  },
  member: {
    headline: "Welcome to kalvoteq",
    intro: "Your account is active. Once an administrator assigns your role, the matching workspace unlocks.",
    steps: [
      ...accountSteps,
      {
        id: "wait",
        title: "Wait for your access level",
        description: "An administrator assigns admin, client, or developer access. This page updates automatically.",
        to: "/contact",
        ctaLabel: "Contact us",
      },
    ],
  },
};

export const onboardingStorageKey = (userId: string, role: WelcomeRole) => `kalvoteq:onboarding:${role}:${userId}`;

export function readCompleted(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? (JSON.parse(raw) as unknown) : null;
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function writeCompleted(key: string, ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    // Ignore storage failures (private mode, quota).
  }
}
