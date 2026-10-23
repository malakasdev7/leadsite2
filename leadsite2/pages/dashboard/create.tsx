import type { NextPage } from 'next';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

const CreateSite: NextPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    templateId: 'default',
    config: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/sites/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.accessToken}`
        },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        alert('Site enviado para geração via IA!');
        router.push('/dashboard');
      } else {
        const err = await res.json();
        alert('Erro: ' + err.error);
      }
    } catch (e) {
      alert('Erro na requisição');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold mb-6">Criar Site com IA 🚀</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Título do Site</label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg mt-1"
              placeholder="Ex: Consultoria de Marketing Digital"
              onChange={e => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Template</label>
            <select
              className="w-full p-2 border rounded-lg mt-1"
              onChange={e => setFormData({...formData, templateId: e.target.value})}
            >
              <option value="default">Minimalista (Default)</option>
              <option value="corporate">Corporativo</option>
              <option value="landing">Landing Page de Alta Conversão</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Instruções para a IA (Config)</label>
            <textarea
              className="w-full p-2 border rounded-lg mt-1"
              placeholder="Descreva seu negócio, público alvo e oferta..."
              rows={4}
              onChange={e => setFormData({...formData, config: e.target.value})}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 disabled:bg-gray-400"
          >
            {loading ? 'Gerando...' : 'Gerar Site Agora'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateSite;
