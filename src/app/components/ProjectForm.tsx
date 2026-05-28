// src/components/ProjectForm.tsx
'use client'; // Bu satır, bu bileşenin tarayıcıda çalışacağını (interaktif olduğunu) belirtir.

import { useState } from 'react';
import { db } from '../services/db';

export default function ProjectForm() {
  const [title, setTitle] = useState(''); // Kullanıcının yazdığı metni tutacağımız yer

  // Butona basıldığında çalışacak fonksiyon
  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault(); // Sayfanın yenilenmesini engeller
    if (!title.trim()) return; // Boş kayıt eklemeyi önler

    // Veritabanına yeni projeyi kaydediyoruz
    await db.projects.add({
      id: crypto.randomUUID(), // Benzersiz, rastgele bir kimlik oluşturur
      title: title,
      description: '',
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    setTitle(''); // Kayıt başarılı olunca kutucuğu temizler
  };

  return (
    <form onSubmit={handleAddProject} className="w-full max-w-md flex gap-2 mb-8">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Yeni proje adı..."
        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button 
        type="submit"
        className="bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
      >
        Oluştur
      </button>
    </form>
  );
}