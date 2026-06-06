// src/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from './services/supabase';
import ProjectList from './components/ProjectList';
import ProjectForm from './components/ProjectForm';
import { useDictionary } from './hooks/useDictionary'; 

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const dict = useDictionary(); 

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      // YENİ: Artık kimseyi zorla login sayfasına atmıyoruz! Sadece kim olduğunu anlıyoruz.
      setUser(session?.user || null);
      setIsLoading(false);
    };
    checkUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload(); // Çıkış yapınca login'e atma, misafir olarak aynı sayfada kal
  };

  if (isLoading) return <p className="flex min-h-screen items-center justify-center text-slate-500 animate-pulse bg-slate-50">Yükleniyor...</p>;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      
      <nav className="w-full bg-white border-b border-slate-100 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xl">⚡</div>
            <h1 className="text-2xl font-extrabold text-slate-950 tracking-tighter">AI Project <span className="text-emerald-600">Architect</span></h1>
          </div>
          
          {/* YENİ: Dinamik Kullanıcı Menüsü */}
          <div className="flex items-center gap-3 bg-slate-100/50 p-1.5 rounded-full border border-slate-100">
            {user ? (
              <>
                <span className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-slate-500 text-sm font-semibold">
                  {user.email.substring(0, 2).toUpperCase()}
                </span>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-slate-900">Oguz Guven</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
                <button onClick={handleLogout} className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-full transition-colors font-semibold">
                  Güvenli Çıkış
                </button>
              </>
            ) : (
              <Link href="/login" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-5 py-2.5 rounded-full transition-colors">
                Giriş Yap / Arşive Ulaş
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-4xl w-full mx-auto p-6 md:p-10 space-y-12">
        <div className="text-center md:text-left py-12 px-6 bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-100/50">
          <h2 className="text-5xl font-extrabold text-slate-950 mb-3 tracking-tighter leading-tight">
            {dict.heroTitle} <span className="text-emerald-600">{dict.heroHighlight}</span>
          </h2>
          <p className="text-slate-600 mb-10 text-xl max-w-2xl mx-auto md:mx-0">
            {dict.heroDesc}
          </p>
          <div className="w-full flex justify-center md:justify-start">
              <ProjectForm />
          </div>
        </div>
        
        <ProjectList />
      </main>

      <footer className="w-full max-w-4xl mx-auto p-10 mt-10 border-t border-slate-100 bg-white rounded-t-2xl shadow-inner shadow-slate-100/30 text-center">
        <p className="text-sm text-slate-500">© 2026 AI Project Architect. Tüm hakları saklıdır.</p>
        <p className="text-md mt-1.5 text-emerald-700 font-extrabold tracking-tight">
          {dict.builtBy}
        </p>
      </footer>
    </div>
  );
}