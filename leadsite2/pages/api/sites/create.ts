import { supabase } from '../../utils/supabaseClient';
import { siteQueue } from '../../utils/queues';
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

  const { title, templateId, config } = req.body;
  if (!title || !templateId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const { data: site, error: dbErr } = await supabase.from('sites').insert({
    owner_id: user.id,
    title,
    template_id: templateId,
    config,
  }).select().single();

  if (dbErr) {
    return res.status(500).json({ error: dbErr.message });
  }

  // Enfileira geração do site (LLM)
  await siteQueue.add('generate', {
    siteId: site.id,
    title,
    templateId,
    config,
  });

  return res.status(200).json({ siteId: site.id, message: 'Site em fila de geração' });
}
