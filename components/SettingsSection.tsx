
import React, { useState } from 'react';
import { User, AIConfig } from '../types';

interface SettingsSectionProps {
  user: User;
  onUpdateUser: (updates: Partial<User>) => void;
  config: AIConfig;
  setConfig: (config: AIConfig) => void;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ user, onUpdateUser, config, setConfig }) => {
  const [name, setName] = useState(user.name);
  const [avatarUrl, setAvatarUrl] = useState(user.avatar || '');
  const [apiEndpoint, setApiEndpoint] = useState(config.apiEndpoint || 'https://api.vikey.ai/v1');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    onUpdateUser({ name, avatar: avatarUrl });
    setConfig({ ...config, apiEndpoint: apiEndpoint.trim() });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAvatarUrl(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4 pb-32">
      <h2 className="text-3xl font-black text-white mb-8 tracking-tight">Pengaturan Fahz GPT</h2>

      <div className="space-y-10 bg-slate-900/50 p-8 border border-slate-800 rounded-[2.5rem] shadow-2xl">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-6">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-slate-800 overflow-hidden bg-slate-800 shadow-2xl transition-transform group-hover:scale-105">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-black text-slate-600">
                  {name.charAt(0)}
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-2 bg-indigo-600 rounded-full cursor-pointer hover:bg-indigo-500 shadow-xl border-4 border-slate-900 transition-colors">
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </label>
          </div>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Foto Profil</p>
        </div>

        {/* Form Section */}
        <div className="space-y-6">
          <div className="group">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block group-focus-within:text-indigo-400 transition-colors">Nama Tampilan</label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all text-sm"
              placeholder="Masukkan nama Anda"
            />
          </div>

          <div className="p-6 bg-slate-950/50 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Developer & Connectivity
            </h4>
            
            <div>
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Custom API Endpoint (Proxy)</label>
              <input 
                type="text"
                value={apiEndpoint}
                onChange={(e) => setApiEndpoint(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all text-xs font-mono"
                placeholder="Contoh: https://api.vikey.ai/v1"
              />
              <p className="text-[9px] text-slate-600 mt-2 leading-relaxed">
                Default: <span className="text-indigo-400">https://api.vikey.ai/v1</span>. Gunakan ini untuk integrasi API Key Vikey Anda.
              </p>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
              <h5 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">⚠️ Peringatan Keamanan</h5>
              <p className="text-[9px] text-amber-200/60 leading-relaxed">
                Jangan pernah membagikan API Key Anda kepada siapapun. Jika Anda merasa kunci Anda bocor, segera ganti kunci baru di dashboard penyedia API Anda.
              </p>
            </div>
          </div>

          <button 
            onClick={handleSave}
            className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
              isSaved ? 'bg-emerald-500 text-white' : 'bg-white text-slate-950 hover:bg-slate-200 shadow-xl'
            }`}
          >
            {isSaved ? 'Pengaturan Disimpan! ✅' : 'Simpan Semua Perubahan'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsSection;
