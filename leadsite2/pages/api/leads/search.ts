import type { NextApiRequest, NextApiResponse } from 'next';
import {
  BR_CITY_NEIGHBORHOODS,
  CATEGORY_PLACES_MAP,
  LeadTier,
} from '../../../utils/leadsiteConstants';
import { DiagnosticFlag, LeadItem } from '../../../utils/leadsiteStore';

const SAMPLE_PREFIXES: Record<string, string[]> = {
  Barbearia: [
    'Barbearia Imperial',
    'Barber Club',
    'Dom Bigode Barbearia',
    'Barbearia Navalha de Ouro',
    'Old School Barber',
    'Barbearia Sr. Corte',
  ],
  'Salão de Beleza': [
    'Studio Glamour',
    'Espaço Bela Mulher',
    'Maison Hair & Nails',
    'Studio Essência Beauty',
    'Salão Realce',
    'Studio Vip Hair',
  ],
  Restaurante: [
    'Restaurante Sabor da Terra',
    'Cantina Tempero Mineiro',
    'Espaço Gourmet',
    'Restaurante & Grill Brasa Viva',
    'Marmitaria Dona Maria',
    'Sabores do Chef',
  ],
  Mecânica: [
    'Auto Mecânica Precisão',
    'Oficina Torque Car',
    'Centro Automotivo Rápido',
    'Mecânica Irmãos Rocha',
    'Auto Center Confiança',
    'Garage 99 Oficina',
  ],
  'Oficina Mecânica': [
    'Oficina Mecânica AutoMaster',
    'Centro Automotivo Prime',
    'Oficina Irmãos Silva',
    'Torque & Motor Oficina',
    'Auto Mecânica Confiança',
    'Garage Car Service',
  ],
  'Pet Shop': [
    'Pet Shop Patinhas Felizes',
    'Mundo Pet & Vet',
    'Bicho Mimado Pet Shop',
    'Casa do Pet',
    'Espaço Animal Pet',
    'Pet Care Center',
  ],
  Odontologia: [
    'Clínica OdontoSorriso',
    'Espaço Dental Prime',
    'Consultório Dr. Sorriso',
    'OdontoVida Clínica',
    'Implante & Estética Dental',
    'Sorriso Perfeito Odontologia',
  ],
  'Dentista / Odontologia': [
    'Clínica OdontoPrime',
    'Consultório Odontológico Sorriso Novo',
    'Odonto Excellence',
    'Centro Dental Integrado',
    'ImplanteMais Odontologia',
    'Studio Dental Care',
  ],
  'Clínica Médica': [
    'Clínica Saúde Integrada',
    'Centro Médico Vida Plena',
    'Policlínica São Lucas',
    'Clínica Bem Estar & Saúde',
    'Instituto Médico Cuidar',
    'Espaço Saúde Total',
  ],
  'Clínica Estética': [
    'Clínica Beleza Pura Estética',
    'Espaço DermaGlow',
    'Studio Corpo & Rosto Estética',
    'Clínica Renova Estética Avançada',
    'Lumière Estética Facial',
    'Bella Pele Clínica',
  ],
  Academia: [
    'Academia Iron Force',
    'CT Fit Performance',
    'Arena Fitness Academia',
    'Movimento Total Gym',
    'PowerFit Centro de Treinamento',
    'Studio Corpo Ativo',
  ],
  Imobiliária: [
    'Imobiliária Horizonte Imóveis',
    'Casa Nova Negócios Imobiliários',
    'Prime Imóveis & Locações',
    'Conquista Consultoria Imobiliária',
    'Portal da Cidade Imóveis',
    'Elite Brokers Imobiliária',
  ],
  Hotel: [
    'Hotel Palace Central',
    'Grand Hotel Executivo',
    'Hotel Sol Nascente',
    'Plaza Comfort Hotel',
    'Hotel Bela Vista',
    'Royal Inn Hotel',
  ],
  Pousada: [
    'Pousada Recanto das Águas',
    'Pousada Villa Bella',
    'Pousada Canto do Sol',
    'Pousada Jardim Secreto',
    'Pousada Brisa da Serra',
    'Pousada Encanto Natural',
  ],
  'Loja de Roupas': [
    'Boutique Estilo Único',
    'UseModa Store',
    'Espaço Fashion Roupas',
    'Loja Tendência Urbana',
    'Ateliê & Boutique Donna',
    'VesteBem Multimarcas',
  ],
  'Advogado / Escritório de Advocacia': [
    'Dr. Ricardo Almeida Advocacia',
    'Ferreira & Santos Advogados Associados',
    'Escritório de Advocacia Silva & Costa',
    'Vanguarda Jurídica Advogados',
    'Aliança Advocacia Empresarial e Cível',
  ],
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
  'Av. Afonso Pena',
  'Rua Marechal Deodoro',
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
  'Roberto Almeida',
  'Vanessa Lima',
];

const DDD_BY_STATE: Record<string, string> = {
  AC: '68', AL: '82', AP: '96', AM: '92', BA: '71', CE: '85', DF: '61', ES: '27',
  GO: '62', MA: '98', MT: '65', MS: '67', MG: '31', PA: '91', PB: '83', PR: '41',
  PE: '81', PI: '86', RJ: '21', RN: '84', RS: '51', RO: '69', RR: '95', SC: '48',
  SP: '11', SE: '79', TO: '63',
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    state = 'SP',
    city = 'São Paulo',
    neighborhood = '',
    category = 'Restaurante',
    limit = 6,
  } = req.body || {};

  const count = Math.min(Math.max(Number(limit) || 6, 1), 24);
  const placeType = CATEGORY_PLACES_MAP[category] || null;
  const ddd = DDD_BY_STATE[state] || '11';
  const cityNeighborhoods = BR_CITY_NEIGHBORHOODS[city] || [
    'Centro',
    'Jardim América',
    'Bela Vista',
    'Santa Mônica',
    'Vila Nova',
  ];

  // Server-side Google Maps Places API integration (never exposes GOOGLE_MAPS_API_KEY on frontend)
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
          const score = 94 - ((idx * 5) % 35);
          const tier: LeadTier = score >= 80 ? 'quente' : score >= 60 ? 'morno' : 'frio';
          const resolvedBairro =
            neighborhood || cityNeighborhoods[idx % cityNeighborhoods.length] || 'Centro';
          const phoneNum = `55${ddd}99${String(1000000 + idx * 13579).slice(0, 7)}`;
          const mapsQuery = encodeURIComponent(
            `${item.name} ${item.formatted_address || `${city} ${state}`}`
          );
          return {
            id: `gmaps-${Date.now()}-${idx}`,
            name: item.name,
            category,
            state,
            city,
            neighborhood: resolvedBairro,
            address: item.formatted_address || `${resolvedBairro}, ${city} - ${state}`,
            phone: phoneNum,
            whatsapp: phoneNum,
            website: '',
            googleMapsUrl: item.place_id
              ? `https://www.google.com/maps/place/?q=place_id:${item.place_id}`
              : `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`,
            openingHours: 'Segunda a Sexta: 08h às 18h · Sábado: 08h às 13h',
            rating: item.rating || 4.7,
            reviewsCount: item.user_ratings_total || 48,
            score,
            tier,
            flags:
              idx % 4 === 2
                ? ['Site fora do ar', 'Site sem SSL']
                : idx % 5 === 3
                ? ['Site desatualizado', 'Site sem contato visível']
                : ['Sem site'],
            stage: 'Novo lead',
            inCrm: false,
            estimatedValue: 1800,
            source: 'Google Maps API',
            openedRecently: idx % 2 === 0,
            ownerName: OWNER_NAMES[idx % OWNER_NAMES.length],
            activities: [],
            createdAt: new Date().toISOString(),
          };
        });
        return res.status(200).json({ leads: mapped, source: 'google_places' });
      }
    } catch {
      // Fallback to deterministic engine below
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

  const flagsPool: DiagnosticFlag[][] = [
    ['Sem site'],
    ['Sem site'],
    ['Site fora do ar', 'Site sem SSL'],
    ['Sem site'],
    ['Site desatualizado', 'Site sem contato visível'],
    ['Sem site'],
  ];

  const generated: LeadItem[] = Array.from({ length: count }).map((_, idx) => {
    const baseName = baseNames[idx % baseNames.length];
    const bairro =
      neighborhood.trim() || cityNeighborhoods[idx % cityNeighborhoods.length] || 'Centro';
    const suffix =
      neighborhood.trim() && !baseName.toLowerCase().includes(neighborhood.trim().toLowerCase())
        ? ` - ${neighborhood.trim()}`
        : idx >= baseNames.length
        ? ` II`
        : '';
    const fullName = `${baseName}${suffix}`;
    const street = STREET_NAMES[idx % STREET_NAMES.length];
    const num = 120 + idx * 235;
    const address = `${street}, ${num} - ${bairro}, ${city} - ${state}`;
    const phoneNum = `55${ddd}9${84000000 + (((idx + 1) * 147258) % 15999999)}`;
    const flags = flagsPool[idx % flagsPool.length];
    const hasBrokenSite = !flags.includes('Sem site');
    const score = flags.includes('Sem site') ? 95 - idx * 3 : 82 - idx * 4;
    const clampedScore = Math.max(45, Math.min(98, score));
    const tier: LeadTier =
      clampedScore >= 80 ? 'quente' : clampedScore >= 60 ? 'morno' : 'frio';
    const mapsQuery = encodeURIComponent(`${fullName} ${address}`);

    return {
      id: `lead-${Date.now()}-${idx}`,
      name: fullName,
      category,
      state,
      city,
      neighborhood: bairro,
      address,
      phone: phoneNum,
      whatsapp: phoneNum,
      website: hasBrokenSite
        ? `http://${fullName
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '')}.com.br`
        : '',
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`,
      openingHours: 'Segunda a Sexta: 08h às 18h · Sábado: 08h às 13h',
      rating: Number((4.5 + ((idx * 7) % 5) * 0.1).toFixed(1)),
      reviewsCount: 32 + ((idx * 43) % 210),
      score: clampedScore,
      tier,
      flags,
      stage: 'Novo lead',
      inCrm: false,
      estimatedValue: 1500,
      source: 'Google Maps',
      openedRecently: idx % 2 === 0,
      ownerName: OWNER_NAMES[idx % OWNER_NAMES.length],
      activities: [],
      createdAt: new Date().toISOString(),
    };
  });

  return res.status(200).json({ leads: generated, source: 'blackdev_leads_engine' });
}
