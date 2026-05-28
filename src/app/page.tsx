// src/app/page.tsx
import ProjectForm from './components/ProjectForm';
import ProjectList from './components/ProjectList';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
      
      {/* Üst Kısım ve Bileşenler */}
      <div className="flex-1 flex flex-col items-center pt-20 px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight text-center">
          Yapay Zeka Destekli Görev Yöneticisi
        </h1>
        <p className="text-md text-gray-500 mb-10 text-center">
          Local-First AI projemize hoş geldin. Veriler güvende, cihazında.
        </p>

        {/* Az önce oluşturduğumuz 2 bileşeni (Form ve Liste) buraya çağırıyoruz */}
        <ProjectForm />
        <ProjectList />

      </div>

      {/* Oğuz Güven - Minimalist İmza */}
      <footer className="w-full text-center py-6 pb-8">
        <p className="text-sm text-gray-400 tracking-wider">
          Crafted with precision by <span className="font-semibold text-gray-600">Oğuz Güven</span>
        </p>
      </footer>

    </main>
  );
}