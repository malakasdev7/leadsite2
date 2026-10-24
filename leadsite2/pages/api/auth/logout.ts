import type { NextApiRequest, NextApiResponse } from 'next';
import { SESSION_COOKIE_NAME } from '../../../utils/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
  );
  return res.status(200).json({ ok: true });
}
