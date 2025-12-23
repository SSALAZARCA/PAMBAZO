/**
 * Vercel deploy entry handler, for serverless deployment, please don't modify this file
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import App from './app.js';

const application = new App();

export default function handler(req: VercelRequest, res: VercelResponse) {
  return application.app(req as any, res as any);
}
