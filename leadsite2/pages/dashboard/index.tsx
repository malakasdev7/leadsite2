import type { NextPage } from 'next';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const Dashboard: NextPage = () => {
  const { data: session } = useSession();

  if (!session) return <div className="p-10 text-center">Por favor, faça login para acessar o dashboard.</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-indigo-600">LeadSite 2.0 Dashboard</h1>
        <div className="space-x-4">
          <Link href="/" className="text-gray-600 hover:text-indigo-600">Voltar</Link>
        </div>
      </nav>

      <main className="p-8 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold">Meus Sites de Captura</h2>
          <Link
            href="/dashboard/create"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            + Criar Novo Site
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Mock de sites - Depois integraremos com /api/sites/list */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
              <h3 className="font-bold text-lg mb-2">Site de Captura #{i}</h3>
              <p className="text-gray-500 text-sm mb-4">Status: <span className="text-green-500 font-medium">Ativo</span></p>
              <div className="flex justify-between items-center">
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">120 Leads</span>
                <Link href={`/dashboard/site/${i}`} className="text-indigo-600 text-sm font-medium hover:underline">Gerenciar</Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
