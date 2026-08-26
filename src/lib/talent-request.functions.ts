import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const talentRequestInput = z.object({
  fullName: z.string().trim().min(2).max(100),
  businessEmail: z.string().trim().email().max(255),
  company: z.string().trim().min(2).max(120),
  country: z.string().trim().min(2).max(100),
  requiredRole: z.string().trim().min(2).max(150),
  requiredSkills: z.string().trim().min(2).max(500),
  technologyStack: z.string().trim().min(2).max(300),
  numberOfEngineers: z.string().trim().min(1).max(20),
  seniority: z.string().trim().min(1).max(50),
  expectedStartDate: z.string().trim().min(1).max(50),
  expectedEngagementDuration: z.string().trim().min(1).max(100),
  preferredTimezoneOverlap: z.string().trim().min(1).max(150),
  projectDescription: z.string().trim().min(20).max(2000),
  additionalInformation: z.string().trim().max(2000).optional(),
});

export const submitTalentRequest = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => talentRequestInput.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error: insertError } = await supabaseAdmin.from("talent_requests").insert({
      full_name: data.fullName,
      business_email: data.businessEmail,
      company: data.company,
      country: data.country,
      required_role: data.requiredRole,
      required_skills: data.requiredSkills,
      technology_stack: data.technologyStack,
      number_of_engineers: data.numberOfEngineers,
      seniority: data.seniority,
      expected_start_date: data.expectedStartDate,
      expected_engagement_duration: data.expectedEngagementDuration,
      preferred_timezone_overlap: data.preferredTimezoneOverlap,
      project_description: data.projectDescription,
      additional_information: data.additionalInformation ?? null,
    });
    if (insertError) console.error("[talent-request] Failed to persist lead", insertError);

    const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
    const key = `${data.businessEmail}-${Date.now()}`;

    await sendTemplateEmail("talent-request-notification", "hello@kalvoteq.com", {
      templateData: data,
      idempotencyKey: `talent-request-notify-${key}`,
      replyTo: data.businessEmail,
    });

    await sendTemplateEmail("talent-request-confirmation", data.businessEmail, {
      templateData: {
        fullName: data.fullName,
        requiredRole: data.requiredRole,
        technologyStack: data.technologyStack,
      },
      idempotencyKey: `talent-request-confirm-${key}`,
      replyTo: "hello@kalvoteq.com",
    });

    return { ok: true };
  });
