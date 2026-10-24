import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { SESSION_COOKIE_NAME, verifySessionToken } from '../../../utils/auth';
import { supabase } from '../../../utils/supabaseClient';

const PLACES_NEW_ENDPOINT = 'https://places.googleapis.com/v1/places:searchText';

const FIELD_MASK = [
  'places.displayName',
  'places.formattedAddress',
  'places.nationalPhoneNumber',
  'places.websiteUri',
  'places.rating',
  'places.userRatingCount',
  'places.googleMapsUri',
  'places.location',
  'places.primaryTypeDisplayName',
  'nextPageToken',
].join(',');

function sanitizeInput(val, maxLen = 120) {
  if (typeof val !== 'string') return '';
  return val
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

async function isRequestAuthenticated(req, res) {
  // 1. Check BlackDev session cookie
  const cookieToken = req.cookies?.[SESSION_COOKIE_NAME];
  if (cookieToken) {
    const validCookie = await verifySessionToken(cookieToken);
    if (validCookie) return true;
  }

  // 2. Check NextAuth session
  try {
    const nextAuthSession = await getServerSession(req, res, authOptions);
    if (nextAuthSession?.user) return true;
  } catch {
    // continue
  }

  // 3. Check Supabase Bearer token
  const authHeader = req.headers?.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearer = authHeader.split(' ')[1];
    if (bearer) {
      try {
        const { data, error } = await supabase.auth.getUser(bearer);
        if (!error && data?.user) return true;
      } catch {
        // continue
      }
    }
  }

  return false;
}

function normalizePlaceToLead(place, fallbackCategory) {
  const siteUrl = typeof place?.websiteUri === 'string' ? place.websiteUri.trim() : '';
  return {
    nome: place?.displayName?.text || '',
    categoria: place?.primaryTypeDisplayName?.text || fallbackCategory || '',
    endereco: place?.formattedAddress || '',
    telefone: place?.nationalPhoneNumber || '',
    site: siteUrl,
    nota: typeof place?.rating === 'number' ? place.rating : 0,
    avaliacoes: typeof place?.userRatingCount === 'number' ? place.userRatingCount : 0,
    google_maps_url: place?.googleMapsUri || '',
    latitude: typeof place?.location?.latitude === 'number' ? place.location.latitude : 0,
    longitude: typeof place?.location?.longitude === 'number' ? place.location.longitude : 0,
    tem_site: Boolean(siteUrl),
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Método não permitido. Utilize POST.',
    });
  }

  const authenticated = await isRequestAuthenticated(req, res);
  if (!authenticated) {
    return res.status(401).json({
      error: 'Não autorizado. Faça login administrativo para buscar leads.',
    });
  }

  const rawQuery = req.body?.query;
  const rawLocation = req.body?.location;
  const rawLimit = req.body?.limit;

  const query = sanitizeInput(rawQuery, 100);
  const location = sanitizeInput(rawLocation, 120);
  const limit = Math.min(Math.max(Number(rawLimit) || 20, 1), 40);

  if (!query) {
    return res.status(400).json({
      error: 'Informe o tipo de negócio (query), por exemplo: "restaurante" ou "barbearia".',
    });
  }

  if (!location) {
    return res.status(400).json({
      error: 'Informe a cidade ou região (location), por exemplo: "Barreiras, BA".',
    });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error:
        'A variável de ambiente GOOGLE_MAPS_API_KEY não está configurada no servidor.',
    });
  }

  try {
    const textQuery = `${query} em ${location}`;
    const collectedPlaces = [];
    let pageToken = null;

    // Google Places API (New) returns up to 20 results per page; fetch up to 2 pages when limit > 20
    while (collectedPlaces.length < limit) {
      const pageSize = Math.min(limit - collectedPlaces.length, 20);
      const requestBody = {
        textQuery,
        languageCode: 'pt-BR',
        regionCode: 'BR',
        pageSize,
      };
      if (pageToken) {
        requestBody.pageToken = pageToken;
      }

      const googleRes = await fetch(PLACES_NEW_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': FIELD_MASK,
          Referer: process.env.GOOGLE_MAPS_REFERER || 'https://leadsite2.vercel.app/',
        },
        body: JSON.stringify(requestBody),
      });

      if (!googleRes.ok) {
        let googleErrMessage = 'Erro ao consultar a Google Places API.';
        try {
          const errJson = await googleRes.json();
          const apiMsg = errJson?.error?.message || '';
          if (googleRes.status === 403 || googleRes.status === 401) {
            googleErrMessage =
              'Permissão negada na Google Places API (New). Verifique se a Places API (New) está ativada no Google Cloud.';
          } else if (googleRes.status === 429) {
            googleErrMessage =
              'Limite de requisições da Google Places API atingido. Tente novamente em instantes.';
          } else if (apiMsg) {
            googleErrMessage = `Erro retornado pelo Google Places: ${apiMsg}`;
          }
        } catch {
          // ignore JSON parse error
        }
        return res.status(googleRes.status >= 400 && googleRes.status < 600 ? googleRes.status : 502).json({
          error: googleErrMessage,
        });
      }

      const data = await googleRes.json();
      const pagePlaces = Array.isArray(data?.places) ? data.places : [];
      collectedPlaces.push(...pagePlaces);

      if (!data?.nextPageToken || pagePlaces.length === 0 || collectedPlaces.length >= limit) {
        break;
      }
      pageToken = data.nextPageToken;
    }

    const leads = collectedPlaces
      .slice(0, limit)
      .map(place => normalizePlaceToLead(place, query));

    return res.status(200).json({ leads });
  } catch {
    return res.status(500).json({
      error:
        'Falha de comunicação ao consultar a Google Places API. Verifique sua conexão e tente novamente.',
    });
  }
}
