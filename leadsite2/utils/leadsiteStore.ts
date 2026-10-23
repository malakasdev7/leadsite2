import { CrmStage, LeadTier, PlanId } from './leadsiteConstants';

export type DiagnosticFlag = 'Sem site' | 'Site fora do ar' | 'Sem SSL' | 'Sem contato';

export interface LeadItem {
  id: string;
  name: string;
  category: string;
  state: string;
  city: string;
  neighborhood?: string;
  address: string;
  phone: string;
  rating: number;
  reviewsCount: number;
  score: number;
  tier: LeadTier;
  flags: DiagnosticFlag[];
  stage: CrmStage;
  lossReason?: string;
  inCrm: boolean;
  siteId?: string;
  notes?: string;
  openedRecently?: boolean;
  ownerName?: string;
  createdAt: string;
}

export interface SiteConfig {
  heroTitle: string;
  heroSubtitle: string;
  ctaText: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  darkMode: boolean;
  badgeText: string;
  aboutTitle: string;
  aboutText: string;
  services: { title: string; description: string; price?: string }[];
  testimonials: { author: string; text: string; stars: number }[];
  openingHours: string;
  address: string;
  phone: string;
  whatsappMessage: string;
}

export interface SiteVersion {
  versionNumber: number;
  createdAt: string;
  instruction: string;
  config: SiteConfig;
}

export interface GeneratedSite {
  id: string;
  slug: string;
  leadId: string;
  businessName: string;
  category: string;
  city: string;
  state: string;
  published: boolean;
  customDomain?: string;
  removeBadge: boolean;
  versions: SiteVersion[];
  currentVersionIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentItem {
  id: string;
  leadId: string;
  leadName: string;
  category: string;
  phone: string;
  date: string;
  time: string;
  type: 'Vídeo-chamada (Mostrar Site)' | 'Ligação de Abordagem' | 'Follow-up de Fechamento';
  notes: string;
  completed: boolean;
}

export interface UserQuotaState {
  plan: PlanId;
  leadsUsed: number;
  sitesUsed: number;
  scriptsUsed: number;
  editsUsed: number;
}

const NICHE_DEFAULTS: Record<
  string,
  {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    tagline: string;
    cta: string;
    services: { title: string; description: string; price?: string }[];
  }
> = {
  Restaurante: {
    primaryColor: '#16213E',
    secondaryColor: '#0F3460',
    accentColor: '#1A7E3A',
    tagline: 'Comida caseira fresquinha todo dia, feita com ingredientes selecionados.',
    cta: 'Pedir no WhatsApp',
    services: [
      { title: 'Marmita Executiva', description: 'Arroz, feijão, proteína grelhada e 3 acompanhamentos frescos.', price: 'R$ 24,90' },
      { title: 'Prato Feito da Casa', description: 'Almoço completo servido no salão ou delivery rápido.', price: 'R$ 29,90' },
      { title: 'Combo Família', description: 'Refeição completa para até 4 pessoas com sobremesa cortesia.', price: 'R$ 89,90' },
    ],
  },
  Marmitaria: {
    primaryColor: '#16213E',
    secondaryColor: '#0F3460',
    accentColor: '#1A7E3A',
    tagline: 'Comida caseira fresquinha todo dia direto na sua porta.',
    cta: 'Pedir no WhatsApp',
    services: [
      { title: 'Marmitex Tradicional', description: 'Cardápio variado diariamente com tempero caseiro.', price: 'R$ 22,00' },
      { title: 'Linha Fit & Saudável', description: 'Opções leves com grelhados, legumes no vapor e arroz integral.', price: 'R$ 26,00' },
      { title: 'Plano Mensal Empresas', description: 'Entrega diária pontual para equipes e comércios locais.', price: 'Sob consulta' },
    ],
  },
  Barbearia: {
    primaryColor: '#111827',
    secondaryColor: '#1F2937',
    accentColor: '#D97706',
    tagline: 'Corte clássico, barba na navalha com toalha quente e atendimento de primeira.',
    cta: 'Agendar Horário no WhatsApp',
    services: [
      { title: 'Corte Degradê / Social', description: 'Acabamento preciso na navalha e finalização com pomada.', price: 'R$ 45,00' },
      { title: 'Barba Terapia (Toalha Quente)', description: 'Alinhamento completo, hidratação e óleo essencial.', price: 'R$ 35,00' },
      { title: 'Combo Corte + Barba + Sobrancelha', description: 'Visual completo renovado com cerveja ou café cortesia.', price: 'R$ 70,00' },
    ],
  },
  'Salão de Beleza': {
    primaryColor: '#4A154B',
    secondaryColor: '#7C2D12',
    accentColor: '#DB2777',
    tagline: 'Realce sua beleza com especialistas em cabelos, mechas, unhas e estética.',
    cta: 'Agendar Horário Agora',
    services: [
      { title: 'Escova & Hidratação Profunda', description: 'Tratamento nutritivo com brilho espelhado para todos os fios.', price: 'R$ 95,00' },
      { title: 'Mechas & Iluminação', description: 'Técnicas personalizadas com proteção da fibra capilar.', price: 'A partir de R$ 280' },
      { title: 'Manicure & Pedicure Gel', description: 'Esmaltação de longa duração com biossegurança total.', price: 'R$ 65,00' },
    ],
  },
  Mecânica: {
    primaryColor: '#0F172A',
    secondaryColor: '#1E293B',
    accentColor: '#DC2626',
    tagline: 'Diagnóstico computadorizado, revisão preventiva e mecânica geral com garantia.',
    cta: 'Solicitar Orçamento no WhatsApp',
    services: [
      { title: 'Revisão Preventiva Completa', description: 'Check-up de 40 itens, freios, suspensão, óleo e filtros.', price: 'Orçamento grátis' },
      { title: 'Injeção Eletrônica & Scanner', description: 'Diagnóstico preciso de falhas de motor e consumo.', price: 'R$ 120,00' },
      { title: 'Freios, Suspensão e Embreagem', description: 'Peças originais com garantia e entrega no mesmo dia.', price: 'Sob avaliação' },
    ],
  },
  'Pet Shop': {
    primaryColor: '#064E3B',
    secondaryColor: '#047857',
    accentColor: '#F59E0B',
    tagline: 'Carinho, banho e tosa seguro, consultório veterinário e linha completa pet.',
    cta: 'Agendar Banho & Tosa',
    services: [
      { title: 'Banho & Tosa Higiênica', description: 'Água morna, produtos hipoalergênicos e secagem tranquila.', price: 'A partir de R$ 55' },
      { title: 'Consulta Veterinária & Vacinas', description: 'Atendimento clínico com amor e cuidado para cães e gatos.', price: 'R$ 110,00' },
      { title: 'Táxi Dog & Delivery de Rações', description: 'Buscamos seu pet em casa e entregamos rações e medicamentos.', price: 'Consulte taxa' },
    ],
  },
};

export function buildInitialSiteConfig(lead: LeadItem): SiteConfig {
  const preset = NICHE_DEFAULTS[lead.category] || {
    primaryColor: '#003A75',
    secondaryColor: '#005EC2',
    accentColor: '#0071E3',
    tagline: `Referência em ${lead.category} em ${lead.city} com atendimento rápido e qualidade garantida.`,
    cta: 'Falar no WhatsApp Agora',
    services: [
      {
        title: `Atendimento Especializado em ${lead.category}`,
        description: `Soluções completas para clientes de ${lead.city} e região com garantia de satisfação.`,
        price: 'Solicitar orçamento',
      },
      {
        title: 'Orçamento Rápido pelo WhatsApp',
        description: 'Tire suas dúvidas e receba atendimento imediato diretamente com nossa equipe.',
        price: 'Sem compromisso',
      },
      {
        title: 'Qualidade & Pontualidade',
        description: `Mais de ${lead.reviewsCount} avaliações positivas de clientes reais no Google.`,
        price: `⭐ ${lead.rating.toFixed(1)}/5.0`,
      },
    ],
  };

  return {
    heroTitle: lead.name,
    heroSubtitle: preset.tagline,
    ctaText: preset.cta,
    primaryColor: preset.primaryColor,
    secondaryColor: preset.secondaryColor,
    accentColor: preset.accentColor,
    darkMode: false,
    badgeText: `⭐ ${lead.rating.toFixed(1)} no Google (${lead.reviewsCount} avaliações) · ${lead.city}/${lead.state}`,
    aboutTitle: `Sobre ${lead.name}`,
    aboutText: `Localizado em ${lead.address}, o ${lead.name} é destaque em ${lead.category} na cidade de ${lead.city} - ${lead.state}. Nosso compromisso é entregar excelência, atendimento humano e resultados de confiança para cada cliente.`,
    services: preset.services,
    testimonials: [
      {
        author: 'Carlos Eduardo M.',
        text: `Excelente atendimento no ${lead.name}! Recomendo para todos de ${lead.city}.`,
        stars: 5,
      },
      {
        author: 'Fernanda Oliveira',
        text: 'Profissionais super atenciosos, preço justo e muita qualidade. Virei cliente fiel!',
        stars: 5,
      },
      {
        author: 'Marcos Vinícius',
        text: 'Rápido, organizado e cumpriu exatamente o combinado. Nota 10!',
        stars: 5,
      },
    ],
    openingHours: 'Segunda a Sexta: 08h às 18h · Sábado: 08h às 13h',
    address: lead.address,
    phone: lead.phone,
    whatsappMessage: `Olá! Vi o site do ${lead.name} e gostaria de mais informações.`,
  };
}

export const INITIAL_LEADS: LeadItem[] = [
  {
    id: 'lead-1',
    name: 'Marmitaria Sabor Caseiro',
    category: 'Restaurante',
    state: 'GO',
    city: 'Goiânia',
    neighborhood: 'Setor Bueno',
    address: 'Av. T-63, 1420 - Setor Bueno, Goiânia - GO',
    phone: '5562992341122',
    rating: 4.9,
    reviewsCount: 184,
    score: 92,
    tier: 'quente',
    flags: ['Sem site'],
    stage: 'Agendado',
    inCrm: true,
    siteId: 'site-1',
    openedRecently: true,
    ownerName: 'Roberto Almeida',
    notes: 'Reunião marcada para mostrar o site com botão verde de pedido no WhatsApp.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'lead-2',
    name: 'Studio Bella Hair',
    category: 'Salão de Beleza',
    state: 'GO',
    city: 'Goiânia',
    neighborhood: 'Setor Marista',
    address: 'Rua 9, 855 - Setor Marista, Goiânia - GO',
    phone: '5562988412290',
    rating: 4.8,
    reviewsCount: 129,
    score: 78,
    tier: 'morno',
    flags: ['Sem site'],
    stage: 'Abordado',
    inCrm: true,
    openedRecently: true,
    ownerName: 'Camila Borges',
    notes: 'Gostou da abordagem no WhatsApp, pediu para ver uma prévia.',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'lead-3',
    name: 'Auto Center Silva',
    category: 'Mecânica',
    state: 'GO',
    city: 'Aparecida de Goiânia',
    neighborhood: 'Centro',
    address: 'Av. Independência, 2310 - Centro, Aparecida de Goiânia - GO',
    phone: '5562984557701',
    rating: 4.7,
    reviewsCount: 96,
    score: 88,
    tier: 'quente',
    flags: ['Site fora do ar', 'Sem SSL'],
    stage: 'Base',
    inCrm: true,
    openedRecently: false,
    ownerName: 'Marcos Silva',
    createdAt: new Date(Date.now() - 3600000 * 14).toISOString(),
  },
  {
    id: 'lead-4',
    name: 'Pet Shop Amigo Fiel',
    category: 'Pet Shop',
    state: 'GO',
    city: 'Goiânia',
    neighborhood: 'Jardim Goiás',
    address: 'Rua 52, 410 - Jardim Goiás, Goiânia - GO',
    phone: '5562991183344',
    rating: 4.6,
    reviewsCount: 64,
    score: 74,
    tier: 'morno',
    flags: ['Sem site'],
    stage: 'Follow Up',
    inCrm: true,
    openedRecently: true,
    ownerName: 'Patrícia Lima',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'lead-5',
    name: 'Barbearia Dom Pedro',
    category: 'Barbearia',
    state: 'SP',
    city: 'São Paulo',
    neighborhood: 'Moema',
    address: 'Al. dos Arapanés, 780 - Moema, São Paulo - SP',
    phone: '5511997654321',
    rating: 4.9,
    reviewsCount: 312,
    score: 95,
    tier: 'quente',
    flags: ['Sem site'],
    stage: 'Convertido',
    inCrm: true,
    openedRecently: true,
    ownerName: 'Pedro Henrique',
    notes: 'Fechou site por R$ 800 à vista + R$ 120/mês de manutenção!',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'lead-6',
    name: 'Clínica OdontoPrime',
    category: 'Odontologia',
    state: 'PR',
    city: 'Curitiba',
    neighborhood: 'Batel',
    address: 'Av. do Batel, 1550 - Batel, Curitiba - PR',
    phone: '5541998761234',
    rating: 4.8,
    reviewsCount: 147,
    score: 91,
    tier: 'quente',
    flags: ['Sem site'],
    stage: 'Base',
    inCrm: false,
    openedRecently: true,
    ownerName: 'Dr. Lucas Andrade',
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_SITES: GeneratedSite[] = [
  {
    id: 'site-1',
    slug: 'marmitaria-sabor-caseiro',
    leadId: 'lead-1',
    businessName: 'Marmitaria Sabor Caseiro',
    category: 'Restaurante',
    city: 'Goiânia',
    state: 'GO',
    published: true,
    removeBadge: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    currentVersionIndex: 1,
    versions: [
      {
        versionNumber: 1,
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        instruction: 'Geração inicial com IA a partir dos dados do Google Maps',
        config: buildInitialSiteConfig(INITIAL_LEADS[0]),
      },
      {
        versionNumber: 2,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        instruction: 'deixe o botão verde e destaque entrega grátis no Setor Bueno',
        config: {
          ...buildInitialSiteConfig(INITIAL_LEADS[0]),
          accentColor: '#1FA855',
          heroSubtitle: 'Comida caseira fresquinha todo dia · Entrega rápida no Setor Bueno e região!',
          ctaText: 'Pedir no WhatsApp Agora',
        },
      },
    ],
  },
];

export const INITIAL_APPOINTMENTS: AppointmentItem[] = [
  {
    id: 'apt-1',
    leadId: 'lead-1',
    leadName: 'Marmitaria Sabor Caseiro',
    category: 'Restaurante · Goiânia',
    phone: '5562992341122',
    date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    time: '14:30',
    type: 'Vídeo-chamada (Mostrar Site)',
    notes: 'Espelhar a tela mostrando o site publicado e propor R$ 800 à vista + R$ 120/mês.',
    completed: false,
  },
  {
    id: 'apt-2',
    leadId: 'lead-2',
    leadName: 'Studio Bella Hair',
    category: 'Salão de Beleza · Goiânia',
    phone: '5562988412290',
    date: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
    time: '10:00',
    type: 'Ligação de Abordagem',
    notes: 'Confirmar se a Camila prefere agendamento online integrado no site.',
    completed: false,
  },
];

const STORAGE_KEYS = {
  LEADS: 'leadsite_v2_leads',
  SITES: 'leadsite_v2_sites',
  APPOINTMENTS: 'leadsite_v2_appointments',
  QUOTA: 'leadsite_v2_quota',
};

export function loadLeads(): LeadItem[] {
  if (typeof window === 'undefined') return INITIAL_LEADS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LEADS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(INITIAL_LEADS));
      return INITIAL_LEADS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_LEADS;
  }
}

export function saveLeads(leads: LeadItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
  } catch {}
}

export function loadSites(): GeneratedSite[] {
  if (typeof window === 'undefined') return INITIAL_SITES;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SITES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SITES, JSON.stringify(INITIAL_SITES));
      return INITIAL_SITES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SITES;
  }
}

export function saveSites(sites: GeneratedSite[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.SITES, JSON.stringify(sites));
  } catch {}
}

export function loadAppointments(): AppointmentItem[] {
  if (typeof window === 'undefined') return INITIAL_APPOINTMENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(INITIAL_APPOINTMENTS));
      return INITIAL_APPOINTMENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_APPOINTMENTS;
  }
}

export function saveAppointments(items: AppointmentItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(items));
  } catch {}
}

export function loadQuota(): UserQuotaState {
  const fallback: UserQuotaState = {
    plan: 'pro',
    leadsUsed: 6,
    sitesUsed: 1,
    scriptsUsed: 4,
    editsUsed: 2,
  };
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUOTA);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.QUOTA, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function saveQuota(q: UserQuotaState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.QUOTA, JSON.stringify(q));
  } catch {}
}
