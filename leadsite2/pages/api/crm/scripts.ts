import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    type = 'whatsapp_inicial',
    objectionKey = 'esta_caro',
    leadName = 'Seu Negócio',
    category = 'Comércio Local',
    city = 'sua cidade',
    state = 'BR',
    rating = 4.8,
    reviewsCount = 85,
    ownerName = '',
    flags = ['Sem site'],
    publicUrl = '',
  } = req.body || {};

  const greetingName = ownerName ? ownerName.split(' ')[0] : 'tudo bem';
  const siteLink =
    publicUrl ||
    `https://leadsite2.vercel.app/site/${leadName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')}`;

  const mainIssue = Array.isArray(flags) && flags.length > 0 ? flags[0] : 'Sem site';
  const issueContext =
    mainIssue === 'Sem site'
      ? `ainda não tem um site oficial cadastrado na ficha do Google Maps`
      : mainIssue === 'Site fora do ar'
      ? `está com o link do site fora do ar no Google Maps (perdendo clientes que clicam)`
      : mainIssue === 'Site sem SSL' || mainIssue === 'Sem SSL'
      ? `está abrindo com aviso de "Site Não Seguro" (sem certificado SSL/HTTPS)`
      : `está com o site desatualizado para celular e sem botão direto de WhatsApp`;

  const scriptsMap: Record<string, string> = {
    whatsapp_inicial: `Olá${ownerName ? `, ${greetingName}` : ''}! Tudo bem? Aqui é o Gustavo, da BlackDev Digital.

Estava pesquisando por *${category}* em *${city}/${state}* no Google Maps e vi que o *${leadName}* tem uma avaliação excelente (⭐ ${rating} com ${reviewsCount} avaliações), mas notei que ${issueContext}.

Como muita gente pesquisa em ${city} pelo celular antes de escolher onde ir, tomei a liberdade de montar uma prévia de como ficaria o site profissional de vocês, já com botão direto pro WhatsApp, avaliações e localização:

👉 ${siteLink}

Dá uma olhadinha rápida e me diz: gostou do estilo? Se fizer sentido, te explico em 5 minutinhos como colocar no ar ainda hoje!`,

    whatsapp_followup: `Oi${ownerName ? `, ${greetingName}` : ''}! Tudo tranquilo por aí na correria do *${leadName}*?

Passei só pra saber se você conseguiu abrir o link da demonstração que montei pro negócio de vocês em *${city}*:
👉 ${siteLink}

Pergunto porque deixei a estrutura pré-configurada para o nicho de *${category}* (com botão flutuante de WhatsApp e mapa integrado).

Podemos bater um papo rápido de 5 minutos hoje à tarde para eu te mostrar como ele ajuda a converter quem busca por ${category} no Google?`,

    ligacao: `📞 ROTEIRO DE LIGAÇÃO — ${leadName.toUpperCase()} (${city}/${state})

1. ABERTURA NATURAL (15s)
"Alô, bom dia! Eu falo com o responsável pelo *${leadName}*${ownerName ? ` (o ${greetingName})` : ''}?
Prazer, aqui é o Gustavo, sou desenvolvedor web da BlackDev. Te liguei rapidinho porque encontrei vocês no Google Maps procurando por *${category}* em *${city}*."

2. DIAGNÓSTICO E GATILHO DE AUTORIDADE (25s)
"Vi que vocês têm uma reputação excelente no Google — nota ${rating} com ${reviewsCount} avaliações — mas percebi que o negócio ${issueContext}. Hoje, mais de 70% dos clientes que procuram ${category} em ${city} clicam no botão 'Website' do Google antes de chamar."

3. PROPOSTA IRRECUSÁVEL — O SITE JÁ ESTÁ PRONTO (20s)
"Ao invés de te ligar tentando vender uma ideia do zero, eu mesmo já criei uma versão pronta do site do *${leadName}* com suas informações, fotos e botão direto pro WhatsApp."

4. CHAMADA PARA AÇÃO (CTA)
"Posso te mandar o link agora nesse WhatsApp para você abrir aí no celular e agendarmos uma conversa rápida de 10 minutos para ajustar os detalhes?"`,

    reuniao: `💻 ROTEIRO DE REUNIÃO DE FECHAMENTO — ${leadName.toUpperCase()}

1. QUEBRA-GELO E CONTEXTO (2 min)
• Parabenizar pela nota ⭐ ${rating} (${reviewsCount} avaliações) em ${city}/${state}.
• Mostrar a ficha atual no Google Maps e apontar o problema identificado: *${mainIssue}*.

2. APRESENTAÇÃO DO SITE AO VIVO (5 min)
• Compartilhar a tela com a página publicada: ${siteLink}
• Destacar os 4 pilares pensados para *${category}*:
  1) Carregamento instantâneo no celular com identidade visual de agência.
  2) Botão flutuante de WhatsApp e botão de ligação com 1 clique.
  3) Seção de serviços claros + avaliações reais do Google que geram confiança imediata.
  4) Mapa do Google Maps integrado e SEO local para ranquear buscas de "${category} em ${city}".

3. BENEFÍCIOS PRÁTICOS E FECHAMENTO (3 min)
• "Um único cliente novo por semana vindo do Google já paga o projeto inteiro com folga."
• "Se aprovarmos agora, já conecto no seu domínio e na sua ficha do Google Meu Negócio hoje mesmo. Como fica melhor para fecharmos: PIX com desconto ou parcelado?"`,
  };

  const objectionsMap: Record<string, string> = {
    ja_tenho_site: `🛡️ QUEBRA DE OBJEÇÃO: "JÁ TENHO SITE" — ${leadName}

"Perfeito${ownerName ? `, ${greetingName}` : ''}! Inclusive eu abri o endereço atual de vocês antes de te chamar e notei que ele ${
      mainIssue === 'Sem site'
        ? 'não está vinculado corretamente na ficha do Google Maps'
        : issueContext
    }.

O objetivo dessa nova estrutura que montei (${siteLink}) não é só 'ter um site no ar', mas transformar cada clique do Google em *${city}* em uma conversa direta no seu WhatsApp em menos de 3 segundos pelo celular.

Que tal compararmos os dois lado a lado numa chamada de 5 minutos? Se você não sentir que o novo converte muito mais clientes para o *${leadName}*, não tem compromisso nenhum!"`,

    esta_caro: `🛡️ QUEBRA DE OBJEÇÃO: "ESTÁ CARO" — ${leadName}

"Eu te entendo perfeitamente${ownerName ? `, ${greetingName}` : ''}. Mas pensa comigo no ticket médio de *${category}* em *${city}*: quantos clientes novos por mês você precisa fechar pelo Google para pagar esse investimento?

Geralmente 1 ou 2 clientes novos já pagam o site inteiro, e todo o restante do ano é lucro limpo no caixa do *${leadName}*. Além disso, como eu já deixei a base pronta pra você (${siteLink}), consigo isentar a taxa de criação do zero e parcelar para caber tranquilo no fluxo do mês. Vamos agendar 5 minutinhos para eu ajustar uma condição especial pra você?"`,

    sem_tempo: `🛡️ QUEBRA DE OBJEÇÃO: "NÃO TENHO TEMPO AGORA" — ${leadName}

"Justamente por saber que a rotina de *${category}* é super corrida que eu já fiz 95% do trabalho pesado antes mesmo de te chamar!

O site do *${leadName}* já está montado aqui: ${siteLink}
Você não vai precisar escrever textos nem parar sua operação. Eu cuido de toda a configuração técnica, domínio e Google Maps. Só preciso de 10 minutos com você no telefone para validar se os serviços e o WhatsApp estão certinhos. Qual horário é mais tranquilo hoje: 14h ou 17h?"`,

    vou_pensar: `🛡️ QUEBRA DE OBJEÇÃO: "VOU PENSAR" — ${leadName}

"Claro${ownerName ? `, ${greetingName}` : ''}, decisão inteligente! Só me diz uma coisa com sinceridade: a sua dúvida hoje é sobre se o visual do site ficou do jeito que você queria para o *${leadName}* ou é sobre a condição de pagamento?

Pergunto porque se for qualquer ajuste no layout ou nos textos de *${category}*, eu altero agora mesmo com você ao vivo na tela. Topa uma chamada rápida de 5 minutos só para alinharmos isso antes de você decidir?"`,

    sobrinho_faz: `🛡️ QUEBRA DE OBJEÇÃO: "MEU SOBRINHO / CONHECIDO FAZ" — ${leadName}

"Que legal que você tem alguém próximo! A grande diferença aqui na BlackDev é que nós não fazemos apenas uma página bonita: nós entregamos uma estrutura profissional otimizada para SEO local em *${city}*, com certificado SSL seguro, hospedagem de alta velocidade e foco total em conversão no WhatsApp para *${category}*.

Além disso, o seu site já está pronto agora (${siteLink}), sem risco de atrasar meses ou ficar sem suporte depois. Vamos conversar 5 minutinhos para eu te mostrar os bastidores da ferramenta?"`,

    nao_preciso: `🛡️ QUEBRA DE OBJEÇÃO: "NÃO PRECISO DE SITE / SÓ USO INSTAGRAM" — ${leadName}

"O Instagram é excelente para quem já conhece o *${leadName}*, mas quem está em *${city}* precisando de *${category}* agora mesmo pesquisa no Google!

Quando a pessoa vê suas ${reviewsCount} avaliações com nota ⭐ ${rating} no Google Maps e encontra um site oficial profissional (${siteLink}), a confiança dobra na hora frente aos concorrentes do bairro.

Posso te mostrar em uma conversa rápida de 5 minutos quantas buscas mensais existem para ${category} em ${city} hoje?"`,
  };

  const script =
    type === 'objecao'
      ? objectionsMap[objectionKey] || objectionsMap.esta_caro
      : scriptsMap[type] || scriptsMap.whatsapp_inicial;

  return res.status(200).json({ script });
}
