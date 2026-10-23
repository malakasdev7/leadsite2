import React, { useEffect, useRef, useState } from 'react';
import type { FaqChatItem } from '../pages/api/faq-chat';

interface FaqChatWidgetProps {
  place: 'lp' | 'app';
}

interface ChatMessage {
  id: number;
  from: 'bot' | 'user';
  text: string;
}

export const FaqChatWidget: React.FC<FaqChatWidgetProps> = ({ place }) => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<FaqChatItem[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, from: 'bot', text: 'Oi! Aqui é o Guilherme, do LeadSite.' },
    { id: 2, from: 'bot', text: 'Sobre o que é sua dúvida?' },
  ]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [resolvedPrompt, setResolvedPrompt] = useState<FaqChatItem | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch(`/api/faq-chat?place=${place}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data?.items)) setItems(data.items);
      })
      .catch(() => {});
  }, [place]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, selectedCategory, resolvedPrompt, open]);

  const categories = Array.from(new Set(items.map(i => i.category)));

  const handleSelectCategory = (cat: string) => {
    setMessages(prev => [
      ...prev,
      { id: Date.now(), from: 'user', text: cat },
      { id: Date.now() + 1, from: 'bot', text: 'Essas são as dúvidas mais comuns sobre isso:' },
    ]);
    setSelectedCategory(cat);
    setResolvedPrompt(null);
  };

  const handleSelectQuestion = (item: FaqChatItem) => {
    setMessages(prev => [
      ...prev,
      { id: Date.now(), from: 'user', text: item.question },
      { id: Date.now() + 1, from: 'bot', text: item.answer },
      { id: Date.now() + 2, from: 'bot', text: 'Isso resolveu sua dúvida?' },
    ]);
    setResolvedPrompt(item);
  };

  const handleReset = () => {
    setMessages(prev => [
      ...prev,
      { id: Date.now(), from: 'user', text: 'Ver outros assuntos' },
      { id: Date.now() + 1, from: 'bot', text: 'Sobre o que é sua dúvida?' },
    ]);
    setSelectedCategory(null);
    setResolvedPrompt(null);
  };

  return (
    <div className="fixed bottom-4 md:bottom-6 right-4 md:right-6 z-[56] flex flex-col items-end gap-2">
      {open && (
        <div
          role="dialog"
          aria-label="Chat de dúvidas"
          className="glass-popup rounded-2xl shadow-xl overflow-hidden flex flex-col w-[calc(100vw-32px)] max-w-[360px] h-[480px] border border-[--border]"
          style={{ background: 'var(--bg-card, #ffffff)' }}
        >
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[--border-dim]">
            <div className="relative shrink-0">
              <div
                className="w-9 h-9 rounded-full text-white flex items-center justify-center font-bold text-[14px]"
                style={{ background: '#0071E3' }}
              >
                G
              </div>
              <span
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
                style={{ background: '#34C759' }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-[14px] leading-tight text-[--text]">Guilherme</div>
              <div className="text-[11px] text-[--text-4]">LeadSite · tira suas dúvidas aqui</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg text-[--text-4] hover:text-[--text-2]"
              aria-label="Fechar"
            >
              ✕
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
            {messages.map(m => (
              <div
                key={m.id}
                className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] text-[13px] leading-relaxed px-3 py-2 whitespace-pre-line ${
                    m.from === 'user'
                      ? 'text-white rounded-2xl rounded-tr-md'
                      : 'text-[--text] rounded-2xl rounded-tl-md bg-[--bg-2]'
                  }`}
                  style={m.from === 'user' ? { background: '#0071E3' } : undefined}
                >
                  {m.text}
                </div>
              </div>
            ))}

            <div className="pt-2 flex flex-col items-end gap-1.5">
              {!selectedCategory &&
                categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => handleSelectCategory(cat)}
                    className="text-left text-[12.5px] leading-snug px-3 py-2 rounded-xl border border-[--border] bg-[--bg-card] hover:border-[#0071E3] transition-colors"
                  >
                    {cat}
                  </button>
                ))}

              {selectedCategory &&
                !resolvedPrompt &&
                items
                  .filter(i => i.category === selectedCategory)
                  .map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleSelectQuestion(item)}
                      className="text-left text-[12.5px] leading-snug px-3 py-2 rounded-xl border border-[--border] bg-[--bg-card] hover:border-[#0071E3] transition-colors"
                    >
                      {item.question}
                    </button>
                  ))}

              {resolvedPrompt && (
                <div className="flex flex-col items-end gap-2">
                  <div className="flex gap-1.5">
                    <button
                      onClick={handleReset}
                      className="text-[12.5px] px-3 py-1.5 rounded-xl border border-[--border] bg-[--bg-card] hover:border-[#0071E3]"
                    >
                      Sim, obrigado!
                    </button>
                    <a
                      href="https://wa.me/5562984124822?text=Oi!%20Vim%20pelo%20LeadSite%20e%20tenho%20uma%20d%C3%BAvida"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[12.5px] font-semibold px-3 py-1.5 rounded-xl text-white"
                      style={{ background: '#1FA855' }}
                    >
                      Falar no WhatsApp
                    </a>
                  </div>
                </div>
              )}

              {selectedCategory && (
                <button
                  onClick={handleReset}
                  className="text-[11.5px] text-[--text-4] hover:text-[--text-2] underline mt-1"
                >
                  ← Ver outros assuntos
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Fechar chat de dúvidas' : 'Abrir chat de dúvidas'}
        style={{ borderRadius: 9999, background: '#0071E3' }}
        className="w-[52px] h-[52px] rounded-full text-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform font-bold text-[20px]"
      >
        {open ? '✕' : '💬'}
      </button>
    </div>
  );
};
