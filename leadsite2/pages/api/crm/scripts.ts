import type { NextApiRequest, NextApiResponse } from 'next';
import { LeadItem } from '../../../utils/leadsiteStore';
import { openai } from '../../../utils/openaiClient';

export type ScriptKind = 'whatsapp' | 'call' | 'meeting' | 'objection';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { lead, kind, siteUrl }: { lead: LeadItem; kind: ScriptKind; siteUrl?: string } =
    req.body || {};

  if (!lead || !kind) {
    return res.status(400).json({ error: 'Lead and kind are required' });
  }

  const previewLink =
    siteUrl ||
    `https://leadsite2.vercel.app/s/${lead.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')}`;

  const owner = lead.ownerName || 'tudo bem';
  const issue = lead.flags.includes('Site fora do ar')
    ? 'está com o site fora do ar no perfil do Google'
    : 'ainda não tem um site oficial cadastrado no perfil do Google Maps';

  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_key') {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content:
              'Você é um especialista brasileiro em vendas de sites locais pelo método LeadSite. Gere scripts diretos, naturais e persuasivos em português do Brasil.',
          },
          {
            role: 'user',
            content: `Gere um roteiro do tipo "${kind}" para o negócio "${lead.name}" (${lead.category} em ${lead.city}/${lead.state}, nota ${lead.rating} com ${lead.reviewsCount} avaliações, diagnóstico: ${lead.flags.join(', ')}). Link do site pronto: ${previewLink}`,
          },
        ],
      });
      const text = completion.choices[0]?.message?.content;
      if (text) {
        return res.status(200).json({ script: text });
      }
    } catch {
      // Fallback to high-converting Brazilian templates below
    }
  }

  const templates: Record<ScriptKind, string> = {
    whatsapp: `Olá, pessoal da *${lead.name}*, ${owner !== 'tudo bem' ? `falo com ${owner}?` : 'tudo bem?'}\n\nVi que vocês têm uma avaliação excelente no Google em ${lead.city} (⭐ ${lead.rating} com ${lead.reviewsCount} avaliações), mas notei que o negócio ${issue}.\n\nComo trabalho criando páginas de alta conversão para ${lead.category.toLowerCase()} na região, tomei a liberdade de montar uma prévia pronta do site de vocês com botão direto pro WhatsApp:\n👉 ${previewLink}\n\nVocê consegue dar uma olhadinha rápida hoje? Se gostar, te explico em 5 minutos como deixamos ele no ar definitivo pra trazer mais clientes de ${lead.city}!`,

    call: `📞 ROTEIRO DE LIGAÇÃO (Objetivo: Agendar reunião rápida de 10 min)\n\n1. ABERTURA (15s):\n"Alô, bom dia! Falo com ${owner} ou com o responsável pela ${lead.name}?"\n"Aqui é [Seu Nome], sou especialista em posicionamento no Google aqui para ${lead.category} em ${lead.city}. Te liguei por um motivo bem rápido:"\n\n2. GANCHO DE VALOR (20s):\n"Eu estava pesquisando ${lead.category.toLowerCase()} em ${lead.city} no Google Maps e vi que a ${lead.name} tem ${lead.reviewsCount} avaliações excelentes (nota ${lead.rating}), mas quando o cliente clica para ver o site de vocês, ${issue}."\n\n3. REVELAÇÃO DO SITE PRONTO (15s):\n"Para você não perder esses clientes para os concorrentes do bairro ${lead.neighborhood || 'da região'}, eu já montei o site da ${lead.name} pronto, com as informações de vocês e botão de pedido/agendamento direto no WhatsApp."\n\n4. CHAMADA PARA AÇÃO (CTA):\n"Não quero te vender nada por telefone. Só quero te mostrar a tela com o site de vocês funcionando por 5 minutinhos no Google Meet hoje às 15h ou amanhã às 10h. Qual horário fica melhor pra você ver?"`,

    meeting: `💻 ROTEIRO DA REUNIÃO (10 a 15 minutos espelhando a tela)\n\n1. QUEBRA-GELO E CONTEXTO (2 min):\n- Parabenize pelas ${lead.reviewsCount} avaliações no Google em ${lead.city}.\n- Mostre na tela que quem pesquisa "${lead.category} em ${lead.city}" hoje encontra concorrentes com site, enquanto a ${lead.name} perde cliques.\n\n2. DEMONSTRAÇÃO AO VIVO DO SITE (4 min):\n- Abra o link ao vivo: ${previewLink}\n- Mostre o cabeçalho personalizado da ${lead.name}, os serviços e os depoimentos.\n- Clique no botão de WhatsApp e mostre que o cliente cai direto na conversa pronta para fechar.\n- Diga: "Se você quiser mudar qualquer cor, foto ou texto agora, eu digito aqui no meu editor e muda na sua frente em 5 segundos."\n\n3. ANCORAGEM E PREÇO (3 min):\n- "Uma agência tradicional cobraria de R$ 2.500 a R$ 4.000 e demoraria 30 dias para entregar isso."\n- "Como o site da ${lead.name} já está pronto e publicado agora, eu consigo liberar o domínio oficial de vocês por apenas R$ 800 à vista (ou no cartão) + R$ 120/mês com hospedagem, SSL e todas as atualizações inclusas."\n\n4. FECHAMENTO IMEDIATO:\n- "Prefere que eu já deixe o link oficial no perfil do Google de vocês hoje no Pix com desconto ou no cartão?"`,

    objection: `🛡️ GUIA DE QUEBRA DE OBJEÇÕES — ${lead.name}\n\n❌ Objeção 1: "Está caro / Estou sem orçamento agora"\n✅ Resposta: "Entendo perfeitamente! Justamente por isso não cobro os R$ 2.500 de uma agência. Quantos clientes novos de ${lead.category.toLowerCase()} precisam clicar no seu botão do WhatsApp no mês para pagar R$ 120? Com 1 ou 2 clientes o site já se paga sozinho. Se fecharmos hoje, consigo fazer a ativação por R$ 497 (ou até R$ 297 de entrada) para você já colocar no Google hoje. Fechado?"\n\n❌ Objeção 2: "Eu já uso o Instagram, não preciso de site"\n✅ Resposta: "O Instagram é ótimo para quem já te conhece, mas quem está com urgência procurando '${lead.category} em ${lead.city}' pesquisa no Google, não no Instagram. Sem site no perfil do Google Maps, o Google entrega esse cliente pronto para o seu concorrente."\n\n❌ Objeção 3: "Vou pensar / Vou falar com meu sócio"\n✅ Resposta: "Claro! Para facilitar para o seu sócio decidir sem precisar imaginar, vou te mandar o link publicado (${previewLink}) agora no WhatsApp. Que horas vocês conversam hoje para eu te ligar 5 minutinhos depois e já ajustar o que ele pedir?"`,
  };

  return res.status(200).json({ script: templates[kind] });
}
