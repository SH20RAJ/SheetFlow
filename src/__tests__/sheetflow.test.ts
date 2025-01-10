import { SheetFlow } from '../sheetflow';
import { SheetFlowValidationError } from '../errors';

jest.mock('google-spreadsheet');
jest.mock('google-auth-library');

describe('SheetFlow', () => {
  let sheetflow: SheetFlow;

  beforeEach(() => {
    sheetflow = new SheetFlow({
      credentials: {
        client_email: 'test@example.com',
        private_key: 'test-key',
      },
      spreadsheetId: 'test-sheet-id',
    });
  });

  describe('Table Operations', () => {
    const Users = sheetflow.defineTable('Users', {
      schema: {
        name: 'string:required',
        email: 'string:email:required',
        age: 'number:min(0)',
      },
      timestamps: true,
    });

    it('should create a new record', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
      };

      const result = await Users.create(userData);
      expect(result).toBeDefined();
      expect(result.name).toBe(userData.name);
    });

    it('should validate data before creation', async () => {
      const invalidData = {
        name: 'John Doe',
        email: 'invalid-email',
        age: -1,
      };

      await expect(Users.create(invalidData)).rejects.toThrow(SheetFlowValidationError);
    });

    it('should query records with filters', async () => {
      const results = await Users.find({
        where: {
          age: { $gt: 18 },
        },
        sort: { name: 'asc' },
        limit: 10,
      });

      expect(Array.isArray(results)).toBe(true);
    });

    it('should update records', async () => {
      const count = await Users.update(
        { age: { $lt: 18 } },
        { status: 'minor' }
      );

      expect(typeof count).toBe('number');
    });

    it('should delete records', async () => {
      const count = await Users.delete({
        email: 'john@example.com',
      });

      expect(typeof count).toBe('number');
    });

    it('should perform aggregations', async () => {
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

      expect(Array.isArray(stats)).toBe(true);
    });
  });
});
