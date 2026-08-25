import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/site/LegalPage";
import { company } from "@/data/site";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — kalvoteq" },
      {
        name: "description",
        content:
          "The terms governing use of this website and the framework for our consulting engagements.",
      },
      { property: "og:title", content: "Terms of Service — kalvoteq" },
      { property: "og:description", content: "Website terms and engagement framework." },
      { property: "og:url", content: "/terms" },
    ],
    links: [{ rel: "canonical", href: "/terms" }],
  }),
  component: () => (
    <LegalPage eyebrow="Legal" title="Terms of Service" updated="1 June 2026">
      <p>
        These terms govern your use of this website. Consulting engagements are governed separately
        by a signed master services agreement and its statements of work, which prevail over
        anything on this page.
      </p>
      <h2>Use of the site</h2>
      <ul>
        <li>
          Content is provided for information only and does not constitute professional advice.
        </li>
        <li>You may not attempt to disrupt, probe, or reverse-engineer the service.</li>
        <li>We may change or withdraw content without notice.</li>
      </ul>
      <h2>Intellectual property</h2>
      <p>
        All site content is owned by {company.legalName} unless stated otherwise. Deliverables
        produced under an engagement transfer to the client on payment, as set out in the relevant
        agreement.
      </p>
      <h2>Liability</h2>
      <p>
        To the extent permitted by law, we exclude liability for indirect or consequential loss
        arising from use of this website. Nothing limits liability for fraud, death, or personal
        injury caused by negligence.
      </p>
      <h2>Governing law</h2>
      <p>
        These terms are governed by the laws of the Republic of Estonia, with disputes subject to
        the courts of Harju County, Tallinn.
      </p>
      <h2>Contact</h2>
      <p>
        {company.legalName}, {company.address}. Email {company.email}.
      </p>
    </LegalPage>
  ),
});
