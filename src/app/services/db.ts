// src/services/db.ts
import Dexie, { type EntityTable } from 'dexie';
import { Project, Task } from '../types/database.types';

// Veritabanımızı 'AITaskManagerDB' adıyla oluşturuyoruz
const db = new Dexie('AITaskManagerDB') as Dexie & {
  projects: EntityTable<Project, 'id'>;
  tasks: EntityTable<Task, 'id'>;
};

// Veritabanı şeması (Sadece hızlı arama/filtreleme yapılacak alanları buraya yazıyoruz)
db.version(1).stores({
  projects: 'id, title, status, createdAt',
  tasks: 'id, projectId, status, createdAt'
});

export { db };