import { Elysia } from "elysia";

export const testRoutes = new Elysia({ prefix: "/test" })
  .get("/hello", () => ({
    message: "Hello from test routes",
    timestamp: new Date().toISOString(),
  }))
  
  .get("/tenant/:id", ({ params: { id }, headers }) => ({
    tenantId: id,
    headers: {
      tenantHeader: headers["x-tenant-id"],
      authorization: headers.authorization ? "Bearer token present" : "No auth header",
    },
  }));

export default testRoutes;