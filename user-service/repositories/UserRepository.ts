import {
  DynamoDBClient,
  ConditionalCheckFailedException,
} from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { z } from 'zod';
import { UserAlreadyExistsError } from '../errors/UserAlreadyExistsError';

const USERS_TABLE = process.env.USERS_TABLE;
const client = new DynamoDBClient();

export const UserSchema = z.object({
  // UUID string
  id: z.string().uuid('The id needs to be a valid UUID'),
  firstName: z.string(),
  lastName: z.string(),
  // Array of unique emails, min 1, max 3
  emails: z
    .array(z.string().email('Invalid email format'))
    .min(1, 'A user must have at least 1 email')
    .max(3, 'A user can have at most 3 emails')
    .refine((emails) => new Set(emails).size === emails.length, {
      message: 'All the emails must be unique',
    }),
  // ISO date format (YYYY-MM-DD)
  dob: z.string().date('dob must be in the format YYYY-MM-DD'),
});

export type User = z.infer<typeof UserSchema>;

export class UserRepository {
  docClient: DynamoDBDocument;

  constructor() {
    this.docClient = DynamoDBDocument.from(client);
  }

  async create(user: User) {
    try {
      await this.docClient.put({
        TableName: USERS_TABLE,
        Item: user,
        // Create only if a user with the same id doesn't already exist
        ConditionExpression: 'attribute_not_exists(id)',
      });
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) {
        throw new UserAlreadyExistsError();
      }
      throw error;
    }
  }

  async get(id: string) {
    const { Item } = await this.docClient.get({
      TableName: USERS_TABLE,
      Key: {
        id,
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

  async delete(id: string) {
    await this.docClient.delete({
      TableName: USERS_TABLE,
      Key: {
        id,
      },
    });
  }
}
