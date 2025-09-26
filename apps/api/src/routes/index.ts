import { Elysia } from "elysia";
import authRoutes from "./auth";
import testRoutes from "./test";
import snowflakeRoutes from "./snowflake";
import contractorsRoutes from "./contractors";
import contractorProfilesRoutes from "./contractor-profiles";
import contractorListsRoutes from "./contractor-lists";
import { analyticsRoutes } from "./analytics";
import aiClassifyRoutes from "./ai-classify";
import executiveSummaryRoutes from "./executive-summary";
// import userRoutes from "./users";

export const apiRoutes = new Elysia({ prefix: "/api/v1" })
  .use(authRoutes)
  .use(testRoutes)
  .use(snowflakeRoutes)
  .use(contractorsRoutes)
  .use(contractorProfilesRoutes)
  .use(contractorListsRoutes)
  .use(analyticsRoutes)
  .use(aiClassifyRoutes)
  .use(executiveSummaryRoutes);
  // .use(userRoutes);

export default apiRoutes;