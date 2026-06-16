import type { Request } from 'express';

export interface AuthenticatedUser {
  user_id: string;
  username: string;
  mail: string;
  roles: string[];
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}
