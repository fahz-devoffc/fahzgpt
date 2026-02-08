
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AIConfig, Attachment } from "../types";

export class GeminiService {
  private getApiKey(): string {
    const apiKey = process.env.API_KEY;
    if (!apiKey || apiKey === "undefined" || apiKey === "") {
      throw new Error("API_KEY_NOT_FOUND: Masukkan API Key Anda di Environment Variables (misal di Vercel/Local ENV).");
    }
    return apiKey;
  }

  private isProxyConfig(config: AIConfig): boolean {
    return !!(config.apiEndpoint && (config.apiEndpoint.includes('vikey.ai') || config.apiEndpoint.includes('/v1')));
  }

  async generateResponse(prompt: string, config: AIConfig, attachments?: Attachment[]): Promise<string> {
    const apiKey = this.getApiKey();
    
    if (this.isProxyConfig(config)) {
      try {
        const baseUrl = config.apiEndpoint?.replace(/\/+$/, '');
        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: config.model || "gemini-2.5-flash-lite-latest",
            messages: [
              { role: "system", content: config.systemInstruction },
              { role: "user", content: prompt }
            ],
            temperature: config.temperature || 0.7,
            max_tokens: 2048
          })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || `Proxy Error: ${response.status}`);
        
        return data.choices?.[0]?.message?.content || "Respon proxy kosong.";
      } catch (error: any) {
        throw new Error("Vikey Error: " + error.message);
      }
    }

    // Mode Standar SDK
    const ai = new GoogleGenAI({ apiKey });
    const parts: any[] = [{ text: prompt }];
    if (attachments) {
      attachments.forEach(att => parts.push({ inlineData: { data: att.data, mimeType: att.mimeType } }));
    }

    const res: GenerateContentResponse = await ai.models.generateContent({
      model: config.model || 'gemini-flash-lite-latest',
      contents: [{ role: 'user', parts }],
      config: { systemInstruction: config.systemInstruction, temperature: config.temperature },
    });
    return res.text || "AI memberikan respon kosong.";
  }

  async generateImage(prompt: string, config: AIConfig): Promise<string> {
    const apiKey = this.getApiKey();

    if (this.isProxyConfig(config)) {
      try {
        const baseUrl = config.apiEndpoint?.replace(/\/+$/, '');
        // Banyak proxy menggunakan endpoint /images/generations (DALL-E style) 
        // atau tetap via /chat/completions jika modelnya multimodal.
        // Untuk Vikey, kita asumsikan menggunakan model flash-image via chat completion jika didukung,
        // atau fallback ke standard fetch.
        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "gemini-2.5-flash-image",
            messages: [{ role: "user", content: prompt }],
          })
        });

        const data = await response.json();
        // Jika proxy mengembalikan content text berisi b64
        if (data.choices?.[0]?.message?.content?.includes('data:image')) {
          return data.choices[0].message.content;
        }
        // Jika proxy meneruskan format asli Gemini
        if (data.candidates?.[0]?.content?.parts) {
          for (const part of data.candidates[0].content.parts) {
            if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          }
        }
        throw new Error("Format gambar dari proxy tidak dikenal.");
      } catch (error: any) {
        // Jika gagal via proxy, beri tahu user
        throw new Error("Gagal membuat gambar via Vikey: " + error.message);
      }
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    throw new Error("Gagal memproses gambar.");
  }

  async generateVideo(prompt: string, config: AIConfig): Promise<string> {
    // Video generation biasanya membutuhkan API Key Google asli dan tidak disarankan via proxy
    const apiKey = this.getApiKey();
    const ai = new GoogleGenAI({ apiKey });
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
    const response = await fetch(`${downloadLink}&key=${apiKey}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }
}

export const geminiService = new GeminiService();
