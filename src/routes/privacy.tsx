import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/site/LegalPage";
import { company } from "@/data/site";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — kalvoteq" },
      {
        name: "description",
        content: "How kalvoteq collects, uses, and protects personal data under the GDPR.",
      },
      { property: "og:title", content: "Privacy Policy — kalvoteq" },
      { property: "og:description", content: "Our GDPR-aligned approach to personal data." },
      { property: "og:url", content: "/privacy" },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
  component: () => (
    <LegalPage eyebrow="Legal" title="Privacy Policy" updated="1 September 2026">
      <p>
        This policy explains how {company.legalName} ("kalvoteq", "we") processes personal data when
        you use this website, create a client or developer portal account, or engage us for
        services. We act as data controller for website enquiries and portal accounts, and as data
        processor when handling client data during delivery engagements.
      </p>
      <h2>Data we collect</h2>
      <ul>
        <li>Contact details you submit through our enquiry, application, or newsletter forms.</li>
        <li>
          Account data if you create a client or developer portal account: your name, email, and
          sign-in method (including Google, if you choose that option).
        </li>
        <li>
          Profile data you add to the portal: for clients, company name, size, country, industry,
          and website; for developers, headline, skills, years of experience, timezone, portfolio
          and GitHub links, and an uploaded avatar.
        </li>
        <li>
          Files you upload through the portal, such as developer documents and delivery
          deliverables, and the project, request, and invoice records generated during an
          engagement.
        </li>
        <li>Technical data such as IP address, browser type, and pages visited.</li>
        <li>Correspondence you send us by email, through the portal, or during an engagement.</li>
      </ul>
      <h2>Why we process it</h2>
      <ul>
        <li>
          To respond to your enquiry or application (legitimate interest, pre-contractual steps).
        </li>
        <li>To create and administer your portal account (performance of a contract).</li>
        <li>To deliver contracted services (performance of a contract).</li>
        <li>To send you our newsletter where you have opted in (consent).</li>
        <li>To secure and improve the website and portal (legitimate interest).</li>
      </ul>
      <h2>AI-assisted content research</h2>
      <p>
        Some kalvoteq Insights articles are researched and drafted with AI assistance as part of our
        editorial process, and reviewed and approved by our team before publication. This processing
        applies to publicly available third-party articles we research, not to your personal data —
        we do not send enquiry, account, or engagement data to AI tools as part of this process.
      </p>
      <h2>Retention</h2>
      <p>
        Enquiry data is kept for 24 months. Job applications are kept for 6 months unless you ask us
        to keep them longer. Portal account and profile data is kept for as long as your account is
        active, and deleted or anonymised within 12 months of account closure. Engagement records
        are retained for the period required by Estonian accounting and contract law.
      </p>
      <h2>Your rights</h2>
      <p>
        You may request access, rectification, erasure, restriction, portability, or object to
        processing. Write to {company.email}. You also have the right to complain to the Estonian
        Data Protection Inspectorate.
      </p>
      <h2>Transfers and subprocessors</h2>
      <p>
        Data is hosted in the European Union by default. We use a small number of subprocessors to
        run this website and portal: Supabase (database, authentication, and file storage), Resend
        (transactional email), Google (optional sign-in), and Anthropic (AI-assisted editorial
        research, described above). Where a subprocessor operates outside the EEA, we rely on
        standard contractual clauses and document the transfer in our data processing agreement.
      </p>
      <h2>Contact</h2>
      <p>
        {company.legalName}, registry code {company.registryCode}, VAT {company.vatNumber},{" "}
        {company.address}. Email {company.email}.
      </p>
    </LegalPage>
  ),
});
