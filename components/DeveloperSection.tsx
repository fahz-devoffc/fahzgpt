
import React from 'react';
import { BRANDING } from '../constants';

const DeveloperSection: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Meet the Developer</h2>
        <p className="text-slate-400">Hubungi kami untuk kolaborasi, saran, atau bantuan teknis mengenai {BRANDING.BOT_NAME}.</p>
      </div>

      <div className="grid gap-6">
        {/* WhatsApp Card */}
        <a 
          href={`https://wa.me/${BRANDING.DEVELOPER.WHATSAPP}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-6 p-6 bg-slate-900 border border-slate-800 rounded-[2rem] hover:border-emerald-500/50 transition-all duration-300"
        >
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 text-3xl group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.672 1.433 5.66 1.434h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-white font-bold text-lg">WhatsApp</h4>
            <p className="text-slate-500 text-sm">+{BRANDING.DEVELOPER.WHATSAPP}</p>
          </div>
          <div className="text-slate-500 font-bold text-[10px] uppercase tracking-widest bg-slate-800 px-3 py-1 rounded-full group-hover:bg-emerald-500 group-hover:text-white transition-colors">Chat</div>
        </a>

        {/* Email Card */}
        <a 
          href={`mailto:${BRANDING.DEVELOPER.EMAIL}`}
          className="group flex items-center gap-6 p-6 bg-slate-900 border border-slate-800 rounded-[2rem] hover:border-indigo-500/50 transition-all duration-300"
        >
          <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 text-3xl group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-white font-bold text-lg">Email Support</h4>
            <p className="text-slate-500 text-sm">{BRANDING.DEVELOPER.EMAIL}</p>
          </div>
          <div className="text-slate-500 font-bold text-[10px] uppercase tracking-widest bg-slate-800 px-3 py-1 rounded-full group-hover:bg-indigo-500 group-hover:text-white transition-colors">Kirim</div>
        </a>

        {/* Company Card */}
        <div className="p-8 bg-gradient-to-br from-slate-900 to-indigo-950/30 border border-slate-800 rounded-[2.5rem] mt-4">
          <h4 className="text-indigo-400 font-black text-xs uppercase tracking-widest mb-4">Mengenai {BRANDING.COMPANY_NAME}</h4>
          <p className="text-slate-300 text-sm leading-relaxed italic">
            "Kami berkomitmen membangun ekosistem AI yang transparan, mudah diakses, dan sangat personal bagi setiap individu."
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeveloperSection;
