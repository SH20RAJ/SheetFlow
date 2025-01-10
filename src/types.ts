export interface SheetFlowConfig {
  credentials: {
    client_email: string;
    private_key: string;
  };
  spreadsheetId: string;
  options?: {
    cache?: {
      enabled: boolean;
      ttl?: number;
    };
    sync?: {
      interval?: number;
      strategy?: 'optimistic' | 'pessimistic';
    };
    security?: {
      encryption?: {
        enabled: boolean;
        fields?: string[];
      };
      rateLimit?: {
        windowMs: number;
        max: number;
      };
    };
    logging?: {
      level: 'debug' | 'info' | 'warn' | 'error';
      format?: 'json' | 'text';
    };
  };
}

export interface TableOptions {
  schema?: Record<string, string>;
  timestamps?: boolean;
  security?: {
    policies?: {
      read?: (user: any, row: any) => boolean;
      write?: (user: any, row: any) => boolean;
    };
  };
  relationships?: Record<string, {
    type: 'hasOne' | 'hasMany' | 'belongsTo';
    table: string;
    foreignKey: string;
  }>;
}

export interface QueryOptions {
  where?: Record<string, any>;
  select?: string[];
  sort?: Record<string, 'asc' | 'desc'>;
  limit?: number;
  offset?: number;
  include?: string[];
}

export interface AggregateOptions {
  $group: {
    _id: string;
    [key: string]: any;
  };
  having?: Record<string, any>;
}

export interface ValidationRule {
  type: string;
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: any[];
  custom?: (value: any) => boolean | Promise<boolean>;
}
