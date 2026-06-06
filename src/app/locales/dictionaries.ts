// src/app/locales/dictionaries.ts

export const dictionaries = {
  tr: {
    heroTitle: "Düşünce",
    heroHighlight: "Ağacı",
    heroDesc: "Tek bir kelimeden sonsuz perspektifler yaratın. Fikirlerinizi derinleştirin ve zihninizi özgür bırakın.",
    // YENİ: Rastgele placeholder dizisi
    inputPlaceholders: [
      "Konuyu yazın (Örn: Yapay Zeka Sanatı Öldürür Mü?)",
      "Konuyu yazın (Örn: Evren bir simülasyon olabilir mi?)",
      "Konuyu yazın (Örn: İnsanlık Mars'ta nasıl bir toplum kurmalı?)",
      "Konuyu yazın (Örn: Sonsuz yaşam psikolojimizi nasıl etkiler?)",
      "Konuyu yazın (Örn: Özgür irade sadece bir yanılsama mı?)"
    ],
    createButton: "3 Bakış Açısı Üret",
    generating: "Zihin Haritası Çiziliyor...",
    projectsTitle: "Zihin Haritalarım",
    emptyProject: "Henüz bir fikir tohumu ekmediniz. Yeni bir konu belirleyerek zihninizi genişletmeye başlayın.",
    taskCount: "Derinlik Seviyesi",
    delete: "Sil",
    builtBy: "Bu uygulama Oğuz (Nafi) Güven tarafından inşa edilmiştir.",
  },
  en: {
    heroTitle: "Thought",
    heroHighlight: "Tree",
    heroDesc: "Create infinite perspectives from a single word. Deepen your ideas and free your mind.",
    inputPlaceholders: [
      "Enter a topic (e.g., Will AI kill art?)",
      "Enter a topic (e.g., Is the universe a simulation?)",
      "Enter a topic (e.g., How should society function on Mars?)",
      "Enter a topic (e.g., How would immortality affect psychology?)",
      "Enter a topic (e.g., Is free will an illusion?)"
    ],
    createButton: "Generate 3 Perspectives",
    generating: "Drawing Mind Map...",
    projectsTitle: "My Mind Maps",
    emptyProject: "You haven't planted an idea seed yet. Start expanding your mind by setting a new topic.",
    taskCount: "Depth Level",
    delete: "Delete",
    builtBy: "Built by Oguz (Nafi) Guven.",
  },
  de: {
    heroTitle: "Gedanken",
    heroHighlight: "Baum",
    heroDesc: "Erschaffen Sie unendliche Perspektiven aus einem einzigen Wort. Vertiefen Sie Ihre Ideen.",
    inputPlaceholders: [
      "Thema eingeben (z. B. Wird KI die Kunst töten?)",
      "Thema eingeben (z. B. Ist das Universum eine Simulation?)",
      "Thema eingeben (z. B. Wie sollte die Gesellschaft auf dem Mars funktionieren?)",
      "Thema eingeben (z. B. Wie würde Unsterblichkeit die Psychologie beeinflussen?)",
      "Thema eingeben (z. B. Ist der freie Wille eine Illusion?)"
    ],
    createButton: "3 Perspektiven Generieren",
    generating: "Mindmap wird gezeichnet...",
    projectsTitle: "Meine Mindmaps",
    emptyProject: "Sie haben noch keinen Ideensamen gepflanzt. Beginnen Sie jetzt.",
    taskCount: "Tiefenebene",
    delete: "Löschen",
    builtBy: "Erstellt von Oguz (Nafi) Guven.",
  }
};

export const getDictionary = (langCode: string) => {
  const code = langCode.substring(0, 2).toLowerCase();
  return dictionaries[code as keyof typeof dictionaries] || dictionaries['en'];
};