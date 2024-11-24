import { NextFunction, Request, Response } from 'express';
import serverless from 'serverless-http';
import { v4 as uuid } from 'uuid';

import { contextMiddleware } from './middleware/contextMiddleware';
import { fetchUserMiddleware } from './middleware/fetchUserMiddleware';
import { validateEmailUpdatesMiddleware } from './middleware/validateEmailUpdatesMiddleware';
import { sendErrorResponse, sendSuccessResponse } from './utils/httpResponses';
import { errorHandlerMiddleware } from './middleware/errorHandlerMiddleware';
import { validatePayloadMiddleware } from './middleware/validatePayloadMiddleware';

const express = require('express');

export const app = express();
const usersRouter = express.Router();

app.use(express.json());
app.use(contextMiddleware);

const getUser = async (req: Request, res: Response) => {
  return sendSuccessResponse({
    res,
    data: req.context.fetchedUser,
    statusCode: 200,
  });
};

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const body = req.body;
  // Generate an ID if not provided
  if (!body.id) {
    body.id = uuid();
  }

  try {
    const { userRepository } = req.context;
    await userRepository.create(body);
    return sendSuccessResponse({ res, data: body, statusCode: 201 });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  const { userRepository } = req.context;
  try {
    const { id } = req.params;
    await userRepository.delete(id);
    return sendSuccessResponse({ res, statusCode: 204 });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userRepository } = req.context;
    const user = req.body;
    const updatedUser = await userRepository.update(user);
    return sendSuccessResponse({ res, data: updatedUser, statusCode: 200 });
  } catch (error) {
    next(error);
  }
};

// Route definitions
usersRouter.post('/', validatePayloadMiddleware(['id']), createUser);
usersRouter.get('/:id', fetchUserMiddleware, getUser);
usersRouter.put(
  '/:id',
  fetchUserMiddleware,
  validatePayloadMiddleware(),
  validateEmailUpdatesMiddleware,
  updateUser
);
usersRouter.delete('/:id', deleteUser);

app.use('/users', usersRouter);

// Error handler
app.use(errorHandlerMiddleware);

app.use((req: Request, res: Response, next: NextFunction) => {
  return sendErrorResponse({
    res,
    statusCode: 404,
    message: 'Route not found',
  });
});

export const handler = serverless(app);
