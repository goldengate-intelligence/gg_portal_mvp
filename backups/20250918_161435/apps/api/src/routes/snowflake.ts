import { Elysia, t } from 'elysia';
import { authMiddleware, requireAuth } from '../middleware/auth';
import { 
  snowflakePermissions, 
  validateSnowflakeQuery, 
  sanitizeSnowflakeInput 
} from '../middleware/snowflake-permissions';
import { 
  snowflakeService,
  QueryParametersSchema,
  SelectQuerySchema,
  InsertQuerySchema,
  UpdateQuerySchema,
  DeleteQuerySchema
} from '../services/snowflake';
import { config } from '../config';

const snowflakeRoutes = new Elysia({ prefix: '/snowflake' })
  .use(authMiddleware())
  .use(requireAuth())
  .use(snowflakePermissions())
  
  // Test connection
  .get('/connection/test', async ({ user }) => {
    try {
      const isConnected = await snowflakeService.testConnection();
      return {
        success: true,
        connected: isConnected,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Connection test failed',
      };
    }
  })
  
  // Execute raw query
  .post('/query/execute', async ({ body, user, snowflakePermissions }) => {
    try {
      const params = QueryParametersSchema.parse(body);
      
      // Validate permissions for raw queries
      const validation = validateSnowflakeQuery(params.query, snowflakePermissions);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
          rows: [],
          metadata: {
            rowCount: 0,
            columnCount: 0,
            columns: [],
            executionTime: 0,
          },
        };
      }
      
      // Sanitize the query
      const sanitizedQuery = sanitizeSnowflakeInput(params.query);
      
      // Apply max rows limit from permissions
      const maxRows = Math.min(
        params.maxRows || snowflakePermissions.maxRowsPerQuery || 10000,
        snowflakePermissions.maxRowsPerQuery || 10000
      );
      
      // Check cache first
      const cached = snowflakeService.cache.get(sanitizedQuery, params.binds);
      if (cached) {
        return {
          ...cached,
          cached: true,
        };
      }
      
      const result = await snowflakeService.executor.execute({
        ...params,
        query: sanitizedQuery,
        maxRows,
      });
      
      // Cache successful results
      if (result.success) {
        snowflakeService.cache.set(sanitizedQuery, result, 300000, params.binds);
      }
      
      return result;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Query execution failed',
        rows: [],
        metadata: {
          rowCount: 0,
          columnCount: 0,
          columns: [],
          executionTime: 0,
        },
      };
    }
  }, {
    body: t.Object({
      query: t.String(),
      binds: t.Optional(t.Array(t.Any())),
      timeout: t.Optional(t.Number()),
      maxRows: t.Optional(t.Number()),
      streamResult: t.Optional(t.Boolean()),
    })
  })
  
  // Validate query
  .post('/query/validate', async ({ body, user }) => {
    try {
      const { query } = body;
      const result = await snowflakeService.executor.validateQuery(query);
      return result;
    } catch (error: any) {
      return {
        valid: false,
        error: error.message || 'Query validation failed',
      };
    }
  }, {
    body: t.Object({
      query: t.String(),
    })
  })
  
  // Build and execute SELECT query
  .post('/query/select', async ({ body, user }) => {
    try {
      // Check if Snowflake is configured
      if (!config.snowflake.account || !config.snowflake.username || !config.snowflake.password) {
        return {
          success: false,
          error: 'Snowflake is not configured. Please set SNOWFLAKE_ACCOUNT, SNOWFLAKE_USERNAME, and SNOWFLAKE_PASSWORD environment variables.',
        };
      }
      
      const queryParams = SelectQuerySchema.parse(body);
      const sql = snowflakeService.builder.buildSelect(queryParams);
      
      // Check cache
      const cached = snowflakeService.cache.get(sql);
      if (cached) {
        return {
          ...cached,
          cached: true,
          sql,
        };
      }
      
      const result = await snowflakeService.executor.execute({
        query: sql,
        maxRows: queryParams.limit,
      });
      
      // Cache successful results
      if (result.success) {
        snowflakeService.cache.set(sql, result);
      }
      
      return {
        ...result,
        sql,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Select query failed',
        rows: [],
        metadata: {
          rowCount: 0,
          columnCount: 0,
          columns: [],
          executionTime: 0,
        },
      };
    }
  }, {
    body: t.Object({
      table: t.String(),
      columns: t.Optional(t.Array(t.String())),
      where: t.Optional(t.Record(t.String(), t.Any())),
      orderBy: t.Optional(t.Array(t.Object({
        column: t.String(),
        direction: t.Optional(t.Union([t.Literal('ASC'), t.Literal('DESC')])),
      }))),
      limit: t.Optional(t.Number()),
      offset: t.Optional(t.Number()),
      joins: t.Optional(t.Array(t.Object({
        type: t.Optional(t.Union([
          t.Literal('INNER'),
          t.Literal('LEFT'),
          t.Literal('RIGHT'),
          t.Literal('FULL')
        ])),
        table: t.String(),
        on: t.String(),
      }))),
      groupBy: t.Optional(t.Array(t.String())),
      having: t.Optional(t.String()),
    })
  })
  
  // Build and execute INSERT query
  .post('/query/insert', async ({ body, user }) => {
    try {
      const queryParams = InsertQuerySchema.parse(body);
      const sql = snowflakeService.builder.buildInsert(queryParams);
      
      const result = await snowflakeService.executor.execute({
        query: sql,
      });
      
      // Invalidate cache for this table
      if (result.success) {
        snowflakeService.cache.invalidateByTable(queryParams.table);
      }
      
      return {
        ...result,
        sql,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Insert query failed',
        rows: [],
        metadata: {
          rowCount: 0,
          columnCount: 0,
          columns: [],
          executionTime: 0,
        },
      };
    }
  }, {
    body: t.Object({
      table: t.String(),
      data: t.Record(t.String(), t.Any()),
      returning: t.Optional(t.Array(t.String())),
    })
  })
  
  // Build and execute UPDATE query
  .post('/query/update', async ({ body, user }) => {
    try {
      const queryParams = UpdateQuerySchema.parse(body);
      const sql = snowflakeService.builder.buildUpdate(queryParams);
      
      const result = await snowflakeService.executor.execute({
        query: sql,
      });
      
      // Invalidate cache for this table
      if (result.success) {
        snowflakeService.cache.invalidateByTable(queryParams.table);
      }
      
      return {
        ...result,
        sql,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Update query failed',
        rows: [],
        metadata: {
          rowCount: 0,
          columnCount: 0,
          columns: [],
          executionTime: 0,
        },
      };
    }
  }, {
    body: t.Object({
      table: t.String(),
      data: t.Record(t.String(), t.Any()),
      where: t.Record(t.String(), t.Any()),
      returning: t.Optional(t.Array(t.String())),
    })
  })
  
  // Build and execute DELETE query
  .post('/query/delete', async ({ body, user }) => {
    try {
      const queryParams = DeleteQuerySchema.parse(body);
      const sql = snowflakeService.builder.buildDelete(queryParams);
      
      const result = await snowflakeService.executor.execute({
        query: sql,
      });
      
      // Invalidate cache for this table
      if (result.success) {
        snowflakeService.cache.invalidateByTable(queryParams.table);
      }
      
      return {
        ...result,
        sql,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Delete query failed',
        rows: [],
        metadata: {
          rowCount: 0,
          columnCount: 0,
          columns: [],
          executionTime: 0,
        },
      };
    }
  }, {
    body: t.Object({
      table: t.String(),
      where: t.Record(t.String(), t.Any()),
      returning: t.Optional(t.Array(t.String())),
    })
  })
  
  // Get query history
  .get('/query/history', async ({ query, user }) => {
    try {
      const limit = query.limit ? parseInt(query.limit) : 100;
      const result = await snowflakeService.executor.getQueryHistory(limit);
      return result;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch query history',
        rows: [],
        metadata: {
          rowCount: 0,
          columnCount: 0,
          columns: [],
          executionTime: 0,
        },
      };
    }
  }, {
    query: t.Object({
      limit: t.Optional(t.String()),
    })
  })
  
  // Get cache statistics
  .get('/cache/stats', async ({ user }) => {
    return {
      success: true,
      stats: snowflakeService.cache.getStats(),
    };
  })
  
  // Clear cache
  .delete('/cache/clear', async ({ user }) => {
    snowflakeService.cache.invalidate();
    return {
      success: true,
      message: 'Cache cleared successfully',
    };
  })
  
  // Get table metadata
  .get('/metadata/tables', async ({ query, user }) => {
    try {
      const schema = query.schema || 'PUBLIC';
      const sql = `
        SELECT 
          TABLE_CATALOG,
          TABLE_SCHEMA,
          TABLE_NAME,
          TABLE_TYPE,
          ROW_COUNT,
          BYTES,
          CREATED,
          LAST_ALTERED
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA = '${schema}'
        ORDER BY TABLE_NAME
      `;
      
      const result = await snowflakeService.executor.execute({
        query: sql,
      });
      
      return result;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch table metadata',
        rows: [],
        metadata: {
          rowCount: 0,
          columnCount: 0,
          columns: [],
          executionTime: 0,
        },
      };
    }
  }, {
    query: t.Object({
      schema: t.Optional(t.String()),
    })
  })
  
  // Get column metadata for a table
  .get('/metadata/columns/:table', async ({ params, query, user }) => {
    try {
      const schema = query.schema || 'PUBLIC';
      const sql = `
        SELECT 
          COLUMN_NAME,
          DATA_TYPE,
          IS_NULLABLE,
          COLUMN_DEFAULT,
          CHARACTER_MAXIMUM_LENGTH,
          NUMERIC_PRECISION,
          NUMERIC_SCALE,
          ORDINAL_POSITION
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = '${schema}'
          AND TABLE_NAME = '${params.table}'
        ORDER BY ORDINAL_POSITION
      `;
      
      const result = await snowflakeService.executor.execute({
        query: sql,
      });
      
      return result;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch column metadata',
        rows: [],
        metadata: {
          rowCount: 0,
          columnCount: 0,
          columns: [],
          executionTime: 0,
        },
      };
    }
  }, {
    params: t.Object({
      table: t.String(),
    }),
    query: t.Object({
      schema: t.Optional(t.String()),
    })
  });

export default snowflakeRoutes;