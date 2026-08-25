import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const careerApplicationInput = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  role: z.string().trim().min(2).max(120),
  message: z.string().trim().min(20).max(2000),
});

export const submitCareerApplication = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => careerApplicationInput.parse(data))
  .handler(async ({ data }) => {
    const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
    const key = `${data.email}-${Date.now()}`;

    await sendTemplateEmail("career-application-notification", "hello@kalvoteq.com", {
      templateData: data,
      idempotencyKey: `career-application-notify-${key}`,
      replyTo: data.email,
    });

    await sendTemplateEmail("career-application-confirmation", data.email, {
      templateData: { name: data.name, role: data.role },
      idempotencyKey: `career-application-confirm-${key}`,
      replyTo: "hello@kalvoteq.com",
    });

    return { ok: true };
  });
