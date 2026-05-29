// src/app/project/[id]/page.tsx
'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../services/db'; // HATA BURADAYDI: ../../ olarak düzeltildi
import Link from 'next/link';
import { use } from 'react';
import TaskList from '../../components/TaskList'; // HATA BURADAYDI: ../../ olarak düzeltildi

export default function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;
  const project = useLiveQuery(() => db.projects.get(projectId), [projectId]);

  if (project === undefined) return <p className="p-10 text-center text-gray-500">Yükleniyor...</p>;
  if (project === null) return <p className="p-10 text-center text-red-500">Proje bulunamadı!</p>;

  return (
    <main className="flex min-h-screen flex-col bg-gray-50 p-8">
      <div className="max-w-3xl w-full mx-auto">
        <Link href="/" className="text-blue-500 hover:underline mb-6 inline-block font-medium">
          ← Ana Sayfaya Dön
        </Link>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.title}</h1>
          <p className="text-gray-500 text-sm">
            Oluşturulma: {new Date(project.createdAt).toLocaleDateString('tr-TR')}
          </p>
        </div>

        {/* Görevler Alanına Sihirli Listemizi Ekledik */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <TaskList projectId={project.id} projectTitle={project.title} />
        </div>
      </div>
    </main>
  );
}