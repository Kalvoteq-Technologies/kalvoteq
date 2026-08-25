/**
 * Central content model for the marketing site.
 * Keeping content data-driven means an admin CMS can later replace these
 * exports with database reads without touching presentation components.
 */

export const company = {
  name: "kalvoteq",
  legalName: "Kalvoteq Technologies OU",
  tagline: "Building high-performance software solutions and engineering teams.",
  email: "hello@kalvoteq.com",
  phone: "+372 600 1240",
  address: "Tornimäe 5, 10145 Tallinn, Estonia",
  hours: "Mon–Fri, 09:00–18:00 EET",
} as const;

export type Service = {
  slug: string;
  title: string;
  summary: string;
  overview: string;
  benefits: string[];
  stack: string[];
  faqs: { q: string; a: string }[];
  featured?: boolean;
};

export const services: Service[] = [
  {
    slug: "custom-software-development",
    title: "Custom Software Development",
    summary: "Bespoke platforms engineered around your operating model, not a template.",
    overview:
      "We design and build production systems end to end — architecture, delivery, and long-term ownership — for organisations whose processes do not fit off-the-shelf software.",
    benefits: [
      "Architecture designed for a decade of change, not a single release",
      "Senior-only delivery squads with an embedded tech lead",
      "Fixed discovery, then iterative delivery with two-week outcomes",
      "Full source ownership and documented handover",
    ],
    stack: ["TypeScript", "React", "Node.js", "Go", ".NET", "PostgreSQL", "Kubernetes"],
    faqs: [
      { q: "How quickly can a team start?", a: "Typical mobilisation is 10–15 business days after scope sign-off." },
      { q: "Do you work fixed-price?", a: "Discovery is fixed-price. Delivery runs time-and-materials with capped sprint budgets." },
    ],
    featured: true,
  },
  {
    slug: "enterprise-software",
    title: "Enterprise Software",
    summary: "Core systems that survive audit, scale, and organisational change.",
    overview:
      "Mission-critical platforms for regulated environments: integration-heavy, permission-aware, and observable from day one.",
    benefits: [
      "Domain-driven design with clear bounded contexts",
      "RBAC, audit logging, and data lineage built in",
      "Integration layer for ERP, CRM, and legacy estates",
      "Documented SLAs and runbooks",
    ],
    stack: ["Java", ".NET", "Kafka", "PostgreSQL", "Azure", "AWS", "OpenTelemetry"],
    faqs: [{ q: "Can you work alongside our internal teams?", a: "Yes — most enterprise engagements are blended squads with client engineers." }],
    featured: true,
  },
  {
    slug: "cloud-engineering",
    title: "Cloud Engineering & DevOps",
    summary: "Infrastructure as code, cost control, and deployment you can trust.",
    overview:
      "We migrate, modernise, and operate cloud platforms — with measurable improvements in release frequency, reliability, and monthly spend.",
    benefits: [
      "Infrastructure as code across every environment",
      "CI/CD pipelines with progressive delivery",
      "Cost optimisation typically 25–40% in the first quarter",
      "24/7 observability and on-call playbooks",
    ],
    stack: ["AWS", "Azure", "GCP", "Terraform", "Kubernetes", "ArgoCD", "Grafana"],
    faqs: [{ q: "Which cloud do you recommend?", a: "The one your team can operate. We are certified across AWS, Azure, and GCP." }],
    featured: true,
  },
  {
    slug: "ai-and-machine-learning",
    title: "Artificial Intelligence & ML",
    summary: "Applied AI that reaches production, with evaluation and guardrails.",
    overview:
      "From retrieval-augmented assistants to forecasting and document automation — scoped against a business metric, shipped behind proper evaluation.",
    benefits: [
      "Use-case scoring workshop before a line of code",
      "Evaluation harness and human-in-the-loop review",
      "Data residency and EU AI Act alignment",
      "MLOps pipelines for retraining and drift detection",
    ],
    stack: ["Python", "PyTorch", "LangGraph", "pgvector", "Databricks", "Vertex AI"],
    faqs: [{ q: "Will our data train external models?", a: "No. We default to EU-hosted inference with zero-retention agreements." }],
    featured: true,
  },
  {
    slug: "mobile-app-development",
    title: "Mobile App Development",
    summary: "Native-quality iOS and Android products with a shared delivery pipeline.",
    overview:
      "Consumer and field-workforce apps built for offline reliability, store compliance, and long-term maintainability.",
    benefits: [
      "Offline-first data synchronisation",
      "Automated store release pipelines",
      "Accessibility and device-matrix testing",
      "Analytics and crash telemetry from launch",
    ],
    stack: ["Swift", "Kotlin", "React Native", "Expo", "Firebase", "Detox"],
    faqs: [{ q: "Native or cross-platform?", a: "We recommend based on hardware needs, team skills, and roadmap — never on preference." }],
    featured: true,
  },
  {
    slug: "dedicated-teams",
    title: "Dedicated Teams & Staff Augmentation",
    summary: "Vetted senior engineers embedded in your process within weeks.",
    overview:
      "Long-running squads or individual specialists who work in your tooling, your ceremonies, and your definition of done.",
    benefits: [
      "Top 3% technical screening with live system design",
      "European time-zone overlap as standard",
      "No lock-in: 30-day rolling terms",
      "Team continuity guarantees with named backups",
    ],
    stack: ["Full-stack", "Platform", "Data", "QA automation", "SRE", "Product design"],
    faqs: [{ q: "How is pricing structured?", a: "Transparent monthly rate per engineer, seniority-banded, with no hidden margins." }],
    featured: true,
  },
  {
    slug: "cybersecurity-consulting",
    title: "Cybersecurity Consulting",
    summary: "Threat modelling, hardening, and compliance readiness.",
    overview:
      "Security engineering embedded into the SDLC — reviews, testing, and remediation that stand up to enterprise procurement.",
    benefits: ["Threat modelling and secure design reviews", "Penetration testing and remediation", "ISO 27001 and SOC 2 readiness", "Supply-chain and dependency governance"],
    stack: ["OWASP ASVS", "Burp Suite", "Snyk", "Vault", "Zero-trust networking"],
    faqs: [{ q: "Do you issue certifications?", a: "We prepare you for audit and work alongside your chosen certification body." }],
  },
  {
    slug: "ui-ux-design",
    title: "UI/UX & Product Design",
    summary: "Interface systems that reduce support load and increase conversion.",
    overview:
      "Research, design systems, and prototypes built in the same repository as your product so design decisions survive delivery.",
    benefits: ["Discovery research with real users", "Token-based design systems", "Accessibility to WCAG 2.2 AA", "Measurable conversion improvements"],
    stack: ["Figma", "Storybook", "Design tokens", "WCAG 2.2", "Maze"],
    faqs: [{ q: "Can you redesign without a rebuild?", a: "Often yes — we ship incremental design systems over existing frontends." }],
  },
  {
    slug: "product-consulting",
    title: "Product Consulting & CTO Advisory",
    summary: "Independent technical leadership for boards and founders.",
    overview:
      "Technical due diligence, roadmap arbitration, and hands-on interim leadership when engineering decisions carry commercial weight.",
    benefits: ["Technical due diligence for investment", "Roadmap and build-vs-buy analysis", "Engineering org design and hiring", "Fractional CTO engagements"],
    stack: ["Architecture review", "DORA metrics", "Cost modelling", "Org design"],
    faqs: [{ q: "How long is a due diligence?", a: "Typically 5–10 working days with a written report and findings call." }],
  },
  {
    slug: "qa-and-test-automation",
    title: "QA & Test Automation",
    summary: "Confidence to release daily instead of quarterly.",
    overview:
      "Test strategy, automation frameworks, and quality gates that shorten regression cycles from weeks to minutes.",
    benefits: ["Risk-based test strategy", "End-to-end automation in CI", "Performance and load engineering", "Release quality dashboards"],
    stack: ["Playwright", "Cypress", "k6", "Pact", "GitHub Actions"],
    faqs: [{ q: "Do you test existing systems?", a: "Yes — we frequently start with a coverage audit on legacy platforms." }],
  },
  {
    slug: "software-modernization",
    title: "Software Modernization",
    summary: "Escape the legacy estate without stopping the business.",
    overview:
      "Strangler-pattern migrations that move value incrementally, keeping the old system running until the last day it is needed.",
    benefits: ["Incremental migration, no big-bang cutover", "Data migration with reconciliation", "Documented target architecture", "Knowledge transfer to internal teams"],
    stack: ["Strangler pattern", "Kafka", "PostgreSQL", "Kubernetes", "Terraform"],
    faqs: [{ q: "What if documentation is missing?", a: "We reverse-engineer behaviour with characterisation tests before changing anything." }],
  },
];

export type Industry = {
  slug: string;
  name: string;
  blurb: string;
  challenges: string[];
  solutions: string[];
  technologies: string[];
  outcomes: string[];
};

export const industries: Industry[] = [
  {
    slug: "healthcare",
    name: "Healthcare",
    blurb: "Clinical-grade platforms with privacy engineered in.",
    challenges: ["Fragmented patient records", "Strict GDPR and MDR obligations", "Legacy hospital information systems"],
    solutions: ["Interoperable data layers", "Clinician-facing workflow tooling", "Audit-ready access control"],
    technologies: ["HL7 FHIR", "PostgreSQL", "Azure Health Data", "Zero-trust access"],
    outcomes: ["38% faster clinical documentation", "Single patient view across sites", "Passed regional data-protection audit"],
  },
  {
    slug: "fintech",
    name: "Finance & FinTech",
    blurb: "Payment, lending, and treasury systems built for scrutiny.",
    challenges: ["Regulatory reporting overhead", "Real-time fraud exposure", "Legacy core banking integration"],
    solutions: ["Event-driven ledger architecture", "Real-time risk scoring", "PSD2 and open-banking APIs"],
    technologies: ["Kafka", "Go", "PostgreSQL", "AWS", "OpenAPI"],
    outcomes: ["Sub-200ms transaction decisioning", "Reporting cycle cut from days to hours", "SOC 2 readiness in two quarters"],
  },
  {
    slug: "logistics",
    name: "Logistics",
    blurb: "Visibility and optimisation across complex supply chains.",
    challenges: ["Fragmented carrier data", "Manual dispatch planning", "Poor last-mile visibility"],
    solutions: ["Unified tracking platform", "Route and load optimisation", "Offline-capable driver apps"],
    technologies: ["React Native", "Python", "TimescaleDB", "Mapbox", "Kubernetes"],
    outcomes: ["17% reduction in empty mileage", "Real-time ETA accuracy above 92%", "Dispatch planning time halved"],
  },
  {
    slug: "retail",
    name: "Retail & Commerce",
    blurb: "Composable commerce that survives peak season.",
    challenges: ["Monolithic commerce platforms", "Inventory accuracy across channels", "Seasonal traffic spikes"],
    solutions: ["Composable storefront architecture", "Unified inventory service", "Personalisation and search"],
    technologies: ["Next.js", "GraphQL", "Redis", "Elasticsearch", "GCP"],
    outcomes: ["2.3x faster page loads", "Zero downtime through Black Friday", "11% uplift in conversion"],
  },
  {
    slug: "government",
    name: "Government & Public Sector",
    blurb: "Digital public services with accessibility as a requirement.",
    challenges: ["Accessibility and language obligations", "Procurement and audit constraints", "Decades-old registries"],
    solutions: ["Accessible service design", "Secure identity integration", "Registry modernisation"],
    technologies: ["X-Road", "eIDAS", "PostgreSQL", "WCAG 2.2 AA"],
    outcomes: ["WCAG 2.2 AA compliance", "Citizen service time reduced by 45%", "Fully auditable case handling"],
  },
  {
    slug: "manufacturing",
    name: "Manufacturing",
    blurb: "Shop-floor data turned into operational decisions.",
    challenges: ["Disconnected OT and IT systems", "Unplanned downtime", "Manual quality reporting"],
    solutions: ["IIoT ingestion pipelines", "Predictive maintenance models", "MES integration"],
    technologies: ["MQTT", "TimescaleDB", "Python", "Grafana", "Azure IoT"],
    outcomes: ["22% less unplanned downtime", "Live OEE across plants", "Automated quality reporting"],
  },
  {
    slug: "education",
    name: "Education",
    blurb: "Learning platforms that scale to national cohorts.",
    challenges: ["Peak-load enrolment periods", "Content fragmentation", "Accessibility requirements"],
    solutions: ["Scalable learning platforms", "Assessment and analytics", "Accessible multi-device delivery"],
    technologies: ["React", "Node.js", "PostgreSQL", "CloudFront", "LTI"],
    outcomes: ["Stable under 60k concurrent users", "Course setup time down 60%", "Full screen-reader support"],
  },
  {
    slug: "energy",
    name: "Energy & Utilities",
    blurb: "Grid, metering, and sustainability data platforms.",
    challenges: ["High-volume telemetry", "Regulatory reporting", "Ageing SCADA integrations"],
    solutions: ["Time-series data platforms", "Forecasting and balancing tools", "Regulatory reporting automation"],
    technologies: ["Kafka", "TimescaleDB", "Python", "Kubernetes", "Grafana"],
    outcomes: ["Billions of readings ingested monthly", "Forecast error reduced by 14%", "Automated regulator submissions"],
  },
];

export type Solution = {
  slug: string;
  title: string;
  problem: string;
  approach: string[];
  timeline: string;
};

export const solutions: Solution[] = [
  { slug: "build-mvp", title: "Build an MVP", problem: "You need a fundable, testable product in one quarter.", approach: ["Two-week discovery and scope lock", "Design system and clickable prototype", "8–12 week build to launch"], timeline: "10–14 weeks" },
  { slug: "legacy-modernization", title: "Legacy Modernization", problem: "Your core system blocks every roadmap item.", approach: ["Architecture and risk assessment", "Strangler-pattern migration plan", "Incremental cutover with reconciliation"], timeline: "6–18 months" },
  { slug: "cloud-migration", title: "Cloud Migration", problem: "On-premise costs and release cycles are unsustainable.", approach: ["Landing zone and IaC baseline", "Workload-by-workload migration", "FinOps and observability handover"], timeline: "3–9 months" },
  { slug: "ai-automation", title: "AI Automation", problem: "Manual processes consume expert time.", approach: ["Use-case scoring against business value", "Prototype with evaluation harness", "Production rollout with human review"], timeline: "8–16 weeks" },
  { slug: "digital-transformation", title: "Digital Transformation", problem: "Digital initiatives stall between strategy and delivery.", approach: ["Capability and value-stream mapping", "Platform and delivery model design", "Coached execution with internal teams"], timeline: "6–24 months" },
  { slug: "dedicated-teams", title: "Dedicated Delivery Teams", problem: "Hiring cannot keep pace with the roadmap.", approach: ["Role profiling and technical screening", "Squad mobilisation in 2–3 weeks", "Continuous capability transfer"], timeline: "From 3 months" },
  { slug: "technology-consulting", title: "Technology Consulting", problem: "You need an independent read on architecture or vendors.", approach: ["Technical due diligence", "Build-vs-buy modelling", "Board-level recommendation"], timeline: "2–6 weeks" },
  { slug: "business-automation", title: "Business Automation", problem: "Back-office work is spread across spreadsheets and email.", approach: ["Process mapping and prioritisation", "Workflow and integration build", "Adoption and measurement"], timeline: "6–12 weeks" },
];

export type CaseStudy = {
  slug: string;
  client: string;
  sector: string;
  title: string;
  problem: string;
  solution: string;
  technologies: string[];
  timeline: string;
  results: { label: string; value: string }[];
  quote: { text: string; author: string; role: string };
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "nordic-payments-ledger",
    client: "Nordic payments provider",
    sector: "FinTech",
    title: "Rebuilding a payments ledger for real-time settlement",
    problem: "A batch-based ledger settled overnight, capping product launches and forcing manual reconciliation across four markets.",
    solution: "We designed an event-sourced ledger with idempotent processing, then migrated market by market behind a routing layer with zero downtime.",
    technologies: ["Go", "Kafka", "PostgreSQL", "AWS", "Terraform"],
    timeline: "9 months",
    results: [
      { label: "Settlement latency", value: "< 200ms" },
      { label: "Manual reconciliation", value: "−94%" },
      { label: "Peak throughput", value: "12k tps" },
    ],
    quote: { text: "They took ownership of the hardest part of our platform and gave it back documented, tested, and faster than our target.", author: "Head of Engineering", role: "Nordic payments provider" },
  },
  {
    slug: "clinical-workflow-platform",
    client: "Regional hospital group",
    sector: "Healthcare",
    title: "A clinical workflow platform across eleven sites",
    problem: "Clinicians re-entered patient data across three legacy systems, adding hours of administrative work each week.",
    solution: "We built a FHIR-based interoperability layer and a clinician workflow interface designed with ward staff over six research cycles.",
    technologies: ["TypeScript", "React", "HL7 FHIR", "PostgreSQL", "Azure"],
    timeline: "12 months",
    results: [
      { label: "Documentation time", value: "−38%" },
      { label: "Sites live", value: "11" },
      { label: "Data-protection audit", value: "Passed" },
    ],
    quote: { text: "The first software rollout our clinicians actually asked to expand.", author: "Programme Director", role: "Regional hospital group" },
  },
  {
    slug: "logistics-visibility",
    client: "Pan-European carrier",
    sector: "Logistics",
    title: "Live network visibility for 4,200 vehicles",
    problem: "Dispatchers planned routes from carrier spreadsheets, and customers had no reliable delivery estimate.",
    solution: "We unified telemetry from six carrier APIs into a streaming platform and shipped an offline-first driver application.",
    technologies: ["Python", "TimescaleDB", "React Native", "Mapbox", "Kubernetes"],
    timeline: "7 months",
    results: [
      { label: "Empty mileage", value: "−17%" },
      { label: "ETA accuracy", value: "92%" },
      { label: "Planning time", value: "−50%" },
    ],
    quote: { text: "We finally plan from data instead of instinct.", author: "COO", role: "Pan-European carrier" },
  },
];

export const testimonials = [
  { quote: "kalvoteq behaves like an internal team with an external standard. Our release cadence went from monthly to daily inside a quarter.", author: "Marika Laine", role: "CTO, Nordic SaaS platform" },
  { quote: "Their technical due diligence changed our investment decision. Direct, evidence-based, and commercially literate.", author: "Daniel Okonkwo", role: "Partner, growth equity fund" },
  { quote: "We scaled from four to nineteen engineers without losing a single sprint of velocity.", author: "Sofia Brandt", role: "VP Product, logistics group" },
];

export const processSteps = [
  { step: "01", title: "Discovery", text: "Stakeholder interviews, constraint mapping, and a costed delivery plan." },
  { step: "02", title: "Planning", text: "Architecture decisions recorded, risks ranked, first increment scoped." },
  { step: "03", title: "Design", text: "Design system and prototypes tested with real users before build." },
  { step: "04", title: "Development", text: "Two-week increments, trunk-based delivery, demoable every Friday." },
  { step: "05", title: "Testing", text: "Automated regression, performance, and security gates in CI." },
  { step: "06", title: "Deployment", text: "Progressive rollout with observability and rollback rehearsed." },
  { step: "07", title: "Support", text: "SLA-backed operations, or a documented handover to your team." },
];

export const differentiators = [
  { title: "Senior Engineers", text: "Median 9 years of experience. No junior padding on billed squads." },
  { title: "Agile Delivery", text: "Two-week increments with working software, not status decks." },
  { title: "Transparent Communication", text: "Shared boards, shared repositories, direct access to the engineers." },
  { title: "Security First", text: "Threat modelling, secure defaults, and dependency governance from sprint one." },
  { title: "Global Delivery", text: "Estonian HQ with delivery across Europe, the UK, North America, and Africa." },
  { title: "Dedicated Teams", text: "Long-running squads that keep the context they earn." },
];

export const values = [
  { title: "Engineering integrity", text: "We recommend the option we would choose with our own money — including doing less." },
  { title: "Radical transparency", text: "Budgets, risks, and mistakes are shared the day we know about them." },
  { title: "Outcome ownership", text: "We measure delivery in business results, not story points." },
  { title: "Craft and rigour", text: "Reviewed code, tested systems, documented decisions. Every time." },
];

export const leadership = [
  { name: "Katrin Mägi", role: "Chief Executive Officer", bio: "Fifteen years scaling delivery organisations across the Nordics and Baltics." },
  { name: "Priit Saar", role: "Chief Technology Officer", bio: "Distributed-systems architect; previously led platform engineering at a European payments group." },
  { name: "Amara Diallo", role: "VP Delivery", bio: "Runs global delivery across four time zones with an obsession for predictability." },
  { name: "Jonas Weber", role: "Head of AI", bio: "Applied ML in regulated industries, with a focus on evaluation and safety." },
];

export const openRoles = [
  { title: "Senior Full-Stack Engineer", location: "Tallinn / Remote EU", type: "Full-time", team: "Product Engineering" },
  { title: "Cloud Platform Engineer", location: "Remote EU", type: "Full-time", team: "Platform" },
  { title: "Machine Learning Engineer", location: "Tallinn / Hybrid", type: "Full-time", team: "AI" },
  { title: "Senior Product Designer", location: "Remote EU", type: "Full-time", team: "Design" },
  { title: "QA Automation Engineer", location: "Remote EU", type: "Contract", team: "Quality" },
  { title: "Engagement Manager", location: "Tallinn", type: "Full-time", team: "Delivery" },
];

export const posts = [
  { slug: "strangler-pattern-in-practice", title: "The strangler pattern in practice: migrating a core banking ledger", category: "Architecture", date: "2026-06-18", readingTime: "9 min", excerpt: "What incremental migration actually looks like when downtime is not an option." },
  { slug: "evaluating-llm-features", title: "Evaluating LLM features before you ship them", category: "AI", date: "2026-05-30", readingTime: "7 min", excerpt: "A practical evaluation harness that catches regressions your demo never will." },
  { slug: "platform-cost-discipline", title: "Cloud cost discipline without slowing delivery", category: "Cloud", date: "2026-05-02", readingTime: "6 min", excerpt: "The five FinOps controls that recovered 34% of a client's monthly spend." },
  { slug: "hiring-senior-engineers", title: "How we screen for senior engineering judgement", category: "Teams", date: "2026-04-11", readingTime: "5 min", excerpt: "Why live system design outperforms algorithm puzzles for consulting work." },
  { slug: "design-systems-that-survive", title: "Design systems that survive delivery pressure", category: "Design", date: "2026-03-21", readingTime: "8 min", excerpt: "Tokens, governance, and the handful of rules that keep a system alive." },
  { slug: "eu-data-residency", title: "EU data residency for AI workloads", category: "Compliance", date: "2026-02-14", readingTime: "6 min", excerpt: "Practical architecture for keeping regulated data inside the union." },
];

export const faqs = [
  { q: "Where are you based and who do you serve?", a: "We are headquartered in Tallinn, Estonia, and deliver for clients across Europe, the UK, North America, and Africa." },
  { q: "What is your minimum engagement?", a: "Consulting engagements start at two weeks. Delivery squads start at three months." },
  { q: "Who owns the intellectual property?", a: "You do. IP transfers to the client on payment, including source, infrastructure code, and documentation." },
  { q: "How do you handle data protection?", a: "GDPR-aligned by default, with EU data residency, DPAs, and role-based access on every engagement." },
  { q: "Can you take over an existing codebase?", a: "Yes. We start with an architecture and quality audit, then agree a stabilisation plan before adding features." },
];
