-- =============================================================================
-- BlackDev Leads — Schema Completo PostgreSQL / Supabase (SaaS de Uso Próprio)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. users (Administrador único do BlackDev Leads)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL DEFAULT 'Administrador BlackDev',
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. leads (Negócios locais encontrados e prospectados)
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL,
  telefone TEXT,
  whatsapp TEXT,
  endereco TEXT,
  cidade TEXT NOT NULL,
  estado TEXT NOT NULL,
  bairro TEXT,
  site TEXT,
  google_maps_url TEXT,
  nota NUMERIC(3,2) DEFAULT 4.8,
  total_avaliacoes INTEGER DEFAULT 0,
  status_site JSONB DEFAULT '["Sem site"]'::jsonb,
  status_crm TEXT DEFAULT 'Novo lead',
  valor_estimado NUMERIC(12,2) DEFAULT 1500.00,
  origem TEXT DEFAULT 'Google Maps',
  horario_funcionamento TEXT,
  observacoes TEXT,
  criado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leads_cidade_estado ON leads(cidade, estado);
CREATE INDEX IF NOT EXISTS idx_leads_categoria ON leads(categoria);
CREATE INDEX IF NOT EXISTS idx_leads_status_crm ON leads(status_crm);

-- 3. lead_searches (Histórico de buscas no Google Maps)
CREATE TABLE IF NOT EXISTS lead_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  regiao TEXT,
  estado TEXT NOT NULL,
  cidade TEXT NOT NULL,
  bairro TEXT,
  categoria TEXT NOT NULL,
  quantidade_resultados INTEGER DEFAULT 0,
  criado_em TIMESTAMPTZ DEFAULT now()
);

-- 4. sites (Sites gerados para os leads)
CREATE TABLE IF NOT EXISTS sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  slug TEXT UNIQUE NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  conteudo_json JSONB NOT NULL,
  tema TEXT DEFAULT 'modern-agency',
  cores JSONB DEFAULT '{"primary":"#2563EB","secondary":"#0F172A","accent":"#22C55E"}'::jsonb,
  logo TEXT,
  imagens JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'published', -- 'published' | 'draft' | 'archived'
  url_publica TEXT,
  versao INTEGER DEFAULT 1,
  criado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sites_slug ON sites(slug);
CREATE INDEX IF NOT EXISTS idx_sites_lead_id ON sites(lead_id);

-- 5. site_versions (Histórico de versões dos sites gerados/editados)
CREATE TABLE IF NOT EXISTS site_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  versao INTEGER NOT NULL,
  instrucao TEXT,
  conteudo_json JSONB NOT NULL,
  criado_em TIMESTAMPTZ DEFAULT now()
);

-- 6. crm_stages (Etapas padrão do pipeline comercial)
CREATE TABLE IF NOT EXISTS crm_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT UNIQUE NOT NULL,
  ordem INTEGER NOT NULL,
  cor TEXT NOT NULL
);

INSERT INTO crm_stages (nome, ordem, cor) VALUES
  ('Novo lead', 1, '#64748B'),
  ('Contatado', 2, '#3B82F6'),
  ('Reunião agendada', 3, '#8B5CF6'),
  ('Proposta enviada', 4, '#F59E0B'),
  ('Em negociação', 5, '#EC4899'),
  ('Fechado', 6, '#10B981'),
  ('Perdido', 7, '#EF4444')
ON CONFLICT (nome) DO NOTHING;

-- 7. crm_deals (Oportunidades comerciais vinculadas aos leads)
CREATE TABLE IF NOT EXISTS crm_deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  etapa TEXT NOT NULL DEFAULT 'Novo lead',
  valor_estimado NUMERIC(12,2) DEFAULT 1500.00,
  origem TEXT DEFAULT 'Google Maps',
  motivo_perda TEXT,
  criado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- 8. lead_activities (Histórico de interações e notas internas do lead)
CREATE TABLE IF NOT EXISTS lead_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL DEFAULT 'nota', -- 'nota' | 'whatsapp' | 'ligacao' | 'reuniao' | 'status' | 'site'
  descricao TEXT NOT NULL,
  criado_em TIMESTAMPTZ DEFAULT now()
);

-- 9. appointments (Compromissos comerciais)
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  lead_nome TEXT,
  data_hora TIMESTAMPTZ NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'reuniao', -- 'ligacao' | 'reuniao' | 'whatsapp' | 'visita'
  observacoes TEXT,
  status TEXT NOT NULL DEFAULT 'agendado', -- 'agendado' | 'concluido' | 'cancelado' | 'reagendado'
  criado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- 10. scripts (Scripts de abordagem gerados com IA para cada lead)
CREATE TABLE IF NOT EXISTS scripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL, -- 'whatsapp_inicial' | 'whatsapp_followup' | 'ligacao' | 'reuniao' | 'objecao'
  objecao_chave TEXT,
  conteudo TEXT NOT NULL,
  criado_em TIMESTAMPTZ DEFAULT now()
);

-- 11. settings (Configurações gerais e de marca do BlackDev Leads)
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_name TEXT DEFAULT 'Gustavo · BlackDev',
  admin_email TEXT DEFAULT 'admin@blackdev.com.br',
  default_whatsapp TEXT DEFAULT '5511999999999',
  brand_name TEXT DEFAULT 'BlackDev Leads',
  brand_primary_color TEXT DEFAULT '#2563EB',
  brand_footer_text TEXT DEFAULT 'Desenvolvido por BlackDev Digital',
  custom_domain TEXT DEFAULT '',
  default_site_theme TEXT DEFAULT 'dark-premium',
  auto_include_whatsapp_float BOOLEAN DEFAULT true,
  auto_include_maps BOOLEAN DEFAULT true,
  auto_include_contact_form BOOLEAN DEFAULT true,
  atualizado_em TIMESTAMPTZ DEFAULT now()
);
