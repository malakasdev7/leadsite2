-- supabase_schema.sql – execute this no SQL editor do seu projeto Supabase

-- Extensão auth já cria a tabela auth.users. Vamos adicionar colunas extras para perfil
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free';

-- sites – armazena os sites que cada usuário cria
CREATE TABLE IF NOT EXISTS sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subdomain TEXT UNIQUE,
  template_id UUID,
  config JSONB,
  generated_url TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- leads – leads capturados pelos formulários dos sites
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  phone TEXT,
  custom_fields JSONB,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- automations – regras de disparo (WhatsApp, e‑mail)
CREATE TABLE IF NOT EXISTS automations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  type TEXT,                 -- whatsapp | email
  trigger_status TEXT,       -- ex.: 'new', 'contacted', ...
  message_template TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

-- messages – histórico das mensagens enviadas
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  automation_id UUID REFERENCES automations(id) ON DELETE CASCADE,
  channel TEXT,               -- whatsapp | email
  content TEXT,
  status TEXT,               -- sent | failed
  sent_at TIMESTAMP DEFAULT now()
);
