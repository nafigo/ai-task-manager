// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProjectForm from './components/ProjectForm';
import ProjectList from './components/ProjectList';
import { useDictionary } from './hooks/useDictionary';
import { supabase } from './services/supabase';

export default function Home() {
  const dict = useDictionary();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    };
    checkUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    // İŞTE EKSİK OLAN ANA KAPSAYICI (TÜM SAYFAYI TUTAN BÜYÜK DİV)
    <div className="flex min-h-screen flex-col bg-slate-50">
      
      {/* ÜST MENÜ (NAVBAR) */}
      <nav className="w-full bg-white border-b border-slate-100 shadow-sm sticky top-0 z-50">
        <div className="w-full max-w-[94vw] 2xl:max-w-[85vw] 3xl:max-w-[75vw] mx-auto px-4 py-4 flex justify-between items-center">
          
          {/* YENİ LOGO VE MARKA: CogniTree Flow */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-2xl shadow-md shadow-emerald-500/20">C</div>
            <h1 className="text-2xl font-black text-slate-950 tracking-tighter">
              CogniTree <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Flow</span>
            </h1>
          </div>
          
          {/* KULLANICI MENÜSÜ */}
          <div className="flex items-center gap-3 bg-slate-100/50 p-1.5 rounded-full border border-slate-100">
            {user ? (
              <>
                <span className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-slate-500 text-sm font-semibold">
                  {user.email?.substring(0, 2).toUpperCase()}
                </span>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-slate-900">Mimar</p>
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

      {/* ANA İÇERİK ALANI */}
      <main className="flex-grow w-full max-w-[94vw] 2xl:max-w-[85vw] 3xl:max-w-[75vw] mx-auto px-4 md:px-6 py-12 space-y-16">
        
        {/* HERO (KARŞILAMA) ALANI */}
        <div className="text-center py-20 px-6 md:px-16 bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/30 flex flex-col items-center">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-950 mb-6 tracking-tighter leading-none max-w-5xl">
            {dict.heroTitle} <span className="text-emerald-600">{dict.heroHighlight}</span>
          </h2>
          <p className="text-slate-500 mb-12 text-xl md:text-2xl max-w-3xl leading-relaxed font-medium">
            {dict.heroDesc}
          </p>
          <div className="w-full max-w-4xl mx-auto flex justify-center">
              <ProjectForm />
          </div>
        </div>
        
        <ProjectList />
      </main>

      {/* ALT BİLGİ (FOOTER) */}
      <footer className="w-full max-w-[94vw] 2xl:max-w-[85vw] 3xl:max-w-[75vw] mx-auto p-10 mt-10 border-t border-slate-100 bg-white rounded-t-[2.5rem] text-center">
        <p className="text-sm text-slate-500">© 2026 CogniTree Flow. Tüm hakları saklıdır.</p>
        <p className="text-md mt-1.5 text-emerald-700 font-extrabold tracking-tight">
          {dict.builtBy}
        </p>
      </footer>
    </div>
  );
}