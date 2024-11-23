import { User } from '../../types/user';
import { UserRepository } from '../../repositories/UserRepository';

// Define the context object that will be available in the Express request object
interface AppContext {
  userRepository: UserRepository;
  fetchedUser?: User;
}

declare global {
  namespace Express {
    interface Request {
      context: AppContext;
    }
  }
}

// To prevent TypeScript error about augmenting the module
export {};
