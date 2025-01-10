import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { EventEmitter } from 'events';
import { SheetFlowConfig, TableOptions, QueryOptions, AggregateOptions } from './types';
import { SheetFlowError, SheetFlowValidationError } from './errors';
import { validateSchema } from './validation';
import { Cache } from './cache';

export class SheetFlow extends EventEmitter {
  private doc: GoogleSpreadsheet;
  private cache: Cache;
  private config: SheetFlowConfig;

  constructor(config: SheetFlowConfig) {
    super();
    this.config = config;
    this.initialize();
  }

  private async initialize() {
    try {
      const auth = new JWT({
        email: this.config.credentials.client_email,
        key: this.config.credentials.private_key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      this.doc = new GoogleSpreadsheet(this.config.spreadsheetId);
      await this.doc.useServiceAccountAuth(auth);
      await this.doc.loadInfo();

      if (this.config.options?.cache?.enabled) {
        this.cache = new Cache(this.config.options.cache);
      }

      this.emit('ready');
    } catch (error) {
      throw new SheetFlowError('Failed to initialize SheetFlow', { cause: error });
    }
  }

  public defineTable(tableName: string, options: TableOptions) {
    const sheet = this.doc.sheetsByTitle[tableName] || this.doc.addSheet({ title: tableName });
    
    return {
      create: async (data: any) => {
        try {
          if (options.schema) {
            await validateSchema(data, options.schema);
          }

          if (options.timestamps) {
            data.createdAt = new Date().toISOString();
            data.updatedAt = new Date().toISOString();
          }

          const rows = await sheet.addRow(data);
          this.emit('afterCreate', { table: tableName, data: rows });
          return rows;
        } catch (error) {
          if (error instanceof Error) {
            throw new SheetFlowValidationError(error.message);
          }
          throw error;
        }
      },

      find: async (query: QueryOptions = {}) => {
        try {
          const cacheKey = `${tableName}:${JSON.stringify(query)}`;
          
          if (this.cache) {
            const cached = await this.cache.get(cacheKey);
            if (cached) return cached;
          }

          await sheet.loadCells();
          const rows = await sheet.getRows();
          
          let results = rows;

          // Apply filters
          if (query.where) {
            results = rows.filter(row => {
              return Object.entries(query.where).every(([key, condition]) => {
                if (typeof condition === 'object') {
                  // Handle operators ($gt, $lt, etc.)
                  return Object.entries(condition).every(([operator, value]) => {
                    switch (operator) {
                      case '$gt': return row[key] > value;
                      case '$gte': return row[key] >= value;
                      case '$lt': return row[key] < value;
                      case '$lte': return row[key] <= value;
                      case '$in': return (value as any[]).includes(row[key]);
                      default: return row[key] === value;
                    }
                  });
                }
                return row[key] === condition;
              });
            });
          }

          // Apply sorting
          if (query.sort) {
            const [field, order] = Object.entries(query.sort)[0];
            results.sort((a, b) => {
              return order === 'asc' 
                ? a[field] > b[field] ? 1 : -1
                : a[field] < b[field] ? 1 : -1;
            });
          }

          // Apply pagination
          if (query.limit) {
            const start = query.offset || 0;
            results = results.slice(start, start + query.limit);
          }

          if (this.cache) {
            await this.cache.set(cacheKey, results);
          }

          return results;
        } catch (error) {
          throw new SheetFlowError('Failed to query data', { cause: error });
        }
      },

      update: async (where: any, data: any) => {
        try {
          if (options.schema) {
            await validateSchema(data, options.schema);
          }

          const rows = await sheet.getRows();
          const updates = rows.filter(row => {
            return Object.entries(where).every(([key, value]) => row[key] === value);
          });

          if (options.timestamps) {
            data.updatedAt = new Date().toISOString();
          }

          for (const row of updates) {
            Object.assign(row, data);
            await row.save();
          }

          this.emit('afterUpdate', { table: tableName, where, data });
          return updates.length;
        } catch (error) {
          throw new SheetFlowError('Failed to update data', { cause: error });
        }
      },

      delete: async (where: any) => {
        try {
          const rows = await sheet.getRows();
          const deletions = rows.filter(row => {
            return Object.entries(where).every(([key, value]) => row[key] === value);
          });

          for (const row of deletions) {
            await row.delete();
          }

          this.emit('afterDelete', { table: tableName, where });
          return deletions.length;
        } catch (error) {
          throw new SheetFlowError('Failed to delete data', { cause: error });
        }
      },

      aggregate: async (options: AggregateOptions) => {
        try {
          const rows = await sheet.getRows();
          const groups = new Map();

          for (const row of rows) {
            const groupKey = options.$group._id === '$all' ? 'all' : row[options.$group._id.slice(1)];
            
            if (!groups.has(groupKey)) {
              groups.set(groupKey, []);
            }
            groups.get(groupKey).push(row);
          }

          const results = Array.from(groups.entries()).map(([key, groupRows]) => {
            const result: any = { _id: key };

            Object.entries(options.$group).forEach(([field, operation]: [string, any]) => {
              if (field === '_id') return;

              const values = groupRows.map(row => row[operation.slice(1)]);
              
              switch (Object.keys(operation)[0]) {
                case '$sum':
                  result[field] = values.reduce((a, b) => a + Number(b), 0);
                  break;
                case '$avg':
                  result[field] = values.reduce((a, b) => a + Number(b), 0) / values.length;
                  break;
                case '$min':
                  result[field] = Math.min(...values.map(Number));
                  break;
                case '$max':
                  result[field] = Math.max(...values.map(Number));
                  break;
                case '$count':
                  result[field] = values.length;
                  break;
              }
            });

            return result;
          });

          // Apply having clause if present
          if (options.having) {
            return results.filter(result => {
              return Object.entries(options.having).every(([field, condition]) => {
                if (typeof condition === 'object') {
                  return Object.entries(condition).every(([operator, value]) => {
                    switch (operator) {
                      case '$gt': return result[field] > value;
                      case '$gte': return result[field] >= value;
                      case '$lt': return result[field] < value;
                      case '$lte': return result[field] <= value;
                      default: return result[field] === value;
                    }
                  });
                }
                return result[field] === condition;
              });
            });
          }

          return results;
        } catch (error) {
          throw new SheetFlowError('Failed to aggregate data', { cause: error });
        }
      }
    };
  }
}
