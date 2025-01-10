import { Request, Response, NextFunction } from 'express';
import { SheetFlowAuthenticationError } from './errors';

interface ApiKeyOptions {
  header: string;
  keys: string[];
}

export const auth = {
  apiKey: (options: ApiKeyOptions) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const apiKey = req.headers[options.header.toLowerCase()];

      if (!apiKey || !options.keys.includes(apiKey as string)) {
        throw new SheetFlowAuthenticationError('Invalid API key');
      }

      next();
    };
  },

  // Add more authentication methods here
};
