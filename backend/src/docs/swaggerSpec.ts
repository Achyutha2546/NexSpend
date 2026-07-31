export const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "NexSpend API - Financial Management & AI Platform",
    version: "1.0.0",
    description: "Enterprise REST API for NexSpend personal finance, budgets, reporting, and AI advisory.",
  },
  servers: [
    {
      url: "http://localhost:5000/api",
      description: "Local Development Server",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [{ BearerAuth: [] }],
  paths: {
    "/auth/me": {
      get: {
        summary: "Get current authenticated user profile",
        responses: {
          "200": { description: "User profile details" },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/transactions": {
      get: {
        summary: "List user transactions with pagination & filters",
        responses: { "200": { description: "Array of transaction items" } },
      },
      post: {
        summary: "Create new transaction record",
        responses: { "201": { description: "Transaction created successfully" } },
      },
    },
    "/budgets": {
      get: {
        summary: "List active user monthly budgets",
        responses: { "200": { description: "Budget allocations & spending status" } },
      },
    },
    "/reports/generate": {
      get: {
        summary: "Generate executive financial statements",
        responses: { "200": { description: "Income, Cash Flow, Budget & Savings Statements" } },
      },
    },
    "/ai/health": {
      get: {
        summary: "Calculate financial health score (0-100)",
        responses: { "200": { description: "Health score breakdown" } },
      },
    },
    "/ai/query": {
      post: {
        summary: "Execute AI Financial Coach advisory query",
        responses: { "200": { description: "LLM response & saved conversation message" } },
      },
    },
  },
}
