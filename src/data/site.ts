/**
 * Central content model for the marketing site.
 * Keeping content data-driven means an admin CMS can later replace these
 * exports with database reads without touching presentation components.
 */

export const company = {
  name: "kalvoteq",
  legalName: "Kalvoteq Technologies OU",
  registryCode: "17583081",
  email: "hello@kalvoteq.com",
  phone: "+372 54210899",
  address: "Amburi 20, 11711 Tallinn, Estonia",
  hours: "Mon–Fri, 08:00–17:00 EET",
  tagline: "Building high-performance software solutions and engineering teams.",
} as const;

export const bankDetails = {
  accountHolder: "kalvoteq Technologies OÜ",
  recipientAddress: "Amburi tn 20-30, Põhja-Tallinna linnaosa, Harju maakond, 11711, Tallinn, Estonia",
  iban: "LT31 3250 0419 8610 7004",
  bic: "REVOLT21",
  intermediaryBic: "CHASDEFX",
} as const;

export type Service = {
  slug: string;
  title: string;
  summary: string;
  overview: string;
  benefits: string[];
  stack: string[];
  faqs: { q: string; a: string }[];
  category: "engineering" | "transformation" | "teams";
  featured?: boolean;
};

export const services: Service[] = [
  // ENGINEERING
  {
    slug: "custom-software-development",
    title: "Custom Software Development",
    summary: "Bespoke platforms engineered around your operating model, not a template.",
    overview:
      "We design and build production systems end to end — architecture, delivery, and long-term ownership — for organisations whose processes do not fit off-the-shelf software.",
    benefits: [
      "Architecture designed for long-term change, not a single release",
      "Senior-only delivery squads with an embedded tech lead",
      "Fixed discovery, then iterative delivery in short increments",
      "Full source ownership and documented handover",
    ],
    stack: ["TypeScript", "React", "Node.js", "Go", ".NET", "PostgreSQL", "Kubernetes"],
    faqs: [
      {
        q: "How quickly can a team start?",
        a: "Mobilisation timelines depend on scope and seniority requirements — typically discussed and confirmed during discovery.",
      },
      {
        q: "Do you work fixed-price?",
        a: "Discovery is fixed-price. Delivery runs time-and-materials with agreed sprint budgets.",
      },
    ],
    category: "engineering",
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
    faqs: [
      {
        q: "Can you work alongside our internal teams?",
        a: "Yes — most enterprise engagements are blended squads with client engineers.",
      },
    ],
    category: "engineering",
    featured: true,
  },
  {
    slug: "mobile-development",
    title: "Mobile Development",
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
    faqs: [
      {
        q: "Native or cross-platform?",
        a: "We recommend based on hardware needs, team skills, and roadmap — never on preference.",
      },
    ],
    category: "engineering",
    featured: true,
  },
  {
    slug: "api-systems-integration",
    title: "API & Systems Integration",
    summary: "Connecting the systems your business already depends on.",
    overview:
      "We design and build integration layers that let core platforms, third-party services, and legacy systems exchange data reliably — without brittle point-to-point connections.",
    benefits: [
      "API design and governance for internal and partner use",
      "Event-driven integration between core business systems",
      "Legacy and third-party system connectivity",
      "Monitoring and contract testing for integration reliability",
    ],
    stack: ["REST", "GraphQL", "gRPC", "Kafka", "OpenAPI", "Node.js", "Kubernetes"],
    faqs: [
      {
        q: "Can you integrate with systems that have no modern API?",
        a: "Yes — we build adapter layers for legacy and file-based systems where a modern API does not exist.",
      },
    ],
    category: "engineering",
    featured: true,
  },
  {
    slug: "quality-engineering",
    title: "Quality Engineering",
    summary: "Confidence to release frequently, with less manual regression.",
    overview:
      "Test strategy, automation frameworks, and quality gates that reduce regression cycles and catch issues before they reach production.",
    benefits: [
      "Risk-based test strategy",
      "End-to-end automation in CI",
      "Performance and load engineering",
      "Release quality dashboards",
    ],
    stack: ["Playwright", "Cypress", "k6", "Pact", "GitHub Actions"],
    faqs: [
      {
        q: "Do you test existing systems?",
        a: "Yes — we frequently start with a coverage audit on existing platforms.",
      },
    ],
    category: "engineering",
  },
  {
    slug: "ui-ux-design",
    title: "UI/UX & Product Design",
    summary: "Interface systems that reduce support load and increase conversion.",
    overview:
      "Research, design systems, and prototypes built in the same repository as your product so design decisions survive delivery.",
    benefits: [
      "Discovery research with real users",
      "Token-based design systems",
      "Accessibility to WCAG 2.2 AA",
      "Design decisions grounded in product usage",
    ],
    stack: ["Figma", "Storybook", "Design tokens", "WCAG 2.2", "Maze"],
    faqs: [
      {
        q: "Can you redesign without a rebuild?",
        a: "Often yes — we ship incremental design systems over existing frontends.",
      },
    ],
    category: "engineering",
  },
  // TRANSFORMATION
  {
    slug: "ai-and-automation",
    title: "AI & Automation",
    summary: "Applied AI that reaches production, with evaluation and guardrails.",
    overview:
      "From retrieval-augmented assistants to forecasting and document automation — scoped against a business objective, shipped behind proper evaluation.",
    benefits: [
      "Use-case scoring workshop before a line of code",
      "Evaluation harness and human-in-the-loop review",
      "Data residency and EU AI Act alignment",
      "MLOps pipelines for retraining and drift detection",
    ],
    stack: ["Python", "PyTorch", "LangGraph", "pgvector", "Databricks", "Vertex AI"],
    faqs: [
      {
        q: "Will our data train external models?",
        a: "No. We default to EU-hosted inference with zero-retention agreements.",
      },
    ],
    category: "transformation",
    featured: true,
  },
  {
    slug: "cloud-and-devops",
    title: "Cloud & DevOps",
    summary: "Infrastructure as code, cost control, and deployment you can trust.",
    overview:
      "We migrate, modernise, and operate cloud platforms — with measurable improvements in release frequency and reliability.",
    benefits: [
      "Infrastructure as code across every environment",
      "CI/CD pipelines with progressive delivery",
      "Cloud cost review and optimisation",
      "Observability and on-call playbooks",
    ],
    stack: ["AWS", "Azure", "GCP", "Terraform", "Kubernetes", "ArgoCD", "Grafana"],
    faqs: [
      {
        q: "Which cloud do you recommend?",
        a: "The one your team can operate. We work across AWS, Azure, and GCP.",
      },
    ],
    category: "transformation",
    featured: true,
  },
  {
    slug: "legacy-modernization",
    title: "Legacy Modernization",
    summary: "Escape the legacy estate without stopping the business.",
    overview:
      "Strangler-pattern migrations that move value incrementally, keeping the old system running until the last day it is needed.",
    benefits: [
      "Incremental migration, no big-bang cutover",
      "Data migration with reconciliation",
      "Documented target architecture",
      "Knowledge transfer to internal teams",
    ],
    stack: ["Strangler pattern", "Kafka", "PostgreSQL", "Kubernetes", "Terraform"],
    faqs: [
      {
        q: "What if documentation is missing?",
        a: "We reverse-engineer behaviour with characterisation tests before changing anything.",
      },
    ],
    category: "transformation",
  },
  {
    slug: "digital-transformation",
    title: "Digital Transformation",
    summary: "Move digital initiatives from strategy into working software.",
    overview:
      "We help organisations translate digital strategy into a delivery plan — mapping capabilities, designing the platform and operating model, and executing alongside internal teams.",
    benefits: [
      "Capability and value-stream mapping",
      "Platform and delivery model design",
      "Coached execution with internal teams",
      "Change management support for adoption",
    ],
    stack: ["Architecture review", "Delivery model design", "Change management", "Roadmapping"],
    faqs: [
      {
        q: "Do you work with our existing teams or replace them?",
        a: "We work alongside your internal teams by default, transferring capability as we go.",
      },
    ],
    category: "transformation",
  },
  {
    slug: "technology-consulting",
    title: "Technology Consulting",
    summary: "Independent technical leadership for boards and founders.",
    overview:
      "Technical due diligence, roadmap arbitration, and hands-on interim leadership when engineering decisions carry commercial weight.",
    benefits: [
      "Technical due diligence for investment",
      "Roadmap and build-vs-buy analysis",
      "Engineering org design and hiring support",
      "Fractional CTO engagements",
    ],
    stack: ["Architecture review", "Cost modelling", "Org design", "Vendor evaluation"],
    faqs: [
      {
        q: "How long does a due diligence take?",
        a: "Timelines depend on scope and system complexity, agreed up front with a written report and findings call.",
      },
    ],
    category: "transformation",
  },
  {
    slug: "cybersecurity-consulting",
    title: "Cybersecurity Consulting",
    summary: "Threat modelling, hardening, and compliance readiness.",
    overview:
      "Security engineering embedded into the SDLC — reviews, testing, and remediation that stand up to enterprise procurement.",
    benefits: [
      "Threat modelling and secure design reviews",
      "Penetration testing and remediation",
      "ISO 27001 and SOC 2 readiness support",
      "Supply-chain and dependency governance",
    ],
    stack: ["OWASP ASVS", "Burp Suite", "Snyk", "Vault", "Zero-trust networking"],
    faqs: [
      {
        q: "Do you issue certifications?",
        a: "We prepare you for audit and work alongside your chosen certification body.",
      },
    ],
    category: "transformation",
  },
];

export type Industry = {
  slug: string;
  name: string;
  blurb: string;
  challenges: string[];
  solutions: string[];
  technologies: string[];
  capabilities: string[];
};

export const industries: Industry[] = [
  {
    slug: "fintech",
    name: "Finance & FinTech",
    blurb: "Payment, lending, and treasury systems built for scrutiny.",
    challenges: [
      "Regulatory reporting overhead",
      "Real-time fraud exposure",
      "Legacy core banking integration",
    ],
    solutions: [
      "Event-driven ledger architecture",
      "Real-time risk scoring",
      "PSD2 and open-banking APIs",
    ],
    technologies: ["Kafka", "Go", "PostgreSQL", "AWS", "OpenAPI"],
    capabilities: [
      "Real-time payments and settlement",
      "Fraud and risk monitoring",
      "Regulatory reporting automation",
      "Core banking integration",
    ],
  },
  {
    slug: "healthcare",
    name: "Healthcare",
    blurb: "Clinical-grade platforms with privacy engineered in.",
    challenges: [
      "Fragmented patient records",
      "Strict GDPR and MDR obligations",
      "Legacy hospital information systems",
    ],
    solutions: [
      "Interoperable data layers",
      "Clinician-facing workflow tooling",
      "Audit-ready access control",
    ],
    technologies: ["HL7 FHIR", "PostgreSQL", "Azure Health Data", "Zero-trust access"],
    capabilities: [
      "Interoperable patient records",
      "Clinical workflow automation",
      "Regulatory and data-protection compliance",
      "Secure access and audit trails",
    ],
  },
  {
    slug: "logistics",
    name: "Logistics",
    blurb: "Visibility and optimisation across complex supply chains.",
    challenges: [
      "Fragmented carrier data",
      "Manual dispatch planning",
      "Poor last-mile visibility",
    ],
    solutions: [
      "Unified tracking platform",
      "Route and load optimisation",
      "Offline-capable driver apps",
    ],
    technologies: ["React Native", "Python", "TimescaleDB", "Mapbox", "Kubernetes"],
    capabilities: [
      "Route optimisation",
      "Fleet and dispatch management",
      "Real-time shipment tracking",
      "Carrier API integration",
      "Operational analytics",
    ],
  },
  {
    slug: "retail",
    name: "Retail & E-commerce",
    blurb: "Composable commerce that survives peak season.",
    challenges: [
      "Monolithic commerce platforms",
      "Inventory accuracy across channels",
      "Seasonal traffic spikes",
    ],
    solutions: [
      "Composable storefront architecture",
      "Unified inventory service",
      "Personalisation and search",
    ],
    technologies: ["Next.js", "GraphQL", "Redis", "Elasticsearch", "GCP"],
    capabilities: [
      "Composable commerce architecture",
      "Unified inventory across channels",
      "Peak-traffic scalability",
      "Personalisation and search",
    ],
  },
  {
    slug: "manufacturing",
    name: "Manufacturing",
    blurb: "Shop-floor data turned into operational decisions.",
    challenges: [
      "Disconnected OT and IT systems",
      "Unplanned downtime",
      "Manual quality reporting",
    ],
    solutions: ["IIoT ingestion pipelines", "Predictive maintenance models", "MES integration"],
    technologies: ["MQTT", "TimescaleDB", "Python", "Grafana", "Azure IoT"],
    capabilities: [
      "IIoT data integration",
      "Predictive maintenance",
      "MES and ERP integration",
      "Quality and compliance reporting",
    ],
  },
  {
    slug: "education",
    name: "Education",
    blurb: "Learning platforms that scale to large cohorts.",
    challenges: [
      "Peak-load enrolment periods",
      "Content fragmentation",
      "Accessibility requirements",
    ],
    solutions: [
      "Scalable learning platforms",
      "Assessment and analytics",
      "Accessible multi-device delivery",
    ],
    technologies: ["React", "Node.js", "PostgreSQL", "CloudFront", "LTI"],
    capabilities: [
      "Scalable learning platforms",
      "Assessment and analytics tooling",
      "Accessible multi-device delivery",
      "Peak-enrolment scalability",
    ],
  },
  {
    slug: "government",
    name: "Public Sector",
    blurb: "Digital public services with accessibility as a requirement.",
    challenges: [
      "Accessibility and language obligations",
      "Procurement and audit constraints",
      "Decades-old registries",
    ],
    solutions: [
      "Accessible service design",
      "Secure identity integration",
      "Registry modernisation",
    ],
    technologies: ["X-Road", "eIDAS", "PostgreSQL", "WCAG 2.2 AA"],
    capabilities: [
      "Accessible digital service design",
      "Secure identity integration",
      "Legacy registry modernisation",
      "Audit-ready case handling",
    ],
  },
  {
    slug: "energy",
    name: "Energy & Utilities",
    blurb: "Grid, metering, and sustainability data platforms.",
    challenges: ["High-volume telemetry", "Regulatory reporting", "Ageing SCADA integrations"],
    solutions: [
      "Time-series data platforms",
      "Forecasting and balancing tools",
      "Regulatory reporting automation",
    ],
    technologies: ["Kafka", "TimescaleDB", "Python", "Kubernetes", "Grafana"],
    capabilities: [
      "Time-series telemetry platforms",
      "Forecasting and grid balancing",
      "Regulatory reporting automation",
      "Legacy SCADA integration",
    ],
  },
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
  type: "client-case-study" | "solution-concept" | "reference-architecture";
};

export const caseStudyTypeLabel: Record<CaseStudy["type"], string> = {
  "client-case-study": "Client Case Study",
  "solution-concept": "Solution Concept",
  "reference-architecture": "Reference Architecture",
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "nordic-payments-ledger",
    client: "Nordic payments provider",
    sector: "FinTech",
    title: "Rebuilding a payments ledger for real-time settlement",
    problem:
      "A batch-based ledger settled overnight, capping product launches and forcing manual reconciliation across four markets.",
    solution:
      "We designed an event-sourced ledger with idempotent processing, then migrated market by market behind a routing layer with zero downtime.",
    technologies: ["Go", "Kafka", "PostgreSQL", "AWS", "Terraform"],
    timeline: "9 months",
    results: [
      { label: "Settlement latency", value: "< 200ms" },
      { label: "Manual reconciliation", value: "−94%" },
      { label: "Peak throughput", value: "12k tps" },
    ],
    quote: {
      text: "They took ownership of the hardest part of our platform and gave it back documented, tested, and faster than our target.",
      author: "Head of Engineering",
      role: "Nordic payments provider",
    },
    type: "client-case-study",
  },
  {
    slug: "clinical-workflow-platform",
    client: "Regional hospital group",
    sector: "Healthcare",
    title: "A clinical workflow platform across eleven sites",
    problem:
      "Clinicians re-entered patient data across three legacy systems, adding hours of administrative work each week.",
    solution:
      "We built a FHIR-based interoperability layer and a clinician workflow interface designed with ward staff over six research cycles.",
    technologies: ["TypeScript", "React", "HL7 FHIR", "PostgreSQL", "Azure"],
    timeline: "12 months",
    results: [
      { label: "Documentation time", value: "−38%" },
      { label: "Sites live", value: "11" },
      { label: "Data-protection audit", value: "Passed" },
    ],
    quote: {
      text: "The first software rollout our clinicians actually asked to expand.",
      author: "Programme Director",
      role: "Regional hospital group",
    },
    type: "client-case-study",
  },
  {
    slug: "logistics-visibility",
    client: "Pan-European carrier",
    sector: "Logistics",
    title: "Live network visibility for a multi-vehicle fleet",
    problem:
      "Dispatchers planned routes from carrier spreadsheets, and customers had no reliable delivery estimate.",
    solution:
      "We unified telemetry from six carrier APIs into a streaming platform and shipped an offline-first driver application.",
    technologies: ["Python", "TimescaleDB", "React Native", "Mapbox", "Kubernetes"],
    timeline: "7 months",
    results: [
      { label: "Empty mileage", value: "−17%" },
      { label: "ETA accuracy", value: "92%" },
      { label: "Planning time", value: "−50%" },
    ],
    quote: {
      text: "We finally plan from data instead of instinct.",
      author: "COO",
      role: "Pan-European carrier",
    },
    type: "client-case-study",
  },
];

export const howWeWork = [
  { title: "Transparent Communication", text: "Clear communication throughout the engagement." },
  { title: "Engineering Quality", text: "Maintainable, tested and documented software." },
  {
    title: "Security by Design",
    text: "Security considered throughout architecture and delivery.",
  },
  {
    title: "Business Alignment",
    text: "Technology decisions connected to measurable business objectives.",
  },
  { title: "Flexible Collaboration", text: "Engagement models adapted to client requirements." },
  {
    title: "Long-Term Thinking",
    text: "Solutions designed for maintainability and future growth.",
  },
];

export const processSteps = [
  {
    step: "01",
    title: "Discovery",
    text: "Stakeholder interviews, constraint mapping, and a costed delivery plan.",
  },
  {
    step: "02",
    title: "Planning",
    text: "Architecture decisions recorded, risks ranked, first increment scoped.",
  },
  {
    step: "03",
    title: "Design",
    text: "Design system and prototypes tested with real users before build.",
  },
  {
    step: "04",
    title: "Development",
    text: "Short increments, trunk-based delivery, demoable regularly.",
  },
  {
    step: "05",
    title: "Testing",
    text: "Automated regression, performance, and security gates in CI.",
  },
  {
    step: "06",
    title: "Deployment",
    text: "Progressive rollout with observability and rollback rehearsed.",
  },
  {
    step: "07",
    title: "Support",
    text: "SLA-backed operations, or a documented handover to your team.",
  },
];

export const differentiators = [
  {
    title: "Engineering First",
    text: "Technology decisions are driven by sound architecture, maintainability and business objectives.",
  },
  {
    title: "Flexible Engagement",
    text: "Work with individual specialists, dedicated teams or complete project-delivery models.",
  },
  {
    title: "Global Talent",
    text: "Build teams without restricting engineering capability to one geographic market.",
  },
  {
    title: "Transparent Delivery",
    text: "Clear communication, defined expectations and visible project progress.",
  },
  {
    title: "Security by Design",
    text: "Security, privacy and reliability are incorporated throughout delivery.",
  },
  {
    title: "Built to Scale",
    text: "Architecture and teams designed to evolve as client requirements grow.",
  },
];

export const values = [
  {
    title: "Engineering integrity",
    text: "We recommend the option we would choose with our own money — including doing less.",
  },
  {
    title: "Radical transparency",
    text: "Budgets, risks, and mistakes are shared the day we know about them.",
  },
  {
    title: "Outcome ownership",
    text: "We measure delivery in business results, not story points.",
  },
  {
    title: "Craft and rigour",
    text: "Reviewed code, tested systems, documented decisions. Every time.",
  },
];

export const openRoles = [
  {
    title: "Senior Full-Stack Engineer",
    location: "Tallinn / Remote EU",
    type: "Full-time",
    team: "Product Engineering",
  },
  { title: "Cloud Platform Engineer", location: "Remote EU", type: "Full-time", team: "Platform" },
  {
    title: "Machine Learning Engineer",
    location: "Tallinn / Hybrid",
    type: "Full-time",
    team: "AI",
  },
  { title: "Senior Product Designer", location: "Remote EU", type: "Full-time", team: "Design" },
  { title: "QA Automation Engineer", location: "Remote EU", type: "Contract", team: "Quality" },
  { title: "Engagement Manager", location: "Tallinn", type: "Full-time", team: "Delivery" },
];

export type EngineerCategory = {
  slug: string;
  title: string;
  stack: string[];
};

export const engineerCategories: EngineerCategory[] = [
  {
    slug: "frontend",
    title: "Frontend Engineers",
    stack: ["React", "Next.js", "Angular", "TypeScript"],
  },
  {
    slug: "backend",
    title: "Backend Engineers",
    stack: ["Node.js", "NestJS", "Java", ".NET", "Python"],
  },
  {
    slug: "mobile",
    title: "Mobile Engineers",
    stack: ["React Native", "Flutter", "Native iOS", "Native Android"],
  },
  {
    slug: "cloud-devops",
    title: "Cloud & DevOps Engineers",
    stack: ["AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Terraform", "CI/CD"],
  },
  {
    slug: "ai-ml",
    title: "AI & Machine Learning Engineers",
    stack: ["LLM Integration", "RAG", "Machine Learning", "Data Systems", "Automation"],
  },
  {
    slug: "qa",
    title: "QA Engineers",
    stack: ["Manual Testing", "Automated Testing", "Performance Testing", "Quality Engineering"],
  },
  {
    slug: "ui-ux",
    title: "UI/UX Designers",
    stack: ["Product Design", "Design Systems", "Prototyping", "User Experience"],
  },
  {
    slug: "technical-leadership",
    title: "Technical Leadership",
    stack: ["Technical Leads", "Solution Architects", "Engineering Leadership"],
  },
];

export const talentProcessSteps = [
  {
    step: "01",
    title: "Tell Us What You Need",
    text: "You provide required skills, technology stack, seniority, project duration, team size, and preferred working-hours/time-zone overlap.",
  },
  {
    step: "02",
    title: "Talent Matching",
    text: "Kalvoteq identifies suitable professionals based on technical competence and project requirements.",
  },
  {
    step: "03",
    title: "Technical Evaluation",
    text: "Candidates go through appropriate technical and professional evaluation.",
  },
  {
    step: "04",
    title: "Client Interview",
    text: "You meet shortlisted engineers before engagement.",
  },
  {
    step: "05",
    title: "Onboarding",
    text: "Selected engineers integrate into your workflows, communication systems and engineering environment.",
  },
  {
    step: "06",
    title: "Ongoing Delivery",
    text: "Kalvoteq supports continuity, communication and engagement management throughout the assignment.",
  },
];

export type EngagementModel = {
  slug: string;
  title: string;
  text: string;
  bestFor: string;
};

export const engagementModels: EngagementModel[] = [
  {
    slug: "dedicated-engineer",
    title: "Dedicated Engineer",
    text: "One or more engineers integrate directly with your existing team.",
    bestFor: "Capacity expansion, specialist expertise, and long-term engineering requirements.",
  },
  {
    slug: "dedicated-squad",
    title: "Dedicated Squad",
    text: "Kalvoteq assembles a multidisciplinary engineering team — frontend, backend, QA, DevOps, design and technical leadership as needed.",
    bestFor: "Organisations that need an autonomous delivery unit.",
  },
  {
    slug: "time-and-materials",
    title: "Time & Materials",
    text: "You purchase engineering capacity based on agreed rates and actual work performed.",
    bestFor: "Evolving projects where requirements may change.",
  },
  {
    slug: "project-delivery",
    title: "Project Delivery",
    text: "Kalvoteq takes responsibility for delivering an agreed software solution.",
    bestFor: "Clients that want an external engineering partner rather than individual engineers.",
  },
];

export const buildScaleOverview = {
  build: {
    title: "Build With Kalvoteq",
    description:
      "For organizations that need Kalvoteq to take responsibility for designing, engineering and delivering technology solutions.",
    items: [
      "Custom Software Development",
      "Enterprise Software",
      "AI & Automation",
      "Cloud & DevOps",
      "Mobile Applications",
      "API & Systems Integration",
      "Legacy Modernization",
      "Digital Transformation",
      "Quality Engineering",
    ],
    ctaLabel: "Explore Engineering Services",
    ctaTo: "/services",
  },
  scale: {
    title: "Scale With Kalvoteq",
    description:
      "For organizations that already have technology initiatives but need experienced engineers or complete technical teams to increase delivery capacity.",
    items: [
      "Dedicated Developers",
      "Team Augmentation",
      "Dedicated Engineering Squads",
      "Technical Specialists",
      "Time & Materials",
      "Flexible Engineering Capacity",
      "Long-Term Team Extension",
    ],
    ctaLabel: "Build Your Engineering Team",
    ctaTo: "/services/team-augmentation",
  },
} as const;

export const technologyExpertise = [
  "React",
  "TypeScript",
  "Node.js",
  "Python",
  "Java",
  ".NET",
  "AWS",
  "Azure",
  "Kubernetes",
  "Terraform",
  "PostgreSQL",
  "React Native",
];

export const faqs = [
  {
    q: "Where are you based and who do you serve?",
    a: "We are headquartered in Tallinn, Estonia, and work with clients and engineering talent across multiple countries, with delivery and communication standards managed centrally from our Estonian base.",
  },
  {
    q: "What is your minimum engagement?",
    a: "Consulting engagements start at two weeks. Delivery squads and dedicated engineers start at three months.",
  },
  {
    q: "Who owns the intellectual property?",
    a: "You do. IP transfers to the client on payment, including source, infrastructure code, and documentation.",
  },
  {
    q: "How do you handle data protection?",
    a: "GDPR-aligned by default, with EU data residency, DPAs, and role-based access on every engagement.",
  },
  {
    q: "Can you take over an existing codebase?",
    a: "Yes. We start with an architecture and quality audit, then agree a stabilisation plan before adding features.",
  },
];
