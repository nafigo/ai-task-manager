// src/app/components/ProjectList.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../services/supabase';
import { useDictionary } from '../hooks/useDictionary';

export default function ProjectList() {
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const dict = useDictionary();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsLoading(false);
        return; // Üye girişi yoksa geçmişi çekme
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error("Projeler çekilemedi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProject = async (id: string, e: React.MouseEvent) => {
    e.preventDefault(); 
    if(!window.confirm("Bu zihin haritasını tamamen silmek istediğinize emin misiniz?")) return;
    
    try {
      await supabase.from('projects').delete().eq('id', id);
      setProjects(projects.filter(p => p.id !== id));
    } catch (error) {
      console.error("Silme hatası:", error);
    }
  };

  if (isLoading) return <p className="text-slate-500 italic animate-pulse">...</p>;

  return (
    <div className="w-full space-y-6">
      <h3 className="text-xl font-bold text-slate-800 tracking-tight">{dict.projectsTitle}</h3>
      
      {projects.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-2xl border-2 border-slate-100 border-dashed shadow-sm">
          <p className="text-slate-500">Burada sadece üye girişi yapmış kullanıcıların geçmiş zihin haritaları arşivlenir.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <Link href={`/project/${project.id}`} key={project.id} className="block group">
              <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-md hover:shadow-xl hover:border-emerald-300 transition-all duration-300 hover:translate-y-[-2px] flex flex-col justify-between h-full relative overflow-hidden">
                
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-100 group-hover:bg-emerald-500 transition-colors"></div>

                <div className="flex items-center gap-5 mb-4">
                  {/* YENİ: GÖRSELDEKİ GİBİ "TREE OF THOUGHTS" KARE DÜĞÜM TASARIMI */}
                  <div className="relative w-12 h-12 shrink-0 flex flex-col items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    {/* Kök Kare */}
                    <div className="w-5 h-5 bg-emerald-600 rounded-md shadow-sm z-10 group-hover:bg-emerald-500 transition-colors"></div>
                    {/* Bağlantı Çizgileri */}
                    <div className="w-0.5 h-2 bg-slate-200 group-hover:bg-emerald-200 transition-colors"></div>
                    <div className="w-8 h-0.5 bg-slate-200 group-hover:bg-emerald-200 transition-colors"></div>
                    {/* Alt Kareler */}
                    <div className="flex justify-between w-9 pt-1">
                      <div className="w-3.5 h-3.5 bg-teal-400 rounded-sm shadow-sm group-hover:bg-teal-300 transition-colors"></div>
                      <div className="w-3.5 h-3.5 bg-blue-500 rounded-sm shadow-sm group-hover:bg-blue-400 transition-colors"></div>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors tracking-tight truncate">
                      {project.title}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {new Date(project.created_at).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end items-center mt-3 border-t border-slate-50 pt-3">
                  <button
                    onClick={(e) => deleteProject(project.id, e)}
                    className="text-slate-400 hover:text-red-500 text-sm font-semibold p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    {dict.delete}
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}