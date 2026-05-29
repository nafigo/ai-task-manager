// src/app/services/ai.ts
import { CreateMLCEngine, MLCEngine } from "@mlc-ai/web-llm";

// Daha akıllı model: Qwen2.5-1.5B 
const SELECTED_MODEL = "Qwen2.5-0.5B-Instruct-q4f16_1-MLC";

class AIService {
  private engine: MLCEngine | null = null;
  private onProgressCallback: ((progress: string) => void) | null = null;

  async initEngine(onProgress: (progress: string) => void): Promise<MLCEngine> {
    if (this.engine) return this.engine;
    this.onProgressCallback = onProgress;

    try {
      this.engine = await CreateMLCEngine(SELECTED_MODEL, {
        initProgressCallback: (report) => {
          if (this.onProgressCallback) this.onProgressCallback(report.text);
        },
      });
      return this.engine;
    } catch (error) {
      console.error("AI Motoru başlatılırken bir hata oluştu:", error);
      throw error;
    }
  }

  async generateResponse(systemPrompt: string, userMessage: string): Promise<string> {
    if (!this.engine) {
      throw new Error("Yapay zeka motoru henüz başlatılmadı! Önce initEngine çalıştırılmalı.");
    }

    try {
      const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ];

      // İŞTE TEK VE DOĞRU OLAN BLOK BURASI
      const reply = await this.engine.chat.completions.create({
        messages: messages as any,
        temperature: 0.1, // Çok ciddi ve net
        max_tokens: 150,  // Sonsuz döngü engellendi
      });

      return reply.choices[0].message.content || "Yapay zeka boş bir cevap döndürdü.";
    } catch (error) {
      console.error("Cevap üretilirken hata oluştu:", error);
      return "Üzgünüm, yerel model yanıt üretirken bir iç hata yaşadı.";
    }
  }
}

export const aiService = new AIService();