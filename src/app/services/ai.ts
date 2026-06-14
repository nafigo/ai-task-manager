// src/app/services/ai.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. KONTROL: Değişken sisteme başarıyla sızabilmiş mi?
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  console.error("🚨 KRİTİK MİMARİ HATA: NEXT_PUBLIC_GEMINI_API_KEY çevresel değişkeni okunamıyor. .env.local dosyanızı ve önbelleğinizi kontrol edin.");
} else {
  console.log("✅ API Anahtarı sisteme başarıyla yüklendi. Uzunluk:", apiKey.length);
}

// Güvenli başlatma
const genAI = new GoogleGenerativeAI(apiKey || "BOS_ANAHTAR");

class AIService {
private model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });  async generateResponse(systemPrompt: string, userMessage: string, retries = 3): Promise<string> {
    if (!apiKey) {
      throw new Error("Sistemde API anahtarı yok. Lütfen yapılandırmayı kontrol edin.");
    }

    for (let i = 0; i < retries; i++) {
      try {
        console.log(`🧠 [Deneme ${i + 1}/${retries}] Google Gemini'ye istek gönderiliyor...`);
        const prompt = `${systemPrompt}\n\nKullanıcı Metni: "${userMessage}"`;
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        
        console.log("✅ Başarılı Yanıt Alındı!");
        return response.text() || "Yapay zeka boş bir cevap döndürdü.";
        
      } catch (error: any) {
        // ŞEFFAF HATA YAKALAYICI: Maskelemeyi bırak, gerçeği söyle!
        console.error("❌ GOOGLE API'DEN REDDEDİLDİ. TAM HATA DETAYI:");
        console.error("- İsim:", error.name);
        console.error("- Mesaj:", error.message);
        console.error("- Durum Kodu (Status):", error.status);

        const isRateLimitOrBusy = error.message?.includes('503') || error.status === 503 || error.message?.includes('429') || error.status === 429;
        
        if (isRateLimitOrBusy && i < retries - 1) {
          console.warn(`⏳ Kota/Yoğunluk sınırı. ${3 * (i + 1)} saniye bekleniyor...`);
          await new Promise(resolve => setTimeout(resolve, 3000 * (i + 1)));
          continue; 
        }
        
        // Hatayı doğrudan ekrana yansıtıyoruz ki ne olduğunu bilelim
        throw new Error(`API Reddi: ${error.message || "Bilinmeyen sunucu hatası."}`);
      }
    }
    return "";
  }
}

export const aiService = new AIService();