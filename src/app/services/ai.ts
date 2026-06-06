// src/app/services/ai.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

class AIService {
  // 1. MÜDAHALE: Daha stabil ve kotası geniş olan modele geçiyoruz
  private model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 

  async generateResponse(systemPrompt: string, userMessage: string, retries = 3): Promise<string> {
    for (let i = 0; i < retries; i++) {
      try {
        const prompt = `${systemPrompt}\n\nKullanıcı Metni: "${userMessage}"`;
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        
        return response.text() || "Yapay zeka boş bir cevap döndürdü.";
      } catch (error: any) {
        // 2. MÜDAHALE: Hem 503 (Sunucu Meşgul) hem de 429 (Kota Doldu) hatalarını yakala
        const isRateLimitOrBusy = error.message?.includes('503') || error.status === 503 || error.message?.includes('429') || error.status === 429;
        
        // Eğer limite takıldıysak ve hala deneme hakkımız varsa, "bekleme süresini" uzatıyoruz (Fren)
        if (isRateLimitOrBusy && i < retries - 1) {
          console.warn(`API Sınırı veya Yoğunluk. ${i + 1}. yeniden deneme için bekleniyor...`);
          // 429 yediğimizde anında saldırmak yerine 3 saniye, 6 saniye bekleyip öyle deniyoruz.
          await new Promise(resolve => setTimeout(resolve, 3000 * (i + 1)));
          continue; 
        }
        
        // Eğer tüm denemelere rağmen hala 429 veriyorsa, kullanıcıya gerçekçi bir uyarı ver
        throw new Error(
          isRateLimitOrBusy 
            ? "Yapay zeka dakikalık sorgu sınırına (Rate Limit) ulaştı. Lütfen 1 dakika bekleyip tekrar deneyin." 
            : "Yapay zeka ile iletişim kurulamadı. API anahtarınızı kontrol edin."
        );
      }
    }
    return "";
  }
}

export const aiService = new AIService();