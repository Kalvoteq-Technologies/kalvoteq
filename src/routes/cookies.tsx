import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/site/LegalPage";
import { company } from "@/data/site";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Cookie Policy — kalvoteq" },
      { name: "description", content: "The cookies this website sets, why they exist, and how to control them." },
      { property: "og:title", content: "Cookie Policy — kalvoteq" },
      { property: "og:description", content: "Essential and optional cookies used on kalvoteq.com." },
      { property: "og:url", content: "/cookies" },
    ],
    links: [{ rel: "canonical", href: "/cookies" }],
  }),
  component: () => (
    <LegalPage eyebrow="Legal" title="Cookie Policy" updated="1 June 2026">
      <p>
        We keep cookies to a minimum. Optional cookies are set only after you accept them in the consent
        banner, and your choice is stored locally in your browser.
      </p>
      <h2>Essential cookies</h2>
      <ul>
        <li>Consent preference — remembers your cookie choice.</li>
        <li>Theme preference — remembers light or dark mode.</li>
        <li>Security and load-balancing cookies set by our hosting provider.</li>
      </ul>
      <h2>Optional analytics</h2>
      <p>
        When accepted, we use privacy-respecting analytics to understand which pages are useful. We do
        not sell data, run advertising networks, or build cross-site profiles.
      </p>
      <h2>Managing cookies</h2>
      <p>
        You can clear site data at any time in your browser settings, which resets your consent choice
        and shows the banner again. Blocking essential cookies may break parts of the site.
      </p>
      <h2>Questions</h2>
      <p>Write to {company.email} and we will answer within five working days.</p>
    </LegalPage>
  ),
});
