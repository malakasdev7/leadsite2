import type { NextPage } from 'next';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import { AppLayout, showToast } from '../../components/AppLayout';
import { sha256Hex } from '../../utils/auth';
import {
  BlackDevSettings,
  INITIAL_SETTINGS,
  loadSettings,
  saveSettings,
} from '../../utils/leadsiteStore';

const SettingsPage: NextPage = () => {
  const [settings, setSettings] = useState<BlackDevSettings>(INITIAL_SETTINGS);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [generatedHash, setGeneratedHash] = useState('');

  // Server Integration Status
  const [mapsConfigured, setMapsConfigured] = useState(false);
  const [supabaseConfigured, setSupabaseConfigured] = useState(false);
  const [testingMaps, setTestingMaps] = useState(false);
  const [mapsTestResult, setMapsTestResult] = useState<string>('');

  useEffect(() => {
    setSettings(loadSettings());
    fetch('/api/settings/test-maps')
      .then(r => r.json())
      .then(d => {
        setMapsConfigured(Boolean(d?.googleMapsConfigured));
        setSupabaseConfigured(Boolean(d?.supabaseConfigured));
      })
      .catch(() => {});
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings(settings);
    window.dispatchEvent(new Event('blackdev-settings-updated'));
    showToast('Configurações do BlackDev Leads salvas com sucesso!', 'success');
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      showToast('A nova senha deve ter pelo menos 6 caracteres.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('A confirmação de senha não confere.', 'error');
      return;
    }
    const hash = await sha256Hex(newPassword);
    setGeneratedHash(hash);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('blackdev_admin_pwd_hash_v1', hash);
    }
    setNewPassword('');
    setConfirmPassword('');
    showToast('Senha administrativa atualizada e hash SHA-256 gerado!', 'success');
  };

  const handleTestMaps = async () => {
    setTestingMaps(true);
    setMapsTestResult('');
    try {
      const res = await fetch('/api/settings/test-maps', { method: 'POST' });
      const data = await res.json();
      setMapsTestResult(data?.message || 'Teste concluído.');
      showToast(
        data?.ok ? 'Teste de integração concluído!' : 'Atenção no teste da chave Maps.',
        data?.ok ? 'success' : 'info'
      );
    } catch {
      setMapsTestResult('Falha ao testar integração com Google Maps.');
    } finally {
      setTestingMaps(false);
    }
  };

  return (
    <>
      <Head>
        <title>Configurações — BlackDev Leads</title>
      </Head>

      <AppLayout
        title="Configurações do Sistema · BlackDev Leads"
        subtitle="Gerencie seu perfil administrador, senha, chave padrão de WhatsApp, identidade visual BlackDev e integrações."
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Perfil, Marca, Domínio & Preferências */}
          <form
            onSubmit={handleSaveSettings}
            className="lg:col-span-7 glass-card rounded-2xl p-6 space-y-6 text-xs"
          >
            {/* 1. Perfil Administrador */}
            <div className="space-y-3">
              <h2 className="text-sm font-extrabold text-[--text] uppercase tracking-wider">
                👤 Perfil do Administrador
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-bold block mb-1 text-[--text-3]">
                    Nome de Exibição
                  </label>
                  <input
                    type="text"
                    value={settings.adminName}
                    onChange={e =>
                      setSettings({ ...settings, adminName: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[--border] bg-[--bg-card]"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1 text-[--text-3]">
                    E-mail Administrativo (ADMIN_EMAIL)
                  </label>
                  <input
                    type="email"
                    value={settings.adminEmail}
                    onChange={e =>
                      setSettings({ ...settings, adminEmail: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[--border] bg-[--bg-card]"
                  />
                </div>
              </div>
            </div>

            {/* 2. WhatsApp & Marca BlackDev */}
            <div className="pt-4 border-t border-[--border-dim] space-y-3">
              <h2 className="text-sm font-extrabold text-[--text] uppercase tracking-wider">
                🏷️ Marca BlackDev, WhatsApp & Domínio
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-bold block mb-1 text-[--text-3]">
                    WhatsApp Padrão BlackDev (com DDI + DDD)
                  </label>
                  <input
                    type="text"
                    value={settings.defaultWhatsapp}
                    onChange={e =>
                      setSettings({ ...settings, defaultWhatsapp: e.target.value })
                    }
                    placeholder="5511999999999"
                    className="w-full px-3 py-2 rounded-xl border border-[--border] bg-[--bg-card]"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1 text-[--text-3]">
                    Nome da Marca no Painel
                  </label>
                  <input
                    type="text"
                    value={settings.brandName}
                    onChange={e =>
                      setSettings({ ...settings, brandName: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[--border] bg-[--bg-card]"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1 text-[--text-3]">
                    Cor Destaque da Marca
                  </label>
                  <input
                    type="color"
                    value={settings.brandPrimaryColor}
                    onChange={e =>
                      setSettings({ ...settings, brandPrimaryColor: e.target.value })
                    }
                    className="w-full h-10 rounded-xl border border-[--border] cursor-pointer"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1 text-[--text-3]">
                    Domínio Próprio p/ Publicação (Opcional)
                  </label>
                  <input
                    type="text"
                    value={settings.customDomain}
                    onChange={e =>
                      setSettings({ ...settings, customDomain: e.target.value })
                    }
                    placeholder="Ex: sites.blackdev.com.br"
                    className="w-full px-3 py-2 rounded-xl border border-[--border] bg-[--bg-card]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1 text-[--text-3]">
                  Assinatura no Rodapé dos Sites Gerados
                </label>
                <input
                  type="text"
                  value={settings.brandFooterText}
                  onChange={e =>
                    setSettings({ ...settings, brandFooterText: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[--border] bg-[--bg-card]"
                />
              </div>
            </div>

            {/* 3. Preferências de Geração de Sites */}
            <div className="pt-4 border-t border-[--border-dim] space-y-3">
              <h2 className="text-sm font-extrabold text-[--text] uppercase tracking-wider">
                ⚡ Preferências Padrão de Geração de Sites
              </h2>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoIncludeWhatsappFloat}
                    onChange={e =>
                      setSettings({
                        ...settings,
                        autoIncludeWhatsappFloat: e.target.checked,
                      })
                    }
                    className="accent-[#2563EB]"
                  />
                  <span>Incluir botão flutuante de WhatsApp automaticamente</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoIncludeMaps}
                    onChange={e =>
                      setSettings({ ...settings, autoIncludeMaps: e.target.checked })
                    }
                    className="accent-[#2563EB]"
                  />
                  <span>Incluir Mapa do Google Maps na seção de localização</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoIncludeContactForm}
                    onChange={e =>
                      setSettings({
                        ...settings,
                        autoIncludeContactForm: e.target.checked,
                      })
                    }
                    className="accent-[#2563EB]"
                  />
                  <span>Incluir formulário de contato integrado ao WhatsApp</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#2563EB] text-white font-extrabold text-xs shadow-lg"
            >
              💾 Salvar Todas as Configurações
            </button>
          </form>

          {/* Right Column: Integração Google Maps & Alteração de Senha */}
          <div className="lg:col-span-5 space-y-6 text-xs">
            {/* Google Maps & Supabase Integration Status */}
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <h2 className="text-sm font-extrabold text-[--text] uppercase tracking-wider">
                🗺️ Status da Integração Google Maps & Banco
              </h2>

              <div className="space-y-2.5">
                <div className="p-3.5 rounded-xl border border-[--border] bg-[--bg-card] flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[--text]">GOOGLE_MAPS_API_KEY</div>
                    <div className="text-[11px] text-[--text-4]">
                      Usada exclusivamente no backend (/api/leads/search)
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold ${
                      mapsConfigured
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-amber-500/15 text-amber-400'
                    }`}
                  >
                    {mapsConfigured ? '● Configurada' : '● Modo Fallback Ativo'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-[--border] bg-[--bg-card] flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[--text]">SUPABASE_URL / DATABASE_URL</div>
                    <div className="text-[11px] text-[--text-4]">
                      Persistência de leads, sites e CRM
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold ${
                      supabaseConfigured
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-blue-500/15 text-blue-400'
                    }`}
                  >
                    {supabaseConfigured ? '● Conectado' : '● Persistência Local + SQL'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={testingMaps}
                onClick={handleTestMaps}
                className="w-full py-2.5 rounded-xl border border-[#2563EB] text-[#3B82F6] font-extrabold hover:bg-[#2563EB]/10"
              >
                {testingMaps
                  ? 'Testando chave no servidor...'
                  : '🔌 Testar Chave do Google Maps Agora'}
              </button>

              {mapsTestResult && (
                <div className="p-3.5 rounded-xl bg-[--bg-2] border border-[--border] text-[--text-2] leading-relaxed">
                  {mapsTestResult}
                </div>
              )}
            </div>

            {/* Password Change Card */}
            <form
              onSubmit={handlePasswordChange}
              className="glass-card rounded-2xl p-6 space-y-4"
            >
              <h2 className="text-sm font-extrabold text-[--text] uppercase tracking-wider">
                🔐 Alterar Senha do Administrador
              </h2>

              <div>
                <label className="font-bold block mb-1 text-[--text-3]">
                  Nova Senha
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres..."
                  className="w-full px-3 py-2 rounded-xl border border-[--border] bg-[--bg-card]"
                />
              </div>

              <div>
                <label className="font-bold block mb-1 text-[--text-3]">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha..."
                  className="w-full px-3 py-2 rounded-xl border border-[--border] bg-[--bg-card]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#10B981] text-white font-extrabold"
              >
                Atualizar Senha & Gerar Hash
              </button>

              {generatedHash && (
                <div className="p-3 rounded-xl bg-[--bg-2] border border-[--border] space-y-1">
                  <div className="font-bold text-[#10B981]">
                    ADMIN_PASSWORD_HASH gerado (SHA-256):
                  </div>
                  <code className="block break-all text-[10.5px] text-[--text-3] select-all">
                    {generatedHash}
                  </code>
                </div>
              )}
            </form>
          </div>
        </div>
      </AppLayout>
    </>
  );
};

export default SettingsPage;
