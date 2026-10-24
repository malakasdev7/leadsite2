import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const hasKey = Boolean(process.env.GOOGLE_MAPS_API_KEY);
  const hasSupabase = Boolean(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  );
  const hasAdminEnv = Boolean(
    process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH
  );

  if (req.method === 'GET') {
    return res.status(200).json({
      googleMapsConfigured: hasKey,
      supabaseConfigured: hasSupabase,
      adminEnvConfigured: hasAdminEnv,
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!hasKey) {
    return res.status(200).json({
      ok: false,
      configured: false,
      message: 'Variável GOOGLE_MAPS_API_KEY ainda não definida no servidor.',
    });
  }

  try {
    const r = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY as string,
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress',
        Referer: process.env.GOOGLE_MAPS_REFERER || 'https://leadsite2.vercel.app/',
      },
      body: JSON.stringify({
        textQuery: 'restaurante em Barreiras, BA',
        languageCode: 'pt-BR',
        regionCode: 'BR',
        pageSize: 5,
      }),
    });

    const data = await r.json();
    if (r.ok && Array.isArray(data?.places)) {
      return res.status(200).json({
        ok: true,
        configured: true,
        mode: 'google_places_v1_live',
        sampleCount: data.places.length,
        message: `Conexão com Google Places API (New) validada com sucesso (${data.places.length} estabelecimentos retornados no teste)!`,
      });
    }
    return res.status(200).json({
      ok: false,
      configured: true,
      message: `A API do Google Places respondeu com erro: ${
        data?.error?.message || r.status
      }`,
    });
  } catch {
    return res.status(500).json({
      ok: false,
      configured: true,
      message: 'Erro de rede ao testar a conexão com Google Places API (New).',
    });
  }
}
