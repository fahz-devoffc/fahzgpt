
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, AIConfig, Attachment } from '../types';
import { geminiService } from '../services/geminiService';
import { BRANDING } from '../constants';
import VoiceCall from './VoiceCall';

const PreviewModal: React.FC<{ code: string; isOpen: boolean; onClose: () => void }> = ({ code, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-12">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full h-full bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-100 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Live Preview</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <iframe 
          srcDoc={code} 
          title="Preview" 
          className="w-full h-full border-none"
          sandbox="allow-scripts"
        />
      </div>
    </div>
  );
};

const CodeActionButtons: React.FC<{ code: string; language: string }> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const extensions: Record<string, string> = {
      'html': 'html', 'javascript': 'js', 'js': 'js', 'typescript': 'ts', 'ts': 'ts',
      'python': 'py', 'py': 'py', 'css': 'css', 'json': 'json', 'php': 'php'
    };
    const ext = extensions[language.toLowerCase()] || 'txt';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fahz-code-${Date.now()}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isHtml = language.toLowerCase() === 'html' || code.trim().toLowerCase().startsWith('<!doctype') || code.trim().toLowerCase().startsWith('<html');

  return (
    <>
      <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
        {isHtml && (
          <button 
            onClick={() => setIsPreviewOpen(true)}
            className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-indigo-600/80 text-white hover:bg-indigo-500 backdrop-blur-sm border border-indigo-500/50 transition-all flex items-center gap-2 shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            Pratinjau
          </button>
        )}
        <button 
          onClick={handleDownload}
          className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 backdrop-blur-sm border border-slate-700/50 transition-all flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Unduh
        </button>
        <button 
          onClick={handleCopy}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-2 ${
            copied ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 backdrop-blur-sm border border-slate-700/50'
          }`}
        >
          {copied ? 'Tersalin!' : 'Salin'}
        </button>
      </div>
      <PreviewModal code={code} isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} />
    </>
  );
};

const MessageContent: React.FC<{ content: string }> = ({ content }) => {
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-4">
      {parts.map((part, index) => {
        if (part.startsWith('```')) {
          const match = part.match(/```(\w+)?\n?([\s\S]*?)\n?```/);
          const language = match?.[1] || 'code';
          const code = match?.[2] || '';

          return (
            <div key={index} className="relative group my-4">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 rounded-t-xl border-x border-t border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{language}</span>
              </div>
              <div className="relative">
                <CodeActionButtons code={code} language={language} />
                <pre className="bg-slate-950 p-4 rounded-b-xl border border-slate-800 overflow-x-auto code-font text-xs lg:text-sm leading-relaxed text-indigo-100 shadow-inner">
                  <code>{code}</code>
                </pre>
              </div>
            </div>
          );
        }
        return (
          <div key={index} className="whitespace-pre-wrap leading-relaxed">
            {part}
          </div>
        );
      })}
    </div>
  );
};

interface PlaygroundProps {
  messages: ChatMessage[];
  setMessages: (messages: ChatMessage[]) => void;
  config: AIConfig;
  setConfig: React.Dispatch<React.SetStateAction<AIConfig>>;
  onStartNew: () => void;
}

const Playground: React.FC<PlaygroundProps> = ({ messages, setMessages, config, setConfig, onStartNew }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isVoiceCallOpen, setIsVoiceCallOpen] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const filesArray = Array.from(files) as File[];
    for (const file of filesArray) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = (event.target?.result as string).split(',')[1];
        const attachment: Attachment = {
          mimeType: file.type,
          data: base64,
          url: URL.createObjectURL(file)
        };
        setPendingAttachments(prev => [...prev, attachment]);
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAction = async (type: 'chat' | 'image' | 'video') => {
    if ((!input.trim() && pendingAttachments.length === 0) || isLoading) return;

    if (type === 'video' || config.model === 'gemini-3-pro-image-preview') {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await (window as any).aistudio.openSelectKey();
      }
    }

    const currentInput = input;
    const currentAttachments = [...pendingAttachments];
    
    const userMsg: ChatMessage = { 
      role: 'user', 
      content: currentInput, 
      timestamp: new Date().toISOString(), 
      attachments: currentAttachments 
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setPendingAttachments([]);
    setIsLoading(true);

    try {
      let aiContent = '';
      let generatedImage = undefined;
      let generatedVideo = undefined;

      if (type === 'image') {
        generatedImage = await geminiService.generateImage(currentInput);
        aiContent = `Saya telah membuatkan gambar berdasarkan: "${currentInput}"`;
      } else if (type === 'video') {
        generatedVideo = await geminiService.generateVideo(currentInput);
        aiContent = `Video Anda sudah siap: "${currentInput}"`;
      } else {
        aiContent = await geminiService.generateResponse(currentInput, config, currentAttachments);
      }

      setMessages([...newMessages, { 
        role: 'ai', 
        content: aiContent, 
        timestamp: new Date().toISOString(),
        generatedImage,
        generatedVideo
      }]);
    } catch (error: any) {
      if (error.message?.includes("Requested entity was not found.")) {
        await (window as any).aistudio.openSelectKey();
      }
      setMessages([...newMessages, { 
        role: 'ai', 
        content: `⚠️ Kesalahan: ${error.message}`, 
        timestamp: new Date().toISOString() 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getModelLabel = () => {
    switch(config.model) {
      case 'gemini-flash-lite-latest': return 'FAHZ LITE';
      case 'gemini-3-flash-preview': return 'FAHZ FLASH';
      case 'gemini-3-pro-preview': return 'FAHZ PRO';
      case 'gemini-2.5-flash-preview-04-17': return 'FAHZ PREMIUM';
      default: return 'FAHZ AI';
    }
  };

  const getStatusColor = () => {
    switch(config.model) {
      case 'gemini-flash-lite-latest': return 'bg-emerald-500';
      case 'gemini-3-flash-preview': return 'bg-amber-400';
      case 'gemini-3-pro-preview': return 'bg-indigo-500';
      case 'gemini-2.5-flash-preview-04-17': return 'bg-violet-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto relative overflow-hidden">
      {/* Desktop Header Overlay */}
      <div className="hidden lg:flex items-center justify-between p-3 absolute top-0 left-0 right-0 z-20 bg-slate-950/50 backdrop-blur-md border-b border-slate-800/50">
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-bold text-slate-400 hover:text-white transition-all group"
        >
          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${getStatusColor()}`}></div>
          {getModelLabel()}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        <button 
          onClick={() => setIsVoiceCallOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          </svg>
          Telepon
        </button>
      </div>

      <VoiceCall 
        isOpen={isVoiceCallOpen} 
        onClose={() => setIsVoiceCallOpen(false)} 
        systemInstruction={config.systemInstruction} 
      />

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute top-14 left-4 z-40 w-80 p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl animate-in zoom-in-95">
          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-3">Model AI</label>
          <div className="space-y-2">
            {[
              { id: 'gemini-flash-lite-latest', name: 'Fahz Lite', desc: 'Sangat Cepat & Hemat Kuota' },
              { id: 'gemini-3-flash-preview', name: 'Fahz Flash', desc: 'Keseimbangan Kecepatan & Akurasi' },
              { id: 'gemini-3-pro-preview', name: 'Fahz Pro', desc: 'Cerdas, Detail & Kreatif' },
              { id: 'gemini-2.5-flash-preview-04-17', name: 'Fahz Premium', desc: 'Model Berlangganan Vikey.ai', highlight: 'text-violet-400' }
            ].map(m => (
              <button 
                key={m.id}
                onClick={() => { setConfig({...config, model: m.id}); setShowSettings(false); }}
                className={`w-full p-3 rounded-xl text-left border transition-all ${config.model === m.id ? `bg-slate-800 border-white text-white` : `bg-slate-800/50 border-slate-700 text-slate-500 hover:border-slate-500`}`}
              >
                <div className="flex items-center justify-between">
                  <div className={`font-bold text-xs ${m.highlight || ''}`}>{m.name}</div>
                  {config.model === m.id && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />}
                </div>
                <div className="text-[9px] opacity-60 mt-1">{m.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-0 py-16 lg:py-24 space-y-8 no-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-8">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl rotate-3"><span className="text-5xl font-black text-slate-950">{BRANDING.LOGO_LETTER}</span></div>
            <div className="space-y-3 px-6">
              <h2 className="text-3xl font-bold text-white tracking-tight">Apa yang bisa saya bantu?</h2>
              <p className="text-slate-400 text-sm max-w-sm mx-auto">Tanyakan apapun, buat gambar, atau review kodingan Anda dengan {BRANDING.BOT_NAME}.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full max-w-md px-4">
              {['Bantu ide bisnis', 'Review kodingan', 'Buat gambar AI', 'Tanya Matematika'].map(t => (
                <button 
                  key={t} onClick={() => setInput(t)}
                  className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl text-[10px] text-slate-400 hover:bg-slate-800 transition-all text-left font-bold"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto w-full space-y-10">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-4 lg:gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500`}>
                <div className={`w-8 h-8 lg:w-9 lg:h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[10px] font-bold border ${
                  msg.role === 'user' ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-white border-white text-slate-950 shadow-xl'
                }`}>
                  {msg.role === 'user' ? 'U' : BRANDING.LOGO_LETTER}
                </div>
                <div className="flex-1 min-w-0 space-y-4 pt-1 lg:pt-1.5">
                  <div className="text-sm lg:text-[15px] leading-relaxed text-slate-300">
                    <MessageContent content={msg.content} />
                  </div>
                  {msg.attachments?.map((att, idx) => (
                    <img key={idx} src={att.url} className="rounded-2xl border border-slate-800 max-w-xs shadow-lg" />
                  ))}
                  {msg.generatedImage && <img src={msg.generatedImage} className="rounded-2xl border border-slate-800 max-w-full shadow-2xl" />}
                  {msg.generatedVideo && <video src={msg.generatedVideo} controls className="rounded-2xl border border-slate-800 w-full shadow-2xl" />}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-4 lg:gap-6 animate-pulse">
                <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-white flex items-center justify-center text-slate-950 text-[10px] font-bold">{BRANDING.LOGO_LETTER}</div>
                <div className="flex items-center gap-1.5 pt-4">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay:'0s'}} />
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay:'0.1s'}} />
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay:'0.2s'}} />
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} className="h-40" />
      </div>

      {/* Input Section */}
      <div className="fixed lg:absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent z-20">
        <div className="max-w-2xl mx-auto">
          {pendingAttachments.length > 0 && (
            <div className="flex gap-2 p-2 mb-2 bg-slate-900/80 rounded-xl border border-slate-800 overflow-x-auto no-scrollbar">
              {pendingAttachments.map((att, i) => (
                <div key={i} className="relative group shrink-0">
                  <img src={att.url} className="w-12 h-12 rounded-lg object-cover" />
                  <button 
                    onClick={() => setPendingAttachments(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute -top-1 -right-1 bg-black text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-2 shadow-2xl focus-within:border-slate-600 transition-all">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAction('chat'))}
              placeholder={`Tanya ${BRANDING.BOT_NAME}...`}
              className="w-full bg-transparent text-white px-4 py-3 focus:outline-none resize-none text-sm placeholder-slate-600"
            />
            <div className="flex items-center justify-between px-2 pb-1">
              <div className="flex items-center gap-1">
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                <button onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-500 hover:text-white transition-colors" title="Unggah Gambar">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </button>
                <div className="w-[1px] h-4 bg-slate-800 mx-1"></div>
                <button onClick={() => handleAction('image')} className="text-[10px] font-bold text-slate-500 hover:text-indigo-400 px-2 uppercase tracking-tighter">Image</button>
                <button onClick={() => handleAction('video')} className="text-[10px] font-bold text-slate-500 hover:text-amber-400 px-2 uppercase tracking-tighter">Video</button>
              </div>
              <button 
                onClick={() => handleAction('chat')}
                disabled={(!input.trim() && pendingAttachments.length === 0) || isLoading}
                className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
                  (!input.trim() && pendingAttachments.length === 0) || isLoading ? 'bg-slate-800 text-slate-600' : 'bg-white text-slate-950 shadow-xl'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
              </button>
            </div>
          </div>
          <p className="text-[9px] text-center text-slate-700 mt-4 font-black uppercase tracking-[0.4em]">{BRANDING.COMPANY_NAME.toUpperCase()} • POWERED BY GEMINI</p>
        </div>
      </div>
    </div>
  );
};

export default Playground;
