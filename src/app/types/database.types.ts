// src/types/database.types.ts

// 1. Proje Modelimiz
export interface Project {
  id: string;                  // Projenin benzersiz kimliği
  title: string;               // Proje adı
  description: string;         // Proje detayı
  status: 'active' | 'paused' | 'completed'; // Sadece bu 3 durumdan biri olabilir
  createdAt: number;           // Oluşturulma tarihi (Sayısal zaman damgası)
  updatedAt: number;
}

// 2. Görev Modelimiz
export interface Task {
  id: string;
  projectId: string;           // Bu görev hangi projeye ait? (Bağlantı noktası)
  title: string;
  content: string;             // Görevin içeriği
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high'; // Öncelik durumu
  aiSummary?: string;          // AI'ın üreteceği özet (İsteğe bağlı, o yüzden "?" var)
  createdAt: number;
}