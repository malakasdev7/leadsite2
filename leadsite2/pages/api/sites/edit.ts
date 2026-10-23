import type { NextApiRequest, NextApiResponse } from 'next';
import { SiteConfig } from '../../../utils/leadsiteStore';
import { openai } from '../../../utils/openaiClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { config, instruction }: { config: SiteConfig; instruction: string } = req.body || {};
  if (!config || !instruction) {
    return res.status(400).json({ error: 'Config and instruction are required' });
  }

  const text = instruction.toLowerCase();
  let updated: SiteConfig = { ...config };

  // Try OpenAI if key is available
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_key') {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'Você é o editor conversacional do LeadSite. Receba o JSON atual de configuração do site (SiteConfig) e a instrução do usuário em português, e retorne APENAS o JSON SiteConfig atualizado mantendo todas as chaves.',
          },
          {
            role: 'user',
            content: `Config atual:\n${JSON.stringify(config)}\n\nInstrução do usuário: "${instruction}"`,
          },
        ],
      });
      const rawJson = completion.choices[0]?.message?.content;
      if (rawJson) {
        const parsed = JSON.parse(rawJson);
        return res.status(200).json({
          config: { ...config, ...parsed },
          summary: `Alteração aplicada via IA: "${instruction}"`,
        });
      }
    } catch {
      // Fall back to deterministic natural language rules below
    }
  }

  // Deterministic Portuguese Natural-Language Editor rules
  if (text.includes('verde')) {
    updated.accentColor = '#1FA855';
    updated.primaryColor = '#064E3B';
    updated.secondaryColor = '#047857';
  } else if (text.includes('azul')) {
    updated.accentColor = '#0071E3';
    updated.primaryColor = '#002B5B';
    updated.secondaryColor = '#005EC2';
  } else if (text.includes('vermelho') || text.includes('vinho')) {
    updated.accentColor = '#DC2626';
    updated.primaryColor = '#450A0A';
    updated.secondaryColor = '#7F1D1D';
  } else if (text.includes('roxo') || text.includes('rosa')) {
    updated.accentColor = '#DB2777';
    updated.primaryColor = '#3B0764';
    updated.secondaryColor = '#6B21A8';
  } else if (text.includes('dourado') || text.includes('laranja') || text.includes('amarelo')) {
    updated.accentColor = '#D97706';
    updated.primaryColor = '#111827';
    updated.secondaryColor = '#1F2937';
  }

  if (text.includes('escuro') || text.includes('dark') || text.includes('preto')) {
    updated.darkMode = true;
    updated.primaryColor = '#090D16';
    updated.secondaryColor = '#111827';
  } else if (text.includes('claro') || text.includes('branco') || text.includes('light')) {
    updated.darkMode = false;
  }

  // Extract custom button text if requested
  const btnMatch = instruction.match(/bot[aã]o\s+(?:para|como|dizendo)\s+["']?([^"']+)["']?/i);
  if (btnMatch && btnMatch[1]) {
    updated.ctaText = btnMatch[1].trim();
  } else if (text.includes('agendar') || text.includes('agendamento')) {
    updated.ctaText = 'Agendar Horário pelo WhatsApp';
  } else if (text.includes('orçamento')) {
    updated.ctaText = 'Solicitar Orçamento Grátis';
  } else if (text.includes('desconto') || text.includes('promoção')) {
    updated.ctaText = 'Garantir Desconto no WhatsApp';
    updated.heroSubtitle = `${updated.heroSubtitle} · Condição especial de primeira compra!`;
  }

  // Extract title change if requested
  const titleMatch = instruction.match(/t[ií]tulo\s+(?:para|como)\s+["']?([^"']+)["']?/i);
  if (titleMatch && titleMatch[1]) {
    updated.heroTitle = titleMatch[1].trim();
  }

  // Extract subtitle change if requested
  const subMatch = instruction.match(/subt[ií]tulo\s+(?:para|como)\s+["']?([^"']+)["']?/i);
  if (subMatch && subMatch[1]) {
    updated.heroSubtitle = subMatch[1].trim();
  } else if (
    !text.includes('verde') &&
    !text.includes('azul') &&
    !text.includes('vermelho') &&
    !text.includes('roxo') &&
    !text.includes('dourado') &&
    !text.includes('escuro') &&
    !text.includes('claro') &&
    !titleMatch &&
    !btnMatch
  ) {
    updated.heroSubtitle = `${config.heroSubtitle} — ${instruction}`;
  }

  return res.status(200).json({
    config: updated,
    summary: `Versão gerada com sucesso: "${instruction}"`,
  });
}
