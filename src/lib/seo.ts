import { company } from "@/data/site";

export function professionalServiceJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: company.name,
    legalName: company.legalName,
    description:
      "Engineering and technology consulting company helping organizations build software and scale engineering capability.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Amburi 20",
      addressLocality: "Tallinn",
      postalCode: "11711",
      addressCountry: "EE",
    },
    email: company.email,
    telephone: company.phone,
    url: "https://kalvoteq.com",
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: company.name,
    url: "https://kalvoteq.com",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://kalvoteq.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `https://kalvoteq.com${item.url}`,
    })),
  };
}

export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
