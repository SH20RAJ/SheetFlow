# Sheet-Flow 📊

<div align="center">

![Sheet-Flow Logo](https://raw.githubusercontent.com/SH20RAJ/SheetFlow/main/logo.svg)

[![npm version](https://img.shields.io/npm/v/@sh20raj/sheet-flow.svg)](https://www.npmjs.com/package/@sh20raj/sheet-flow)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

</div>

**Sheet-Flow** transforms your Google Sheets into powerful, production-ready databases with a RESTful API interface. Built for modern applications, it provides enterprise-grade features while maintaining the simplicity and flexibility of spreadsheets.

## 🌟 Key Features

### Core Functionality
- **🔄 Real-Time Sync**: Bi-directional synchronization between your API and spreadsheets
- **🔐 Enterprise-Grade Security**: Row-level access control, API key authentication, and rate limiting
- **🚀 High Performance**: Intelligent caching and connection pooling for optimal performance
- **📦 Type Safety**: Full TypeScript support with automatic type inference from sheet headers

### Advanced Features
- **🔍 Advanced Querying**
  - Complex filters and search operations
  - Pagination and sorting
  - Relationship support between sheets
  - Aggregation functions
  
- **🎯 Data Validation**
  - Schema validation using Joi
  - Custom validation rules
  - Data transformation hooks
  
- **🔌 Integration Features**
  - Webhooks for real-time updates
  - Event system for data changes
  - Custom middleware support
  - Batch operations
  
- **🛠 Developer Experience**
  - Auto-generated TypeScript types
  - Comprehensive error handling
  - Detailed logging and monitoring
  - OpenAPI/Swagger documentation

## 📚 Quick Start

### Installation

```bash
npm install @sh20raj/sheet-flow
```

### Basic Usage

```typescript
import { SheetFlow } from '@sh20raj/sheet-flow';

// Initialize SheetFlow
const sheetflow = new SheetFlow({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
  },
  spreadsheetId: 'your-spreadsheet-id'
});

// Define your schema (optional)
const userSchema = {
  name: 'string:required',
  email: 'string:email:required',
  age: 'number:min(0)',
};

// Create a table
const Users = sheetflow.defineTable('Users', {
  schema: userSchema,
  timestamps: true, // Adds createdAt and updatedAt
});

// CRUD Operations
async function examples() {
  // Create
  const newUser = await Users.create({
    name: 'John Doe',
    email: 'john@example.com',
    age: 25
  });

  // Read with filtering
  const adults = await Users.find({
    where: {
      age: { $gte: 18 }
    },
    sort: { name: 'asc' },
    limit: 10
  });

  // Update
  await Users.update(
    { age: { $lt: 18 } },
    { status: 'minor' }
  );

  // Delete
  await Users.delete({
    email: 'john@example.com'
  });
}
```

## 🔧 Advanced Configuration

```typescript
const config: SheetFlowConfig = {
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
  },
  spreadsheetId: 'your-spreadsheet-id',
  options: {
    cache: {
      enabled: true,
      ttl: 60000, // 1 minute
    },
    sync: {
      interval: 5000, // 5 seconds
      strategy: 'optimistic',
    },
    security: {
      encryption: {
        enabled: true,
        fields: ['email', 'phone'],
      },
      rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
      },
    },
    logging: {
      level: 'info',
      format: 'json',
    },
  },
};
```

## 🔐 Authentication & Security

### API Key Authentication

```typescript
import { SheetFlow, auth } from '@sh20raj/sheet-flow';

const app = express();

// Add authentication middleware
app.use(auth.apiKey({
  header: 'X-API-Key',
  keys: ['your-api-key'],
}));
```

### Row-Level Security

```typescript
const Users = sheetflow.defineTable('Users', {
  schema: userSchema,
  security: {
    policies: {
      read: (user, row) => user.id === row.userId || user.role === 'admin',
      write: (user, row) => user.role === 'admin',
    },
  },
});
```

## 🎯 Event Handling

```typescript
// Subscribe to events
Users.on('beforeCreate', async (data) => {
  // Validate or transform data before creation
  data.createdBy = currentUser.id;
});

Users.on('afterUpdate', async (oldData, newData) => {
  // Trigger webhooks or other side effects
  await notifyWebhooks({
    event: 'user.updated',
    data: { old: oldData, new: newData },
  });
});
```

## 📊 Relationships & Joins

```typescript
const Orders = sheetflow.defineTable('Orders', {
  schema: orderSchema,
  relationships: {
    user: {
      type: 'belongsTo',
      table: 'Users',
      foreignKey: 'userId',
    },
  },
});

// Query with joins
const ordersWithUsers = await Orders.find({
  include: ['user'],
  where: {
    'user.country': 'USA',
  },
});
```

## 🔍 Advanced Queries

```typescript
// Complex filtering
const results = await Users.find({
  where: {
    $or: [
      { age: { $gt: 18 } },
      { status: 'approved' },
    ],
    country: { $in: ['USA', 'Canada'] },
    lastLogin: { $gte: new Date('2023-01-01') },
  },
  select: ['id', 'name', 'email'],
  sort: { age: 'desc' },
  limit: 20,
  offset: 0,
});

// Aggregations
const stats = await Users.aggregate({
  $group: {
    _id: '$country',
    avgAge: { $avg: '$age' },
    total: { $count: true },
  },
  having: {
    total: { $gt: 100 },
  },
});
```

## 🚨 Error Handling

```typescript
try {
  await Users.create({
    name: 'John',
    email: 'invalid-email',
  });
} catch (error) {
  if (error instanceof SheetFlowValidationError) {
    console.error('Validation failed:', error.details);
  } else if (error instanceof SheetFlowConnectionError) {
    console.error('Connection failed:', error.message);
  }
}
```

## 📈 Monitoring & Logging

```typescript
// Custom logger
sheetflow.setLogger({
  info: (msg, meta) => winston.info(msg, meta),
  error: (msg, meta) => winston.error(msg, meta),
});

// Monitor performance
sheetflow.on('query', (stats) => {
  console.log(`Query took ${stats.duration}ms`);
});
```

## 🔄 Migration Tools

```typescript
import { migrate } from '@sh20raj/sheet-flow/tools';

// Create a migration
const migration = {
  up: async (sheet) => {
    await sheet.addColumn('status', { type: 'string', default: 'active' });
    await sheet.renameColumn('userName', 'fullName');
  },
  down: async (sheet) => {
    await sheet.removeColumn('status');
    await sheet.renameColumn('fullName', 'userName');
  },
};

// Run migrations
await migrate.up();
```

## 🧪 Testing

```typescript
import { createTestClient } from '@sh20raj/sheet-flow/testing';

describe('User API', () => {
  let client;

  beforeEach(() => {
    client = createTestClient();
  });

  it('should create a user', async () => {
    const user = await client.Users.create({
      name: 'Test User',
      email: 'test@example.com',
    });
    expect(user.id).toBeDefined();
  });
});
```

## 📝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

- 📚 [Documentation](https://sheet-flow.docs.com)
- 💬 [Discord Community](https://discord.gg/sheet-flow)
- 🐛 [Issue Tracker](https://github.com/username/sheet-flow/issues)
- 📧 [Email Support](mailto:support@sheet-flow.com)

---

<div align="center">
Made with ❤️ by the Sheet-Flow Team
</div>
