import { NextFunction, Request, Response } from 'express';
import serverless from 'serverless-http';
import { v4 as uuid } from 'uuid';

import { contextMiddleware } from './middleware/contextMiddleware';
import { UserSchema } from './repositories';
import { fetchUserMiddleware } from './middleware/fetchUserMiddleware';
import { InvalidPayloadError } from './errors/InvalidPayloadError';
import validateUpdateUserPayloadMiddleware from './middleware/validateUpdateUserPayloadMiddlware';

const express = require('express');

const app = express();
const router = express.Router();

app.use(express.json());
app.use(contextMiddleware);

const getUser = async (req: Request, res: Response) => {
  res.json(req.context.fetchedUser);
};

const createUser = async (req: Request, res: Response) => {
  const body = req.body;
  // Generate an ID if not provided
  if (!body.id) {
    body.id = uuid();
  }
  const { userRepository } = req.context;

  try {
    // Validate the user payload
    const { success, data, error } = UserSchema.safeParse(body);

    // Throw an error if the payload is invalid
    if (!success) {
      throw new InvalidPayloadError({ errors: error.errors });
    }

    await userRepository.create(data);
    return res.json(data);
  } catch (error) {
    // Return an error response if the validation or the create operation fails
    res
      .status(error.statusCode || 500)
      .json({ message: error.message, errors: error.errors });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  const { userRepository } = req.context;
  const { id } = req.params;
  await userRepository.delete(id);
  res.status(204).send();
};

const updateUser = async (req: Request, res: Response) => {
  const { userRepository } = req.context;
  const { id } = req.params;
  const user = req.body;
  try {
    const updatedUser = await userRepository.update(id, user);
    res.json(updatedUser);
  } catch (error) {
    // return an error response if the update operation fails
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

// Route definitions
router.post('/', createUser);
router.get('/:id', fetchUserMiddleware, getUser);
router.put(
  '/:id',
  fetchUserMiddleware,
  validateUpdateUserPayloadMiddleware,
  updateUser
);
router.delete('/:id', deleteUser);

router.use((req: Request, res: Response, next: NextFunction) => {
  return res.status(404).json({
    error: 'Route not found',
  });
});

app.use('/users', router);

exports.handler = serverless(app);
