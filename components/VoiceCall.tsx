
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { BRANDING } from '../constants';

interface VoiceCallProps {
  isOpen: boolean;
  onClose: () => void;
  systemInstruction: string;
}

type VoiceType = 'Puck' | 'Kore';

const VoiceCall: React.FC<VoiceCallProps> = ({ isOpen, onClose, systemInstruction }) => {
  const [step, setStep] = useState<'selection' | 'calling'>('selection');
  const [selectedVoice, setSelectedVoice] = useState<VoiceType>('Puck');
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Base64 Helpers
  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number) => {
    const dataInt16 = new Int16Array(data.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, sampleRate);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
    return buffer;
  };

  const startCall = async () => {
    try {
      setStep('calling');
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API Key tidak ditemukan.");

      const ai = new GoogleGenAI({ apiKey });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message) => {
            const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
              setIsAiSpeaking(true);
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), outputCtx, 24000);
              const source = outputCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outputCtx.destination);
              source.onended = () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setIsAiSpeaking(false);
              };
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setIsAiSpeaking(false);
            }
          },
          onerror: (e) => setError("Koneksi terputus: " + e.message),
          onclose: () => console.log("Session closed"),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } },
          },
          systemInstruction: systemInstruction + " Respond in a conversational tone. Keep answers concise for voice chat.",
        },
      });

      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      setError(err.message);
      setStep('selection');
    }
  };

  const endCall = () => {
    if (sessionRef.current) sessionRef.current.close();
    sourcesRef.current.forEach(s => s.stop());
    onClose();
    setStep('selection');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-500" />
      
      <div className="relative w-full max-w-lg aspect-[9/16] lg:aspect-auto lg:h-[80vh] bg-slate-900 border border-slate-800 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col items-center p-8 lg:p-12 animate-in zoom-in-95 duration-500">
        
        {step === 'selection' ? (
          <div className="flex-1 flex flex-col items-center justify-center w-full space-y-12">
            <div className="text-center">
              <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Mulai Panggilan Suara</h3>
              <p className="text-slate-400 text-sm">Pilih suara asisten Fahz Anda</p>
            </div>

            <div className="grid grid-cols-2 gap-6 w-full">
              <button 
                onClick={() => setSelectedVoice('Puck')}
                className={`p-6 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-4 ${selectedVoice === 'Puck' ? 'bg-indigo-600/20 border-indigo-500' : 'bg-slate-800 border-transparent hover:border-slate-700'}`}
              >
                <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center text-3xl shadow-lg">👨</div>
                <div className="text-center">
                  <div className="font-bold text-white">Adam</div>
                  <div className="text-[10px] text-slate-500 uppercase font-black">Laki-laki</div>
                </div>
              </button>

              <button 
                onClick={() => setSelectedVoice('Kore')}
                className={`p-6 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-4 ${selectedVoice === 'Kore' ? 'bg-pink-600/20 border-pink-500' : 'bg-slate-800 border-transparent hover:border-slate-700'}`}
              >
                <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center text-3xl shadow-lg">👩</div>
                <div className="text-center">
                  <div className="font-bold text-white">Kore</div>
                  <div className="text-[10px] text-slate-500 uppercase font-black">Perempuan</div>
                </div>
              </button>
            </div>

            <div className="w-full pt-8 border-t border-slate-800">
              <button 
                onClick={startCall}
                className="w-full py-5 bg-white text-slate-950 rounded-3xl font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-xl shadow-white/5"
              >
                Hubungkan Sekarang
              </button>
              <button onClick={onClose} className="w-full py-4 text-slate-500 text-xs font-bold hover:text-white transition-colors mt-4">Nanti Saja</button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-between w-full h-full py-10">
            <div className="text-center">
              <div className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2 animate-pulse">Connected</div>
              <h4 className="text-xl font-bold text-white tracking-tight">{BRANDING.BOT_NAME} Voice</h4>
            </div>

            {/* Pulsing Avatar Animation */}
            <div className="relative flex items-center justify-center">
              <div className={`absolute w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl transition-all duration-500 ${isAiSpeaking ? 'scale-150 opacity-100' : 'scale-100 opacity-50'}`} />
              
              <div className={`
                w-32 h-32 rounded-[3rem] bg-white flex items-center justify-center text-5xl font-black text-slate-950 shadow-2xl z-10 transition-all duration-300
                ${isAiSpeaking ? 'scale-110 shadow-indigo-500/40 ring-4 ring-indigo-500/20' : 'scale-100'}
              `}>
                {BRANDING.LOGO_LETTER}
                {isAiSpeaking && (
                  <div className="absolute inset-0 flex items-center justify-center">
                     <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" />
                     </div>
                  </div>
                )}
              </div>

              {/* Decorative Audio Waves */}
              {isAiSpeaking && (
                <div className="absolute -inset-10 flex items-center justify-center">
                  {[...Array(3)].map((_, i) => (
                    <div 
                      key={i}
                      className="absolute border border-indigo-500/30 rounded-full animate-ping"
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        animationDuration: `${2 + i}s`,
                        animationDelay: `${i * 0.5}s`
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {error && <div className="bg-red-500/10 text-red-400 text-xs px-4 py-2 rounded-xl border border-red-500/20">{error}</div>}

            <div className="flex flex-col items-center gap-6 w-full">
              <p className="text-slate-500 text-sm font-medium animate-pulse">
                {isAiSpeaking ? "Fahz sedang bicara..." : "Mendengarkan Anda..."}
              </p>
              
              <div className="flex items-center gap-8">
                <button className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-700">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                </button>
                
                <button 
                  onClick={endCall}
                  className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center text-white shadow-2xl shadow-red-600/30 hover:bg-red-500 transition-all hover:scale-105 active:scale-95"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                   </svg>
                </button>

                <button className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-700">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceCall;
