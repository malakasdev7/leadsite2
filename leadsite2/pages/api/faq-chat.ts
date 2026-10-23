import type { NextApiRequest, NextApiResponse } from 'next';

export interface FaqChatItem {
  id: string;
  place: 'lp' | 'app';
  category: string;
  category_order: number;
  question: string;
  answer: string;
  sort_order: number;
  show_whatsapp: boolean;
  active: boolean;
}

export const FAQ_LP_ITEMS: FaqChatItem[] = [
  {
    id: 'd0226398-304d-4b16-8e5f-55253672ec0b',
    place: 'lp',
    category: 'Como funciona',
    category_order: 1,
    question: 'O que o LeadSite faz?',
    answer:
      'Ele acha negócios da sua cidade que não têm site (ou têm um fora do ar), cria o site deles em segundos e te dá o roteiro pra oferecer. Você vende o site pro dono do negócio e fica com o dinheiro.',
    sort_order: 1,
    show_whatsapp: false,
    active: true,
  },
  {
    id: 'fae1272e-2206-43aa-8ee1-1cb082c0278c',
    place: 'lp',
    category: 'Como funciona',
    category_order: 1,
    question: 'Preciso saber programar?',
    answer:
      'Não. Você escolhe o negócio, clica em gerar e o site sai pronto. Pra mudar alguma coisa, é só descrever a mudança no editor.',
    sort_order: 2,
    show_whatsapp: false,
    active: true,
  },
  {
    id: 'db59a4d1-10fe-4225-8f28-c70004b6373b',
    place: 'lp',
    category: 'Como funciona',
    category_order: 1,
    question: 'Os sites ficam bons mesmo?',
    answer:
      'Ficam. O site já sai com as fotos, cores e dados do próprio negócio, funciona no celular e vem publicado com hospedagem inclusa.',
    sort_order: 3,
    show_whatsapp: false,
    active: true,
  },
  {
    id: '0d806195-3625-4f78-a514-a4d8520875af',
    place: 'lp',
    category: 'Dinheiro',
    category_order: 2,
    question: 'Quanto posso cobrar por site?',
    answer:
      'A gente recomenda começar por volta de R$500. Na negociação dá pra descer até uns R$97, que já paga o plano Starter. Aí tudo que vier depois é lucro.',
    sort_order: 1,
    show_whatsapp: false,
    active: true,
  },
  {
    id: 'a16215a5-6ac5-468e-91c6-93d48da48485',
    place: 'lp',
    category: 'Dinheiro',
    category_order: 2,
    question: 'Em quanto tempo recupero o que paguei?',
    answer:
      'Uma venda. Um site vendido a R$97 já paga o mês do Starter, e um a R$500 paga com folga até o Agência.',
    sort_order: 2,
    show_whatsapp: false,
    active: true,
  },
  {
    id: 'c7a3f719-d6df-46ae-9831-68827db81be2',
    place: 'lp',
    category: 'Dinheiro',
    category_order: 2,
    question: 'Serve pra quem está começando do zero?',
    answer:
      'Serve. Você não precisa de experiência nem de carteira de clientes. Dá pra começar no plano Gratuito, testar a busca e gerar seus primeiros sites antes de pagar qualquer coisa.',
    sort_order: 3,
    show_whatsapp: false,
    active: true,
  },
  {
    id: '3bb4527f-f8f2-41eb-8c4c-7c40f8e45969',
    place: 'lp',
    category: 'Planos e pagamento',
    category_order: 3,
    question: 'Qual a diferença entre os planos?',
    answer:
      'Muda o quanto você pode buscar e criar por mês, e alguns recursos que só existem nos planos maiores. Dá pra ver todos lado a lado na seção de Preços.',
    sort_order: 1,
    show_whatsapp: false,
    active: true,
  },
  {
    id: 'b0c82ce4-6a7f-40fe-892a-0b66ce779b1f',
    place: 'lp',
    category: 'Planos e pagamento',
    category_order: 3,
    question: 'Tem plano grátis?',
    answer: 'Tem! É só acessar o painel e começar a explorar e testar a plataforma gratuitamente.',
    sort_order: 2,
    show_whatsapp: false,
    active: true,
  },
  {
    id: 'b59ba483-6176-401c-8bf5-911c096ec209',
    place: 'lp',
    category: 'Planos e pagamento',
    category_order: 3,
    question: 'Aceita Pix? Dá pra parcelar?',
    answer:
      'Aceita sim! O Pix tem desconto à vista no plano anual, e também dá pra parcelar em até 12x no cartão.',
    sort_order: 3,
    show_whatsapp: true,
    active: true,
  },
  {
    id: 'e377b722-3427-425c-810c-f33a372319c0',
    place: 'lp',
    category: 'Dúvidas gerais',
    category_order: 4,
    question: 'Posso cancelar quando quiser?',
    answer:
      'Pode. Você cancela pela própria conta e continua usando até o fim do período que já pagou.',
    sort_order: 1,
    show_whatsapp: false,
    active: true,
  },
  {
    id: '2c172758-2bb7-4e89-88a4-2e8e50135729',
    place: 'lp',
    category: 'Dúvidas gerais',
    category_order: 4,
    question: 'Tem que pagar domínio e hospedagem?',
    answer:
      'Não. Todo site já sai publicado com hospedagem inclusa. No Pro e no Agência ainda dá pra ligar o domínio próprio do cliente.',
    sort_order: 2,
    show_whatsapp: false,
    active: true,
  },
];

export const FAQ_APP_ITEMS: FaqChatItem[] = [
  {
    id: 'ef75db9a-e80a-4f4a-8f6b-ce2f8e9419e9',
    place: 'app',
    category: 'Buscar leads',
    category_order: 1,
    question: 'Como funciona a cota de busca?',
    answer:
      'Cada lead que aparece na busca conta na sua cota do mês. Quando acaba, a busca avisa e mostra quando renova.',
    sort_order: 1,
    show_whatsapp: false,
    active: true,
  },
  {
    id: '2193df6a-5162-4a06-ba85-7be162a4290e',
    place: 'app',
    category: 'Buscar leads',
    category_order: 1,
    question: 'Como faço site pra quem não está no buscador?',
    answer:
      'Nos planos Pro e Agência, na hora de criar o site, libera a opção de você descrever manualmente como é o negócio da pessoa.',
    sort_order: 2,
    show_whatsapp: false,
    active: true,
  },
  {
    id: '5bb703f5-30b4-4568-ad38-9ef239bef81d',
    place: 'app',
    category: 'Criar e editar site',
    category_order: 2,
    question: 'Como gero o site de um lead?',
    answer:
      'No card do lead, clica em Gerar site. Em segundos ele sai pronto com as cores, fotos e dados do negócio.',
    sort_order: 1,
    show_whatsapp: false,
    active: true,
  },
  {
    id: 'e7826024-ca21-4ccf-aa13-ec58a057b76e',
    place: 'app',
    category: 'Criar e editar site',
    category_order: 2,
    question: 'Como edito textos, cores e fotos?',
    answer:
      'Dentro do editor (/studio), clica no texto ou descreve a mudança no chat em português (ex.: "deixe o botão verde"). Cada alteração vira uma versão no histórico, então dá pra desfazer quando quiser.',
    sort_order: 2,
    show_whatsapp: false,
    active: true,
  },
  {
    id: '738be2a1-a728-43d8-b100-fed797bf0717',
    place: 'app',
    category: 'Publicar e entregar',
    category_order: 3,
    question: 'Como entrego o site pro cliente?',
    answer: 'É só publicar no editor, clicar em Copiar Link Público e mandar pro cliente ver no ar.',
    sort_order: 1,
    show_whatsapp: false,
    active: true,
  },
  {
    id: 'dc6d2be4-f82c-4483-b3e2-78b43eeace35',
    place: 'app',
    category: 'Vender pro cliente',
    category_order: 4,
    question: 'Quanto cobrar dos clientes?',
    answer:
      'Recomendamos cobrar por volta de R$500 a R$800 à vista + R$120/mês de manutenção e hospedagem. Na negociação você pode descer até R$97 para fechar rápido.',
    sort_order: 1,
    show_whatsapp: false,
    active: true,
  },
  {
    id: '1616f0ae-10d9-4eee-8f9d-5a7360057202',
    place: 'app',
    category: 'Vender pro cliente',
    category_order: 4,
    question: 'Como abordar as pessoas pra vender?',
    answer:
      'Use os 4 scripts prontos no CRM: mande a Mensagem de WhatsApp ou faça a Ligação de Abordagem, agende uma chamada de vídeo de 10 minutos, espelhe a tela mostrando o site pronto e use o guia de Quebra de Objeções.',
    sort_order: 2,
    show_whatsapp: false,
    active: true,
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const place = req.query.place === 'app' ? 'app' : 'lp';
  const items = place === 'app' ? FAQ_APP_ITEMS : FAQ_LP_ITEMS;
  res.status(200).json({ items });
}
