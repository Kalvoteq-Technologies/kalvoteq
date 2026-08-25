import type { ComponentType } from "react";

export interface TemplateEntry {
  component: ComponentType<any>;
  subject: string | ((data: Record<string, any>) => string);
  displayName?: string;
  previewData?: Record<string, any>;
  /** Fixed recipient — overrides caller-provided recipientEmail when set. */
  to?: string;
}

/**
 * Template registry — maps template names to their React Email components.
 * Import and register new templates here after creating them in this directory.
 *
 * Example:
 *   import { template as welcomeTemplate } from './welcome'
 *   // then add to TEMPLATES: 'welcome': welcomeTemplate
 */
import { template as contactConfirmation } from "./contact-confirmation";
import { template as contactNotification } from "./contact-notification";
import { template as welcome } from "./welcome";
import { template as talentRequestNotification } from "./talent-request-notification";
import { template as talentRequestConfirmation } from "./talent-request-confirmation";
import { template as projectRequestNotification } from "./project-request-notification";
import { template as projectRequestConfirmation } from "./project-request-confirmation";
import { template as careerApplicationNotification } from "./career-application-notification";
import { template as careerApplicationConfirmation } from "./career-application-confirmation";

export const TEMPLATES: Record<string, TemplateEntry> = {
  "contact-confirmation": contactConfirmation,
  "contact-notification": contactNotification,
  welcome: welcome,
  "talent-request-notification": talentRequestNotification,
  "talent-request-confirmation": talentRequestConfirmation,
  "project-request-notification": projectRequestNotification,
  "project-request-confirmation": projectRequestConfirmation,
  "career-application-notification": careerApplicationNotification,
  "career-application-confirmation": careerApplicationConfirmation,
};
