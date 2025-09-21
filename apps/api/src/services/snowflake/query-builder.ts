import { z } from 'zod';

export const SelectQuerySchema = z.object({
  table: z.string(),
  columns: z.array(z.string()).optional(),
  where: z.record(z.any()).optional(),
  orderBy: z.array(z.object({
    column: z.string(),
    direction: z.enum(['ASC', 'DESC']).optional(),
  })).optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
  joins: z.array(z.object({
    type: z.enum(['INNER', 'LEFT', 'RIGHT', 'FULL']).optional(),
    table: z.string(),
    on: z.string(),
  })).optional(),
  groupBy: z.array(z.string()).optional(),
  having: z.string().optional(),
});

export type SelectQuery = z.infer<typeof SelectQuerySchema>;

export const InsertQuerySchema = z.object({
  table: z.string(),
  data: z.record(z.any()),
  returning: z.array(z.string()).optional(),
});

export type InsertQuery = z.infer<typeof InsertQuerySchema>;

export const UpdateQuerySchema = z.object({
  table: z.string(),
  data: z.record(z.any()),
  where: z.record(z.any()),
  returning: z.array(z.string()).optional(),
});

export type UpdateQuery = z.infer<typeof UpdateQuerySchema>;

export const DeleteQuerySchema = z.object({
  table: z.string(),
  where: z.record(z.any()),
  returning: z.array(z.string()).optional(),
});

export type DeleteQuery = z.infer<typeof DeleteQuerySchema>;

export class SnowflakeQueryBuilder {
  private sanitizeIdentifier(identifier: string): string {
    return `"${identifier.replace(/"/g, '""')}"`;
  }

  private sanitizeValue(value: any): string {
    if (value === null) return 'NULL';
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
    if (value instanceof Date) return `'${value.toISOString()}'`;
    if (typeof value === 'string') {
      return `'${value.replace(/'/g, "''")}'`;
    }
    return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
  }

  buildSelect(query: SelectQuery): string {
    const validated = SelectQuerySchema.parse(query);
    let sql = 'SELECT ';

    if (validated.columns && validated.columns.length > 0) {
      sql += validated.columns.map(col => this.sanitizeIdentifier(col)).join(', ');
    } else {
      sql += '*';
    }

    sql += ` FROM ${this.sanitizeIdentifier(validated.table)}`;

    if (validated.joins) {
      for (const join of validated.joins) {
        const joinType = join.type || 'INNER';
        sql += ` ${joinType} JOIN ${this.sanitizeIdentifier(join.table)} ON ${join.on}`;
      }
    }

    if (validated.where && Object.keys(validated.where).length > 0) {
      const conditions = Object.entries(validated.where).map(([key, value]) => {
        if (value === null) {
          return `${this.sanitizeIdentifier(key)} IS NULL`;
        }
        if (Array.isArray(value)) {
          const values = value.map(v => this.sanitizeValue(v)).join(', ');
          return `${this.sanitizeIdentifier(key)} IN (${values})`;
        }
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          const operators = Object.entries(value).map(([op, val]) => {
            switch (op) {
              case '$gt': return `${this.sanitizeIdentifier(key)} > ${this.sanitizeValue(val)}`;
              case '$gte': return `${this.sanitizeIdentifier(key)} >= ${this.sanitizeValue(val)}`;
              case '$lt': return `${this.sanitizeIdentifier(key)} < ${this.sanitizeValue(val)}`;
              case '$lte': return `${this.sanitizeIdentifier(key)} <= ${this.sanitizeValue(val)}`;
              case '$ne': return `${this.sanitizeIdentifier(key)} != ${this.sanitizeValue(val)}`;
              case '$like': return `${this.sanitizeIdentifier(key)} LIKE ${this.sanitizeValue(val)}`;
              case '$ilike': return `${this.sanitizeIdentifier(key)} ILIKE ${this.sanitizeValue(val)}`;
              default: return `${this.sanitizeIdentifier(key)} = ${this.sanitizeValue(val)}`;
            }
          });
          return operators.join(' AND ');
        }
        return `${this.sanitizeIdentifier(key)} = ${this.sanitizeValue(value)}`;
      });
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    if (validated.groupBy && validated.groupBy.length > 0) {
      sql += ` GROUP BY ${validated.groupBy.map(col => this.sanitizeIdentifier(col)).join(', ')}`;
    }

    if (validated.having) {
      sql += ` HAVING ${validated.having}`;
    }

    if (validated.orderBy && validated.orderBy.length > 0) {
      const orderClauses = validated.orderBy.map(order => 
        `${this.sanitizeIdentifier(order.column)} ${order.direction || 'ASC'}`
      );
      sql += ` ORDER BY ${orderClauses.join(', ')}`;
    }

    if (validated.limit) {
      sql += ` LIMIT ${validated.limit}`;
    }

    if (validated.offset) {
      sql += ` OFFSET ${validated.offset}`;
    }

    return sql;
  }

  buildInsert(query: InsertQuery): string {
    const validated = InsertQuerySchema.parse(query);
    const columns = Object.keys(validated.data);
    const values = Object.values(validated.data);

    let sql = `INSERT INTO ${this.sanitizeIdentifier(validated.table)} `;
    sql += `(${columns.map(col => this.sanitizeIdentifier(col)).join(', ')}) `;
    sql += `VALUES (${values.map(val => this.sanitizeValue(val)).join(', ')})`;

    if (validated.returning && validated.returning.length > 0) {
      sql += ` RETURNING ${validated.returning.map(col => this.sanitizeIdentifier(col)).join(', ')}`;
    }

    return sql;
  }

  buildUpdate(query: UpdateQuery): string {
    const validated = UpdateQuerySchema.parse(query);
    const setClauses = Object.entries(validated.data).map(([key, value]) => 
      `${this.sanitizeIdentifier(key)} = ${this.sanitizeValue(value)}`
    );

    let sql = `UPDATE ${this.sanitizeIdentifier(validated.table)} SET ${setClauses.join(', ')}`;

    const whereConditions = Object.entries(validated.where).map(([key, value]) => {
      if (value === null) {
        return `${this.sanitizeIdentifier(key)} IS NULL`;
      }
      return `${this.sanitizeIdentifier(key)} = ${this.sanitizeValue(value)}`;
    });

    sql += ` WHERE ${whereConditions.join(' AND ')}`;

    if (validated.returning && validated.returning.length > 0) {
      sql += ` RETURNING ${validated.returning.map(col => this.sanitizeIdentifier(col)).join(', ')}`;
    }

    return sql;
  }

  buildDelete(query: DeleteQuery): string {
    const validated = DeleteQuerySchema.parse(query);
    
    let sql = `DELETE FROM ${this.sanitizeIdentifier(validated.table)}`;

    const whereConditions = Object.entries(validated.where).map(([key, value]) => {
      if (value === null) {
        return `${this.sanitizeIdentifier(key)} IS NULL`;
      }
      return `${this.sanitizeIdentifier(key)} = ${this.sanitizeValue(value)}`;
    });

    sql += ` WHERE ${whereConditions.join(' AND ')}`;

    if (validated.returning && validated.returning.length > 0) {
      sql += ` RETURNING ${validated.returning.map(col => this.sanitizeIdentifier(col)).join(', ')}`;
    }

    return sql;
  }

  buildCreateTable(tableName: string, columns: Array<{
    name: string;
    type: string;
    nullable?: boolean;
    primaryKey?: boolean;
    unique?: boolean;
    default?: any;
  }>): string {
    const columnDefs = columns.map(col => {
      let def = `${this.sanitizeIdentifier(col.name)} ${col.type}`;
      if (!col.nullable) def += ' NOT NULL';
      if (col.primaryKey) def += ' PRIMARY KEY';
      if (col.unique) def += ' UNIQUE';
      if (col.default !== undefined) {
        def += ` DEFAULT ${this.sanitizeValue(col.default)}`;
      }
      return def;
    });

    return `CREATE TABLE IF NOT EXISTS ${this.sanitizeIdentifier(tableName)} (${columnDefs.join(', ')})`;
  }

  buildDropTable(tableName: string, ifExists: boolean = true): string {
    return `DROP TABLE ${ifExists ? 'IF EXISTS ' : ''}${this.sanitizeIdentifier(tableName)}`;
  }
}

export const queryBuilder = new SnowflakeQueryBuilder();