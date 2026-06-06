// src/app/components/ProjectForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useDictionary } from '../hooks/useDictionary';

export default function ProjectForm() {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dynamicPlaceholder, setDynamicPlaceholder] = useState('');
  const dict = useDictionary();

  useEffect(() => {
    if (dict.inputPlaceholders && dict.inputPlaceholders.length > 0) {
      const randomIndex = Math.floor(Math.random() * dict.inputPlaceholders.length);
      setDynamicPlaceholder(dict.inputPlaceholders[randomIndex]);
    }
  }, [dict]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('projects').insert([{ title: title.trim() }]);
      if (error) throw error;
      setTitle('');
      window.location.reload(); 
    } catch (error) {
      console.error("Fikir tohumu eklenirken hata:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-6">
      <div className="w-full relative group">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <span className="text-emerald-500 text-xl group-focus-within:animate-bounce">🧠</span>
        </div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={dynamicPlaceholder}
          className="w-full pl-14 pr-5 py-5 rounded-2xl border-2 border-slate-200 bg-white focus:bg-slate-50 focus:outline-none focus:border-emerald-500 shadow-lg transition-all text-lg md:text-xl font-medium text-slate-800 placeholder-slate-400"
          disabled={isSubmitting}
        />
      </div>
      
      <button
        type="submit"
        disabled={!title.trim() || isSubmitting}
        className={`relative bg-emerald-500 text-white font-extrabold px-10 py-4 rounded-full shadow-lg shadow-emerald-500/40 text-lg flex items-center justify-center gap-3 tracking-wide transition-transform duration-300 ${
          title.trim().length > 0 && !isSubmitting 
            ? 'scale-105 hover:-translate-y-1 cursor-pointer' // Yazı yazılınca sadece hafifçe büyür ve öne çıkar
            : 'scale-100 cursor-not-allowed' // Boşken sabit kalır ama RENK ASLA DEĞİŞMEZ
        }`}
      >
        {isSubmitting ? (
          <>
            <span className="animate-spin inline-block">🔮</span>
            {dict.generating}
          </>
        ) : (
          <>
            <span className={`text-2xl ${title.trim().length > 0 ? 'animate-bounce' : ''}`}>✨</span>
            {dict.createButton}
          </>
        )}
      </button>
    </form>
  );
}