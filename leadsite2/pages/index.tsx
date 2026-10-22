import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';

const Home: NextPage = () => {
  const { data: session } = useSession();

  return (
    <>
      <Head>
        <title>LeadSite 2.0 – Crie sites de captura</title>
      </Head>
      <main className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl font-bold mb-6">LeadSite 2.0</h1>
        <div className="space-x-4">
          {session ? (
            <>
              <Link href="/dashboard">Dashboard</Link>
              <button onClick={() => signOut()}>Sair</button>
            </>
          ) : (
            <button onClick={() => signIn()}>Entrar / Registrar</button>
          )}
        </div>
      </main>
    </>
  );
};

export default Home;
