import type { NextApiRequest, NextApiResponse } from 'next';
import { SESSION_COOKIE_NAME, verifySessionToken } from '../../../utils/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.cookies?.[SESSION_COOKIE_NAME];
  const session = await verifySessionToken(token);
  if (!session) {
    return res.status(401).json({ authenticated: false });
  }
  return res.status(200).json({
    authenticated: true,
    user: {
      email: session.email,
      name: session.name,
    },
  });
}
