
import React from 'react';
import { AppTab, ChatSession, User } from '../types';
import { BRANDING } from '../constants';

interface SidebarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  onNewChat: () => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  setActiveSessionId: (id: string) => void;
  user: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, setActiveTab, onNewChat, sessions, activeSessionId, setActiveSessionId, user, onLogout 
}) => {
  return (
    <div className="h-full bg-slate-900 border-r border-slate-800 flex flex-col overflow-hidden">
      {/* Header Sidebar */}
      <div className="p-4">
        <button 
          onClick={onNewChat}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-all border border-slate-700/50 shadow-lg group"
        >
          <div className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center text-[10px] font-black">{BRANDING.LOGO_LETTER}</div>
          <span className="text-sm">Chat Baru</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-auto text-slate-500 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Main Nav */}
      <nav className="px-4 space-y-1 mb-6">
        {[
          { id: AppTab.TEMPLATES, label: 'Mode AI', icon: '🧩' },
          { id: AppTab.LEARN, label: `Info ${BRANDING.LOGO_LETTER}ahz`, icon: '✨' },
          { id: AppTab.DEVELOPER, label: 'Developer', icon: '👨‍💻' },
          { id: AppTab.SETTINGS, label: 'Setelan', icon: '⚙️' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              activeTab === item.id ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_rgba(79,70,229,0.1)]' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-xs font-bold tracking-tight">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
        <div className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em] mb-3 px-2">History</div>
        <div className="space-y-1">
          {sessions.length === 0 ? (
            <p className="text-[10px] text-slate-700 px-2 italic">Belum ada percakapan.</p>
          ) : (
            sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSessionId(s.id)}
                className={`w-full text-left px-3 py-3 rounded-xl text-xs truncate transition-all ${
                  activeSessionId === s.id && activeTab === AppTab.PLAYGROUND
                    ? 'bg-slate-800 text-white shadow-inner' 
                    : 'text-slate-500 hover:bg-slate-800/30 hover:text-slate-300'
                }`}
              >
                {s.title}
              </button>
            ))
          )}
        </div>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-800 mt-auto">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800 transition-all group relative">
          <div className="w-9 h-9 rounded-full bg-indigo-600 border border-slate-700 flex items-center justify-center font-bold text-xs overflow-hidden">
            {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{user.name}</p>
            <p className="text-[10px] text-slate-500 truncate">{BRANDING.COMPANY_NAME}</p>
          </div>
          <button 
            onClick={onLogout}
            className="p-1.5 text-slate-600 hover:text-red-400 transition-colors"
            title="Logout"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
