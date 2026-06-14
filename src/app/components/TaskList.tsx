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
  const [isGuest, setIsGuest] = useState(false);
  
  const dict = useDictionary();

  useEffect(() => {
    checkUserAndFetch();
  }, [projectId]);

  const checkUserAndFetch = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setIsGuest(true);
      setIsLoading(false);
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

  const generateUUID = () => Math.random().toString(36).substring(2, 15);

  const handleSelectOption = async (selectedNode: any) => {
    setCurrentParentId(selectedNode.id); 
    const hasChildren = nodes.some(n => n.parent_id === selectedNode.id);
    if (hasChildren) return;

    setGeneratingId(selectedNode.id);
    try {
      const systemPrompt = "Sen ufuk açıcı bir düşünürsün. Verilen alt fikri derinleştiren tamamen yeni 3 felsefi, pratik veya stratejik alt perspektif üret. DİKKAT: Hiçbir giriş veya sonuç cümlesi yazma. Sadece 3 madde ver. Her fikrin başına sadece tire (-) koy.";
      const userPrompt = `Ana Konu: "${projectTitle}". Alt fikir: "${selectedNode.title}".`;

      const response = await aiService.generateResponse(systemPrompt, userPrompt);
      
      let cleanLines = response
        .split('\n')
        .map(line => line.replace(/^[\d\.\-\*\s]+/, '').trim())
        .filter(line => line.length > 10)
        .slice(0, 3);

      const newNodes: any[] = [];
      const session = await supabase.auth.getSession();
      const userId = session.data.session?.user?.id;
      
      cleanLines.forEach(title => {
        // ÇÖZÜM: Veritabanına gidecek paketi "undefined" değerlerinden koruyoruz
        const taskPayload: any = {
          project_id: projectId,
          title: title,
          parent_id: selectedNode.id,
          status: 'todo'
        };

        if (userId) taskPayload.user_id = userId;
        if (isGuest) taskPayload.id = generateUUID(); // Sadece misafirse ID üret

        newNodes.push(taskPayload);
      });

      if (newNodes.length > 0) {
        if (!isGuest) {
          const { error } = await supabase.from('tasks').insert(newNodes);
          if (error) throw error; // Supabase hatasını ekrana bas
          await fetchNodes();
        } else {
          setNodes(prev => [...prev, ...newNodes]);
        }
      }
    } catch (error: any) {
      console.error("Supabase Kayıt Hatası:", error);
      alert(`🚨 Kayıt Hatası: ${error.message}`);
      setCurrentParentId(selectedNode.parent_id);
    } finally {
      setGeneratingId(null);
    }
  };

  const handleGenerateRoot = async () => {
    setGeneratingId('root');
    try {
      const systemPrompt = "Sen ufuk açıcı bir düşünürsün. Verilen konuyu ele alan en temel ve kışkırtıcı 3 farklı perspektif üret. DİKKAT: Hiçbir giriş veya sonuç cümlesi yazma. Sadece 3 madde ver. Her fikrin başına sadece tire (-) koy.";
      const userPrompt = `Konu: "${projectTitle}".`;

      const response = await aiService.generateResponse(systemPrompt, userPrompt);
      
      let cleanLines = response
        .split('\n')
        .map(line => line.replace(/^[\d\.\-\*\s]+/, '').trim())
        .filter(line => line.length > 10)
        .slice(0, 3);

      const newNodes: any[] = [];
      const session = await supabase.auth.getSession();
      const userId = session.data.session?.user?.id;
      
      cleanLines.forEach(title => {
        // ÇÖZÜM: Veritabanına gidecek paketi temizliyoruz
        const taskPayload: any = {
          project_id: projectId,
          title: title,
          parent_id: null,
          status: 'todo'
        };

        if (userId) taskPayload.user_id = userId;
        if (isGuest) taskPayload.id = generateUUID();

        newNodes.push(taskPayload);
      });

      if (newNodes.length > 0) {
        if (!isGuest) {
          const { error } = await supabase.from('tasks').insert(newNodes);
          if (error) throw error;
          await fetchNodes();
        } else {
          setNodes(newNodes);
        }
      }
    } catch (error: any) {
      console.error("Supabase Kayıt Hatası:", error);
      alert(`🚨 Kayıt Hatası: ${error.message}`);
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

  if (isLoading) return <p className="text-slate-500 p-10 text-center animate-pulse">Yükleniyor...</p>;

  const currentOptions = nodes.filter(n => n.parent_id === currentParentId);
  const rootNodes = nodes.filter(n => n.parent_id === null);
  const historyPath = getHistoryPath();
  const activeNode = nodes.find(n => n.id === currentParentId);

  // src/app/components/TaskList.tsx (return kısmından itibaren)

  return (
    <>
      {/* YENİ: Genişletilmiş Tünel Alanı (max-w-[1400px]) */}
      <div className="w-full max-w-[1400px] mx-auto flex flex-col min-h-[70vh] print:hidden px-4 md:px-8">
        
        {historyPath.length > 0 && (
          <div className="mb-12 flex flex-wrap items-center gap-2 bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-200 shadow-sm">
            <button 
              onClick={() => setCurrentParentId(null)}
              className="text-base font-bold text-slate-400 hover:text-emerald-600 transition-colors px-2"
            >
              🏠 Başlangıç
            </button>
            
            {historyPath.map((step, index) => (
              <div key={step.id} className="flex items-center gap-2">
                <span className="text-slate-300">/</span>
                <button
                  onClick={() => setCurrentParentId(step.id)}
                  className={`text-sm md:text-base px-5 py-2.5 rounded-xl truncate max-w-[250px] transition-all ${
                    index === historyPath.length - 1 
                      ? 'bg-emerald-100 text-emerald-800 font-extrabold shadow-sm' 
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 font-medium' 
                  }`}
                  title={step.title}
                >
                  {step.title.substring(0, 30)}...
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex-grow flex flex-col justify-center">
          {rootNodes.length === 0 ? (
             <div className="text-center py-32">
               <div className="text-7xl mb-8 animate-bounce">🌱</div>
               <p className="text-slate-500 font-medium text-xl mb-10">{dict.emptyProject}</p>
               <button
                 onClick={handleGenerateRoot}
                 disabled={generatingId === 'root'}
                 className="relative bg-emerald-500 text-white font-extrabold px-14 py-6 rounded-full shadow-xl shadow-emerald-500/40 text-2xl flex items-center justify-center gap-4 tracking-wide transition-transform duration-300 hover:-translate-y-1 hover:scale-105 active:scale-95 disabled:scale-100 disabled:cursor-not-allowed mx-auto"
               >
                 {generatingId === 'root' ? (
                   <> <span className="animate-spin">🔮</span> {dict.generating} </>
                 ) : (
                   <> <span className="animate-pulse">✨</span> {dict.createButton} </>
                 )}
               </button>
             </div>
          ) : (
            <div className="w-full">
              {generatingId ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  {[1, 2, 3].map((skeleton) => (
                    <div key={skeleton} className="bg-white border border-slate-100 rounded-[2.5rem] p-10 md:p-12 shadow-sm flex flex-col justify-between animate-pulse min-h-[400px]">
                      <div className="space-y-6 mt-4">
                        <div className="h-6 bg-slate-200 rounded-full w-full"></div>
                        <div className="h-6 bg-slate-200 rounded-full w-5/6"></div>
                        <div className="h-6 bg-slate-200 rounded-full w-full"></div>
                        <div className="h-6 bg-slate-200 rounded-full w-3/4"></div>
                      </div>
                      <div className="w-full h-16 bg-slate-100 rounded-2xl mt-10"></div>
                    </div>
                  ))}
                </div>
              ) : currentOptions.length === 0 ? (
                <div className="text-center py-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem]">
                   <div className="text-7xl mb-6">🌪️</div>
                   <h3 className="text-3xl font-extrabold text-slate-800 mb-4">Düşünce tüneli burada tıkandı</h3>
                   <button
                     onClick={() => activeNode && handleSelectOption(activeNode)}
                     className="bg-slate-800 hover:bg-slate-900 text-white px-10 py-5 rounded-full font-bold text-xl transition-transform hover:-translate-y-1 shadow-lg flex items-center gap-3 mx-auto mt-8"
                   >
                     🔄 Tekrar Zihnini Zorla
                   </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  {currentOptions.map((node) => (
                    <div 
                      key={node.id} 
                      className="bg-white border border-slate-200 hover:border-emerald-500 rounded-[3rem] p-10 md:p-12 shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col justify-between group cursor-pointer hover:-translate-y-2 min-h-[420px]"
                      onClick={() => handleSelectOption(node)}
                    >
                      {/* YENİ: GERÇEK EDİTORYAL DERGİ TİPOGRAFİSİ */}
                      <p className="text-slate-800 font-semibold text-xl md:text-2xl leading-relaxed mb-12 tracking-tight group-hover:text-slate-950">
                        {node.title}
                      </p>
                      
                      <button className="w-full bg-slate-50 group-hover:bg-emerald-500 text-slate-500 group-hover:text-white font-extrabold text-xl py-6 rounded-3xl transition-colors duration-300 flex justify-between items-center px-8">
                        <span>Bu Yolu Seç</span>
                        <span className="text-3xl group-hover:translate-x-3 transition-transform">→</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {rootNodes.length > 0 && (
          <div className="mt-20 pt-10 border-t border-slate-200 flex justify-center mb-16">
            <button 
              onClick={() => window.print()}
              className="bg-slate-900 hover:bg-black text-white px-12 py-6 rounded-full font-extrabold text-2xl transition-transform hover:scale-105 shadow-2xl flex items-center gap-4"
            >
              📄 Simülasyonu Bitir ve Rapor Çıkar
            </button>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* PREMIUM BUSINESS REPORT PDF TEMPLATE (PRINT ONLY)       */}
      {/* ========================================================= */}
      <div className="hidden print:block w-full text-slate-900 bg-white font-sans print:color-adjust-exact">
        
        {/* Antetli Rapor Üst Bilgisi */}
        <div className="flex justify-between items-end border-b-4 border-slate-900 pb-8 mb-12">
          <div>
            <p className="text-emerald-600 font-black tracking-widest uppercase text-xs mb-2">SYNAPSE FLOW • EXECUTIVE BRIEF</p>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">Stratejik Analiz Raporu</h1>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-800">Tarih: {new Date().toLocaleDateString('tr-TR')}</p>
            <p className="text-xs text-slate-400 mt-1">Doküman ID: #SF-{projectId.substring(0,6).toUpperCase()}</p>
          </div>
        </div>

        {/* Proje Künyesi Kutusu */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-12 flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Odaklanılan Ana Strateji / Konu</span>
          <h2 className="text-3xl text-slate-900 font-extrabold tracking-tight">"{projectTitle}"</h2>
        </div>

        {/* Sol Sütun: Yolculuk | Sağ Sütun: Çıktılar (Premium Matrix Düzeni) */}
        <div className="grid grid-cols-12 gap-10">
          
          {/* İZLENEN ROTA (TIMELINE) */}
          {historyPath.length > 0 && (
            <div className="col-span-5 print:break-inside-avoid">
              <h3 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight mb-6 border-b border-slate-300 pb-2">
                🧭 Zihinsel Rota
              </h3>
              <div className="relative pl-6 border-l-2 border-emerald-500 space-y-8 ml-2 mt-4">
                {historyPath.map((step, index) => (
                  <div key={step.id} className="relative">
                    {/* Timeline Düğümü */}
                    <div className="absolute -left-[31px] top-1 bg-emerald-600 text-white w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shadow-sm ring-4 ring-white"></div>
                    <span className="text-xs font-bold text-slate-400">Adım {index + 1}</span>
                    <h4 className="text-base font-bold text-slate-800 leading-tight mt-0.5">{step.title}</h4>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NİHAİ STRATEJİK SEÇENEKLER */}
          <div className={`${historyPath.length > 0 ? 'col-span-7' : 'col-span-12'}`}>
            <h3 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight mb-6 border-b border-slate-300 pb-2">
              📍 Geliştirilen Perspektifler
            </h3>
            <div className="space-y-4 mt-4">
              {currentOptions.map((opt, idx) => (
                <div key={opt.id} className="print:break-inside-avoid bg-white border-2 border-slate-100 rounded-xl p-5 shadow-sm flex items-start gap-4">
                  <div className="bg-slate-900 text-white font-black text-sm w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 leading-relaxed">{opt.title}</h4>
                    <p className="text-xs text-slate-400 mt-2 italic">• Synapse Flow AI tarafından optimize edilmiştir.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* İmza ve Onay Alanı (Kurumsallığı Tepeye Çıkaran Detay) */}
        <div className="mt-24 border-t border-slate-200 pt-8 print:break-inside-avoid">
          <div className="flex justify-between items-center text-sm text-slate-500">
            <div>
              <p className="font-bold text-slate-800">Hazırlayan AI Sistem:</p>
              <p className="text-emerald-600 font-extrabold">Synapse Flow Core Engine v3.5</p>
            </div>
            <div className="text-center border-t border-slate-300 pt-4 w-48">
              <p className="font-bold text-slate-700 text-xs uppercase tracking-wider">Yönetici Onayı</p>
              <div className="h-8"></div> {/* İmza Boşluğu */}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}