export type PlanId = 'free' | 'starter' | 'pro' | 'agency';
export type BillingInterval = 'month' | 'year';
export type PriceLine = 'local' | 'global';

export type CrmStage = 'Base' | 'Abordado' | 'Agendado' | 'Follow Up' | 'Convertido' | 'Perdido';
export type LeadTier = 'quente' | 'morno' | 'frio';

export const CRM_STAGES: CrmStage[] = [
  'Base',
  'Abordado',
  'Agendado',
  'Follow Up',
  'Convertido',
  'Perdido',
];

export const CRM_STAGE_COLORS: Record<CrmStage, string> = {
  Base: '#8E8E93',
  Abordado: '#0071E3',
  Agendado: '#34C759',
  'Follow Up': '#FF9500',
  Convertido: '#5856D6',
  Perdido: '#FF3B30',
};

export const LOSS_REASONS: string[] = [
  'Preço alto / sem orçamento',
  'Vai pensar e sumiu',
  'Já tem site / não precisa',
  'Contratou outra pessoa',
  'Dono/sócio não aprovou',
  'Negócio em dificuldades',
  'Não viu valor',
  'Sem interesse no momento',
];

export const LEAD_TIER_STYLES: Record<LeadTier, { label: string; color: string; bg: string }> = {
  quente: { label: 'Quente', color: '#1A7E3A', bg: 'rgba(48,209,88,0.14)' },
  morno: { label: 'Morno', color: '#B26B00', bg: 'rgba(255,159,10,0.16)' },
  frio: { label: 'Frio', color: '#0071E3', bg: 'rgba(0,113,227,0.12)' },
};

// Exact 55 categories mapped to Google Places types from module 88144
export const CATEGORY_PLACES_MAP: Record<string, string | null> = {
  Restaurante: 'restaurant',
  Padaria: 'bakery',
  Lanchonete: 'snack_bar',
  Hamburgueria: 'hamburger_restaurant',
  Pizzaria: 'pizza_restaurant',
  'Bar / Botequim': 'bar',
  Sorveteria: 'ice_cream_shop',
  Marmitaria: 'restaurant',
  Cafeteria: 'cafe',
  Barbearia: 'barber_shop',
  'Salão de Beleza': 'beauty_salon',
  'Clínica Estética': null,
  'Manicure / Nail Art': 'beauty_salon',
  Academia: 'gym',
  'Pilates / Yoga': null,
  Odontologia: 'dentist',
  'Clínica Médica': 'doctor',
  Fisioterapia: 'physiotherapist',
  Psicologia: null,
  Farmácia: 'pharmacy',
  Óptica: 'store',
  'Laboratório de Exames': 'medical_lab',
  Nutrição: null,
  Mecânica: 'car_repair',
  'Auto Peças': 'store',
  Borracharia: 'car_repair',
  'Lava-Rápido': 'car_wash',
  'Funilaria e Pintura': 'car_repair',
  'Auto Elétrica': 'car_repair',
  Concessionária: 'car_dealer',
  Eletricista: 'electrician',
  Encanador: 'plumber',
  Pintor: 'painter',
  Chaveiro: 'locksmith',
  Contabilidade: 'accounting',
  Advocacia: 'lawyer',
  Imobiliária: 'real_estate_agency',
  Lavanderia: 'laundry',
  Seguradora: 'insurance_agency',
  'Escola de Idiomas': 'school',
  'Escola Particular': 'school',
  'Cursos / Treinamentos': null,
  'Creche / Escola Infantil': 'school',
  Supermercado: 'supermarket',
  'Loja de Roupas': 'clothing_store',
  'Loja de Calçados': 'shoe_store',
  'Papelaria / Livraria': 'book_store',
  Eletroeletrônicos: 'electronics_store',
  'Material de Construção': 'building_materials_store',
  Floricultura: 'florist',
  Joalheria: 'jewelry_store',
  'Marcenaria / Móveis': 'furniture_store',
  'Pet Shop': 'pet_store',
  Veterinária: 'veterinary_care',
  'Pousada / Hotel': null,
  'Agência de Viagens': 'travel_agency',
  Igreja: 'church',
};

export const FREE_CATEGORIES = [
  'Barbearia',
  'Salão de Beleza',
  'Restaurante',
  'Mecânica',
  'Pet Shop',
];

export const STARTER_CATEGORIES = [
  ...FREE_CATEGORIES,
  'Lanchonete',
  'Padaria',
  'Pizzaria',
  'Odontologia',
  'Clínica Médica',
  'Academia',
  'Loja de Roupas',
];

export const PRO_CATEGORIES = [
  ...STARTER_CATEGORIES,
  'Hamburgueria',
  'Cafeteria',
  'Bar / Botequim',
  'Clínica Estética',
  'Manicure / Nail Art',
  'Fisioterapia',
  'Psicologia',
  'Farmácia',
  'Advocacia',
  'Contabilidade',
  'Imobiliária',
  'Eletricista',
  'Encanador',
  'Supermercado',
  'Material de Construção',
  'Auto Peças',
  'Marcenaria / Móveis',
  'Igreja',
];

export const ALL_CATEGORIES = Object.keys(CATEGORY_PLACES_MAP);

export function getCategoriesForPlan(plan: PlanId): string[] {
  if (plan === 'free') return FREE_CATEGORIES;
  if (plan === 'starter') return STARTER_CATEGORIES;
  if (plan === 'pro') return PRO_CATEGORIES;
  return ALL_CATEGORIES;
}

export const CAKTO_CHECKOUT_SLUGS: Record<string, string> = {
  'starter-mensal': 'mv69ckb',
  'pro-mensal': 'ek5hi8r',
  'agencia-mensal': '5bdvwnc',
  'starter-mensal-pix': 'rvvgzp5',
  'pro-mensal-pix': '3dcg4dz',
  'agencia-mensal-pix': '4w6qwzu',
  'starter-anual': '4wnf57c',
  'pro-anual': '3fxru4y',
  'agencia-anual': '39arpsj',
  'agencia-1ano': '34u449v',
  'pro-condicao-especial': 'efvghnu',
};

export function calcInstallment12x(yearlyPriceCents: number): number {
  const reais = yearlyPriceCents / 100;
  return Math.round(((1.16 * reais + 0.99) / 12) * 100) / 100;
}

export interface PlanLimits {
  leadsPerMonth: number;
  scriptsPerMonth: number;
  sitesPerMonth: number;
  systemsPerMonth: number;
  animatedHerosPerMonth: number;
  animatedHeroImagesPerMonth: number;
  editsPerMonth: number;
  logosPerMonth: number;
  siteVersions: number;
  csvExport: boolean;
  publicLink: boolean;
  analyticsAccess: boolean;
  fullCityCoverage: boolean;
  neighborhoodSearch: boolean;
  freeSiteCreation: boolean;
  removeBadge: boolean;
  trackingScripts: boolean;
  customBadge: boolean;
  customDomain: boolean;
  freeHosting: boolean;
  networkingGroup: boolean;
}

export interface PlanDefinition {
  id: PlanId;
  name: string;
  description: string;
  monthlyPrice: number; // cents BRL
  yearlyPrice: number; // cents BRL
  monthlyPriceUsd: number; // cents USD
  yearlyPriceUsd: number; // cents USD
  highlight?: boolean;
  support: string;
  limits: PlanLimits;
}

export const PLANS: Record<PlanId, PlanDefinition> = {
  free: {
    id: 'free',
    name: 'Gratuito',
    description: 'Para explorar a plataforma',
    monthlyPrice: 0,
    yearlyPrice: 0,
    monthlyPriceUsd: 0,
    yearlyPriceUsd: 0,
    support: 'Documentação',
    limits: {
      leadsPerMonth: 40,
      scriptsPerMonth: 10,
      sitesPerMonth: 2,
      systemsPerMonth: 0,
      animatedHerosPerMonth: 0,
      animatedHeroImagesPerMonth: 0,
      editsPerMonth: 3,
      logosPerMonth: 0,
      siteVersions: 3,
      csvExport: false,
      publicLink: true,
      analyticsAccess: true,
      fullCityCoverage: false,
      neighborhoodSearch: false,
      freeSiteCreation: false,
      removeBadge: false,
      trackingScripts: false,
      customBadge: false,
      customDomain: false,
      freeHosting: true,
      networkingGroup: false,
    },
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    description: 'Para freelancers que estão começando',
    monthlyPrice: 9700,
    yearlyPrice: 79700,
    monthlyPriceUsd: 1700,
    yearlyPriceUsd: 10200,
    support: 'Suporte por e-mail',
    limits: {
      leadsPerMonth: 500,
      scriptsPerMonth: 80,
      sitesPerMonth: 15,
      systemsPerMonth: 0,
      animatedHerosPerMonth: 0,
      animatedHeroImagesPerMonth: 0,
      editsPerMonth: 30,
      logosPerMonth: 3,
      siteVersions: 10,
      csvExport: true,
      publicLink: true,
      analyticsAccess: true,
      fullCityCoverage: false,
      neighborhoodSearch: false,
      freeSiteCreation: false,
      removeBadge: false,
      trackingScripts: false,
      customBadge: false,
      customDomain: false,
      freeHosting: true,
      networkingGroup: false,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'Para freelancers ativos',
    monthlyPrice: 12700,
    yearlyPrice: 99700,
    monthlyPriceUsd: 4700,
    yearlyPriceUsd: 28200,
    highlight: true,
    support: 'Suporte via WhatsApp',
    limits: {
      leadsPerMonth: 1500,
      scriptsPerMonth: 250,
      sitesPerMonth: 50,
      systemsPerMonth: 0,
      animatedHerosPerMonth: 0,
      animatedHeroImagesPerMonth: 0,
      editsPerMonth: 100,
      logosPerMonth: 10,
      siteVersions: 30,
      csvExport: true,
      publicLink: true,
      analyticsAccess: true,
      fullCityCoverage: false,
      neighborhoodSearch: true,
      freeSiteCreation: true,
      removeBadge: true,
      trackingScripts: true,
      customBadge: false,
      customDomain: true,
      freeHosting: true,
      networkingGroup: true,
    },
  },
  agency: {
    id: 'agency',
    name: 'Agência',
    description: 'Para agências e equipes',
    monthlyPrice: 29700,
    yearlyPrice: 229700,
    monthlyPriceUsd: 14700,
    yearlyPriceUsd: 88200,
    support: 'WhatsApp prioritário',
    limits: {
      leadsPerMonth: 3000,
      scriptsPerMonth: 500,
      sitesPerMonth: 90,
      systemsPerMonth: 5,
      animatedHerosPerMonth: 2,
      animatedHeroImagesPerMonth: 10,
      editsPerMonth: 200,
      logosPerMonth: 25,
      siteVersions: 50,
      csvExport: true,
      publicLink: true,
      analyticsAccess: true,
      fullCityCoverage: true,
      neighborhoodSearch: true,
      freeSiteCreation: true,
      removeBadge: true,
      trackingScripts: true,
      customBadge: true,
      customDomain: true,
      freeHosting: true,
      networkingGroup: true,
    },
  },
};

export const PLAN_ORDER: PlanId[] = ['free', 'starter', 'pro', 'agency'];

export function getPlanFeatureItems(planId: PlanId, interval: BillingInterval = 'year') {
  const p = PLANS[planId];
  const y = p.limits;
  const catCount = getCategoriesForPlan(planId).length;
  const isAgency = planId === 'agency';
  const teamOk = isAgency && interval === 'year';

  const items = [
    { key: 'leads', text: `${y.leadsPerMonth.toLocaleString('pt-BR')} leads por mês`, ok: true },
    {
      key: 'categories',
      text: isAgency ? 'Todas as categorias de negócio' : `${catCount} categorias de negócio`,
      ok: true,
    },
    {
      key: 'recentes',
      text: 'Negócios abertos recentemente, já com o dono e o contato',
      ok: planId !== 'free',
    },
    { key: 'sites', text: `${y.sitesPerMonth} sites por mês`, ok: true },
    {
      key: 'animatedHeros',
      text:
        y.animatedHerosPerMonth > 0
          ? `${y.animatedHerosPerMonth} sites animados por mês`
          : 'Sites animados',
      ok: y.animatedHerosPerMonth > 0,
    },
    { key: 'scripts', text: `${y.scriptsPerMonth} scripts de abordagem por mês`, ok: true },
    {
      key: 'systems',
      text:
        y.systemsPerMonth > 0
          ? `${y.systemsPerMonth} sistemas de agendamento por mês (app com painel de admin)`
          : 'Sistemas de agendamento (app com painel de admin)',
      ok: y.systemsPerMonth > 0,
    },
    {
      key: 'team',
      text: teamOk
        ? 'Equipe: convide até 2 pessoas pro seu plano'
        : 'Equipe de até 2 pessoas',
      ok: teamOk,
    },
    { key: 'edits', text: `${y.editsPerMonth} edições de site por mês`, ok: y.editsPerMonth > 0 },
    {
      key: 'logos',
      text: y.logosPerMonth > 0 ? `${y.logosPerMonth} logos com IA por mês` : 'Logo com IA',
      ok: y.logosPerMonth > 0,
    },
    {
      key: 'versions',
      text: `Histórico de ${y.siteVersions} versões (dá pra voltar)`,
      ok: true,
    },
    {
      key: 'fullCityCoverage',
      text: 'Busca em todos os municípios do Brasil',
      ok: y.fullCityCoverage,
    },
    { key: 'neighborhoodSearch', text: 'Busca por bairro', ok: y.neighborhoodSearch },
    {
      key: 'freeHosting',
      text: 'Hospedagem com subdomínio próprio grátis',
      ok: y.freeHosting,
    },
    { key: 'publicLink', text: 'Link público para clientes', ok: y.publicLink },
    {
      key: 'csvExport',
      text: 'Exportar seus leads em planilha (CSV)',
      ok: y.csvExport,
    },
    {
      key: 'analyticsAccess',
      text: 'Dashboard com funil de vendas e dicas',
      ok: y.analyticsAccess,
    },
    {
      key: 'freeSiteCreation',
      text: 'Crie sites pra quem não está na busca',
      ok: y.freeSiteCreation,
    },
    {
      key: 'trackingScripts',
      text: 'Pixel do Facebook, Google Analytics e Google Ads no site',
      ok: y.trackingScripts,
    },
    {
      key: 'removeBadge',
      text: "Retirar a marca d'água do site",
      ok: y.removeBadge,
    },
    {
      key: 'customBadge',
      text: "Personalizar a marca d'água com a sua",
      ok: y.customBadge,
    },
    {
      key: 'customDomain',
      text: 'Domínio próprio (tirar o .useleadsite.com)',
      ok: y.customDomain,
    },
    {
      key: 'networkingGroup',
      text: 'Grupo exclusivo de networking',
      ok: y.networkingGroup,
    },
  ];

  return items
    .sort((a, b) => Number(b.ok) - Number(a.ok))
    .concat([{ key: 'support', text: p.support, ok: true }]);
}

export const BR_STATES_CITIES: Record<string, string[]> = {
  SP: ['São Paulo', 'Campinas', 'Santos', 'Ribeirão Preto', 'Sorocaba', 'São José dos Campos', 'Guarulhos', 'Osasco'],
  GO: ['Goiânia', 'Aparecida de Goiânia', 'Anápolis', 'Rio Verde', 'Caldas Novas'],
  MG: ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim', 'Montes Claros'],
  RJ: ['Rio de Janeiro', 'Niterói', 'Duque de Caxias', 'Nova Iguaçu', 'Petrópolis', 'Campos dos Goytacazes'],
  PR: ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel', 'Foz do Iguaçu'],
  SC: ['Florianópolis', 'Joinville', 'Blumenau', 'São José', 'Chapecó', 'Itajaí'],
  RS: ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Canoas', 'Santa Maria', 'Gramado'],
  BA: ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Ilhéus'],
  CE: ['Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Sobral'],
  DF: ['Brasília', 'Taguatinga', 'Águas Claras', 'Ceilândia'],
  PE: ['Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Caruaru', 'Petrolina'],
  ES: ['Vitória', 'Vila Velha', 'Serra', 'Cariacica', 'Cachoeiro de Itapemirim'],
  MT: ['Cuiabá', 'Várzea Grande', 'Rondonópolis', 'Sinop'],
  MS: ['Campo Grande', 'Dourados', 'Três Lagoas'],
  PA: ['Belém', 'Ananindeua', 'Santarém', 'Marabá'],
};

export const STUDY_NICHE_STATS = [
  { niche: 'Barbearia', analyzed: 157215, noSitePct: 30 },
  { niche: 'Restaurante', analyzed: 115292, noSitePct: 30 },
  { niche: 'Salão de Beleza', analyzed: 93205, noSitePct: 35 },
  { niche: 'Pet Shop', analyzed: 75743, noSitePct: 38 },
  { niche: 'Mecânica', analyzed: 36341, noSitePct: 61 },
  { niche: 'Advocacia', analyzed: 10515, noSitePct: 29 },
  { niche: 'Clínica Estética', analyzed: 7257, noSitePct: 32 },
  { niche: 'Odontologia', analyzed: 7141, noSitePct: 30 },
  { niche: 'Academia', analyzed: 5601, noSitePct: 34 },
  { niche: 'Clínica Médica', analyzed: 3920, noSitePct: 29 },
  { niche: 'Psicologia', analyzed: 3282, noSitePct: 36 },
  { niche: 'Contabilidade', analyzed: 3210, noSitePct: 33 },
  { niche: 'Loja de Roupas', analyzed: 3007, noSitePct: 35 },
  { niche: 'Imobiliária', analyzed: 2974, noSitePct: 10 },
  { niche: 'Lanchonete', analyzed: 2630, noSitePct: 56 },
];

export const STUDY_STATE_STATS = [
  { state: 'SP', analyzed: 153107, noSitePct: 28 },
  { state: 'GO', analyzed: 44902, noSitePct: 33 },
  { state: 'MG', analyzed: 43452, noSitePct: 33 },
  { state: 'RJ', analyzed: 40971, noSitePct: 37 },
  { state: 'PR', analyzed: 33046, noSitePct: 32 },
  { state: 'SC', analyzed: 29216, noSitePct: 30 },
  { state: 'RS', analyzed: 27272, noSitePct: 33 },
  { state: 'BA', analyzed: 22152, noSitePct: 40 },
  { state: 'CE', analyzed: 18302, noSitePct: 41 },
  { state: 'DF', analyzed: 17359, noSitePct: 31 },
  { state: 'PE', analyzed: 15282, noSitePct: 43 },
  { state: 'ES', analyzed: 11912, noSitePct: 45 },
  { state: 'MT', analyzed: 8526, noSitePct: 43 },
  { state: 'MS', analyzed: 8032, noSitePct: 36 },
  { state: 'PA', analyzed: 7550, noSitePct: 51 },
];
