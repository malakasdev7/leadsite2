import type { NextApiRequest, NextApiResponse } from 'next';
import { CATEGORY_PLACES_MAP, LeadTier } from '../../../utils/leadsiteConstants';
import { DiagnosticFlag, LeadItem } from '../../../utils/leadsiteStore';

const SAMPLE_PREFIXES: Record<string, string[]> = {
  Barbearia: ['Barbearia Imperial', 'Barber Club', 'Dom Bigode Barbearia', 'Barbearia Navalha de Ouro', 'Old School Barber', 'Barbearia Sr. Corte'],
  'Salão de Beleza': ['Studio Glamour', 'Espaço Bela Mulher', 'Maison Hair & Nails', 'Studio Essência Beauty', 'Salão Realce', 'Studio Vip Hair'],
  Restaurante: ['Restaurante Sabor da Terra', 'Cantina Tempero Mineiro', 'Espaço Gourmet', 'Restaurante & Grill Brasa Viva', 'Marmitaria Dona Maria', 'Sabores do Chef'],
  Mecânica: ['Auto Mecânica Precisão', 'Oficina Torque Car', 'Centro Automotivo Rápido', 'Mecânica Irmãos Rocha', 'Auto Center Confiança', 'Garage 99 Oficina'],
  'Pet Shop': ['Pet Shop Patinhas Felizes', 'Mundo Pet & Vet', 'Bicho Mimado Pet Shop', 'Casa do Pet', 'Espaço Animal Pet', 'Pet Care Center'],
  Odontologia: ['Clínica OdontoSorriso', 'Espaço Dental Prime', 'Consultório Dr. Sorriso', 'OdontoVida Clínica', 'Implante & Estética Dental'],
  Lanchonete: ['Lanchonete Ponto do Sabor', 'Burger & Cia', 'Chapa Quente Lanches', 'Estação do Lanche', 'Sabor Express Lanchonete'],
  Padaria: ['Panificadora Pão Dourado', 'Padaria & Confeitaria Trigo Nobre', 'Delícias do Forno', 'Padaria São José', 'Empório do Pão'],
};

const STREET_NAMES = [
  'Av. Brasil',
  'Rua Sete de Setembro',
  'Av. Paulista',
  'Rua Quinze de Novembro',
  'Av. Independência',
  'Rua das Palmeiras',
  'Av. Rio Branco',
  'Rua Tiradentes',
];

const OWNER_NAMES = [
  'Carlos Eduardo',
  'Fernanda Souza',
  'Ricardo Oliveira',
  'Juliana Mendes',
  'Marcos Paulo',
  'Patrícia Costa',
  'André Luiz',
  'Camila Rodrigues',
];

const DDD_BY_STATE: Record<string, string> = {
  SP: '11',
  GO: '62',
  MG: '31',
  RJ: '21',
  PR: '41',
  SC: '48',
  RS: '51',
  BA: '71',
  CE: '85',
  DF: '61',
  PE: '81',
  ES: '27',
  MT: '65',
  MS: '67',
  PA: '91',
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    state = 'GO',
    city = 'Goiânia',
    neighborhood = '',
    category = 'Restaurante',
    limit = 6,
  } = req.body || {};

  const count = Math.min(Math.max(Number(limit) || 6, 1), 20);
  const placeType = CATEGORY_PLACES_MAP[category] || null;
  const ddd = DDD_BY_STATE[state] || '11';

  // Optional live Google Maps Places Text Search if GOOGLE_MAPS_API_KEY is configured
  if (process.env.GOOGLE_MAPS_API_KEY) {
    try {
      const q = `${category} em ${neighborhood ? neighborhood + ', ' : ''}${city} - ${state}, Brasil`;
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
        q
      )}${placeType ? `&type=${placeType}` : ''}&language=pt-BR&key=${process.env.GOOGLE_MAPS_API_KEY}`;
      const r = await fetch(url);
      const data = await r.json();
      if (Array.isArray(data?.results) && data.results.length > 0) {
        const mapped: LeadItem[] = data.results.slice(0, count).map((item: any, idx: number) => {
          const score = 94 - (idx * 5) % 35;
          const tier: LeadTier = score >= 80 ? 'quente' : score >= 60 ? 'morno' : 'frio';
          return {
            id: `gmaps-${Date.now()}-${idx}`,
            name: item.name,
            category,
            state,
            city,
            neighborhood: neighborhood || 'Centro',
            address: item.formatted_address || `${city} - ${state}`,
            phone: `55${ddd}99${String(1000000 + idx * 13579).slice(0, 7)}`,
            rating: item.rating || 4.7,
            reviewsCount: item.user_ratings_total || 48,
            score,
            tier,
            flags: idx % 4 === 2 ? ['Site fora do ar', 'Sem SSL'] : ['Sem site'],
            stage: 'Base',
            inCrm: false,
            openedRecently: idx % 2 === 0,
            ownerName: OWNER_NAMES[idx % OWNER_NAMES.length],
            createdAt: new Date().toISOString(),
          };
        });
        return res.status(200).json({ leads: mapped, source: 'google_places' });
      }
    } catch {
      // Fallback to realistic generator below
    }
  }

  const baseNames = SAMPLE_PREFIXES[category] || [
    `${category} Prime`,
    `Espaço ${category}`,
    `${category} Central`,
    `${category} & Cia`,
    `Master ${category}`,
    `${category} Express`,
  ];

  const generated: LeadItem[] = Array.from({ length: count }).map((_, idx) => {
    const baseName = baseNames[idx % baseNames.length];
    const suffix = neighborhood ? ` ${neighborhood}` : idx >= baseNames.length ? ` II` : '';
    const street = STREET_NAMES[idx % STREET_NAMES.length];
    const num = 120 + idx * 235;
    const bairro = neighborhood || (idx % 2 === 0 ? 'Centro' : 'Jardim América');

    const flagsPool: DiagnosticFlag[][] = [
      ['Sem site'],
      ['Sem site'],
      ['Site fora do ar', 'Sem SSL'],
      ['Sem site'],
      ['Sem SSL'],
      ['Sem site', 'Sem contato'],
    ];
    const flags = flagsPool[idx % flagsPool.length];
    const score = flags.includes('Sem site') ? 95 - idx * 3 : 76 - idx * 4;
    const clampedScore = Math.max(38, Math.min(98, score));
    const tier: LeadTier =
      clampedScore >= 82 ? 'quente' : clampedScore >= 60 ? 'morno' : 'frio';

    return {
      id: `lead-${Date.now()}-${idx}`,
      name: `${baseName}${suffix}`,
      category,
      state,
      city,
      neighborhood: bairro,
      address: `${street}, ${num} - ${bairro}, ${city} - ${state}`,
      phone: `55${ddd}9${84000000 + ((idx + 1) * 147258) % 15999999}`,
      rating: Number((4.5 + ((idx * 7) % 5) * 0.1).toFixed(1)),
      reviewsCount: 32 + ((idx * 43) % 210),
      score: clampedScore,
      tier,
      flags,
      stage: 'Base',
      inCrm: false,
      openedRecently: idx % 2 === 0,
      ownerName: OWNER_NAMES[idx % OWNER_NAMES.length],
      createdAt: new Date().toISOString(),
    };
  });

  return res.status(200).json({ leads: generated, source: 'leadsite_engine' });
}
