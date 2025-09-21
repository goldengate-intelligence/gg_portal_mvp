import { Elysia } from "elysia";
import { auth } from "../lib/auth";

// Create the Better Auth plugin for Elysia with macro
export const betterAuthPlugin = new Elysia({ name: 'better-auth' })
  .mount('/auth', auth.handler)
  .macro({
    auth: {
      async resolve({ status, request: { headers } }) {
        const session = await auth.api.getSession({ headers });
        
        if (!session) {
          return status(401);
        }
        
        return {
          user: session.user,
          session: session.session
        };
      }
    }
  });

// Helper to get session without requiring auth
export const getAuthSession = new Elysia({ name: 'get-auth-session' })
  .derive(async ({ request: { headers } }) => {
    const session = await auth.api.getSession({ headers });
    
    return {
      user: session?.user || null,
      session: session?.session || null
    };
  });