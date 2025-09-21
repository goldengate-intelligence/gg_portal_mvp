import { Elysia, Context } from "elysia";
import { AuthContext } from "./auth";

export interface SnowflakePermissions {
  allowedDatabases?: string[];
  allowedSchemas?: string[];
  allowedTables?: string[];
  allowedOperations?: Array<'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'CREATE' | 'DROP' | 'ALTER'>;
  maxRowsPerQuery?: number;
  allowRawQueries?: boolean;
  readOnly?: boolean;
}

const defaultPermissions: SnowflakePermissions = {
  allowedOperations: ['SELECT'],
  maxRowsPerQuery: 10000,
  allowRawQueries: false,
  readOnly: true,
};

const rolePermissions: Record<string, SnowflakePermissions> = {
  admin: {
    allowedOperations: ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER'],
    maxRowsPerQuery: 100000,
    allowRawQueries: true,
    readOnly: false,
  },
  analyst: {
    allowedOperations: ['SELECT', 'INSERT', 'UPDATE'],
    maxRowsPerQuery: 50000,
    allowRawQueries: true,
    readOnly: false,
  },
  viewer: {
    allowedOperations: ['SELECT'],
    maxRowsPerQuery: 10000,
    allowRawQueries: false,
    readOnly: true,
  },
};

export const snowflakePermissions = () =>
  new Elysia({ name: "snowflake-permissions" })
    .derive((context: Context & AuthContext) => {
      if (!context.user) {
        return { snowflakePermissions: defaultPermissions };
      }

      const userRole = context.user.role;
      const permissions = rolePermissions[userRole] || defaultPermissions;

      return { snowflakePermissions: permissions };
    });

export const requireSnowflakeOperation = (operation: string) =>
  new Elysia({ name: "require-snowflake-operation" })
    .derive((context: Context & AuthContext & { snowflakePermissions: SnowflakePermissions }) => {
      const permissions = context.snowflakePermissions;

      if (!permissions.allowedOperations?.includes(operation as any)) {
        throw new Error(`Operation '${operation}' is not allowed for your role`);
      }

      return context;
    });

export const validateSnowflakeQuery = (query: string, permissions: SnowflakePermissions): {
  valid: boolean;
  error?: string;
} => {
  const normalizedQuery = query.trim().toUpperCase();

  // Check if raw queries are allowed
  if (!permissions.allowRawQueries) {
    return {
      valid: false,
      error: 'Raw SQL queries are not allowed for your role',
    };
  }

  // Check read-only mode
  if (permissions.readOnly) {
    const writeOperations = ['INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER', 'TRUNCATE'];
    for (const op of writeOperations) {
      if (normalizedQuery.startsWith(op)) {
        return {
          valid: false,
          error: `Write operations are not allowed in read-only mode`,
        };
      }
    }
  }

  // Check allowed operations
  if (permissions.allowedOperations) {
    const queryOperation = normalizedQuery.split(' ')[0];
    if (!permissions.allowedOperations.includes(queryOperation as any)) {
      return {
        valid: false,
        error: `Operation '${queryOperation}' is not allowed for your role`,
      };
    }
  }

  // Check for database restrictions
  if (permissions.allowedDatabases && permissions.allowedDatabases.length > 0) {
    // Simple check for database references
    const dbPattern = /(?:FROM|INTO|UPDATE|DELETE FROM)\s+(\w+)\.(\w+)\.(\w+)/gi;
    const matches = normalizedQuery.matchAll(dbPattern);
    
    for (const match of matches) {
      const database = match[1];
      if (!permissions.allowedDatabases.includes(database)) {
        return {
          valid: false,
          error: `Access to database '${database}' is not allowed`,
        };
      }
    }
  }

  // Check for schema restrictions
  if (permissions.allowedSchemas && permissions.allowedSchemas.length > 0) {
    const schemaPattern = /(?:FROM|INTO|UPDATE|DELETE FROM)\s+(?:(\w+)\.)?(\w+)\.(\w+)/gi;
    const matches = normalizedQuery.matchAll(schemaPattern);
    
    for (const match of matches) {
      const schema = match[2];
      if (!permissions.allowedSchemas.includes(schema)) {
        return {
          valid: false,
          error: `Access to schema '${schema}' is not allowed`,
        };
      }
    }
  }

  // Check for table restrictions
  if (permissions.allowedTables && permissions.allowedTables.length > 0) {
    const tablePattern = /(?:FROM|INTO|UPDATE|DELETE FROM)\s+(?:(?:\w+\.)?(?:\w+\.))?(\w+)/gi;
    const matches = normalizedQuery.matchAll(tablePattern);
    
    for (const match of matches) {
      const table = match[1];
      if (!permissions.allowedTables.includes(table)) {
        return {
          valid: false,
          error: `Access to table '${table}' is not allowed`,
        };
      }
    }
  }

  return { valid: true };
};

export const sanitizeSnowflakeInput = (input: string): string => {
  // Remove potentially dangerous characters and patterns
  let sanitized = input
    .replace(/;+$/g, '') // Remove trailing semicolons
    .replace(/--.*$/gm, '') // Remove SQL comments
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
    .trim();

  // Check for SQL injection patterns
  const dangerousPatterns = [
    /\bEXEC(?:UTE)?\s*\(/i,
    /\bXP_\w+/i,
    /\bsp_\w+/i,
    /\bDROP\s+(?:TABLE|DATABASE|SCHEMA|VIEW|PROCEDURE|FUNCTION)/i,
    /\bCREATE\s+(?:USER|ROLE)/i,
    /\bGRANT\s+/i,
    /\bREVOKE\s+/i,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(sanitized)) {
      throw new Error('Query contains potentially dangerous SQL patterns');
    }
  }

  return sanitized;
};