import { Worker } from 'bullmq';
import { supabase } from '../utils/supabaseClient';
import { openai } from '../utils/openaiClient'; // you will create this file later
import { uploadToS3 } from '../utils/s3Uploader'; // placeholder implementation

export const siteWorker = new Worker('site-gen', async job => {
  const { siteId, title, templateId, config } = job.data;

  // 1️⃣ Busca o prompt do template (simplificado aqui)
  const templatePrompt = `Criar site de captura de leads com título "${title}".`;

  const prompt = `${templatePrompt}\nConfigurações: ${JSON.stringify(config)}`;

  // 2️⃣ Chama o LLM
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
  });

  const html = response.choices[0].message?.content ?? '';

  // 3️⃣ Faz upload para S3 (ou Vercel) – aqui apenas simulamos
  const url = await uploadToS3(siteId, html);

  // 4️⃣ Atualiza a tabela de sites
  await supabase.from('sites').update({
    generated_url: url,
    updated_at: new Date().toISOString(),
  }).eq('id', siteId);

  return { siteId, url };
});
