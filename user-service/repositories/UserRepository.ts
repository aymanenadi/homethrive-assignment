import {
  DynamoDBClient,
  ConditionalCheckFailedException,
} from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  DeleteCommand,
  PutCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { z } from 'zod';
import { UserAlreadyExistsError } from '../errors/UserAlreadyExistsError';
import { UserNotFoundError } from '../errors/UserNotFoundError';

const USERS_TABLE = process.env.USERS_TABLE;
const client = new DynamoDBClient();

export const UserSchema = z.object({
  // UUID string
  id: z.string().uuid('The id needs to be a valid UUID'),
  firstName: z
    .string({ message: 'First name is required' })
    .min(1, 'First name cannot be an empty string'),
  lastName: z
    .string({ message: 'Last name is required' })
    .min(1, 'Last name cannot be an empty string'),
  // Array of unique emails, min 1, max 3
  emails: z
    .array(z.string().email('Invalid email format'), {
      message: 'The emails field is required',
    })
    .min(1, 'A user must have at least 1 email')
    .max(3, 'A user can have at most 3 emails')
    .refine((emails) => new Set(emails).size === emails.length, {
      message: 'All the emails must be unique',
    }),
  // ISO date format (YYYY-MM-DD)
  dob: z
    .string({
      message: 'Date of birth is required',
    })
    .date('dob must be in the format YYYY-MM-DD'),
});

export type User = z.infer<typeof UserSchema>;

export class UserRepository {
  docClient: DynamoDBDocumentClient;

  constructor() {
    this.docClient = DynamoDBDocumentClient.from(client);
  }

  async create(user: User) {
    try {
      await this.docClient.send(
        new PutCommand({
          TableName: USERS_TABLE,
          Item: user,
          // Create only if a user with the same id doesn't already exist
          ConditionExpression: 'attribute_not_exists(id)',
        })
      );
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) {
        throw new UserAlreadyExistsError();
      }
      throw error;
    }
  }

  async get(id: string) {
    const { Item } = await this.docClient.send(
      new GetCommand({
        TableName: USERS_TABLE,
        Key: {
          id,
        },
      })
    );

    return Item as User | undefined;
  }

  async update(user: User) {
    try {
      const result = await this.docClient.send(
        new PutCommand({
          TableName: USERS_TABLE,
          Item: user,
          // Only update if the user already exists
          ConditionExpression: 'attribute_exists(id)',
          ReturnValues: 'ALL_NEW',
        })
      );
      return result.Attributes as User;
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) {
        throw new UserNotFoundError();
      }
      throw error;
    }
  }

  async delete(id: string) {
    await this.docClient.send(
      new DeleteCommand({
        TableName: USERS_TABLE,
        Key: {
          id,
        },
      })
    );
  }
}
