import { Worker } from 'bullmq';
import { supabase } from '../utils/supabaseClient';
import { whatsappQueue } from '../utils/queues';
import twilio from 'twilio';

const client = twilio(process.env.TWILIO_SID!, process.env.TWILIO_TOKEN!);

export const whatsappWorker = new Worker('whatsapp', async job => {
  const { lead, messageTemplate, automationId } = job.data;
  const body = messageTemplate
    .replace(/{{name}}/g, lead.name)
    .replace(/{{email}}/g, lead.email)
    .replace(/{{phone}}/g, lead.phone);

  try {
    await client.messages.create({
      from: 'whatsapp:+14155238886',
      to: `whatsapp:${lead.phone}`,
      body,
    });

    await supabase.from('messages').insert({
      lead_id: lead.id,
      automation_id: automationId,
      channel: 'whatsapp',
      content: body,
      status: 'sent',
      sent_at: new Date().toISOString(),
    });
  } catch (e) {
    await supabase.from('messages').insert({
      lead_id: lead.id,
      automation_id: automationId,
      channel: 'whatsapp',
      content: body,
      status: 'failed',
      sent_at: new Date().toISOString(),
    });
    throw e;
  }
});
