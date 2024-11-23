import {
  DynamoDBClient,
  ConditionalCheckFailedException,
} from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  DeleteCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';

import { UserAlreadyExistsError } from '../errors/UserAlreadyExistsError';
import { UserNotFoundError } from '../errors/UserNotFoundError';
import { User } from '../types/user';

const USERS_TABLE = process.env.USERS_TABLE;
const client = new DynamoDBClient();

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
