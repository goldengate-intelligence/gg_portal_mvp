export * from './connection';
export * from './query-executor';
export * from './query-builder';
export * from './cache';

import { connectionPool, testConnection } from './connection';
import { queryExecutor } from './query-executor';
import { queryBuilder } from './query-builder';
import { queryCache } from './cache';

export const snowflakeService = {
  connection: connectionPool,
  executor: queryExecutor,
  builder: queryBuilder,
  cache: queryCache,
  testConnection,
};

export default snowflakeService;