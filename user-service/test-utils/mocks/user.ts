import { v4 as uuid } from 'uuid';
import { User } from '../../types/user';

export const toMockUser = (): User => ({
  id: uuid(),
  firstName: 'John',
  lastName: 'Doe',
  emails: ['john.doe1@test.com', 'john.doe2@test.com'],
  dob: '1990-01-01',
});
