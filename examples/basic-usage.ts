import { SheetFlow } from '../src';

async function main() {
  // Initialize SheetFlow with your Google Sheets credentials
  const sheetflow = new SheetFlow({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL!,
      private_key: process.env.GOOGLE_PRIVATE_KEY!,
    },
    spreadsheetId: process.env.SPREADSHEET_ID!,
    options: {
      cache: {
        enabled: true,
        ttl: 60, // 1 minute
      },
      security: {
        encryption: {
          enabled: true,
          fields: ['email', 'phone'],
        },
      },
    },
  });

  // Define a table with schema
  const Users = sheetflow.defineTable('Users', {
    schema: {
      name: 'string:required',
      email: 'string:email:required',
      age: 'number:min(0)',
      country: 'string',
    },
    timestamps: true,
  });

  try {
    // Create a new user
    const newUser = await Users.create({
      name: 'John Doe',
      email: 'john@example.com',
      age: 25,
      country: 'USA',
    });
    console.log('Created user:', newUser);

    // Query users
    const adultUsers = await Users.find({
      where: {
        age: { $gte: 18 },
        country: 'USA',
      },
      sort: { name: 'asc' },
      limit: 10,
    });
    console.log('Adult users:', adultUsers);

    // Update users
    const updatedCount = await Users.update(
      { country: 'USA' },
      { status: 'active' }
    );
    console.log('Updated users:', updatedCount);

    // Aggregate data
    const stats = await Users.aggregate({
      $group: {
        _id: '$country',
        avgAge: { $avg: '$age' },
        totalUsers: { $count: true },
      },
      having: {
        totalUsers: { $gt: 5 },
      },
    });
    console.log('User statistics:', stats);

  } catch (error) {
    console.error('Error:', error);
  }
}

main();
