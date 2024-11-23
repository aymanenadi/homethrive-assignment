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

/**
 * Converts a partial user object to DynamoDB UpdateExpression, ExpressionAttributeNames and ExpressionAttributeValues
 * @param user
 * @returns
 */
const toUpdateExpressions = (user: Partial<User>) => {
  const updateExpressions: string[] = [];
  const expressionAttributeNames: { [key: string]: string } = {};
  const expressionAttributeValues: { [key: string]: any } = {};

  // Get all the attributes from the UserSchema except the id because we shouldn't update it
  const validAttributes = Object.keys(UserSchema.shape).filter(
    (field) => field !== 'id'
  );

  const processField = (field: string) => {
    if (user[field] !== undefined) {
      updateExpressions.push(`#${field} = :${field}`);
      expressionAttributeNames[`#${field}`] = field;
      expressionAttributeValues[`:${field}`] = user[field];
    }
  };

  validAttributes.forEach(processField);

  if (updateExpressions.length === 0) {
    throw new Error('No valid user attributes to update');
  }

  return {
    UpdateExpression: 'SET ' + updateExpressions.join(', '),
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
  };
};

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

  async update(id: string, user: Partial<User>) {
    try {
      const {
        UpdateExpression,
        ExpressionAttributeNames,
        ExpressionAttributeValues,
      } = toUpdateExpressions(user);

      const result = await this.docClient.send(
        new UpdateCommand({
          TableName: USERS_TABLE,
          Key: {
            id,
          },
          UpdateExpression,
          ExpressionAttributeNames,
          ExpressionAttributeValues,
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
