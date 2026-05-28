// src/components/ProjectList.tsx
'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';

export default function ProjectList() {
  // Veritabanındaki tüm projeleri tarihe göre ters sıralayıp getirir
  // useLiveQuery sayesinde veritabanı değiştiğinde bu liste OTOMATİK güncellenir!
  const projects = useLiveQuery(() => db.projects.orderBy('createdAt').reverse().toArray());

  // Eğer veri yükleniyorsa veya hiç proje yoksa
  if (!projects) return <p className="text-gray-400">Projeler yükleniyor...</p>;
  if (projects.length === 0) return <p className="text-gray-400 text-sm italic">Henüz hiç proje eklemedin.</p>;

  return (
    <div className="w-full max-w-md flex flex-col gap-3">
      {projects.map((project) => (
        <div key={project.id} className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm flex justify-between items-center hover:shadow-md transition-shadow">
          <div>
            <h3 className="font-semibold text-gray-800">{project.title}</h3>
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full mt-1 inline-block">
              {project.status === 'active' ? 'Aktif' : project.status}
            </span>
          </div>
          <button 
            onClick={() => db.projects.delete(project.id)} 
            className="text-red-400 hover:text-red-600 text-sm"
          >
            Sil
          </button>
        </div>
      ))}
    </div>
  );
}