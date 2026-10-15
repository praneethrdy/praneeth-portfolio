// Single source of truth for everything the site says. Later sections read from here too.

export const profile = {
  firstName: "Praneeth",
  lastName: "Reddy",
  fullName: "Devarannagari Praneeth Kumar Reddy",
  role: "Java backend engineer",
  pitch:
    "I build banking microservices that move money exactly once: Quarkus, gRPC, PostgreSQL, Infinispan.",
  status: "Open to backend roles",
  location: "Bengaluru",
  email: "praneethreddy.dev@gmail.com",
  resumeUrl: "/Praneeth_BackendDev_Resume.pdf",
  links: {
    github: "https://github.com/praneethrdy",
    linkedin: "https://www.linkedin.com/in/praneethreddydevarannagari/",
    leetcode: "https://leetcode.com/u/Praneethrdy/",
  },
};

export type ServiceNode = {
  id: string;
  label: string;
  position: [number, number, number];
  /** The node the story is about; drawn larger and always labelled. */
  key?: boolean;
};

// The hero graph is a simplified picture of the iCABO request path and the payment engine.
export const serviceNodes: ServiceNode[] = [
  { id: "client", label: "client", position: [-4.2, 1.6, 0] },
  { id: "rest", label: "REST API", position: [-1.8, 0.9, 0.8] },
  { id: "grpc", label: "gRPC", position: [0.6, 1.8, -0.6] },
  { id: "cache", label: "Infinispan cache", position: [1.2, -0.3, 1.2], key: true },
  { id: "ledger", label: "Ledger", position: [3.4, 1.2, 0.2] },
  { id: "pg", label: "PostgreSQL", position: [2.6, -2.0, -0.4] },
  { id: "outbox", label: "Outbox", position: [-0.6, -1.8, -0.8] },
];

export const serviceEdges: [string, string][] = [
  ["client", "rest"],
  ["rest", "grpc"],
  ["grpc", "cache"],
  ["cache", "ledger"],
  ["cache", "pg"],
  ["grpc", "ledger"],
  ["rest", "outbox"],
  ["outbox", "pg"],
  ["ledger", "pg"],
];

// Request paths as lists of node ids. Cache hits outnumber misses, roughly matching the ~60% fewer DB queries.
export const requestRoutes: string[][] = [
  ["client", "rest", "grpc", "cache"],
  ["client", "rest", "grpc", "cache"],
  ["client", "rest", "grpc", "cache"],
  ["client", "rest", "grpc", "cache", "pg"],
  ["client", "rest", "outbox", "pg"],
  ["client", "rest", "grpc", "ledger", "pg"],
];

/** Shape the Experience particle sculpture takes for each achievement. */
export type MorphShape = "pillars" | "stream" | "cache" | "gauge" | "grid" | "containers";

export type Achievement = {
  id: string;
  metric: string;
  metricLabel: string;
  title: string;
  body: string;
  tags: string[];
  shape: MorphShape;
};

export const experience = {
  role: "Software Engineer Trainee",
  company: "iCABO Global",
  location: "Bengaluru",
  period: "Oct 2025 – Sep 2026",
  product: "iCABO Gen4",
  context:
    "An AI-native, cloud-native core banking platform: modular, event-driven microservices for retail and commercial banking, with multi-tenancy.",
  teamwork:
    "Worked in Agile/Scrum sprints with product, backend and QA teams: sprint planning, daily stand-ups and code reviews.",
  achievements: [
    {
      id: "apis",
      metric: "10+",
      metricLabel: "REST endpoints shipped",
      title: "Core banking APIs, end to end",
      body: "Built and maintained backend services in Java and Quarkus inside a hexagonal-architecture codebase, from contract to production.",
      tags: ["Java 17", "Quarkus", "Hexagonal"],
      shape: "pillars",
    },
    {
      id: "grpc",
      metric: "gRPC",
      metricLabel: "Protobuf contracts between services",
      title: "Reliable service-to-service calls",
      body: "Designed REST APIs to HTTP standards and gRPC services with Protobuf contracts across the account, product and transaction services.",
      tags: ["gRPC", "Protobuf", "REST"],
      shape: "stream",
    },
    {
      id: "cache",
      metric: "−60%",
      metricLabel: "repeated database queries",
      title: "Distributed caching with Infinispan",
      body: "Cached frequently read business data in Infinispan, cutting repeated PostgreSQL queries by about 60% and speeding up high-traffic endpoints.",
      tags: ["Infinispan", "PostgreSQL"],
      shape: "cache",
    },
    {
      id: "tests",
      metric: "70→90%",
      metricLabel: "unit test coverage",
      title: "Tests that catch real bugs",
      body: "Raised coverage with JUnit 5 and Mockito, and traced defects to root cause, including build failures and cache and balance-computation issues.",
      tags: ["JUnit 5", "Mockito", "TDD"],
      shape: "gauge",
    },
    {
      id: "regression",
      metric: "−70%",
      metricLabel: "manual validation effort",
      title: "YAML-driven regression suite",
      body: "Automated regression runs through a YAML-driven test framework, so whole request flows are replayed on every change instead of checked by hand.",
      tags: ["YAML", "API testing"],
      shape: "grid",
    },
    {
      id: "docker",
      metric: "Docker",
      metricLabel: "services containerised and validated",
      title: "Shipped in containers",
      body: "Containerised and validated services with Docker, and kept Git history clean with branching and code-review practices across the lifecycle.",
      tags: ["Docker", "Git", "Azure DevOps"],
      shape: "containers",
    },
  ] satisfies Achievement[],
};

export const projects = [
  {
    id: "payment-retry-engine",
    name: "Payment Retry Engine",
    kind: "Personal project",
    summary:
      "A payment service that charges exactly once, even when clients retry after a network timeout or the server crashes mid-request.",
    points: [
      "Idempotency keys turn a retried request into a lookup of the first result, so a retry never becomes a second charge.",
      "An outbox table is written in the same transaction as the payment, so no payment is lost if the process dies before calling the bank.",
      "Failed bank calls retry with exponential backoff, then move to a dead-letter queue for review.",
      "Workers claim jobs with SELECT … FOR UPDATE SKIP LOCKED, so several instances never process the same payment.",
    ],
    stack: ["Java", "Quarkus", "PostgreSQL", "Docker", "JUnit 5"],
    links: [{ label: "Code on GitHub", href: "https://github.com/praneethrdy/payment-retry-engine" }],
  },
  {
    id: "amramrutam",
    name: "Amramrutam Mango Farm",
    kind: "Freelance client",
    summary:
      "A production marketing site for an organic mango farm in Andhra Pradesh, with SEO work, later extended with a Java backend: REST APIs, PostgreSQL persistence and Docker deployment.",
    points: [
      "Owned delivery end to end, from API design to client integration.",
      "Deployed on Vercel and live for the client's customers.",
    ],
    stack: ["Java", "REST", "PostgreSQL", "Docker", "Vercel", "SEO"],
    links: [{ label: "Live site", href: "https://amramrutam.vercel.app/" }],
  },
];

export const skillGroups: { name: string; items: string[] }[] = [
  { name: "Core Java", items: ["Java 8", "Java 17", "OOP", "Collections", "Exception handling"] },
  { name: "Backend & APIs", items: ["Quarkus", "Spring Boot", "REST", "gRPC", "Protobuf", "Microservices"] },
  { name: "Data & caching", items: ["PostgreSQL", "MySQL", "Redis", "Infinispan"] },
  { name: "Testing & quality", items: ["JUnit 5", "Mockito", "TDD", "Integration testing", "API testing", "SonarQube"] },
  { name: "Architecture", items: ["Hexagonal", "Event-driven", "SOLID", "Design patterns"] },
  { name: "Tools", items: ["Git", "GitHub", "Docker", "Postman", "VS Code", "Azure DevOps", "Agile Scrum"] },
];

export const education = [
  {
    degree: "Master of Computer Applications (MCA)",
    school: "CMR Institute of Technology, Bengaluru",
    period: "Aug 2023 – Sep 2025",
    score: "93.2%",
  },
  {
    degree: "Bachelor of Computer Applications (BCA)",
    school: "CMR University, Bengaluru",
    period: "Oct 2020 – May 2023",
    score: "83.2%",
  },
];

export const certifications = [
  {
    name: "Full Stack Web Development Training",
    issuer: "TAP Academy",
    year: "2025",
    href: "https://drive.google.com/file/d/1F8TBPm2rdjTSOseHQ91tw96iFK5lSUrL/view?usp=sharing",
  },
];
