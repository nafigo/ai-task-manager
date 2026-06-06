// src/app/hooks/useDictionary.ts
import { useState, useEffect } from 'react';
import { getDictionary } from '../locales/dictionaries';

export const useDictionary = () => {
  // İlk açılışta varsayılan olarak İngilizce veya Türkçe yükle
  const [dict, setDict] = useState(getDictionary('en')); 

  useEffect(() => {
    // Sayfa tarayıcıda yüklendiği an bilgisayarın dilini yakala
    if (typeof window !== 'undefined') {
      const userLang = navigator.language; // Örn: 'tr-TR', 'en-US', 'de-DE'
      setDict(getDictionary(userLang));
    }
  }, []);

  return dict; // Yakalanan dile ait sözlüğü sayfaya fırlat
};