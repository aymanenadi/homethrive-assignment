import { Request, Response } from 'express';
import serverless from 'serverless-http';
import { v4 as uuid } from 'uuid';

import { contextMiddleware } from './middleware/contextMiddleware';
import { UserSchema } from './repositories';

const express = require('express');

const app = express();
const router = express.Router();

app.use(express.json());
app.use(contextMiddleware);

const getUser = async (req: Request, res: Response) => {
  const { userRepository } = req.context;
  const { id } = req.params;
  const user = await userRepository.get(id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
};

const createUser = async (req: Request, res: Response) => {
  const body = req.body;
  // Generate an ID if not provided
  if (!body.id) {
    body.id = uuid();
  }

  // Validate the user payload
  const { success, data, error } = UserSchema.safeParse(body);

  if (!success) {
    return res
      .status(400)
      .json({ message: 'Invalid user payload', error: error.errors });
  }

  const { userRepository } = req.context;
  try {
    await userRepository.create(data);
    return res.json(data);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  const { userRepository } = req.context;
  const { id } = req.params;
  await userRepository.delete(id);
  res.status(204).send();
};

// Route definitions
router.post('/', createUser);
router.get('/:id', getUser);
router.delete('/:id', deleteUser);

router.use((req, res, next) => {
  return res.status(404).json({
    error: 'Route not found',
  });
});

app.use('/users', router);

exports.handler = serverless(app);
