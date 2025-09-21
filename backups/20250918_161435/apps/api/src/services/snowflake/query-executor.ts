import snowflake from 'snowflake-sdk';
import { z } from 'zod';
import { config } from '../../config';
import { connectionPool, SnowflakeConnectionOptions } from './connection';

export const QueryParametersSchema = z.object({
  query: z.string().min(1),
  binds: z.array(z.any()).optional(),
  timeout: z.number().optional(),
  maxRows: z.number().optional(),
  streamResult: z.boolean().optional().default(false),
});

export type QueryParameters = z.infer<typeof QueryParametersSchema>;

export interface QueryResult {
  rows: any[];
  metadata: {
    rowCount: number;
    columnCount: number;
    columns: Array<{
      name: string;
      type: string;
      nullable: boolean;
      length?: number;
      precision?: number;
      scale?: number;
    }>;
    executionTime: number;
    queryId?: string;
  };
  success: boolean;
  error?: string;
}

export interface StreamQueryResult {
  stream: NodeJS.ReadableStream;
  metadata: {
    columns: Array<{
      name: string;
      type: string;
    }>;
    queryId?: string;
  };
}

class QueryExecutor {
  async execute(
    params: QueryParameters,
    connectionOptions?: SnowflakeConnectionOptions
  ): Promise<QueryResult> {
    const startTime = Date.now();
    const validatedParams = QueryParametersSchema.parse(params);

    try {
      const connection = await connectionPool.getConnection(connectionOptions);
      
      if (validatedParams.streamResult) {
        throw new Error('Use executeStream method for streaming results');
      }

      const result = await this.runQuery(
        connection,
        validatedParams.query,
        validatedParams.binds,
        validatedParams.timeout,
        validatedParams.maxRows
      );

      const executionTime = Date.now() - startTime;

      return {
        rows: result.rows,
        metadata: {
          rowCount: result.rows.length,
          columnCount: result.columns.length,
          columns: result.columns.map(col => ({
            name: col.getName(),
            type: col.getType(),
            nullable: col.isNullable(),
            length: col.getLength(),
            precision: col.getPrecision(),
            scale: col.getScale(),
          })),
          executionTime,
          queryId: result.queryId,
        },
        success: true,
      };
    } catch (error: any) {
      console.error('Query execution failed:', error);
      return {
        rows: [],
        metadata: {
          rowCount: 0,
          columnCount: 0,
          columns: [],
          executionTime: Date.now() - startTime,
        },
        success: false,
        error: error.message || 'Query execution failed',
      };
    }
  }

  async executeStream(
    params: Omit<QueryParameters, 'streamResult'>,
    connectionOptions?: SnowflakeConnectionOptions
  ): Promise<StreamQueryResult> {
    const validatedParams = QueryParametersSchema.parse({ ...params, streamResult: true });

    try {
      const connection = await connectionPool.getConnection(connectionOptions);
      
      const statement = connection.execute({
        sqlText: validatedParams.query,
        binds: validatedParams.binds,
        timeout: validatedParams.timeout || config.snowflake.timeout,
        streamResult: true,
      });

      return new Promise((resolve, reject) => {
        statement.streamRows()
          .on('error', reject)
          .on('data', () => {})
          .on('end', () => {})
          .on('readable', function(this: NodeJS.ReadableStream) {
            resolve({
              stream: this,
              metadata: {
                columns: statement.getColumns().map(col => ({
                  name: col.getName(),
                  type: col.getType(),
                })),
                queryId: statement.getQueryId(),
              },
            });
          });
      });
    } catch (error: any) {
      console.error('Stream query execution failed:', error);
      throw error;
    }
  }

  private async runQuery(
    connection: snowflake.Connection,
    sqlText: string,
    binds?: any[],
    timeout?: number,
    maxRows?: number
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const options: any = {
        sqlText,
        binds,
        timeout: timeout || config.snowflake.timeout,
        complete: (err: any, statement: any, rows: any) => {
          if (err) {
            reject(err);
          } else {
            const limitedRows = maxRows ? rows.slice(0, maxRows) : rows;
            resolve({
              rows: limitedRows,
              columns: statement.getColumns(),
              queryId: statement.getQueryId(),
            });
          }
        },
      };

      connection.execute(options);
    });
  }

  async validateQuery(query: string, connectionOptions?: SnowflakeConnectionOptions): Promise<{
    valid: boolean;
    error?: string;
  }> {
    try {
      const explainQuery = `EXPLAIN ${query}`;
      const result = await this.execute(
        { query: explainQuery, maxRows: 1 },
        connectionOptions
      );
      
      return {
        valid: result.success,
        error: result.error,
      };
    } catch (error: any) {
      return {
        valid: false,
        error: error.message || 'Query validation failed',
      };
    }
  }

  async getQueryHistory(
    limit: number = 100,
    connectionOptions?: SnowflakeConnectionOptions
  ): Promise<QueryResult> {
    const query = `
      SELECT 
        QUERY_ID,
        QUERY_TEXT,
        DATABASE_NAME,
        SCHEMA_NAME,
        QUERY_TYPE,
        SESSION_ID,
        USER_NAME,
        ROLE_NAME,
        WAREHOUSE_NAME,
        WAREHOUSE_SIZE,
        EXECUTION_STATUS,
        ERROR_CODE,
        ERROR_MESSAGE,
        START_TIME,
        END_TIME,
        TOTAL_ELAPSED_TIME,
        BYTES_SCANNED,
        ROWS_PRODUCED,
        COMPILATION_TIME,
        EXECUTION_TIME,
        QUEUED_PROVISIONING_TIME,
        QUEUED_REPAIR_TIME,
        QUEUED_OVERLOAD_TIME,
        TRANSACTION_BLOCKED_TIME
      FROM TABLE(INFORMATION_SCHEMA.QUERY_HISTORY())
      ORDER BY START_TIME DESC
      LIMIT ${limit}
    `;

    return this.execute({ query }, connectionOptions);
  }
}

export const queryExecutor = new QueryExecutor();

export async function executeQuery(
  params: QueryParameters,
  connectionOptions?: SnowflakeConnectionOptions
): Promise<QueryResult> {
  return queryExecutor.execute(params, connectionOptions);
}

export async function executeStreamQuery(
  params: Omit<QueryParameters, 'streamResult'>,
  connectionOptions?: SnowflakeConnectionOptions
): Promise<StreamQueryResult> {
  return queryExecutor.executeStream(params, connectionOptions);
}