// src/app/project/[id]/page.tsx
'use client';

import { useEffect, useState, use } from 'react';
import { supabase } from '../../services/supabase';
import Link from 'next/link';
import TaskList from '../../components/TaskList';
import { useDictionary } from '../../hooks/useDictionary';

export default function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;
  
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const dict = useDictionary();

  useEffect(() => {
    const fetchProject = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
      
      if (error) {
        console.error("Proje buluttan çekilemedi:", error);
        setProject(null);
      } else {
        setProject(data);
      }
      setIsLoading(false);
    };

    fetchProject();
  }, [projectId]);

  if (isLoading) return <p className="p-10 text-center text-slate-500 animate-pulse bg-slate-50 min-h-screen">...</p>;
  if (!project) return <p className="p-10 text-center text-red-500 bg-slate-50 min-h-screen">Proje bulutta bulunamadı!</p>;

  return (
    <main className="flex min-h-screen flex-col bg-slate-50">
      
      {/* 1. Üst Kısım (Header): Hala kutu içinde kalsın ki şık dursun */}
      <div className="max-w-7xl w-full mx-auto px-6 pt-6 mb-6">
        <Link href="/" className="text-emerald-600 hover:text-emerald-700 mb-6 inline-block font-semibold text-sm bg-emerald-50 px-4 py-2 rounded-full transition-colors">
          ← {dict.projectsTitle}
        </Link>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-950 tracking-tighter">{project.title}</h1>
            <p className="text-slate-400 text-sm mt-1">
              {project.created_at ? new Date(project.created_at).toLocaleDateString('tr-TR') : '...'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Zihin Haritası Alanı (TaskList): BURAYI TAM GENİŞ YAPTIK */}
      <div className="w-full flex-grow px-2 md:px-4 pb-4">
        <TaskList projectId={project.id} projectTitle={project.title} />
      </div>

    </main>
  );
}