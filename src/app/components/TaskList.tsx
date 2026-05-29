// src/components/TaskList.tsx
'use client';

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { aiService } from '../services/ai';

export default function TaskList({ projectId, projectTitle }: { projectId: string, projectTitle: string }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const tasks = useLiveQuery(
    () => db.tasks.where('projectId').equals(projectId).toArray(),
    [projectId]
  );

  const handleGenerateTasks = async () => {
    setIsGenerating(true);
    try {
      const systemPrompt = "Sen son derece ciddi, net ve profesyonel bir proje yöneticisisin. Görevin, verilen proje başlığı ile ilgili yapılması gereken en mantıklı ve kısa 5 gerçekçi adımı listelemektir. Asla uydurma kelime kullanma. Sadece Türkçe yanıt ver. Ekstra açıklama yapma. Her görevin başına sadece tire (-) koy.";
      const userPrompt = `Proje Adı: "${projectTitle}"`;

      const response = await aiService.generateResponse(systemPrompt, userPrompt);
      const taskLines = response.split('\n').filter(line => line.trim().length > 3);

      for (const line of taskLines) {
        const cleanTitle = line.replace(/^[\d\.\-\*\s]+/, '').trim();
        
        if (cleanTitle) {
          // BENİM HATAM BURADAYDI: id'yi sildirmemeliydim. Geri ekledik!
          await db.tasks.add({
            id: crypto.randomUUID(), 
            projectId: projectId,
            title: cleanTitle,
            status: 'todo',
            createdAt: Date.now()
          } as any); 
        }
      }
    } catch (error) {
      console.error("Görevler üretilirken hata:", error);
      alert("Görevler üretilirken bir hata oluştu. Ana sayfadan AI motorunu başlattığına emin ol.");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleTaskStatus = async (taskId: any, currentStatus: string) => {
    const newStatus = currentStatus === 'todo' ? 'done' : 'todo';
    await db.tasks.update(taskId, { status: newStatus as any });
  };

  if (!tasks) return <p className="text-gray-500 text-sm">Görevler yükleniyor...</p>;

  return (
    <div className="w-full mt-2">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-xl font-semibold text-gray-800">Görevler</h2>
        <button
          onClick={handleGenerateTasks}
          disabled={isGenerating}
          className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:bg-purple-400 flex items-center gap-2"
        >
          {isGenerating ? '⏳ Yapay Zeka Düşünüyor...' : '✨ Yapay Zeka ile Görev Üret'}
        </button>
      </div>

      {tasks.length === 0 ? (
        <p className="text-gray-400 italic text-sm text-center py-4">Henüz görev yok. Yukarıdaki sihirli butona tıkla!</p>
      ) : (
        <ul className="space-y-3">
          {tasks.map(task => (
            <li key={task.id} className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow group">
              <input
                type="checkbox"
                checked={task.status === 'done'}
                onChange={() => toggleTaskStatus(task.id, task.status)}
                className="w-5 h-5 text-purple-600 rounded border-gray-300 cursor-pointer"
              />
              <span className={`flex-1 font-medium ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                {task.title}
              </span>
              <button
                onClick={() => db.tasks.delete(task.id as any)}
                className="text-red-400 hover:text-red-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Sil
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}