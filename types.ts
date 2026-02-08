
export enum AppTab {
  LEARN = 'LEARN',
  PLAYGROUND = 'PLAYGROUND',
  TEMPLATES = 'TEMPLATES',
  CODE = 'CODE',
  DEVELOPER = 'DEVELOPER',
  SETTINGS = 'SETTINGS'
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Attachment {
  mimeType: string;
  data: string; // base64
  url: string;
}

export interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  timestamp: string; // ISO string for storage
  attachments?: Attachment[];
  generatedImage?: string;
  generatedVideo?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  lastUpdated: string;
}

export interface AIConfig {
  systemInstruction: string;
  temperature: number;
  model: string;
  apiEndpoint?: string; // Endpoint kustom untuk proxy seperti Vikey.ai
}

export interface Template {
  id: string;
  name: string;
  description: string;
  systemInstruction: string;
  icon: string;
}
