import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { SESSION_COOKIE_NAME, verifySessionToken } from '../../../utils/auth';
import { getServiceSupabase, supabase } from '../../../utils/supabaseClient';

async function isRequestAuthenticated(req: NextApiRequest, res: NextApiResponse): Promise<boolean> {
  const cookieToken = req.cookies?.[SESSION_COOKIE_NAME];
  if (cookieToken) {
    const validCookie = await verifySessionToken(cookieToken);
    if (validCookie) return true;
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (session?.user) return true;
  } catch {
    // ignore
  }

  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      const { data, error } = await supabase.auth.getUser(token);
      if (!error && data?.user) return true;
    } catch {
      // ignore
    }
  }

  return false;
}

function normalizePhone(phone?: string | null): string {
  if (!phone) return '';
  return String(phone).replace(/\D/g, '');
}

function normalizeText(text?: string | null): string {
  if (!text) return '';
  return String(text).trim().toLowerCase();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authenticated = await isRequestAuthenticated(req, res);
  if (!authenticated) {
    return res.status(401).json({ error: 'Não autorizado. Faça login administrativo.' });
  }

  const db = getServiceSupabase() || supabase;

  if (req.method === 'GET') {
    const { data, error } = await db
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      return res.status(200).json({ leads: [], warning: error.message });
    }
    return res.status(200).json({ leads: data || [] });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  // Support both batch { leads: [...] } and single lead payload
  const rawItems = Array.isArray(req.body?.leads)
    ? req.body.leads
    : req.body?.name || req.body?.nome
    ? [req.body]
    : [];

  if (rawItems.length === 0) {
    return res.status(400).json({ error: 'Nenhum lead informado para salvar.' });
  }

  // Fetch existing leads from Supabase to prevent duplicates by (name + endereco) or phone
  const { data: existingRows } = await db
    .from('leads')
    .select('id, name, phone, custom_fields');

  const existingList = Array.isArray(existingRows) ? existingRows : [];
  const existingPhones = new Set<string>();
  const existingNameAddress = new Set<string>();

  for (const row of existingList) {
    const p = normalizePhone(row.phone);
    if (p) existingPhones.add(p);
    const n = normalizeText(row.name);
    const addr = normalizeText(row.custom_fields?.endereco);
    if (n && addr) {
      existingNameAddress.add(`${n}::${addr}`);
    } else if (n) {
      existingNameAddress.add(`${n}::`);
    }
  }

  const toInsert: any[] = [];
  const duplicates: string[] = [];

  for (const item of rawItems) {
    const nome = String(item.nome || item.name || '').trim();
    if (!nome) continue;

    const telefone = String(item.telefone || item.phone || '').trim();
    const endereco = String(
      item.endereco || item.customFields?.endereco || item.custom_fields?.endereco || ''
    ).trim();

    const phoneKey = normalizePhone(telefone);
    const nameAddrKey = `${normalizeText(nome)}::${normalizeText(endereco)}`;

    const isDupPhone = Boolean(phoneKey && existingPhones.has(phoneKey));
    const isDupNameAddr = existingNameAddress.has(nameAddrKey);

    if (isDupPhone || isDupNameAddr) {
      duplicates.push(nome);
      continue;
    }

    if (phoneKey) existingPhones.add(phoneKey);
    existingNameAddress.add(nameAddrKey);

    const siteUrl = String(
      item.site ?? item.customFields?.site ?? item.custom_fields?.site ?? ''
    ).trim();

    const customFields = {
      categoria: String(item.categoria ?? item.customFields?.categoria ?? ''),
      endereco,
      site: siteUrl,
      nota: Number(item.nota ?? item.customFields?.nota ?? 0),
      avaliacoes: Number(item.avaliacoes ?? item.customFields?.avaliacoes ?? 0),
      google_maps_url: String(
        item.google_maps_url ?? item.customFields?.google_maps_url ?? ''
      ),
      latitude: Number(item.latitude ?? item.customFields?.latitude ?? 0),
      longitude: Number(item.longitude ?? item.customFields?.longitude ?? 0),
      tem_site:
        typeof item.tem_site === 'boolean' ? item.tem_site : Boolean(siteUrl),
      origem: 'google_maps',
    };

    toInsert.push({
      site_id: req.query.siteId || item.site_id || null,
      name: nome,
      email: item.email || null,
      phone: telefone,
      status: 'new',
      custom_fields: customFields,
    });
  }

  if (toInsert.length === 0) {
    return res.status(200).json({
      inserted: [],
      duplicates,
      insertedCount: 0,
      duplicateCount: duplicates.length,
      message: 'Todos os leads selecionados já estavam cadastrados no CRM.',
    });
  }

  const { data: insertedData, error: insertError } = await db
    .from('leads')
    .insert(toInsert)
    .select();

  if (insertError) {
    return res.status(500).json({
      error: `Erro ao salvar leads no Supabase: ${insertError.message}`,
    });
  }

  return res.status(200).json({
    lead: insertedData?.[0] || null,
    inserted: insertedData || [],
    duplicates,
    insertedCount: (insertedData || []).length,
    duplicateCount: duplicates.length,
  });
}
