import { CrmStage, LeadTier } from './leadsiteConstants';

export type DiagnosticFlag =
  | 'Sem site'
  | 'Site fora do ar'
  | 'Site sem SSL'
  | 'Site sem contato visível'
  | 'Site desatualizado'
  | 'Sem SSL'
  | 'Sem contato';

export interface LeadActivity {
  id: string;
  type: 'nota' | 'whatsapp' | 'ligacao' | 'reuniao' | 'status' | 'site';
  description: string;
  createdAt: string;
}

export interface LeadItem {
  id: string;
  name: string;
  category: string;
  state: string;
  city: string;
  neighborhood?: string;
  address: string;
  phone: string;
  whatsapp?: string;
  website?: string;
  googleMapsUrl?: string;
  openingHours?: string;
  rating: number;
  reviewsCount: number;
  score: number;
  tier: LeadTier;
  flags: DiagnosticFlag[];
  stage: CrmStage;
  lossReason?: string;
  inCrm: boolean;
  siteId?: string;
  estimatedValue?: number;
  source?: string;
  notes?: string;
  activities?: LeadActivity[];
  openedRecently?: boolean;
  ownerName?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface LeadSearchHistoryItem {
  id: string;
  region: string;
  state: string;
  city: string;
  neighborhood?: string;
  category: string;
  count: number;
  createdAt: string;
}

export interface SiteSectionsVisibility {
  hero: boolean;
  services: boolean;
  about: boolean;
  gallery: boolean;
  testimonials: boolean;
  map: boolean;
  contactForm: boolean;
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
  logoText?: string;
  logoUrl?: string;
  heroImage?: string;
  galleryImages?: string[];
  aboutTitle: string;
  aboutText: string;
  services: { title: string; description: string; price?: string }[];
  testimonials: { author: string; text: string; stars: number }[];
  openingHours: string;
  address: string;
  phone: string;
  whatsappMessage: string;
  seoTitle?: string;
  seoDescription?: string;
  sections?: SiteSectionsVisibility;
}

export interface SiteVersion {
  versionNumber: number;
  createdAt: string;
  instruction: string;
  config: SiteConfig;
}

export type SitePublishStatus = 'published' | 'draft' | 'archived';

export interface GeneratedSite {
  id: string;
  slug: string;
  leadId: string;
  businessName: string;
  category: string;
  city: string;
  state: string;
  published: boolean;
  status?: SitePublishStatus;
  customDomain?: string;
  removeBadge: boolean;
  versions: SiteVersion[];
  currentVersionIndex: number;
  createdAt: string;
  updatedAt: string;
}

export type AppointmentType = 'ligacao' | 'reuniao' | 'whatsapp' | 'visita';
export type AppointmentStatus = 'agendado' | 'concluido' | 'cancelado' | 'reagendado';

export interface AppointmentItem {
  id: string;
  title: string;
  leadId: string;
  leadName: string;
  category: string;
  phone: string;
  date: string;
  time: string;
  type: AppointmentType;
  status: AppointmentStatus;
  notes: string;
  completed: boolean;
}

export interface BlackDevSettings {
  adminName: string;
  adminEmail: string;
  defaultWhatsapp: string;
  brandName: string;
  brandPrimaryColor: string;
  brandFooterText: string;
  customDomain: string;
  defaultSiteTheme: 'dark-agency' | 'light-clean';
  autoIncludeWhatsappFloat: boolean;
  autoIncludeMaps: boolean;
  autoIncludeContactForm: boolean;
}

const NICHE_DEFAULTS: Record<
  string,
  {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    tagline: string;
    cta: string;
    heroImage: string;
    galleryImages: string[];
    services: { title: string; description: string; price?: string }[];
  }
> = {
  Restaurante: {
    primaryColor: '#0F172A',
    secondaryColor: '#1E293B',
    accentColor: '#16A34A',
    tagline: 'Gastronomia autêntica, ingredientes frescos selecionados diariamente e ambiente acolhedor.',
    cta: 'Fazer Pedido ou Reserva no WhatsApp',
    heroImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
    ],
    services: [
      { title: 'Almoço Executivo & Pratos da Casa', description: 'Refeições preparadas na hora com carnes nobres e acompanhamentos frescos.', price: 'A partir de R$ 28,90' },
      { title: 'Delivery Rápido pelo WhatsApp', description: 'Entrega quente e embalada com cuidado em toda a região.', price: 'Peça agora' },
      { title: 'Combo Família & Eventos', description: 'Porções completas para compartilhar com a família e amigos.', price: 'A partir de R$ 89,90' },
    ],
  },
  Barbearia: {
    primaryColor: '#090D16',
    secondaryColor: '#111827',
    accentColor: '#D97706',
    tagline: 'Corte clássico e moderno, barba na toalha quente e experiência premium para o homem de estilo.',
    cta: 'Agendar Horário no WhatsApp',
    heroImage: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=800&q=80',
    ],
    services: [
      { title: 'Corte Degradê / Clássico', description: 'Visagismo masculino, acabamento na navalha e lavagem especial.', price: 'R$ 50,00' },
      { title: 'Barba Terapia com Toalha Quente', description: 'Alinhamento preciso, espuma aquecida e óleos hidratantes.', price: 'R$ 40,00' },
      { title: 'Combo VIP (Corte + Barba + Sobrancelha)', description: 'Atendimento completo com bebida cortesia.', price: 'R$ 80,00' },
    ],
  },
  'Salão de Beleza': {
    primaryColor: '#3B0764',
    secondaryColor: '#581C87',
    accentColor: '#EC4899',
    tagline: 'Especialistas em mechas, coloração, tratamentos capilares e estética com produtos de alta performance.',
    cta: 'Agendar Horário pelo WhatsApp',
    heroImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=800&q=80',
    ],
    services: [
      { title: 'Mechas Criativas & Iluminação', description: 'Técnicas personalizadas com teste de mecha e reconstrução inclusa.', price: 'Avaliação gratuita' },
      { title: 'Cronograma Capilar & Escova', description: 'Brilho espelhado, nutrição profunda e finalização duradoura.', price: 'R$ 110,00' },
      { title: 'Unhas em Gel & Design de Sobrancelhas', description: 'Biossegurança 100% esterilizada e acabamento impecável.', price: 'R$ 75,00' },
    ],
  },
  'Dentista / Odontologia': {
    primaryColor: '#0C4A6E',
    secondaryColor: '#0369A1',
    accentColor: '#0284C7',
    tagline: 'Odontologia moderna, implantes, lentes de contato dental e atendimento humanizado para toda a família.',
    cta: 'Agendar Avaliação pelo WhatsApp',
    heroImage: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
    ],
    services: [
      { title: 'Implantes & Reabilitação Oral', description: 'Tecnologia digital sem dor para devolver a segurança do seu sorriso.', price: 'Agende avaliação' },
      { title: 'Clareamento a Laser & Facetas', description: 'Estética dental avançada com resultados naturais e rápidos.', price: 'Condições especiais' },
      { title: 'Limpeza Preventiva & Check-up Digital', description: 'Prevenção completa de cáries e tártaro com câmera intraoral.', price: 'Consulta imediata' },
    ],
  },
  Odontologia: {
    primaryColor: '#0C4A6E',
    secondaryColor: '#0369A1',
    accentColor: '#0284C7',
    tagline: 'Odontologia moderna, implantes, clareamento e atendimento humanizado para toda a família.',
    cta: 'Agendar Avaliação pelo WhatsApp',
    heroImage: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
    ],
    services: [
      { title: 'Implantes & Próteses', description: 'Planejamento computadorizado e segurança total.', price: 'Agende avaliação' },
      { title: 'Estética Dental & Clareamento', description: 'Sorriso renovado com acompanhamento especializado.', price: 'Sob consulta' },
      { title: 'Odontologia Preventiva', description: 'Profilaxia completa e atendimento para adultos e crianças.', price: 'Atendimento rápido' },
    ],
  },
  'Oficina Mecânica': {
    primaryColor: '#0F172A',
    secondaryColor: '#1E293B',
    accentColor: '#DC2626',
    tagline: 'Diagnóstico computadorizado, revisão completa, freios, suspensão e mecânica multimarcas com garantia.',
    cta: 'Solicitar Orçamento no WhatsApp',
    heroImage: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1632823471565-1ecdf5c6da35?auto=format&fit=crop&w=800&q=80',
    ],
    services: [
      { title: 'Revisão Preventiva & Troca de Óleo', description: 'Check-up completo de 45 itens com peças originais e laudo técnico.', price: 'Check-up gratuito' },
      { title: 'Injeção Eletrônica & Scanner', description: 'Leitura computadorizada de falhas, sensores e consumo elevado.', price: 'Diagnóstico preciso' },
      { title: 'Freios, Suspensão e Embreagem', description: 'Segurança total para sua família com garantia em serviços e peças.', price: 'Orçamento na hora' },
    ],
  },
  Mecânica: {
    primaryColor: '#0F172A',
    secondaryColor: '#1E293B',
    accentColor: '#DC2626',
    tagline: 'Diagnóstico computadorizado, revisão preventiva e mecânica geral com garantia.',
    cta: 'Solicitar Orçamento no WhatsApp',
    heroImage: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1632823471565-1ecdf5c6da35?auto=format&fit=crop&w=800&q=80',
    ],
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
    tagline: 'Carinho, banho e tosa seguro, consultório veterinário e linha completa de rações e acessórios.',
    cta: 'Agendar Banho & Tosa no WhatsApp',
    heroImage: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80',
    ],
    services: [
      { title: 'Banho & Tosa Hipoalergênico', description: 'Ambiente climatizado, produtos premium e carinho em cada etapa.', price: 'A partir de R$ 55' },
      { title: 'Consultório Veterinário & Vacinas', description: 'Cuidado completo com a saúde do seu cão ou gato.', price: 'Agende consulta' },
      { title: 'Táxi Dog & Delivery Pet', description: 'Buscamos seu pet com segurança e entregamos rações em domicílio.', price: 'Chame no WhatsApp' },
    ],
  },
};

export function buildInitialSiteConfig(lead: LeadItem): SiteConfig {
  const preset = NICHE_DEFAULTS[lead.category] || {
    primaryColor: '#0F172A',
    secondaryColor: '#1E293B',
    accentColor: '#2563EB',
    tagline: `Referência em ${lead.category} em ${lead.city} com atendimento rápido, estrutura moderna e qualidade garantida.`,
    cta: 'Falar pelo WhatsApp Agora',
    heroImage:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80',
    ],
    services: [
      {
        title: `Excelência em ${lead.category}`,
        description: `Atendimento personalizado para clientes de ${lead.city} e região com garantia de satisfação.`,
        price: 'Solicitar orçamento',
      },
      {
        title: 'Atendimento Rápido via WhatsApp',
        description: 'Tire dúvidas, agende horários ou solicite orçamento sem burocracia.',
        price: 'Resposta imediata',
      },
      {
        title: 'Tradição & Confiança Local',
        description: `Avaliado com nota ${lead.rating.toFixed(1)} por ${lead.reviewsCount} clientes no Google.`,
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
    darkMode: true,
    badgeText: `⭐ ${lead.rating.toFixed(1)} no Google (${lead.reviewsCount} avaliações) · ${lead.city}/${lead.state}`,
    logoText: lead.name,
    logoUrl: '',
    heroImage: preset.heroImage,
    galleryImages: preset.galleryImages,
    aboutTitle: `Por que escolher ${lead.name}?`,
    aboutText: `Localizado em ${lead.address}, o ${lead.name} se consolidou como referência em ${lead.category} em ${lead.city} - ${lead.state}. Unimos profissionais qualificados, atendimento próximo e compromisso real com cada cliente.`,
    services: preset.services,
    testimonials: [
      {
        author: 'Carlos Eduardo M.',
        text: `Excelente atendimento no ${lead.name}! Estrutura impecável e equipe muito atenciosa em ${lead.city}.`,
        stars: 5,
      },
      {
        author: 'Fernanda Oliveira',
        text: 'Profissionais super pontuais, preço justo e qualidade acima da média. Recomendo de olhos fechados!',
        stars: 5,
      },
      {
        author: 'Marcos Vinícius',
        text: 'Atendimento rápido pelo WhatsApp e serviço nota 10. Virei cliente fiel!',
        stars: 5,
      },
    ],
    openingHours: lead.openingHours || 'Segunda a Sexta: 08h às 18h · Sábado: 08h às 13h',
    address: lead.address,
    phone: lead.phone,
    whatsappMessage: `Olá! Vi o site oficial de ${lead.name} e gostaria de mais informações.`,
    seoTitle: `${lead.name} | ${lead.category} em ${lead.city} - ${lead.state}`,
    seoDescription: `${preset.tagline} Confira nossos serviços, avaliações e fale direto no WhatsApp. ${lead.address}.`,
    sections: {
      hero: true,
      services: true,
      about: true,
      gallery: true,
      testimonials: true,
      map: true,
      contactForm: true,
    },
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
    whatsapp: '5562992341122',
    website: '',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Marmitaria+Sabor+Caseiro+Goiania+GO',
    openingHours: 'Seg a Sáb: 10h30 às 15h00',
    rating: 4.9,
    reviewsCount: 184,
    score: 94,
    tier: 'quente',
    flags: ['Sem site'],
    stage: 'Reunião agendada',
    inCrm: true,
    siteId: 'site-1',
    estimatedValue: 1800,
    source: 'Google Maps',
    openedRecently: true,
    ownerName: 'Roberto Almeida',
    notes: 'Reunião marcada para apresentar a proposta visual do site com cardápio e botão de pedido no WhatsApp.',
    activities: [
      {
        id: 'act-1',
        type: 'site',
        description: 'Site gerado automaticamente via BlackDev Leads.',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 'act-2',
        type: 'whatsapp',
        description: 'Primeiro contato enviado no WhatsApp com link de demonstração.',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
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
    whatsapp: '5562988412290',
    website: '',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Studio+Bella+Hair+Goiania+GO',
    openingHours: 'Ter a Sáb: 09h00 às 19h30',
    rating: 4.8,
    reviewsCount: 129,
    score: 86,
    tier: 'quente',
    flags: ['Sem site'],
    stage: 'Contatado',
    inCrm: true,
    estimatedValue: 1500,
    source: 'Google Maps',
    openedRecently: true,
    ownerName: 'Camila Borges',
    notes: 'Gostou da abordagem no WhatsApp, pediu para ver uma prévia com fotos de mechas.',
    activities: [
      {
        id: 'act-3',
        type: 'whatsapp',
        description: 'Mensagem inicial enviada para Camila Borges.',
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'lead-3',
    name: 'Auto Center Silva',
    category: 'Oficina Mecânica',
    state: 'SP',
    city: 'São Paulo',
    neighborhood: 'Pinheiros',
    address: 'Rua dos Pinheiros, 940 - Pinheiros, São Paulo - SP',
    phone: '5511984557701',
    whatsapp: '5511984557701',
    website: 'http://autocentersilva-antigo.com.br',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Auto+Center+Silva+Pinheiros+SP',
    openingHours: 'Seg a Sex: 08h00 às 18h00 · Sáb: 08h00 às 13h00',
    rating: 4.7,
    reviewsCount: 96,
    score: 88,
    tier: 'quente',
    flags: ['Site fora do ar', 'Site sem SSL'],
    stage: 'Novo lead',
    inCrm: true,
    estimatedValue: 2200,
    source: 'Google Maps',
    openedRecently: false,
    ownerName: 'Marcos Silva',
    notes: 'Domínio atual abre aviso de site não seguro (sem HTTPS) e layout antigo.',
    activities: [],
    createdAt: new Date(Date.now() - 3600000 * 14).toISOString(),
  },
  {
    id: 'lead-4',
    name: 'Pet Shop Amigo Fiel',
    category: 'Pet Shop',
    state: 'MG',
    city: 'Belo Horizonte',
    neighborhood: 'Savassi',
    address: 'Rua Pernambuco, 1120 - Savassi, Belo Horizonte - MG',
    phone: '5531991183344',
    whatsapp: '5531991183344',
    website: '',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Pet+Shop+Amigo+Fiel+Savassi+BH',
    openingHours: 'Seg a Sáb: 08h30 às 19h00',
    rating: 4.8,
    reviewsCount: 112,
    score: 84,
    tier: 'quente',
    flags: ['Sem site'],
    stage: 'Proposta enviada',
    inCrm: true,
    estimatedValue: 1600,
    source: 'Google Maps',
    openedRecently: true,
    ownerName: 'Patrícia Lima',
    notes: 'Proposta de R$ 1.600 enviada após demonstrar o botão de agendamento de banho e tosa.',
    activities: [],
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
    whatsapp: '5511997654321',
    website: '',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Barbearia+Dom+Pedro+Moema+SP',
    openingHours: 'Ter a Sáb: 09h00 às 21h00',
    rating: 4.9,
    reviewsCount: 312,
    score: 95,
    tier: 'quente',
    flags: ['Sem site'],
    stage: 'Fechado',
    inCrm: true,
    siteId: 'site-2',
    estimatedValue: 2000,
    source: 'Google Maps',
    openedRecently: true,
    ownerName: 'Pedro Henrique',
    notes: 'Contrato fechado! Site publicado e entregue.',
    activities: [],
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'lead-6',
    name: 'Clínica OdontoPrime',
    category: 'Dentista / Odontologia',
    state: 'PR',
    city: 'Curitiba',
    neighborhood: 'Batel',
    address: 'Av. do Batel, 1550 - Batel, Curitiba - PR',
    phone: '5541998761234',
    whatsapp: '5541998761234',
    website: 'http://odontoprime-ctba.com.br',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Clinica+OdontoPrime+Batel+Curitiba',
    openingHours: 'Seg a Sex: 08h00 às 19h00',
    rating: 4.9,
    reviewsCount: 147,
    score: 91,
    tier: 'quente',
    flags: ['Site sem SSL', 'Site sem contato visível', 'Site desatualizado'],
    stage: 'Em negociação',
    inCrm: true,
    estimatedValue: 2800,
    source: 'Google Maps',
    openedRecently: true,
    ownerName: 'Dr. Lucas Andrade',
    notes: 'Interessado em landing page de alta conversão para implantes e facetas.',
    activities: [],
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
    status: 'published',
    removeBadge: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    currentVersionIndex: 1,
    versions: [
      {
        versionNumber: 1,
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        instruction: 'Geração inicial automática via BlackDev Leads',
        config: buildInitialSiteConfig(INITIAL_LEADS[0]),
      },
      {
        versionNumber: 2,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        instruction: 'Destaque entrega rápida no Setor Bueno e botão verde WhatsApp',
        config: {
          ...buildInitialSiteConfig(INITIAL_LEADS[0]),
          accentColor: '#16A34A',
          heroSubtitle:
            'Comida caseira fresquinha todo dia · Entrega rápida no Setor Bueno e região!',
          ctaText: 'Pedir pelo WhatsApp Agora',
        },
      },
    ],
  },
  {
    id: 'site-2',
    slug: 'barbearia-dom-pedro',
    leadId: 'lead-5',
    businessName: 'Barbearia Dom Pedro',
    category: 'Barbearia',
    city: 'São Paulo',
    state: 'SP',
    published: true,
    status: 'published',
    removeBadge: false,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date().toISOString(),
    currentVersionIndex: 0,
    versions: [
      {
        versionNumber: 1,
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        instruction: 'Site oficial gerado pelo BlackDev Leads',
        config: buildInitialSiteConfig(INITIAL_LEADS[4]),
      },
    ],
  },
];

export const INITIAL_APPOINTMENTS: AppointmentItem[] = [
  {
    id: 'apt-1',
    title: 'Apresentação do Site — Marmitaria Sabor Caseiro',
    leadId: 'lead-1',
    leadName: 'Marmitaria Sabor Caseiro',
    category: 'Restaurante · Goiânia',
    phone: '5562992341122',
    date: new Date().toISOString().slice(0, 10),
    time: '14:30',
    type: 'reuniao',
    status: 'agendado',
    notes: 'Mostrar o site ao vivo no celular e fechar pacote completo.',
    completed: false,
  },
  {
    id: 'apt-2',
    title: 'Ligação de Follow-up — Studio Bella Hair',
    leadId: 'lead-2',
    leadName: 'Studio Bella Hair',
    category: 'Salão de Beleza · Goiânia',
    phone: '5562988412290',
    date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    time: '10:00',
    type: 'ligacao',
    status: 'agendado',
    notes: 'Confirmar se a Camila quer incluir galeria do Instagram no site.',
    completed: false,
  },
  {
    id: 'apt-3',
    title: 'Envio de Proposta no WhatsApp — Clínica OdontoPrime',
    leadId: 'lead-6',
    leadName: 'Clínica OdontoPrime',
    category: 'Dentista / Odontologia · Curitiba',
    phone: '5541998761234',
    date: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
    time: '16:00',
    type: 'whatsapp',
    status: 'agendado',
    notes: 'Enviar link da nova página com certificado SSL e botão flutuante.',
    completed: false,
  },
];

export const INITIAL_SEARCH_HISTORY: LeadSearchHistoryItem[] = [
  {
    id: 'sh-1',
    region: 'Centro-Oeste',
    state: 'GO',
    city: 'Goiânia',
    neighborhood: 'Setor Bueno',
    category: 'Restaurante',
    count: 6,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'sh-2',
    region: 'Sudeste',
    state: 'SP',
    city: 'São Paulo',
    neighborhood: 'Moema',
    category: 'Barbearia',
    count: 10,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];

export const INITIAL_SETTINGS: BlackDevSettings = {
  adminName: 'Gustavo · BlackDev',
  adminEmail: 'admin@blackdev.com.br',
  defaultWhatsapp: '5511999999999',
  brandName: 'BlackDev Leads',
  brandPrimaryColor: '#2563EB',
  brandFooterText: 'Desenvolvido por BlackDev Digital',
  customDomain: '',
  defaultSiteTheme: 'dark-agency',
  autoIncludeWhatsappFloat: true,
  autoIncludeMaps: true,
  autoIncludeContactForm: true,
};

const STORAGE_KEYS = {
  LEADS: 'blackdev_v3_leads',
  SITES: 'blackdev_v3_sites',
  APPOINTMENTS: 'blackdev_v3_appointments',
  SEARCH_HISTORY: 'blackdev_v3_search_history',
  SETTINGS: 'blackdev_v3_settings',
};

const LEGACY_STAGE_MAP: Record<string, CrmStage> = {
  Base: 'Novo lead',
  Abordado: 'Contatado',
  Agendado: 'Reunião agendada',
  'Follow Up': 'Em negociação',
  Convertido: 'Fechado',
  Perdido: 'Perdido',
};

function normalizeLead(l: any): LeadItem {
  const mappedStage: CrmStage = LEGACY_STAGE_MAP[l.stage] || l.stage || 'Novo lead';
  const phoneClean = String(l.phone || '').replace(/\D/g, '');
  const query = encodeURIComponent(`${l.name} ${l.address || ''} ${l.city || ''} ${l.state || ''}`);
  return {
    ...l,
    stage: mappedStage,
    whatsapp: l.whatsapp || phoneClean,
    googleMapsUrl:
      l.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${query}`,
    estimatedValue: typeof l.estimatedValue === 'number' ? l.estimatedValue : 1500,
    source: l.source || 'Google Maps',
    activities: Array.isArray(l.activities) ? l.activities : [],
  };
}

export function loadLeads(): LeadItem[] {
  if (typeof window === 'undefined') return INITIAL_LEADS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LEADS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(INITIAL_LEADS));
      return INITIAL_LEADS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalizeLead) : INITIAL_LEADS;
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
    const parsed: GeneratedSite[] = JSON.parse(raw);
    return parsed.map(s => ({
      ...s,
      status: s.status || (s.published ? 'published' : 'draft'),
    }));
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

export function loadSearchHistory(): LeadSearchHistoryItem[] {
  if (typeof window === 'undefined') return INITIAL_SEARCH_HISTORY;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(INITIAL_SEARCH_HISTORY));
      return INITIAL_SEARCH_HISTORY;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SEARCH_HISTORY;
  }
}

export function saveSearchHistory(items: LeadSearchHistoryItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(items));
  } catch {}
}

export function loadSettings(): BlackDevSettings {
  if (typeof window === 'undefined') return INITIAL_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
      return INITIAL_SETTINGS;
    }
    return { ...INITIAL_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return INITIAL_SETTINGS;
  }
}

export function saveSettings(settings: BlackDevSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch {}
}
