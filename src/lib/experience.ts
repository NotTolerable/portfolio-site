/** Public professional summaries from the owner's supplied resume and experience notes.
 * Extended source notes stay private; the separately authorized resume is at /resume. */
export type Experience = {
  id: string;
  organization: string;
  role: string;
  period?: string;
  kind: string;
  summary: string;
  responsibilities: readonly string[];
  tools: string;
};

export const professionalExperience: readonly Experience[] = [
  {
    id: "407-etr", organization: "407 ETR", role: "Software Engineer Intern", period: "May 2026 – Present", kind: "Platforms & Infrastructure · Vaughan, ON",
    summary: "Platform automation, cloud infrastructure and backend tooling for engineering teams.",
    responsibilities: [
      "Owned AWS S3 configuration for the migration of 200M+ historical customer invoices. Built a Python tool that generated 160 lifecycle policies for archival and retention-based expiration.",
      "Automated Helm chart generation, reducing Kubernetes deployment setup from more than four hours to 15 minutes.",
      "Resolved two critical security vulnerabilities blocking Jenkins and OpenShift deployments for a developer platform used by 50+ developers.",
      "Provisioned 40+ AWS and OpenShift resources with Terraform and Terragrunt for a Temporal proof of concept.",
      "Extended a Java Spring Boot and Solace queue-visualization platform used by 100+ engineers with REST endpoints for retrieving and downloading queue messages; tested integrations with Postman.",
      "Traced delivery paths for more than ten customer email-delivery incidents using AWS SES and CloudTrail.",
    ], tools: "AWS / PYTHON / KUBERNETES / HELM / OPENSHIFT / TERRAFORM / TERRAGRUNT / JENKINS / JAVA / SOLACE",
  },
  {
    id: "devroom", organization: "DevRoom", role: "Software Engineer", period: "Sep 2024 – Aug 2025", kind: "Freelance development & game server operations",
    summary: "Backend infrastructure, production operations and client game server delivery.",
    responsibilities: [
      "Operated Ubuntu production environments across 20+ client deployments, configuring game servers and resolving release, configuration and performance issues.",
      "Built backend infrastructure connecting proxies, hub services and eight service stacks for a network serving 300 users.",
      "Resolved an authentication and data-integrity incident affecting 550 users and more than 1,000 records.",
      "Delivered client server-setup and configuration commissions, and took on application-manager responsibilities alongside technical delivery.",
    ], tools: "LINUX / UBUNTU / PROXY NETWORKS / YAML / JSON / SQL / TROUBLESHOOTING",
  },
  {
    id: "orbital", organization: "Orbital Studios", role: "Software Developer", period: "May 2023 – Apr 2024", kind: "Freelance development & game server operations",
    summary: "Java backend services, delivery automation and runtime reliability for multiplayer systems.",
    responsibilities: [
      "Automated CI/CD workflows with GitHub Actions and Maven across nine repositories.",
      "Built multithreaded backend services supporting 200+ concurrent users across five service stacks.",
      "Tuned JVM heap and garbage-collection settings and established baseline performance checks, reducing crashes and instability by 80%.",
      "Delivered game server configurations and investigated client-reported errors, resource bottlenecks and stability issues.",
    ], tools: "JAVA / JVM / MAVEN / GITHUB ACTIONS / PERFORMANCE PROFILING / SERVER CONFIGURATION",
  },
  {
    id: "polaris", organization: "Polaris Studios", role: "Backend Infrastructure Engineer", kind: "Contract · Game server infrastructure",
    summary: "Dedicated-server backends and proxy networks for client game server environments.",
    responsibilities: [
      "Configured dedicated-server backends and connected proxy and game server services into client networks.",
      "Delivered the hosting and network setup required to bring game server environments into operation.",
    ], tools: "DEDICATED SERVERS / BACKEND CONFIGURATION / PROXY NETWORKS",
  },
];

/** Grouped by technical responsibility at the owner's request; no individual server names or titles. */
export const gameServerWork = [
  {
    title: "Multiplayer infrastructure",
    summary: "Deploying and operating the infrastructure behind multiplayer services.",
    contributions: [
      "Worked on shared-hosting and dedicated-server deployments, including a Hetzner migration.",
      "Administered Linux environments and configured Pterodactyl hosting.",
      "Connected hubs and multiple gameplay services through proxy networks.",
      "Configured firewalls, DDoS protection, Cloudflare DNS, TLS certificates and service permissions.",
    ],
    description: "I worked on shared-hosting and dedicated-server deployments, including a Hetzner migration, Linux administration, Pterodactyl setup, and proxy networks connecting hubs and multiple gameplay services. Configured firewalls, DDoS protection, Cloudflare DNS, TLS certificates and service permissions.",
    tools: "LINUX / HETZNER / PTERODACTYL / PROXY NETWORKS / DNS / TLS",
  },
  {
    title: "Runtime performance & diagnostics",
    summary: "Tracing runtime bottlenecks and improving server stability under player load.",
    contributions: [
      "Used Spark profiling to trace memory leaks, CPU-heavy plugins and resource bottlenecks under player load.",
      "Tuned JVM heap allocation and garbage-collection parameters.",
      "Investigated errors across client environments and optimized configurations for stability.",
      "Worked on earlier networks that reached 200+ concurrent players at peak.",
    ],
    description: "Used Spark profiling to trace memory leaks, CPU-heavy plugins and resource bottlenecks under player load. Tuned JVM heap allocation and garbage-collection parameters, investigated errors across client environments, and optimized configurations for stability. Earlier networks reached 200+ concurrent players at peak.",
    tools: "JAVA / JVM / GARBAGE COLLECTION / SPARK / MEMORY & CPU PROFILING",
  },
  {
    title: "Anti-cheat & exploit prevention",
    summary: "Improving detection workflows and correcting movement exploits in multiplayer environments.",
    contributions: [
      "Tuned detection-check buffers and thresholds, combining a general-purpose anti-cheat with combat-focused checks from an open-source engine.",
      "Extended the open-source integration to send detection alerts through Discord webhooks.",
      "Co-developed trajectory-based teleportation correction, collaborating on vector math to prevent players clipping through geometry.",
    ],
    description: "Tuned detection-check buffers and thresholds, combining a general-purpose anti-cheat with combat-focused checks from an open-source engine. Extended the open-source integration to send detection alerts through Discord webhooks. Co-developed trajectory-based teleportation correction, collaborating on vector math to prevent players clipping through geometry.",
    tools: "DETECTION TUNING / VECTOR MATH / JAVA / EVENT HANDLING / DISCORD WEBHOOKS",
  },
  {
    title: "Java development & automation",
    summary: "Building configurable Java plugins and scheduled server workflows.",
    contributions: [
      "Developed configurable combat physics, armor and enchantment modifiers through a Java game-server API.",
      "Implemented custom item attributes, projectile interactions and reload commands.",
      "Published three public plugins, including an extension of an existing open-source project.",
      "Built scheduled gameplay workflows with cron-style tasks and advanced YAML/JSON configuration to avoid additional heavyweight dependencies.",
    ],
    description: "Developed configurable combat physics, armor and enchantment modifiers, custom item attributes, projectile interactions and reload commands through a Java game-server API. Published three public plugins, including an extension of an existing open-source project. Built scheduled gameplay workflows with cron-style tasks and advanced YAML/JSON configuration to avoid additional heavyweight dependencies.",
    tools: "JAVA / SPIGOT API / YAML / JSON / SQL / CRON / PLUGIN INTEGRATION",
  },
] as const;

export const gameServerMetrics = [
  { value: "200+", label: "Peak concurrent players", context: "On an individual game server network" },
  { value: "1,000+", label: "Community members", context: "In an individual server community" },
  { value: "3", label: "Public Java plugins", context: "Released through a plugin marketplace" },
] as const;

export const additionalBuilds = [
  {
    name: "Grand River Analytics", label: "Client website · AI-assisted development",
    description: "Delivered a financial-insights website with AI-assisted implementation, including a report-publishing admin panel and SEO keyword controls. Configured GitHub-to-Fly.io deployment after pull-request approval, persistent volumes, environment configuration and Cloudflare DNS; diagnosed deployment and application issues.",
  },
  {
    name: "CaseCommons", label: "Client website · AI-assisted prototype",
    description: "An AI-assisted legal case-analysis community prototype for students, with submissions, discussions, accounts, an admin panel and account permissions. In development.",
  },
  {
    name: "Public Java plugins", label: "Open-source customization & plugin development · 2023",
    description: "Published three Java plugins covering configurable combat physics, collaborative trajectory-based teleportation exploit prevention, and projectile/splash interactions. Work included extending an existing open-source plugin, adding configurable armor and enchantment modifiers, implementing reload commands and documenting installation and configuration.",
  },
  {
    name: "Coursework builds", label: "Python / Pygame / Flask",
    description: "Built a terminal air-transit simulation, collaborated on a Pygame tic-tac-toe game and a Tron recreation with responsibility for collision hitboxes, and built a Flask banking application with accounts and balance transfers.",
  },
] as const;
