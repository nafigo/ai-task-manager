// src/components/AILoader.tsx
'use client';

import { useState } from 'react';
import { aiService } from '../services/ai';

export default function AILoader() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [progress, setProgress] = useState('');

  const handleLoadAI = async () => {
    setIsLoading(true);
    try {
      // AI servisimizi çağırıyoruz ve gelen canlı raporları state'e yazıyoruz
      await aiService.initEngine((report) => {
        setProgress(report);
      });
      setIsLoaded(true);
      setProgress('Model başarıyla yüklendi! Artık cihazında çalışıyor.');
    } catch (error) {
      setProgress('Yükleme sırasında hata oluştu. Lütfen sayfayı yenile.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Eğer motor yüklendiyse ekranda şık bir "Aktif" mesajı göster
  if (isLoaded) {
    return (
      <div className="w-full max-w-md bg-green-50 text-green-700 p-3 rounded-lg text-sm text-center border border-green-200 mb-8 font-medium shadow-sm">
        🧠 Yapay Zeka Motoru Aktif ve Göreve Hazır
      </div>
    );
  }

  // Henüz yüklenmediyse yükleme butonunu ve çubuğunu göster
  return (
    <div className="w-full max-w-md bg-white border border-gray-200 p-5 rounded-lg shadow-sm mb-8 flex flex-col items-center gap-3">
      <p className="text-sm text-gray-600 text-center">
        Otomatik görev üretmek için Yapay Zeka motorunu tarayıcına indirmelisin. (Sadece ilk seferde indirilir, sonra önbellekten anında açılır).
      </p>
      <button
        onClick={handleLoadAI}
        disabled={isLoading}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-wait"
      >
        {isLoading ? 'Yükleniyor...' : 'Yapay Zekayı Başlat'}
      </button>
      
      {/* Canlı yükleme durumu buraya yazılacak */}
      {progress && (
        <p className="text-xs text-gray-500 font-mono text-center mt-2 bg-gray-50 p-2 rounded w-full break-words">
          {progress}
        </p>
      )}
    </div>
  );
}