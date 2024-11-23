import { mockClient } from 'aws-sdk-client-mock';
import {
  GetCommand,
  DynamoDBDocumentClient,
  PutCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { UserRepository, User } from './UserRepository';
import { UserAlreadyExistsError } from '../errors/UserAlreadyExistsError';
import { UserNotFoundError } from '../errors/UserNotFoundError';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';

describe('UserRepository', () => {
  const dynamoDBMock = mockClient(DynamoDBDocumentClient);

  const userRepository = new UserRepository();
  const user: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    firstName: 'John',
    lastName: 'Doe',
    emails: ['john.doe@example.com'],
    dob: '1990-01-01',
  };

  beforeEach(() => {
    dynamoDBMock.reset();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      dynamoDBMock
        .on(PutCommand, {
          TableName: process.env.USERS_TABLE,
          Item: user,
          ConditionExpression: 'attribute_not_exists(id)',
        })
        .resolves({});

      await expect(userRepository.create(user)).resolves.not.toThrow();
    });

    it('should throw UserAlreadyExistsError if user already exists', async () => {
      dynamoDBMock
        .on(PutCommand, {
          TableName: process.env.USERS_TABLE,
          Item: user,
          ConditionExpression: 'attribute_not_exists(id)',
        })
        .rejects(
          new ConditionalCheckFailedException({
            message: 'The conditional request failed',
            $metadata: {},
          })
        );

      await expect(userRepository.create(user)).rejects.toThrow(
        UserAlreadyExistsError
      );
    });

    it('should throw an error if DynamoDB throws an error', async () => {
      dynamoDBMock
        .on(PutCommand, {
          TableName: process.env.USERS_TABLE,
          Item: user,
          ConditionExpression: 'attribute_not_exists(id)',
        })
        .rejects(new Error('Internal Server Error'));

      await expect(userRepository.create(user)).rejects.toThrow(Error);
    });
  });

  describe('get', () => {
    it('should get an existing user', async () => {
      dynamoDBMock
        .on(GetCommand, {
          TableName: process.env.USERS_TABLE,
          Key: { id: user.id },
        })
        .resolves({ Item: user });

      const result = await userRepository.get(user.id);
      expect(result).toEqual(user);
    });

    it('should return undefined if user does not exist', async () => {
      dynamoDBMock
        .on(GetCommand, {
          TableName: process.env.USERS_TABLE,
          Key: { id: user.id },
        })
        .resolves({});

      const result = await userRepository.get(user.id);
      expect(result).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      dynamoDBMock
        .on(PutCommand, {
          TableName: process.env.USERS_TABLE,
          Item: user,
        })
        .resolves({});

      await expect(userRepository.delete(user.id)).resolves.not.toThrow();
    });
  });

  describe('update', () => {
    it('should update an existing user', async () => {
      const updatePayload = { firstName: 'Jane' };
      const updatedUser = { ...user, ...updatePayload };
      dynamoDBMock
        .on(UpdateCommand, {
          TableName: process.env.USERS_TABLE,
          Key: { id: user.id },
          UpdateExpression: 'SET #firstName = :firstName',
          ExpressionAttributeNames: { '#firstName': 'firstName' },
          ExpressionAttributeValues: { ':firstName': 'Jane' },
          ReturnValues: 'ALL_NEW',
        })
        .resolves({
          Attributes: updatedUser,
        });

      const result = await userRepository.update(user.id, updatePayload);
      expect(result).toEqual(updatedUser);
    });

    it('should throw UserNotFoundError if user does not exist', async () => {
      const updatePayload = { firstName: 'Jane' };
      dynamoDBMock
        .on(UpdateCommand, {
          TableName: process.env.USERS_TABLE,
          Key: { id: user.id },
          UpdateExpression: 'SET #firstName = :firstName',
          ExpressionAttributeNames: { '#firstName': 'firstName' },
          ExpressionAttributeValues: { ':firstName': 'Jane' },
          ReturnValues: 'ALL_NEW',
        })
        .rejects(
          new ConditionalCheckFailedException({
            message: 'The conditional request failed',
            $metadata: {},
          })
        );

      await expect(
        userRepository.update(user.id, updatePayload)
      ).rejects.toThrow(UserNotFoundError);
    });

    it('should throw an error if DynamoDB throws an error', async () => {
      const updatePayload = { firstName: 'Jane' };
      dynamoDBMock
        .on(UpdateCommand, {
          TableName: process.env.USERS_TABLE,
          Key: { id: user.id },
          UpdateExpression: 'SET #firstName = :firstName',
          ExpressionAttributeNames: { '#firstName': 'firstName' },
          ExpressionAttributeValues: { ':firstName': 'Jane' },
          ReturnValues: 'ALL_NEW',
        })
        .rejects(new Error('Internal Server Error'));

      await expect(
        userRepository.update(user.id, updatePayload)
      ).rejects.toThrow(Error);
    });

    it('should throw an error if the update payload has just the id field', async () => {
      const updatePayload = { id: '123e4567-e89b-12d3-a456-426614174000' };

      await expect(
        userRepository.update(user.id, updatePayload)
      ).rejects.toThrow(Error);
    });
  });
});
