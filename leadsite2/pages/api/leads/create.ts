import { supabase } from '../../../utils/supabaseClient';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.headers.authorization?.split(' ')[1];
  const { data: user, error: authErr } = await supabase.auth.api.getUser(token);
  if (authErr) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const { name, email, phone, customFields } = req.body;

  const { data, error } = await supabase.from('leads').insert({
    site_id: req.query.siteId,
    name,
    email,
    phone,
    custom_fields: customFields,
  });

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  return res.status(200).json({ lead: data[0] });
}
