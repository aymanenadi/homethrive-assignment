import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { z } from 'zod';

const USERS_TABLE = process.env.USERS_TABLE;
const client = new DynamoDBClient();

export const UserSchema = z.object({
  // UUID string
  id: z.string().uuid(),
  firstName: z.string(),
  lastName: z.string(),
  // Array of emails, min 1, max 3
  emails: z.array(z.string().email()).min(1).max(3),
  // ISO date format (YYYY-MM-DD)
  dob: z.string().date(),
});

type User = z.infer<typeof UserSchema>;

export class UserRepository {
  docClient: DynamoDBDocument;

  constructor() {
    this.docClient = DynamoDBDocument.from(client);
  }

  async create(user: User) {
    await this.docClient.put({
      TableName: USERS_TABLE,
      Item: user,
      // Create only if a user with the same id doesn't already exist
      ConditionExpression: 'attribute_not_exists(id)',
    });
  }

  async get(userId: string) {
    const { Item } = await this.docClient.get({
      TableName: USERS_TABLE,
      Key: {
        userId,
      },
    });

    return Item as User | undefined;
  }

  async update(id: string, user: Partial<User>) {
    await this.docClient.put({
      TableName: USERS_TABLE,
      Item: {
        ...user,
        id,
      },
      // Only update if the user already exists
      ConditionExpression: 'attribute_exists(id)',
    });
  }

  async delete(userId: string) {
    await this.docClient.delete({
      TableName: USERS_TABLE,
      Key: {
        userId,
      },
    });
  }
}
