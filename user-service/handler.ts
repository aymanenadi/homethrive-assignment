// import { contextMiddleware } from './middleware/contextMiddleware';
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
import { contextMiddleware } from './middleware/contextMiddleware';
import { Request, Response } from 'express';

const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} = require('@aws-sdk/lib-dynamodb');

const express = require('express');
const serverless = require('serverless-http');

const app = express();
const router = express.Router();

const USERS_TABLE = process.env.USERS_TABLE;
const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

app.use(express.json());
app.use(contextMiddleware);

router.get('/:userId', async (req: Request, res: Response) => {
  const { userRepository } = req.context;
  const { userId } = req.params;
  const user = await userRepository.get(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

router.post('/', async (req, res) => {
  const { userId, name } = req.body;
  if (typeof userId !== 'string') {
    res.status(400).json({ error: '"userId" must be a string' });
  } else if (typeof name !== 'string') {
    res.status(400).json({ error: '"name" must be a string' });
  }

  const params = {
    TableName: USERS_TABLE,
    Item: { userId, name },
  };

  try {
    const command = new PutCommand(params);
    await docClient.send(command);
    res.json({ userId, name });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not create user' });
  }
});

router.use((req, res, next) => {
  return res.status(404).json({
    error: 'Not Found',
  });
});

app.use('/users', router);

exports.handler = serverless(app);
