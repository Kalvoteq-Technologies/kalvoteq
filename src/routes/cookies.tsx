import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/site/LegalPage";
import { company } from "@/data/site";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Cookie Policy — kalvoteq" },
      {
        name: "description",
        content: "The cookies this website sets, why they exist, and how to control them.",
      },
      { property: "og:title", content: "Cookie Policy — kalvoteq" },
      {
        property: "og:description",
        content: "Essential and optional cookies used on kalvoteq.com.",
      },
      { property: "og:url", content: "/cookies" },
    ],
    links: [{ rel: "canonical", href: "/cookies" }],
  }),
  component: () => (
    <LegalPage eyebrow="Legal" title="Cookie Policy" updated="1 September 2026">
      <p>
        We keep cookies to a minimum. We do not currently use analytics, advertising, or cross-site
        tracking cookies of any kind. If that changes, we will update this policy and ask for your
        consent before setting anything beyond what is listed below.
      </p>
      <h2>Essential cookies and local storage</h2>
      <ul>
        <li>Cookie notice preference — remembers that you have seen this notice.</li>
        <li>Theme preference — remembers light or dark mode.</li>
        <li>
          If you sign in to the client or developer portal, a session cookie that keeps you
          authenticated.
        </li>
        <li>Security and load-balancing cookies set by our hosting provider.</li>
      </ul>
      <h2>Managing cookies</h2>
      <p>
        You can clear site data at any time in your browser settings, which resets your preferences
        and shows the notice again. Blocking essential cookies may break parts of the site,
        including signing in to the portal.
      </p>
      <h2>Questions</h2>
      <p>Write to {company.email} and we will answer within five working days.</p>
    </LegalPage>
  ),
});
