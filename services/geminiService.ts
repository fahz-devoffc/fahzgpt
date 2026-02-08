
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AIConfig, Attachment } from "../types";

export class GeminiService {
  private getClient(customEndpoint?: string) {
    const apiKey = process.env.API_KEY;
    
    if (!apiKey || apiKey === "undefined" || apiKey === "") {
      throw new Error("API_KEY_NOT_FOUND: Masukkan API Key Anda di Environment Variables.");
    }
    
    // Inisialisasi client standar Google GenAI
    // Jika menggunakan proxy seperti Vikey, baseUrl akan diarahkan ke sana.
    // Catatan: SDK @google/genai akan mengirimkan API key melalui header 'x-goog-api-key'.
    // Kebanyakan proxy Gemini (seperti Vikey) sudah mendukung header ini secara otomatis.
    return new GoogleGenAI({ 
      apiKey,
      ...(customEndpoint ? { baseUrl: customEndpoint } : {})
    });
  }

  async generateResponse(prompt: string, config: AIConfig, attachments?: Attachment[]): Promise<string> {
    const ai = this.getClient(config.apiEndpoint);
    try {
      const parts: any[] = [{ text: prompt }];
      
      if (attachments && attachments.length > 0) {
        attachments.forEach(att => {
          parts.push({
            inlineData: {
              data: att.data,
              mimeType: att.mimeType
            }
          });
        });
      }

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: config.model || 'gemini-flash-lite-latest',
        contents: [{ role: 'user', parts }],
        config: {
          systemInstruction: config.systemInstruction,
          temperature: config.temperature,
        },
      });

      if (!response.text) {
        throw new Error("Model merespons kosong. Periksa apakah saldo Vikey Anda mencukupi.");
      }

      return response.text;
    } catch (error: any) {
      console.error("Gemini Error:", error);
      
      const msg = error.message || "";
      if (msg.includes("API key not valid") || msg.includes("401")) {
        throw new Error("API Key Vikey tidak valid atau salah format.");
      }
      if (msg.includes("404")) {
        throw new Error(`Model '${config.model}' tidak ditemukan di endpoint ini.`);
      }
      
      throw new Error(msg || "Terjadi masalah koneksi ke server Vikey/AI.");
    }
  }

  async generateImage(prompt: string, config?: AIConfig): Promise<string> {
    const ai = this.getClient(config?.apiEndpoint);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      const candidates = response.candidates;
      if (candidates && candidates[0].content.parts) {
        for (const part of candidates[0].content.parts) {
          if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          }
        }
      }
      throw new Error("Gagal memproses gambar dari AI.");
    } catch (error: any) {
      throw new Error("Gagal membuat gambar: " + error.message);
    }
  }

  async generateVideo(prompt: string, config?: AIConfig): Promise<string> {
    const ai = this.getClient(config?.apiEndpoint);
    try {
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      if (!response.ok) throw new Error("Gagal mengunduh file video.");
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error: any) {
      throw new Error("Generate Video gagal: " + error.message);
    }
  }
}

export const geminiService = new GeminiService();
