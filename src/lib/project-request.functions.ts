import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const projectRequestInput = z.object({
  name: z.string().trim().min(2).max(100),
  company: z.string().trim().min(2).max(120),
  businessEmail: z.string().trim().email().max(255),
  projectType: z.string().trim().min(1).max(150),
  projectDescription: z.string().trim().min(20).max(2000),
  currentStage: z.string().trim().min(1).max(100),
  expectedTimeline: z.string().trim().min(1).max(100),
  approximateBudgetRange: z.string().trim().min(1).max(100),
  requiredTechnologies: z.string().trim().max(300).optional(),
  additionalInformation: z.string().trim().max(2000).optional(),
});

export const submitProjectRequest = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => projectRequestInput.parse(data))
  .handler(async ({ data }) => {
    const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
    const key = `${data.businessEmail}-${Date.now()}`;

    await sendTemplateEmail("project-request-notification", "hello@kalvoteq.com", {
      templateData: data,
      idempotencyKey: `project-request-notify-${key}`,
      replyTo: data.businessEmail,
    });

    await sendTemplateEmail("project-request-confirmation", data.businessEmail, {
      templateData: {
        name: data.name,
        projectType: data.projectType,
        projectDescription: data.projectDescription,
      },
      idempotencyKey: `project-request-confirm-${key}`,
      replyTo: "hello@kalvoteq.com",
    });

    return { ok: true };
  });
