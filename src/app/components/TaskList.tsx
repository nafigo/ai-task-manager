// src/app/components/TaskList.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { aiService } from '../services/ai';
import { useDictionary } from '../hooks/useDictionary';

export default function TaskList({ projectId, projectTitle }: { projectId: string, projectTitle: string }) {
  const [nodes, setNodes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [currentParentId, setCurrentParentId] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false); // Misafir kontrolü
  
  const dict = useDictionary();

  useEffect(() => {
    checkUserAndFetch();
  }, [projectId]);

  const checkUserAndFetch = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setIsGuest(true);
      setIsLoading(false); // Giriş yoksa buluttan veri çekmeyi atla, hafızadan çalışacak
    } else {
      setIsGuest(false);
      fetchNodes();
    }
  };

  const fetchNodes = async () => {
    try {
      const { data, error } = await supabase.from('tasks').select('*').eq('project_id', projectId);
      if (error) throw error;
      setNodes(data || []);
    } catch (error) {
      console.error("Veriler çekilemedi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Benzersiz ID oluşturucu (Misafir kullanıcıların kartları için)
  const generateUUID = () => Math.random().toString(36).substring(2, 15);

  const handleSelectOption = async (selectedNode: any) => {
    setCurrentParentId(selectedNode.id); 
    const hasChildren = nodes.some(n => n.parent_id === selectedNode.id);
    if (hasChildren) return;

    setGeneratingId(selectedNode.id);
    try {
      const systemPrompt = "Sen ufuk açıcı bir düşünürsün. Verilen alt fikri derinleştiren tamamen yeni 3 felsefi, pratik veya stratejik alt perspektif üret. Sadece Türkçe yanıt ver. Her fikrin başına sadece tire (-) koy. Kısa ve net ol.";
      const userPrompt = `Ana Konu: "${projectTitle}". Üzerinde durduğumuz alt fikir: "${selectedNode.title}".`;

      const response = await aiService.generateResponse(systemPrompt, userPrompt);
      const lines = response.split('\n').filter(line => line.trim().length > 3);

      const newNodes: any[] = [];
      const userId = !isGuest ? (await supabase.auth.getSession()).data.session?.user.id : null;
      
      lines.forEach(line => {
        const cleanTitle = line.replace(/^[\d\.\-\*\s]+/, '').trim();
        if (cleanTitle) {
          newNodes.push({
            id: isGuest ? generateUUID() : undefined, // Misafirse rastgele id ver
            project_id: projectId,
            title: cleanTitle,
            parent_id: selectedNode.id,
            status: 'todo',
            user_id: userId
          });
        }
      });

      if (newNodes.length > 0) {
        if (!isGuest) {
          await supabase.from('tasks').insert(newNodes);
          await fetchNodes();
        } else {
          // Misafir ise veritabanına dokunma, sadece ekrandaki hafızaya ekle
          setNodes(prev => [...prev, ...newNodes]);
        }
      }
    } catch (error: any) {
      alert(`🚨 ${error.message || "Yapay Zeka sınırına takıldınız. Lütfen biraz bekleyin."}`);
      setCurrentParentId(selectedNode.parent_id);
    } finally {
      setGeneratingId(null);
    }
  };

  const handleGenerateRoot = async () => {
    setGeneratingId('root');
    try {
      const systemPrompt = "Sen ufuk açıcı bir düşünürsün. Verilen konuyu ele alan en temel ve kışkırtıcı 3 farklı perspektif üret. Sadece Türkçe yanıt ver. Her fikrin başına sadece tire (-) koy.";
      const userPrompt = `Konu: "${projectTitle}".`;

      const response = await aiService.generateResponse(systemPrompt, userPrompt);
      const lines = response.split('\n').filter(line => line.trim().length > 3);

      const newNodes: any[] = [];
      const userId = !isGuest ? (await supabase.auth.getSession()).data.session?.user.id : null;
      
      lines.forEach(line => {
        const cleanTitle = line.replace(/^[\d\.\-\*\s]+/, '').trim();
        if (cleanTitle) {
          newNodes.push({
            id: isGuest ? generateUUID() : undefined,
            project_id: projectId,
            title: cleanTitle,
            parent_id: null,
            status: 'todo',
            user_id: userId
          });
        }
      });

      if (newNodes.length > 0) {
        if (!isGuest) {
          await supabase.from('tasks').insert(newNodes);
          await fetchNodes();
        } else {
          setNodes(newNodes);
        }
      }
    } catch (error: any) {
      alert(`🚨 Hata: ${error.message}`);
    } finally {
      setGeneratingId(null);
    }
  };

  const getHistoryPath = () => {
    let path = [];
    let curr = nodes.find(n => n.id === currentParentId);
    while (curr) {
      path.unshift(curr); 
      curr = nodes.find(n => n.id === curr.parent_id);
    }
    return path;
  };

  if (isLoading) return <p className="text-slate-500 p-10 text-center animate-pulse">...</p>;

  const currentOptions = nodes.filter(n => n.parent_id === currentParentId);
  const rootNodes = nodes.filter(n => n.parent_id === null);
  const historyPath = getHistoryPath();

  return (
    <>
      <div className="w-full max-w-5xl mx-auto flex flex-col min-h-[70vh] print:hidden">
        
        {historyPath.length > 0 && (
          <div className="mb-8 flex flex-wrap items-center gap-2 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <button 
              onClick={() => setCurrentParentId(null)}
              className="text-sm font-bold text-slate-400 hover:text-emerald-600 transition-colors px-2"
            >
              🏠 Başlangıç
            </button>
            
            {historyPath.map((step, index) => (
              <div key={step.id} className="flex items-center gap-2">
                <span className="text-slate-300">/</span>
                <button
                  onClick={() => setCurrentParentId(step.id)}
                  className={`text-sm px-4 py-2 rounded-xl truncate max-w-[200px] transition-all ${
                    index === historyPath.length - 1 
                      ? 'bg-emerald-100 text-emerald-800 font-extrabold' 
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 font-medium' 
                  }`}
                  title={step.title}
                >
                  {step.title.substring(0, 25)}...
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex-grow flex flex-col justify-center">
          {rootNodes.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-6">🌱</div>
              <p className="text-slate-500 font-medium text-lg mb-8">{dict.emptyProject}</p>
              
              {/* NOT 2: BURASI ARTIK ULTRA CANLI VE ULTRA HAVALI YENİ BUTON */}
              <button
                onClick={handleGenerateRoot}
                disabled={generatingId === 'root'}
                className="relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold px-12 py-5 rounded-full text-xl transition-all duration-300 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-600/40 hover:scale-105 active:scale-95 disabled:from-slate-300 disabled:to-slate-400 flex items-center gap-3 mx-auto tracking-wide"
              >
                {generatingId === 'root' ? (
                  <> <span className="animate-spin">🔮</span> {dict.generating} </>
                ) : (
                  <> <span>✨</span> {dict.createButton} </>
                )}
              </button>

            </div>
          ) : (
            <div className="w-full">
              {generatingId ? (
                <div className="text-center py-20 animate-pulse">
                  <div className="text-5xl mb-4">🔮</div>
                  <h3 className="text-xl font-bold text-emerald-600">Yapay Zeka bu fikri derinleştiriyor...</h3>
                  <p className="text-slate-500 mt-2">Lütfen bekleyin, yeni perspektifler oluşturuluyor.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {currentOptions.map((node) => (
                    <div 
                      key={node.id} 
                      className="bg-white border-2 border-slate-200 hover:border-emerald-500 rounded-3xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group cursor-pointer"
                      onClick={() => handleSelectOption(node)}
                    >
                      <p className="text-slate-800 font-medium text-lg leading-relaxed mb-6 group-hover:text-slate-950">
                        {node.title}
                      </p>
                      {/* Seçenek butonunu da canlandırdık */}
                      <button className="relative overflow-hidden bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-12 py-5 rounded-full text-xl transition-all duration-300 shadow-xl shadow-emerald-600/30 hover:shadow-emerald-600/50 hover:scale-105 active:scale-95 disabled:bg-slate-300 disabled:shadow-none flex items-center gap-3 mx-auto tracking-wide">
                        Bu Yolu Seç →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {rootNodes.length > 0 && (
          <div className="mt-12 pt-6 border-t border-slate-200 flex justify-center">
            <button 
              onClick={() => window.print()}
              className="bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-extrabold text-lg transition-all shadow-lg hover:shadow-xl flex items-center gap-3"
            >
              📄 Simülasyonu Bitir ve PDF İndir
            </button>
          </div>
        )}
      </div>

      {/* PDF Görünümü (Yazıcı modunda tetiklenir) */}
      <div className="hidden print:block w-full text-black bg-white">
        <div className="border-b-4 border-slate-900 pb-6 mb-8">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Perspektif Ağadı Raporu</h1>
          <h2 className="text-xl text-slate-600 font-semibold">Ana Konu: {projectTitle}</h2>
        </div>
        {historyPath.length > 0 && (
          <div className="mb-10">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">🧭 İzlenen Yol</h3>
            <div className="pl-4 border-l-4 border-slate-200 space-y-6">
              {historyPath.map((step, index) => (
                <div key={step.id} className="relative">
                  <div className="absolute -left-[25px] top-1 bg-slate-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">{index + 1}</div>
                  <h4 className="text-lg font-bold text-slate-900">{step.title}</h4>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="mt-10 pt-8 border-t-2 border-slate-200">
          <h3 className="text-2xl font-bold text-slate-800 mb-6">📍 Son Perspektifler</h3>
          <div className="space-y-4">
            {currentOptions.map((opt, idx) => (
              <div key={opt.id} className="p-4 bg-slate-50 border border-slate-300 rounded-xl">
                <span className="font-extrabold text-slate-400 mr-2">Seçenek {idx + 1}:</span>
                <span className="text-lg text-slate-800 font-medium">{opt.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}