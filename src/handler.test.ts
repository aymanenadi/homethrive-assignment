import request from 'supertest';
import { app } from './handler';
import { UserRepository } from './repositories/UserRepository';
import { toMockUser } from './test-utils/mocks/user';

let userRepositoryGetSpy: jest.SpyInstance;
let userRepositoryCreateSpy: jest.SpyInstance;
let userRepositoryUpdateSpy: jest.SpyInstance;
let userRepositoryDeleteSpy: jest.SpyInstance;

const mockUser = toMockUser();

describe('user-service handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    userRepositoryGetSpy = jest.spyOn(UserRepository.prototype, 'get');
    userRepositoryCreateSpy = jest.spyOn(UserRepository.prototype, 'create');
    userRepositoryUpdateSpy = jest.spyOn(UserRepository.prototype, 'update');
    userRepositoryDeleteSpy = jest.spyOn(UserRepository.prototype, 'delete');

    userRepositoryGetSpy.mockResolvedValue(mockUser);
    userRepositoryCreateSpy.mockResolvedValue(undefined);
    userRepositoryDeleteSpy.mockResolvedValue(undefined);
    userRepositoryUpdateSpy.mockResolvedValue(undefined);
  });

  describe('GET /users/:id', () => {
    it('should fetch a user by ID', async () => {
      userRepositoryGetSpy.mockResolvedValue(mockUser);
      const response = await request(app).get(`/users/${mockUser.id}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'success',
        data: mockUser,
      });
    });

    it('should return 404 if user is not found', async () => {
      userRepositoryGetSpy.mockResolvedValue(null);
      const response = await request(app).get(`/users/${mockUser.id}`);
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        status: 'error',
        message: 'User not found',
      });
    });

    it('should return 500 if an internal serror occurs', async () => {
      userRepositoryGetSpy.mockRejectedValue(new Error('Database error'));
      const response = await request(app).get(`/users/${mockUser.id}`);
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Database error',
      });
    });
  });

  describe('POST /users', () => {
    it('should create a user with a generated ID', async () => {
      const newUser = {
        ...mockUser,
        id: undefined,
      };

      const response = await request(app)
        .post('/users')
        .send(newUser)
        .set('Accept', 'application/json');
      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        status: 'success',
        data: {
          ...newUser,
          id: expect.any(String),
        },
      });
    });

    it('should accept a valid user payload with a uuid', async () => {
      const response = await request(app)
        .post('/users')
        .send(mockUser)
        .set('Accept', 'application/json');
      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        status: 'success',
        data: mockUser,
      });
    });

    it('should return 400 if the payload has additional fields', async () => {
      const response = await request(app)
        .post('/users')
        .send({
          ...mockUser,
          additionalKey: 'additionalValue',
        })
        .set('Accept', 'application/json');
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Invalid payload',
        errors: [
          expect.objectContaining({
            message: "Unrecognized key(s) in object: 'additionalKey'",
            keys: ['additionalKey'],
          }),
        ],
      });
    });

    it('should return 400 if the user does not have any emails', async () => {
      const userWithoutEmails = { ...mockUser, emails: [] };
      const response = await request(app)
        .post('/users')
        .send(userWithoutEmails)
        .set('Accept', 'application/json');
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Invalid payload',
        errors: [
          expect.objectContaining({
            message: 'A user must have at least 1 email address',
            path: ['emails'],
          }),
        ],
      });
    });

    it('should return 400 if the payload has an empty first name', async () => {
      const userWithoutFirstName = { ...mockUser, firstName: '' };
      const response = await request(app)
        .post('/users')
        .send(userWithoutFirstName)
        .set('Accept', 'application/json');
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Invalid payload',
        errors: [
          expect.objectContaining({
            message: 'First name cannot be an empty string',
            path: ['firstName'],
          }),
        ],
      });
    });

    it('should return 400 if the payload has an empty last name', async () => {
      const userWithoutLastName = { ...mockUser, lastName: '' };
      const response = await request(app)
        .post('/users')
        .send(userWithoutLastName)
        .set('Accept', 'application/json');
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Invalid payload',
        errors: [
          expect.objectContaining({
            message: 'Last name cannot be an empty string',
            path: ['lastName'],
          }),
        ],
      });
    });

    it('should return 400 if the payload has a undefined first name', async () => {
      const userWithoutFirstName = { ...mockUser, firstName: undefined };
      const response = await request(app)
        .post('/users')
        .send(userWithoutFirstName)
        .set('Accept', 'application/json');
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Invalid payload',
        errors: [
          expect.objectContaining({
            message: 'First name is required',
            path: ['firstName'],
          }),
        ],
      });
    });

    it('should return 400 if the payload has a undefined last name', async () => {
      const userWithoutLastName = { ...mockUser, lastName: undefined };
      const response = await request(app)
        .post('/users')
        .send(userWithoutLastName)
        .set('Accept', 'application/json');
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Invalid payload',
        errors: [
          expect.objectContaining({
            message: 'Last name is required',
            path: ['lastName'],
          }),
        ],
      });
    });

    it('should return 400 if the payload has an invalid email', async () => {
      const userWithInvalidEmail = { ...mockUser, emails: ['invalid-email'] };
      const response = await request(app)
        .post('/users')
        .send(userWithInvalidEmail)
        .set('Accept', 'application/json');
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Invalid payload',
        errors: [
          expect.objectContaining({
            message: 'Invalid email format',
            path: ['emails', 0],
          }),
        ],
      });
    });

    it('should return 400 if the payload has no emails', async () => {
      const userWithoutEmails = { ...mockUser, emails: [] };
      const response = await request(app)
        .post('/users')
        .send(userWithoutEmails)
        .set('Accept', 'application/json');
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Invalid payload',
        errors: [
          expect.objectContaining({
            message: 'A user must have at least 1 email address',
            path: ['emails'],
          }),
        ],
      });
    });

    it('should return 400 if the payload has more than 3 emails', async () => {
      const userWithFourEmails = {
        ...mockUser,
        emails: [
          'test1@mail.com',
          'test2@mail.com',
          'test3@mail.com',
          'test4@mail.com',
        ],
      };
      const response = await request(app)
        .post('/users')
        .send(userWithFourEmails)
        .set('Accept', 'application/json');
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Invalid payload',
        errors: [
          expect.objectContaining({
            message: 'A user can have at most 3 email addresses',
            path: ['emails'],
          }),
        ],
      });
    });

    it('should return 400 if the payload has missing emails field', async () => {
      const userWithMissingEmails = { ...mockUser, emails: undefined };
      const response = await request(app)
        .post('/users')
        .send(userWithMissingEmails)
        .set('Accept', 'application/json');
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Invalid payload',
        errors: [
          expect.objectContaining({
            message: 'The emails field is required',
          }),
        ],
      });
    });

    it('should return 400 if the payload has a missing dob field', async () => {
      const userWithMissingDOB = { ...mockUser, dob: undefined };
      const response = await request(app)
        .post('/users')
        .send(userWithMissingDOB)
        .set('Accept', 'application/json');
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Invalid payload',
        errors: [
          expect.objectContaining({
            message: 'Date of birth is required',
          }),
        ],
      });
    });

    it('should return 400 if the payload has an invalid dob field', async () => {
      const userWithInvalidDOB = { ...mockUser, dob: 'invalid-dob' };
      const response = await request(app)
        .post('/users')
        .send(userWithInvalidDOB)
        .set('Accept', 'application/json');
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Invalid payload',
        errors: [
          expect.objectContaining({
            message: 'dob must be in the format YYYY-MM-DD',
          }),
        ],
      });
    });

    it('should return 500 if an internal error occurs', async () => {
      userRepositoryCreateSpy.mockRejectedValue(new Error('Database error'));
      const response = await request(app).post('/users').send(mockUser);
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Database error',
      });
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete a user by ID', async () => {
      const response = await request(app).delete(`/users/${mockUser.id}`);
      expect(response.status).toBe(204);
    });

    it('should return 500 if an internal error occurs', async () => {
      userRepositoryDeleteSpy.mockRejectedValue(new Error('Database error'));
      const response = await request(app).delete(`/users/${mockUser.id}`);
      expect(response.status).toBe(500);
    });
  });

  describe('PUT /users/:id', () => {
    beforeEach(() => {});
    it('should update a user by ID', async () => {
      const updatedUser = {
        ...mockUser,
        firstName: 'Jane - Updated',
        lastName: 'Doe - Updated',
      };

      const response = await request(app)
        .put(`/users/${mockUser.id}`)
        .send(updatedUser);
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({
        status: 'success',
        data: updatedUser,
      });
    });

    it('should return 404 if the user is not found', async () => {
      userRepositoryGetSpy.mockResolvedValue(null);
      const response = await request(app)
        .put(`/users/${mockUser.id}`)
        .send(mockUser);
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        status: 'error',
        message: 'User not found',
      });
    });

    it('should return 400 if the payload is invalid', async () => {
      const invalidUser = {
        ...mockUser,
        emails: ['invalid-email'],
      };
      const response = await request(app)
        .put(`/users/${mockUser.id}`)
        .send(invalidUser);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Invalid payload',
        errors: [
          expect.objectContaining({
            message: 'Invalid email format',
          }),
        ],
      });
    });

    it('should return 400 if the payload has an empty first name', async () => {
      const userWithoutFirstName = { ...mockUser, firstName: '' };
      const response = await request(app)
        .put(`/users/${mockUser.id}`)
        .send(userWithoutFirstName)
        .set('Accept', 'application/json');
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Invalid payload',
        errors: [
          expect.objectContaining({
            message: 'First name cannot be an empty string',
            path: ['firstName'],
          }),
        ],
      });
    });

    it('should return 400 if the payload has an undefined first name', async () => {
      const userWithoutFirstName = { ...mockUser, firstName: undefined };
      const response = await request(app)
        .put(`/users/${mockUser.id}`)
        .send(userWithoutFirstName)
        .set('Accept', 'application/json');
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Invalid payload',
        errors: [
          expect.objectContaining({
            message: 'First name is required',
            path: ['firstName'],
          }),
        ],
      });
    });

    it('should return 400 if the payload has an empty last name', async () => {
      const userWithoutlastName = { ...mockUser, lastName: '' };
      const response = await request(app)
        .put(`/users/${mockUser.id}`)
        .send(userWithoutlastName)
        .set('Accept', 'application/json');
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Invalid payload',
        errors: [
          expect.objectContaining({
            message: 'Last name cannot be an empty string',
            path: ['lastName'],
          }),
        ],
      });
    });

    it('should return 400 if the payload has an undefined last name', async () => {
      const userWithoutlasstName = { ...mockUser, lastName: undefined };
      const response = await request(app)
        .put(`/users/${mockUser.id}`)
        .send(userWithoutlasstName)
        .set('Accept', 'application/json');
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Invalid payload',
        errors: [
          expect.objectContaining({
            message: 'Last name is required',
            path: ['lastName'],
          }),
        ],
      });
    });

    it('should return 400 if the payload has an invalid email', async () => {
      const userWithInvalidEmail = { ...mockUser, emails: ['invalid-email'] };
      const response = await request(app)
        .put(`/users/${mockUser.id}`)
        .send(userWithInvalidEmail)
        .set('Accept', 'application/json');
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Invalid payload',
        errors: [
          expect.objectContaining({
            message: 'Invalid email format',
            path: ['emails', 0],
          }),
        ],
      });
    });

    it('should return 400 if the payload has no emails', async () => {
      const userWithEmptyEmails = { ...mockUser, emails: [] };
      const response = await request(app)
        .put(`/users/${mockUser.id}`)
        .send(userWithEmptyEmails)
        .set('Accept', 'application/json');
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Invalid payload',
        errors: [
          expect.objectContaining({
            message: 'A user must have at least 1 email address',
            path: ['emails'],
          }),
        ],
      });
    });

    it('should return 400 if the payload has more than 3 emails', async () => {
      const payload = {
        ...mockUser,
        emails: [
          'test1@mail.com',
          'test2@mail.com',
          'test3@mail.com',
          'test4@mail.com',
        ],
      };
      const response = await request(app)
        .put(`/users/${mockUser.id}`)
        .send(payload)
        .set('Accept', 'application/json');
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Invalid payload',
        errors: [
          expect.objectContaining({
            message: 'A user can have at most 3 email addresses',
            path: ['emails'],
          }),
        ],
      });
    });

    it('should return 400 if the payload has additional fields', async () => {
      const response = await request(app)
        .put(`/users/${mockUser.id}`)
        .send({
          ...mockUser,
          additionalKey: 'additionalValue',
        })
        .set('Accept', 'application/json');
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Invalid payload',
        errors: [
          expect.objectContaining({
            message: "Unrecognized key(s) in object: 'additionalKey'",
            keys: ['additionalKey'],
          }),
        ],
      });
    });

    it('should return 400 if the user tries to delete an email', async () => {
      const payload = {
        ...mockUser,
        emails: [mockUser.emails[0]],
      };
      const response = await request(app)
        .put(`/users/${mockUser.id}`)
        .send(payload)
        .set('Accept', 'application/json');
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Deleting an email address is not allowed',
      });
    });

    it('should return 500 if an internal error occurs', async () => {
      userRepositoryUpdateSpy.mockRejectedValue(new Error('Database error'));
      const response = await request(app)
        .put(`/users/${mockUser.id}`)
        .send(mockUser);
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Database error',
      });
    });
  });

  it('should return 404 for unknown routes', async () => {
    const response = await request(app).get('/unknown-route');
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      status: 'error',
      message: 'Route not found',
    });
  });
});
