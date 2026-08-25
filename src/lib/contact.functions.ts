import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

const contactInput = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  companyName: z.string().trim().min(2).max(120),
  interest: z.string().trim().min(1).max(120),
  message: z.string().trim().min(20).max(2000),
})

export const submitContactEnquiry = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => contactInput.parse(data))
  .handler(async ({ data }) => {
    const { sendTemplateEmail } = await import('@/lib/email-templates/send-email')
    const key = `${data.email}-${Date.now()}`

    await sendTemplateEmail('contact-notification', 'hello@kalvoteq.com', {
      templateData: data,
      idempotencyKey: `contact-notify-${key}`,
      replyTo: data.email,
    })

    await sendTemplateEmail('contact-confirmation', data.email, {
      templateData: { name: data.name, interest: data.interest, message: data.message },
      idempotencyKey: `contact-confirm-${key}`,
      replyTo: 'hello@kalvoteq.com',
    })

    return { ok: true }
  })
