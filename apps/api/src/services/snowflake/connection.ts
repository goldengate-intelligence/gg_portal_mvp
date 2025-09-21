import snowflake from 'snowflake-sdk';
import { config } from '../../config';

export interface SnowflakeConnectionOptions {
  account?: string;
  username?: string;
  password?: string;
  database?: string;
  warehouse?: string;
  schema?: string;
  role?: string;
  timeout?: number;
}

class SnowflakeConnectionPool {
  private connections: Map<string, snowflake.Connection> = new Map();
  private readonly maxConnections = 10;
  private readonly connectionTimeout = config.snowflake.timeout || 60000;

  async getConnection(options?: SnowflakeConnectionOptions): Promise<snowflake.Connection> {
    const connectionKey = this.getConnectionKey(options);
    
    if (this.connections.has(connectionKey)) {
      const connection = this.connections.get(connectionKey)!;
      if (connection.isUp()) {
        return connection;
      }
      this.connections.delete(connectionKey);
    }

    if (this.connections.size >= this.maxConnections) {
      const oldestKey = this.connections.keys().next().value;
      const oldestConnection = this.connections.get(oldestKey);
      if (oldestConnection) {
        await this.closeConnection(oldestConnection);
        this.connections.delete(oldestKey);
      }
    }

    const connection = await this.createConnection(options);
    this.connections.set(connectionKey, connection);
    return connection;
  }

  private async createConnection(options?: SnowflakeConnectionOptions): Promise<snowflake.Connection> {
    const connectionOptions = {
      account: options?.account || config.snowflake.account,
      username: options?.username || config.snowflake.username,
      password: options?.password || config.snowflake.password,
      database: options?.database || config.snowflake.database,
      warehouse: options?.warehouse || config.snowflake.warehouse,
      schema: options?.schema || config.snowflake.schema,
      role: options?.role || config.snowflake.role,
      timeout: options?.timeout || this.connectionTimeout,
    };

    if (!connectionOptions.account || !connectionOptions.username || !connectionOptions.password) {
      throw new Error('Snowflake credentials are not configured');
    }

    return new Promise((resolve, reject) => {
      const connection = snowflake.createConnection(connectionOptions);

      connection.connect((err, conn) => {
        if (err) {
          console.error('Failed to connect to Snowflake:', err);
          reject(err);
        } else {
          console.log('Successfully connected to Snowflake');
          resolve(conn);
        }
      });
    });
  }

  private getConnectionKey(options?: SnowflakeConnectionOptions): string {
    const account = options?.account || config.snowflake.account || 'default';
    const username = options?.username || config.snowflake.username || 'default';
    const database = options?.database || config.snowflake.database || 'default';
    return `${account}-${username}-${database}`;
  }

  private async closeConnection(connection: snowflake.Connection): Promise<void> {
    return new Promise((resolve) => {
      connection.destroy((err) => {
        if (err) {
          console.error('Error closing Snowflake connection:', err);
        }
        resolve();
      });
    });
  }

  async closeAll(): Promise<void> {
    const closePromises = Array.from(this.connections.values()).map(conn => 
      this.closeConnection(conn)
    );
    await Promise.all(closePromises);
    this.connections.clear();
  }
}

export const connectionPool = new SnowflakeConnectionPool();

export async function testConnection(options?: SnowflakeConnectionOptions): Promise<boolean> {
  try {
    const connection = await connectionPool.getConnection(options);
    return connection.isUp();
  } catch (error) {
    console.error('Snowflake connection test failed:', error);
    return false;
  }
}