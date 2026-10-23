import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import React, { useState } from 'react';
import { DottedSurface } from '../components/DottedSurface';
import { FaqChatWidget } from '../components/FaqChatWidget';
import {
  BillingInterval,
  calcInstallment12x,
  getPlanFeatureItems,
  LEAD_TIER_STYLES,
  PLAN_ORDER,
  PLANS,
  PriceLine,
} from '../utils/leadsiteConstants';

const FAQ_LIST = [
  {
    q: 'O que exatamente o LeadSite faz?',
    a: 'O LeadSite encontra negócios locais no Google Maps que ainda não têm site (ou estão com o site fora do ar/sem SSL), gera um site profissional personalizado com IA em segundos usando os dados reais do negócio, permite editar conversando em português e já entrega os scripts de WhatsApp, ligação e reunião dentro de um CRM visual.',
  },
  {
    q: 'Preciso saber programar ou configurar hospedagem?',
    a: 'Não! Você clica em "Gerar site", o site nasce pronto e publicado com hospedagem gratuita inclusa em todos os planos. Para alterar textos, cores ou seções, basta digitar o que deseja mudar no chat do editor.',
  },
  {
    q: 'Quanto posso cobrar por cada site vendido?',
    a: 'Nossos usuários costumam cobrar entre R$ 500 e R$ 1.500 à vista pela criação do site, mais uma mensalidade recorrente de R$ 100 a R$ 250 pela hospedagem e manutenção. Com apenas 1 venda você já paga a assinatura e lucra.',
  },
  {
    q: 'Posso usar o domínio próprio do meu cliente?',
    a: 'Sim! Nos planos Pro e Agência você pode conectar o domínio próprio do cliente (ex.: www.marmitariasabor.com.br) e remover ou personalizar a marca d’água no rodapé.',
  },
  {
    q: 'Como funciona a busca de leads por cidade e nicho?',
    a: 'No menu Leads você escolhe o Estado (UF), a Cidade, opcionalmente o Bairro e uma das 55 categorias de negócios locais. O sistema varre os estabelecimentos e destaca quem está Sem site, com Site fora do ar ou Sem SSL.',
  },
  {
    q: 'Existe fidelidade ou multa de cancelamento?',
    a: 'Nenhuma fidelidade. Você pode começar no plano Gratuito sem cartão de crédito e cancelar ou alterar seu plano quando quiser diretamente no painel.',
  },
  {
    q: 'O LeadSite tem relação com o leadsite.io?',
    a: 'Não. O LeadSite é uma plataforma brasileira (useleadsite.com), criada em português para prospecção local e geração de sites com IA.',
  },
];

const Home: NextPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Revenue Simulator state (exact defaults from module 35272: 3 sites, R$ 800 upfront, R$ 120 maint)
  const [sitesPerMonth, setSitesPerMonth] = useState(3);
  const [upfrontPrice, setUpfrontPrice] = useState(800);
  const [monthlyMaint, setMonthlyMaint] = useState(120);

  // Pricing state
  const [interval, setIntervalState] = useState<BillingInterval>('year');
  const [priceLine, setPriceLine] = useState<PriceLine>('local');

  // FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const totalClients12m = sitesPerMonth * 12;
  const mrrAfter12m = totalClients12m * monthlyMaint;
  const firstYearTotal = 12 * sitesPerMonth * upfrontPrice + monthlyMaint * sitesPerMonth * 78;
  const freedomNumber = sitesPerMonth * upfrontPrice + 12 * sitesPerMonth * monthlyMaint;

  const formatCurrency = (val: number) =>
    priceLine === 'local'
      ? `R$ ${Math.round(val).toLocaleString('pt-BR')}`
      : `US$ ${Math.round(val).toLocaleString('en-US')}`;

  return (
    <>
      <Head>
        <title>LeadSite — Encontre clientes sem site no Google Maps e gere sites com IA</title>
        <meta
          name="description"
          content="Busque negócios sem site no Google Maps, gere e edite o site com IA em um clique e feche vendas no WhatsApp com nosso CRM."
        />
      </Head>

      <div className="relative min-h-screen overflow-x-hidden bg-[--bg] text-[--text]">
        {/* Header Navigation */}
        <header className="sticky top-0 z-50 glass-sidebar border-b border-[--border-dim]">
          <nav className="max-w-6xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
            <a href="#topo" className="flex items-center gap-2">
              <img src="/logo.svg" alt="LeadSite" className="logo-img h-[20px] w-auto" />
            </a>

            <div className="hidden md:flex items-center gap-7">
              <a
                href="#passo-a-passo"
                className="text-[13px] font-medium text-[--text-3] hover:text-[--text] transition-colors"
              >
                Passo a passo
              </a>
              <a
                href="#telas"
                className="text-[13px] font-medium text-[--text-3] hover:text-[--text] transition-colors"
              >
                As telas
              </a>
              <a
                href="#mentoria"
                className="text-[13px] font-medium text-[--text-3] hover:text-[--text] transition-colors"
              >
                Mentoria
              </a>
              <a
                href="#precos"
                className="text-[13px] font-medium text-[--text-3] hover:text-[--text] transition-colors"
              >
                Preços
              </a>
              <a
                href="#faq"
                className="text-[13px] font-medium text-[--text-3] hover:text-[--text] transition-colors"
              >
                FAQ
              </a>
              <Link
                href="/dados"
                className="text-[13px] font-medium text-[--text-3] hover:text-[--text] transition-colors"
              >
                Dados 2026
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/dashboard"
                className="text-[13px] font-semibold text-[--text-2] hover:text-[--text] transition-colors"
              >
                Entrar no Painel
              </Link>
              <Link
                href="/leads"
                className="text-[13px] font-bold px-4 py-2 rounded-full text-white transition-all hover:opacity-90"
                style={{ background: '#0071E3' }}
              >
                Começar grátis
              </Link>
            </div>

            <button
              onClick={() => setMobileMenuOpen(v => !v)}
              className="md:hidden p-2 text-[--text-2]"
              aria-label="Menu"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </nav>

          {mobileMenuOpen && (
            <div className="md:hidden glass-popup border-t border-[--border-dim] px-5 py-4 flex flex-col gap-2">
              <a href="#passo-a-passo" onClick={() => setMobileMenuOpen(false)} className="py-1.5 text-[14px]">
                Passo a passo
              </a>
              <a href="#telas" onClick={() => setMobileMenuOpen(false)} className="py-1.5 text-[14px]">
                As telas
              </a>
              <a href="#precos" onClick={() => setMobileMenuOpen(false)} className="py-1.5 text-[14px]">
                Preços
              </a>
              <Link href="/leads" className="mt-2 text-center font-bold text-white py-2.5 rounded-full" style={{ background: '#0071E3' }}>
                Abrir Painel Agora
              </Link>
            </div>
          )}
        </header>

        {/* Hero Section with 3D Wave Particles & Mac Window Mockup */}
        <section id="topo" className="relative overflow-hidden">
          <DottedSurface />
          <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-12">
            <div
              className="lp-glow"
              style={{
                width: 420,
                height: 420,
                background: 'rgba(0,113,227,0.18)',
                top: -80,
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            />
            <div className="relative text-center max-w-3xl mx-auto">
              <img
                src="/logo-mark.svg"
                alt="LeadSite"
                className="logo-img h-28 sm:h-36 w-auto mx-auto mb-6"
              />
              <h1 className="text-[clamp(2.1rem,5.5vw,3.8rem)] font-extrabold leading-[1.06] tracking-tight text-[--text]">
                Aprenda a usar o <span className="lp-gradient-text">LeadSite</span> e feche clientes em minutos
              </h1>
              <p className="mt-5 text-[clamp(1rem,2vw,1.2rem)] text-[--text-3] leading-relaxed max-w-2xl mx-auto">
                Busque negócios <strong className="text-[--text-2]">sem site no Google Maps</strong>, gere e edite o site com inteligência artificial em um clique e feche a venda no{' '}
                <strong className="text-[--text-2]">CRM com script pronto para WhatsApp</strong>.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/leads"
                  className="inline-flex items-center gap-2 text-[15px] font-bold px-7 py-3.5 rounded-full text-white transition-all hover:opacity-90 shadow-lg"
                  style={{ background: '#0071E3', boxShadow: '0 8px 28px rgba(0,113,227,0.35)' }}
                >
                  Começar grátis no Painel →
                </Link>
                <a
                  href="#passo-a-passo"
                  className="inline-flex items-center gap-2 text-[15px] font-semibold px-7 py-3.5 rounded-full glass-btn border border-[--border]"
                >
                  Ver o passo a passo
                </a>
              </div>

              <p className="mt-5 text-[12px] text-[--text-4] flex items-center justify-center gap-x-5 gap-y-1 flex-wrap">
                <span className="inline-flex items-center gap-1.5">
                  <span style={{ color: '#1A7E3A' }}>✓</span> Tudo dentro do painel
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span style={{ color: '#1A7E3A' }}>✓</span> Sem instalar nada
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span style={{ color: '#1A7E3A' }}>✓</span> Feito para o Brasil
                </span>
              </p>
            </div>

            {/* Interactive Mac Window Preview (app.useleadsite.com/pipeline) */}
            <div className="relative mt-12 max-w-4xl mx-auto">
              <div className="rounded-2xl overflow-hidden glass-card">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[--border-dim]">
                  <span className="w-3 h-3 rounded-full" style={{ background: '#FF5F57' }} />
                  <span className="w-3 h-3 rounded-full" style={{ background: '#FEBC2E' }} />
                  <span className="w-3 h-3 rounded-full" style={{ background: '#28C840' }} />
                  <div className="ml-3 flex-1 max-w-[280px] text-[11px] text-[--text-4] bg-[--bg-dark] rounded-md px-3 py-1 truncate">
                    app.useleadsite.com/pipeline
                  </div>
                  <Link
                    href="/leads"
                    className="ml-auto text-[11px] font-bold text-[#0071E3] hover:underline"
                  >
                    Testar ao vivo →
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-[1.1fr_1fr] gap-0">
                  {/* Left Column: Found Leads */}
                  <div className="p-4 sm:p-5 border-b sm:border-b-0 sm:border-r border-[--border-dim]">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[13px] font-bold text-[--text]">Leads encontrados</span>
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ color: '#0071E3', background: 'rgba(0,113,227,0.12)' }}
                      >
                        +60 novos
                      </span>
                    </div>

                    <div className="flex flex-col gap-2">
                      {[
                        { name: 'Marmitaria Sabor Caseiro', cat: 'Restaurante · Goiânia', score: 92, tier: 'quente' as const, noSite: true },
                        { name: 'Studio Bella Hair', cat: 'Salão · Goiânia', score: 78, tier: 'morno' as const, noSite: true },
                        { name: 'Auto Center Silva', cat: 'Oficina · Aparecida', score: 64, tier: 'morno' as const, noSite: false },
                        { name: 'Pet Shop Amigo Fiel', cat: 'Pet · Goiânia', score: 41, tier: 'frio' as const, noSite: true },
                      ].map((item, idx) => {
                        const st = LEAD_TIER_STYLES[item.tier];
                        return (
                          <div
                            key={idx}
                            className="bg-[--bg-2] border border-[--border-dim] rounded-xl px-3 py-2.5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[12px] font-semibold text-[--text] truncate">
                                {item.name}
                              </span>
                              <span className="text-[11px] font-bold shrink-0" style={{ color: st.color }}>
                                {item.score}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                              <span className="text-[10px] text-[--text-4]">{item.cat}</span>
                              <span
                                className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                                style={{ color: st.color, background: st.bg }}
                              >
                                {st.label}
                              </span>
                              {item.noSite && (
                                <span
                                  className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                                  style={{ color: '#D92D20', background: '#FFF5F4' }}
                                >
                                  Sem site
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Generated Site Preview */}
                  <div className="p-4 sm:p-5 bg-[--bg-dark]/40 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[13px] font-bold text-[--text]">Site gerado</span>
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
                          style={{ background: '#0071E3' }}
                        >
                          ● Publicado
                        </span>
                      </div>

                      <div className="rounded-xl overflow-hidden border border-[--border-dim] bg-white">
                        <div
                          className="h-24 flex flex-col items-center justify-center text-center px-3"
                          style={{
                            background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 60%, #0F3460 100%)',
                          }}
                        >
                          <span className="text-[13px] font-extrabold text-white">
                            Marmitaria Sabor Caseiro
                          </span>
                          <span className="text-[9px] text-white/75 mt-0.5">
                            Comida caseira fresquinha todo dia
                          </span>
                          <span
                            className="mt-2 text-[9px] font-bold text-white rounded-full px-3 py-1"
                            style={{ background: '#1FA855' }}
                          >
                            Pedir no WhatsApp
                          </span>
                        </div>
                        <div className="p-3 grid grid-cols-3 gap-1.5">
                          {['#F4C95D', '#E8A87C', '#C38D9E'].map((c, i) => (
                            <div
                              key={i}
                              className="h-9 rounded-md"
                              style={{ background: c, opacity: 0.85 }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2 bg-[--bg-2] border border-[--border-dim] rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: '#0071E3' }} />
                        <span className="text-[11px] text-[--text-3]">
                          “deixe o botão verde” · ajustado num clique
                        </span>
                      </div>
                      <Link
                        href="/studio?siteId=site-1"
                        className="text-[11px] font-bold text-[#0071E3] hover:underline shrink-0"
                      >
                        Abrir Editor →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-y border-[--border-dim] bg-[--bg-2]/40">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '557.168+', label: 'negócios brasileiros analisados' },
              { value: '3.400+', label: 'sites publicados com IA' },
              { value: '4,9/5', label: 'avaliação dos usuários' },
              { value: '< 30s', label: 'para gerar e publicar um site' },
            ].map((s, i) => (
              <div key={i}>
                <div className="text-[clamp(1.5rem,3vw,2rem)] font-extrabold text-[--text]">
                  {s.value}
                </div>
                <div className="text-[12px] text-[--text-4] mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 6 Steps Section */}
        <section id="passo-a-passo" className="relative max-w-6xl mx-auto px-5 sm:px-8 py-14 sm:py-18">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-[13px] font-bold uppercase tracking-wider" style={{ color: '#0071E3' }}>
              Passo a passo
            </span>
            <h2 className="mt-3 text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold tracking-tight text-[--text]">
              Como usar o LeadSite, do começo ao fechamento.
            </h2>
            <p className="mt-3 text-[15px] text-[--text-3]">
              Seis passos, na ordem exata em que você faz no painel. Siga cada um e feche seu primeiro cliente hoje.
            </p>
          </div>

          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                title: 'Busque negócios sem site',
                body: 'Abra o menu Leads. Escolha Estado, Cidade e a Categoria (55 nichos), defina a quantidade e clique em Buscar. O LeadSite marca quem precisa de você: Sem site, Site fora do ar, Sem SSL.',
                href: '/leads',
              },
              {
                title: 'Envie os melhores para o CRM',
                body: 'Marque os leads mais quentes (Score alto) e clique em Enviar para CRM. Eles entram direto no seu funil visual Kanban ou podem ser exportados em CSV.',
                href: '/crm',
              },
              {
                title: 'Gere o site com um clique',
                body: 'No card do lead, clique em Gerar site. Em segundos a IA monta um site profissional e responsivo com nome, endereço, telefone, avaliações e serviços do negócio.',
                href: '/leads',
              },
              {
                title: 'Edite conversando, sem código',
                body: 'O site abre no Editor (/studio). Descreva a mudança em português no chat (ex.: "deixe o botão verde") e volte quando quiser no Histórico de versões.',
                href: '/studio',
              },
              {
                title: 'Publique e mostre para o cliente',
                body: 'Clique em Copiar Link Público e mande para o cliente ver na hora. Hospedagem gratuita já inclusa em todos os planos.',
                href: '/s/marmitaria-sabor-caseiro',
              },
              {
                title: 'Aborde e feche no CRM',
                body: 'Abra o lead no CRM e gere na hora Mensagem WhatsApp, Roteiro de Ligação, Roteiro da Reunião e Quebra de Objeções. Marque reuniões em Agendamentos.',
                href: '/crm',
              },
            ].map((step, i) => (
              <div key={i} className="glass-card rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className="w-8 h-8 rounded-full text-white text-[13px] font-bold flex items-center justify-center shrink-0"
                      style={{ background: '#0071E3' }}
                    >
                      {i + 1}
                    </span>
                    <h3 className="text-[16px] font-bold text-[--text]">{step.title}</h3>
                  </div>
                  <p className="text-[13.5px] text-[--text-3] leading-relaxed">{step.body}</p>
                </div>
                <Link
                  href={step.href}
                  className="mt-4 inline-flex items-center gap-1 text-[12.5px] font-bold text-[#0071E3] hover:underline"
                >
                  Abrir esta ferramenta →
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* As Telas Section */}
        <section id="telas" className="max-w-6xl mx-auto px-5 sm:px-8 py-12">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-[13px] font-bold uppercase tracking-wider" style={{ color: '#0071E3' }}>
              As telas
            </span>
            <h2 className="mt-2 text-[clamp(1.8rem,4vw,2.5rem)] font-extrabold tracking-tight text-[--text]">
              Cada tela do menu e para que ela serve.
            </h2>
          </div>

          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { title: 'Dashboard', body: 'Sua visão geral. Acompanhe leads encontrados, sites gerados, cotas do plano e o andamento do funil.', href: '/dashboard' },
              { title: 'Leads (Google Maps)', body: 'Onde tudo começa. Busque por Estado, Cidade, Bairro e 55 Categorias e veja quem está sem site de verdade.', href: '/leads' },
              { title: 'Editor de Site IA (/studio)', body: 'Gere e edite conversando em português. Cada ajuste vira uma versão no Histórico de versões.', href: '/studio' },
              { title: 'CRM Visual em Kanban', body: 'Arraste os leads pelas 6 etapas do funil e gere Mensagem WhatsApp e Roteiro de Ligação com 1 clique.', href: '/crm' },
              { title: 'Agendamentos', body: 'Nada de esquecer follow-up. Toda reunião ou vídeo-chamada marcada no CRM aparece organizada por data.', href: '/crm?tab=appointments' },
              { title: 'Raio-X de Dados do Brasil', body: 'Estudo exclusivo com 557.168 negócios locais analisados por nicho e estado brasileiro.', href: '/dados' },
            ].map((sc, i) => (
              <Link
                key={i}
                href={sc.href}
                className="glass-card rounded-2xl p-6 transition-transform hover:-translate-y-1 block"
              >
                <h3 className="text-[16px] font-bold text-[--text] mb-2">{sc.title}</h3>
                <p className="text-[13.5px] text-[--text-3] leading-relaxed">{sc.body}</p>
                <span className="mt-3 inline-block text-[12px] font-bold text-[#0071E3]">
                  Acessar tela →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Mentoria Banner */}
        <section id="mentoria" className="max-w-6xl mx-auto px-5 sm:px-8 py-10">
          <div
            className="relative rounded-3xl overflow-hidden px-6 py-12 sm:px-12 sm:py-14"
            style={{
              background: 'linear-gradient(150deg, #06251A 0%, #0A3D2A 45%, #128C4A 100%)',
            }}
          >
            <div className="relative grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <span
                  className="inline-flex items-center gap-2 text-[12px] font-semibold px-3 py-1 rounded-full text-white"
                  style={{
                    background: 'rgba(255,255,255,0.14)',
                    border: '1px solid rgba(255,255,255,0.22)',
                  }}
                >
                  👑 Time de elite de vendas
                </span>
                <h2 className="mt-4 text-[clamp(1.7rem,3.8vw,2.4rem)] font-extrabold tracking-tight text-white leading-[1.1]">
                  Entre na mentoria e aprenda a vender como os melhores.
                </h2>
                <p className="mt-3 text-[15px] text-white/80 leading-relaxed max-w-lg">
                  O LeadSite entrega os leads e os sites. Na mentoria você aprende a parte que fecha a venda: abordagem, preço e negociação.
                </p>
                <ul className="mt-5 space-y-2 text-[14px] text-white/90">
                  <li>✓ Aulas e bastidores de quem vende site todo dia</li>
                  <li>✓ Modelos de abordagem e negociação prontos</li>
                  <li>✓ Comunidade para tirar dúvidas e trocar clientes</li>
                </ul>
              </div>
              <div className="flex flex-col items-center lg:items-end gap-2">
                <a
                  href="https://chat.whatsapp.com/JfcLZuArHTMKF4SBUPQuGZ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 text-[15px] font-bold px-8 py-4 rounded-full text-[#06251A] bg-white hover:opacity-90 shadow-xl"
                >
                  Entrar no grupo de mentoria →
                </a>
                <span className="text-[12px] text-white/70">Grupo no WhatsApp · Vagas limitadas</span>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Revenue Simulator */}
        <section className="relative max-w-6xl mx-auto px-5 sm:px-8 py-14">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-[12px] font-semibold px-3 py-1 rounded-full border border-[--border] glass-btn">
              📈 Modelo de receita recorrente
            </span>
            <h2 className="mt-3 text-[clamp(1.8rem,4vw,2.5rem)] font-extrabold tracking-tight text-[--text]">
              Quanto você pode faturar
            </h2>
            <p className="mt-2 text-[14px] text-[--text-3]">
              Ajuste os controles e veja sua projeção de receita personalizada vendendo sites + manutenção mensal.
            </p>
          </div>

          <div className="mt-8 max-w-4xl mx-auto glass-card rounded-3xl p-6 sm:p-8">
            <div className="grid sm:grid-cols-3 gap-7">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-[--text-4]">
                  Sites vendidos / mês
                </div>
                <div className="text-[28px] font-extrabold text-[#0071E3] mt-1">{sitesPerMonth}</div>
                <input
                  type="range"
                  min={1}
                  max={15}
                  step={1}
                  value={sitesPerMonth}
                  onChange={e => setSitesPerMonth(Number(e.target.value))}
                  className="w-full mt-3 accent-[#0071E3] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-[--text-4] mt-1">
                  <span>1</span>
                  <span>15</span>
                </div>
              </div>

              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-[--text-4]">
                  Preço à vista por site
                </div>
                <div className="text-[28px] font-extrabold text-[#0071E3] mt-1">
                  {formatCurrency(upfrontPrice)}
                </div>
                <input
                  type="range"
                  min={300}
                  max={3000}
                  step={50}
                  value={upfrontPrice}
                  onChange={e => setUpfrontPrice(Number(e.target.value))}
                  className="w-full mt-3 accent-[#0071E3] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-[--text-4] mt-1">
                  <span>{formatCurrency(300)}</span>
                  <span>{formatCurrency(3000)}</span>
                </div>
              </div>

              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-[--text-4]">
                  Manutenção mensal
                </div>
                <div className="text-[28px] font-extrabold text-[#0071E3] mt-1">
                  {formatCurrency(monthlyMaint)}
                </div>
                <input
                  type="range"
                  min={50}
                  max={300}
                  step={10}
                  value={monthlyMaint}
                  onChange={e => setMonthlyMaint(Number(e.target.value))}
                  className="w-full mt-3 accent-[#0071E3] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-[--text-4] mt-1">
                  <span>{formatCurrency(50)}</span>
                  <span>{formatCurrency(300)}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              <div className="rounded-2xl p-5 text-center bg-[--bg-2] border border-[--border-dim]">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[--text-4]">
                  Receita recorrente mensal
                </div>
                <div className="text-[13px] text-[--text-3] mt-1">
                  {sitesPerMonth}/mês × 12 = <strong>{totalClients12m} clientes</strong>
                </div>
                <div className="text-[32px] font-extrabold text-[#0071E3] mt-1">
                  {formatCurrency(mrrAfter12m)}
                </div>
                <div className="text-[11px] text-[--text-4] mt-1">depois de 12 meses vendendo</div>
              </div>

              <div className="rounded-2xl p-5 text-center bg-[--bg-2] border border-[--border-dim]">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[--text-4]">
                  Receita anual potencial
                </div>
                <div className="text-[13px] text-[--text-3] mt-1">Vendas à vista + manutenção</div>
                <div className="text-[32px] font-extrabold text-[#0071E3] mt-1">
                  {formatCurrency(firstYearTotal)}
                </div>
                <div className="text-[11px] text-[--text-4] mt-1">projeção acumulada do 1º ano</div>
              </div>
            </div>

            <div
              className="mt-4 rounded-2xl px-6 py-7 text-center text-white"
              style={{
                background: 'linear-gradient(150deg, #003A75 0%, #0071E3 100%)',
                boxShadow: '0 16px 40px rgba(0,113,227,0.3)',
              }}
            >
              <div className="text-[11px] font-bold uppercase tracking-wider text-white/80">
                Seu número da liberdade
              </div>
              <div className="text-[clamp(2.2rem,5vw,3.2rem)] font-extrabold mt-1 leading-none">
                {formatCurrency(freedomNumber)}
              </div>
              <div className="text-[13px] text-white/85 mt-2">
                renda mensal total após 12 meses
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section (#precos) */}
        <section id="precos" className="relative max-w-6xl mx-auto px-5 sm:px-8 py-14">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-[13px] font-bold uppercase tracking-wider" style={{ color: '#0071E3' }}>
              Planos
            </span>
            <h2 className="mt-2 text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold tracking-tight text-[--text]">
              Escolha o plano e comece a vender.
            </h2>
            <p className="mt-2 text-[14px] text-[--text-3]">
              Sem cartão para começar. Sem fidelidade. Cancele quando quiser.
            </p>

            <div className="mt-6 inline-flex items-center gap-1 p-1 rounded-full glass-btn border border-[--border]">
              <button
                onClick={() => setIntervalState('month')}
                className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all ${
                  interval === 'month' ? 'text-white' : 'text-[--text-3]'
                }`}
                style={interval === 'month' ? { background: '#0071E3' } : undefined}
              >
                Mensal
              </button>
              <button
                onClick={() => setIntervalState('year')}
                className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all inline-flex items-center gap-1.5 ${
                  interval === 'year' ? 'text-white' : 'text-[--text-3]'
                }`}
                style={interval === 'year' ? { background: '#0071E3' } : undefined}
              >
                Anual
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: interval === 'year' ? 'rgba(255,255,255,0.22)' : 'rgba(26,126,58,0.14)',
                    color: interval === 'year' ? '#fff' : '#1A7E3A',
                  }}
                >
                  -35%
                </span>
              </button>
            </div>
          </div>

          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
            {PLAN_ORDER.map(pid => {
              const plan = PLANS[pid];
              const isYear = interval === 'year';
              const isLocal = priceLine === 'local';
              const monthlyCents = isLocal ? plan.monthlyPrice : plan.monthlyPriceUsd;
              const yearlyCents = isLocal ? plan.yearlyPrice : plan.yearlyPriceUsd;
              const activeCents = isYear ? yearlyCents : monthlyCents;
              const installment12x = isYear && activeCents > 0 && isLocal ? calcInstallment12x(activeCents) : 0;
              const highlight = !!plan.highlight;
              const features = getPlanFeatureItems(pid, interval);

              return (
                <div
                  key={pid}
                  className={`relative h-full rounded-2xl p-6 flex flex-col ${
                    highlight ? '' : 'glass-card'
                  }`}
                  style={
                    highlight
                      ? {
                          background: 'linear-gradient(160deg, #0071E3, #005EC2)',
                          boxShadow: '0 16px 40px rgba(0,113,227,0.35)',
                        }
                      : undefined
                  }
                >
                  {highlight && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-bold px-3 py-1 rounded-full text-[#0071E3] bg-white shadow">
                      Mais popular
                    </span>
                  )}

                  <div className={`text-[16px] font-bold ${highlight ? 'text-white' : 'text-[--text]'}`}>
                    {plan.name}
                  </div>
                  <div className={`text-[12px] mt-1 ${highlight ? 'text-white/80' : 'text-[--text-4]'}`}>
                    {plan.description}
                  </div>

                  <div className="mt-5 flex items-end gap-1">
                    <span
                      className={`text-[28px] font-extrabold leading-none ${
                        highlight ? 'text-white' : 'text-[--text]'
                      }`}
                    >
                      {activeCents === 0 ? (
                        'Grátis'
                      ) : isYear && isLocal ? (
                        <>
                          <span className="text-[15px] mr-1">12x</span>
                          R$ {installment12x.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </>
                      ) : isLocal ? (
                        `R$ ${(activeCents / 100).toLocaleString('pt-BR')}`
                      ) : (
                        `US$ ${(activeCents / 100).toLocaleString('en-US')}`
                      )}
                    </span>
                    {activeCents > 0 && !isYear && (
                      <span className={`text-[12px] ${highlight ? 'text-white/75' : 'text-[--text-4]'}`}>
                        /mês
                      </span>
                    )}
                  </div>

                  {isYear && activeCents > 0 && (
                    <div className="mt-1.5 flex flex-col gap-1">
                      <div className={`text-[11px] ${highlight ? 'text-white/80' : 'text-[--text-4]'}`}>
                        {isLocal
                          ? `ou R$ ${(activeCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} à vista no Pix`
                          : `US$ ${(activeCents / 100).toLocaleString('en-US')} cobrado anualmente`}
                      </div>
                      <span
                        className="self-start inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={
                          highlight
                            ? { background: 'rgba(255,255,255,0.22)', color: '#fff' }
                            : { background: 'rgba(26,126,58,0.12)', color: '#1A7E3A' }
                        }
                      >
                        Economize {isLocal ? 'R$' : 'US$'}{' '}
                        {((12 * monthlyCents - yearlyCents) / 100).toLocaleString('pt-BR')}/ano
                      </span>
                    </div>
                  )}

                  <Link
                    href={`/leads?plan=${pid}`}
                    className={`mt-5 text-center text-[13.5px] font-bold px-4 py-2.5 rounded-full transition-all ${
                      highlight
                        ? 'bg-white text-[#0071E3] hover:opacity-90'
                        : 'text-white hover:opacity-90'
                    }`}
                    style={highlight ? undefined : { background: '#0071E3' }}
                  >
                    {activeCents === 0 ? 'Começar grátis' : `Escolher ${plan.name}`}
                  </Link>

                  <ul className="mt-6 flex flex-col gap-2">
                    {features.map(f => (
                      <li
                        key={f.key}
                        className={`flex items-start gap-2 text-[12.5px] ${
                          f.ok
                            ? highlight
                              ? 'text-white/90'
                              : 'text-[--text-2]'
                            : highlight
                            ? 'text-white/35'
                            : 'text-[--text-4] opacity-50'
                        }`}
                      >
                        <span className="mt-0.5 shrink-0 font-bold">
                          {f.ok ? '✓' : '–'}
                        </span>
                        <span>{f.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => setPriceLine(p => (p === 'local' ? 'global' : 'local'))}
              className="text-[12px] text-[--text-4] hover:text-[--text] underline"
            >
              {priceLine === 'local'
                ? 'Precisa buscar leads fora do Brasil? Ver planos globais em Dólar (USD)'
                : 'Voltar para planos nacionais em Real (BRL)'}
            </button>
          </div>
        </section>

        {/* FAQ Accordion */}
        <section id="faq" className="max-w-3xl mx-auto px-5 sm:px-8 py-12">
          <h2 className="text-center text-[clamp(1.8rem,4vw,2.5rem)] font-extrabold tracking-tight text-[--text] mb-8">
            Perguntas frequentes
          </h2>
          <div className="flex flex-col gap-3">
            {FAQ_LIST.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="glass-card rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="text-[15px] font-semibold text-[--text]">{item.q}</span>
                    <span className="text-[--text-4] font-bold">{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-[14px] text-[--text-3] leading-relaxed">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Final CTA */}
        <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-16">
          <div
            className="relative rounded-3xl overflow-hidden px-6 py-14 text-center"
            style={{
              background: 'linear-gradient(150deg, #001E3C 0%, #003A75 45%, #0071E3 100%)',
            }}
          >
            <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-extrabold tracking-tight text-white max-w-2xl mx-auto leading-[1.1]">
              Agora é com você. Abra o menu Leads e faça a primeira busca.
            </h2>
            <p className="mt-3 text-[15px] text-white/80 max-w-xl mx-auto">
              Grátis para começar. Sem cartão. Cancele quando quiser.
            </p>
            <div className="mt-7">
              <Link
                href="/leads"
                className="inline-flex items-center gap-2 text-[15px] font-bold px-8 py-4 rounded-full bg-white text-[#0071E3] hover:opacity-90 shadow-xl"
              >
                Começar grátis agora →
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[--border-dim]">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <img src="/logo.svg" alt="LeadSite" className="logo-img h-[18px] w-auto" />
            <div className="flex items-center gap-6 text-[13px] text-[--text-4] flex-wrap justify-center">
              <Link href="/leads" className="hover:text-[--text-2]">
                Buscar Leads
              </Link>
              <Link href="/studio" className="hover:text-[--text-2]">
                Editor IA
              </Link>
              <Link href="/crm" className="hover:text-[--text-2]">
                CRM & Scripts
              </Link>
              <Link href="/dados" className="hover:text-[--text-2]">
                Dados 2026
              </Link>
            </div>
            <div className="text-[12px] text-[--text-4]">© 2026 LeadSite</div>
          </div>
        </footer>

        <FaqChatWidget place="lp" />
      </div>
    </>
  );
};

export default Home;
