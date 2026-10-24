export type CrmStage =
  | 'Novo lead'
  | 'Contatado'
  | 'Reunião agendada'
  | 'Proposta enviada'
  | 'Em negociação'
  | 'Fechado'
  | 'Perdido';

export type LeadTier = 'quente' | 'morno' | 'frio';

export const CRM_STAGES: CrmStage[] = [
  'Novo lead',
  'Contatado',
  'Reunião agendada',
  'Proposta enviada',
  'Em negociação',
  'Fechado',
  'Perdido',
];

export const CRM_STAGE_COLORS: Record<CrmStage, string> = {
  'Novo lead': '#64748B',
  Contatado: '#3B82F6',
  'Reunião agendada': '#8B5CF6',
  'Proposta enviada': '#F59E0B',
  'Em negociação': '#EC4899',
  Fechado: '#10B981',
  Perdido: '#EF4444',
};

export const LOSS_REASONS: string[] = [
  'Já tenho site',
  'Está caro / sem orçamento',
  'Não tenho tempo agora',
  'Vou pensar e sumiu',
  'Meu sobrinho faz',
  'Não preciso de site',
  'Dono/sócio não aprovou',
  'Contratou outra agência',
];

export const COMMON_OBJECTIONS = [
  { key: 'ja_tenho_site', label: '“Já tenho site.”' },
  { key: 'esta_caro', label: '“Está caro.”' },
  { key: 'sem_tempo', label: '“Não tenho tempo agora.”' },
  { key: 'vou_pensar', label: '“Vou pensar.”' },
  { key: 'sobrinho_faz', label: '“Meu sobrinho faz.”' },
  { key: 'nao_preciso', label: '“Não preciso de site.”' },
];

export const LEAD_TIER_STYLES: Record<LeadTier, { label: string; color: string; bg: string }> = {
  quente: { label: 'Oportunidade quente', color: '#10B981', bg: 'rgba(16,185,129,0.14)' },
  morno: { label: 'Oportunidade morna', color: '#F59E0B', bg: 'rgba(245,158,11,0.16)' },
  frio: { label: 'Oportunidade fria', color: '#3B82F6', bg: 'rgba(59,130,246,0.14)' },
};

// Complete categories mapped to Google Places API types (100% unlocked for BlackDev Leads)
export const CATEGORY_PLACES_MAP: Record<string, string | null> = {
  Restaurante: 'restaurant',
  Barbearia: 'barber_shop',
  'Clínica Médica': 'doctor',
  'Dentista / Odontologia': 'dentist',
  Odontologia: 'dentist',
  Academia: 'gym',
  'Pet Shop': 'pet_store',
  'Oficina Mecânica': 'car_repair',
  Mecânica: 'car_repair',
  Imobiliária: 'real_estate_agency',
  Hotel: 'lodging',
  Pousada: 'lodging',
  'Pousada / Hotel': 'lodging',
  'Loja de Roupas': 'clothing_store',
  'Loja / Comércio Local': 'store',
  'Salão de Beleza': 'beauty_salon',
  'Advogado / Escritório de Advocacia': 'lawyer',
  Advocacia: 'lawyer',
  'Clínica Estética': null,
  Padaria: 'bakery',
  Lanchonete: 'snack_bar',
  Hamburgueria: 'hamburger_restaurant',
  Pizzaria: 'pizza_restaurant',
  'Bar / Botequim': 'bar',
  Sorveteria: 'ice_cream_shop',
  Marmitaria: 'restaurant',
  Cafeteria: 'cafe',
  'Manicure / Nail Art': 'beauty_salon',
  'Pilates / Yoga': null,
  Fisioterapia: 'physiotherapist',
  Psicologia: null,
  Farmácia: 'pharmacy',
  Óptica: 'store',
  'Laboratório de Exames': 'medical_lab',
  Nutrição: null,
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
  Lavanderia: 'laundry',
  Seguradora: 'insurance_agency',
  'Escola de Idiomas': 'school',
  'Escola Particular': 'school',
  'Cursos / Treinamentos': null,
  'Creche / Escola Infantil': 'school',
  Supermercado: 'supermarket',
  'Loja de Calçados': 'shoe_store',
  'Papelaria / Livraria': 'book_store',
  Eletroeletrônicos: 'electronics_store',
  'Material de Construção': 'building_materials_store',
  Floricultura: 'florist',
  Joalheria: 'jewelry_store',
  'Marcenaria / Móveis': 'furniture_store',
  Veterinária: 'veterinary_care',
  'Agência de Viagens': 'travel_agency',
  Igreja: 'church',
};

export const FEATURED_NICHES: string[] = [
  'Restaurante',
  'Barbearia',
  'Clínica Médica',
  'Dentista / Odontologia',
  'Academia',
  'Pet Shop',
  'Oficina Mecânica',
  'Imobiliária',
  'Hotel',
  'Pousada',
  'Loja de Roupas',
  'Salão de Beleza',
  'Advogado / Escritório de Advocacia',
  'Clínica Estética',
];

export const ALL_CATEGORIES = Object.keys(CATEGORY_PLACES_MAP);

export function getCategoriesForPlan(): string[] {
  return ALL_CATEGORIES;
}

export type BrRegion = 'Todas' | 'Sudeste' | 'Sul' | 'Centro-Oeste' | 'Nordeste' | 'Norte';

export const BR_REGIONS: Record<BrRegion, string[]> = {
  Todas: [
    'SP', 'RJ', 'MG', 'ES',
    'PR', 'SC', 'RS',
    'GO', 'DF', 'MT', 'MS',
    'BA', 'PE', 'CE', 'MA', 'PB', 'RN', 'AL', 'SE', 'PI',
    'AM', 'PA', 'TO', 'RO', 'AC', 'AP', 'RR',
  ],
  Sudeste: ['SP', 'RJ', 'MG', 'ES'],
  Sul: ['PR', 'SC', 'RS'],
  'Centro-Oeste': ['GO', 'DF', 'MT', 'MS'],
  Nordeste: ['BA', 'PE', 'CE', 'MA', 'PB', 'RN', 'AL', 'SE', 'PI'],
  Norte: ['AM', 'PA', 'TO', 'RO', 'AC', 'AP', 'RR'],
};

export const BR_STATE_NAMES: Record<string, string> = {
  AC: 'Acre',
  AL: 'Alagoas',
  AP: 'Amapá',
  AM: 'Amazonas',
  BA: 'Bahia',
  CE: 'Ceará',
  DF: 'Distrito Federal',
  ES: 'Espírito Santo',
  GO: 'Goiás',
  MA: 'Maranhão',
  MT: 'Mato Grosso',
  MS: 'Mato Grosso do Sul',
  MG: 'Minas Gerais',
  PA: 'Pará',
  PB: 'Paraíba',
  PR: 'Paraná',
  PE: 'Pernambuco',
  PI: 'Piauí',
  RJ: 'Rio de Janeiro',
  RN: 'Rio Grande do Norte',
  RS: 'Rio Grande do Sul',
  RO: 'Rondônia',
  RR: 'Roraima',
  SC: 'Santa Catarina',
  SP: 'São Paulo',
  SE: 'Sergipe',
  TO: 'Tocantins',
};

export const BR_STATES_CITIES: Record<string, string[]> = {
  SP: ['São Paulo', 'Campinas', 'Santos', 'Ribeirão Preto', 'Sorocaba', 'São José dos Campos', 'Guarulhos', 'Osasco', 'São Bernardo do Campo', 'Santo André', 'Bauru', 'Piracicaba', 'Jundiaí'],
  RJ: ['Rio de Janeiro', 'Niterói', 'Duque de Caxias', 'Nova Iguaçu', 'Petrópolis', 'Campos dos Goytacazes', 'Volta Redonda', 'Macaé', 'Cabo Frio'],
  MG: ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim', 'Montes Claros', 'Uberaba', 'Governador Valadares', 'Ipatinga', 'Poços de Caldas'],
  ES: ['Vitória', 'Vila Velha', 'Serra', 'Cariacica', 'Cachoeiro de Itapemirim', 'Linhares', 'Guarapari'],
  PR: ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel', 'Foz do Iguaçu', 'São José dos Pinhais', 'Guarapuava'],
  SC: ['Florianópolis', 'Joinville', 'Blumenau', 'São José', 'Chapecó', 'Itajaí', 'Criciúma', 'Balneário Camboriú', 'Jaraguá do Sul'],
  RS: ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Canoas', 'Santa Maria', 'Gramado', 'Novo Hamburgo', 'Passo Fundo', 'São Leopoldo'],
  GO: ['Goiânia', 'Aparecida de Goiânia', 'Anápolis', 'Rio Verde', 'Caldas Novas', 'Luziânia', 'Águas Lindas de Goiás', 'Valparaíso de Goiás'],
  DF: ['Brasília', 'Taguatinga', 'Águas Claras', 'Ceilândia', 'Guará', 'Samambaia', 'Gama', 'Sobradinho'],
  MT: ['Cuiabá', 'Várzea Grande', 'Rondonópolis', 'Sinop', 'Sorriso', 'Lucas do Rio Verde', 'Tangará da Serra'],
  MS: ['Campo Grande', 'Dourados', 'Três Lagoas', 'Corumbá', 'Ponta Porã'],
  BA: ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Ilhéus', 'Itabuna', 'Juazeiro', 'Lauro de Freitas', 'Porto Seguro'],
  PE: ['Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Caruaru', 'Petrolina', 'Paulista', 'Cabo de Santo Agostinho', 'Garanhuns'],
  CE: ['Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Sobral', 'Maracanaú', 'Crato'],
  MA: ['São Luís', 'Imperatriz', 'São José de Ribamar', 'Timon', 'Caxias'],
  PB: ['João Pessoa', 'Campina Grande', 'Santa Rita', 'Patos', 'Cabedelo'],
  RN: ['Natal', 'Mossoró', 'Parnamirim', 'São Gonçalo do Amarante'],
  AL: ['Maceió', 'Arapiraca', 'Rio Largo', 'Marechal Deodoro'],
  SE: ['Aracaju', 'Nossa Senhora do Socorro', 'Lagarto', 'Itabaiana'],
  PI: ['Teresina', 'Parnaíba', 'Picos', 'Piripiri'],
  AM: ['Manaus', 'Parintins', 'Itacoatiara', 'Manacapuru'],
  PA: ['Belém', 'Ananindeua', 'Santarém', 'Marabá', 'Parauapebas', 'Castanhal'],
  TO: ['Palmas', 'Araguaína', 'Gurupi', 'Porto Nacional'],
  RO: ['Porto Velho', 'Ji-Paraná', 'Ariquemes', 'Vilhena', 'Cacoal'],
  AC: ['Rio Branco', 'Cruzeiro do Sul', 'Sena Madureira'],
  AP: ['Macapá', 'Santana', 'Laranjal do Jari'],
  RR: ['Boa Vista', 'Rorainópolis', 'Caracaraí'],
};

export const BR_CITY_NEIGHBORHOODS: Record<string, string[]> = {
  'São Paulo': ['Pinheiros', 'Moema', 'Vila Mariana', 'Itaim Bibi', 'Tatuapé', 'Santana', 'Bela Vista', 'Jardins', 'Perdizes', 'Centro'],
  Campinas: ['Cambuí', 'Taquaral', 'Barão Geraldo', 'Centro', 'Nova Campinas'],
  'Rio de Janeiro': ['Copacabana', 'Ipanema', 'Barra da Tijuca', 'Botafogo', 'Tijuca', 'Centro', 'Recreio dos Bandeirantes', 'Leblon'],
  'Belo Horizonte': ['Savassi', 'Lourdes', 'Funcionários', 'Pampulha', 'Buritis', 'Centro', 'Santa Efigênia'],
  Curitiba: ['Batel', 'Água Verde', 'Bigorrilho', 'Centro', 'Juvevê', 'Portão', 'Cabral'],
  Florianópolis: ['Centro', 'Trindade', 'Itacorubi', 'Jurerê', 'Ingleses', 'Lagoa da Conceição', 'Campeche'],
  'Porto Alegre': ['Moinhos de Vento', 'Bela Vista', 'Cidade Baixa', 'Menino Deus', 'Petrópolis', 'Centro Histórico'],
  Goiânia: ['Setor Bueno', 'Setor Marista', 'Setor Oeste', 'Jardim Goiás', 'Setor Central', 'Setor Campinas', 'Setor Sul'],
  Brasília: ['Asa Sul', 'Asa Norte', 'Lago Sul', 'Lago Norte', 'Sudoeste', 'Noroeste'],
  Salvador: ['Pituba', 'Barra', 'Caminho das Árvores', 'Rio Vermelho', 'Itaigara', 'Graça', 'Centro'],
  Fortaleza: ['Aldeota', 'Meireles', 'Cocó', 'Fatima', 'Centro', 'Varjota'],
  Recife: ['Boa Viagem', 'Graças', 'Espinheiro', 'Casa Forte', 'Pina', 'Boa Vista'],
  Vitória: ['Praia do Canto', 'Jardim da Penha', 'Mata da Praia', 'Enseada do Suá', 'Centro'],
  Manaus: ['Adrianópolis', 'Vieiralves', 'Ponta Negra', 'Centro', 'Parque 10 de Novembro'],
  Belém: ['Nazaré', 'Umarizal', 'Batista Campos', 'Marco', 'Cidade Velha'],
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
];

export const STUDY_STATE_STATS = [
  { state: 'SP', analyzed: 153107, noSitePct: 28 },
  { state: 'GO', analyzed: 44902, noSitePct: 33 },
  { state: 'MG', analyzed: 43452, noSitePct: 33 },
  { state: 'RJ', analyzed: 40971, noSitePct: 37 },
  { state: 'PR', analyzed: 33046, noSitePct: 32 },
];
