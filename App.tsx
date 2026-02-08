
import React, { useState, useEffect } from 'react';
import { AppTab, ChatMessage, AIConfig, ChatSession, User } from './types';
import { INITIAL_SYSTEM_INSTRUCTION, BRANDING } from './constants';
import Sidebar from './components/Sidebar';
import LearnSection from './components/LearnSection';
import Playground from './components/Playground';
import TemplatesGrid from './components/TemplatesGrid';
import CodeViewer from './components/CodeViewer';
import AuthPage from './components/AuthPage';
import DeveloperSection from './components/DeveloperSection';
import SettingsSection from './components/SettingsSection';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.PLAYGROUND);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [config, setConfig] = useState<AIConfig>({
    systemInstruction: INITIAL_SYSTEM_INSTRUCTION,
    temperature: 0.7,
    model: 'gemini-flash-lite-latest',
    apiEndpoint: 'https://api.vikey.ai/v1', // Diatur permanen ke Vikey.ai sebagai default
  });

  // Load storage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem('fahz_sessions');
    const savedUser = localStorage.getItem('fahz_user');
    const savedConfig = localStorage.getItem('fahz_config');
    
    let initialSessions: ChatSession[] = [];
    if (savedSessions) {
      initialSessions = JSON.parse(savedSessions);
      setSessions(initialSessions);
    }
    
    if (savedUser) {
      const u = JSON.parse(savedUser);
      setUser(u);
      if (initialSessions.length > 0) {
        setActiveSessionId(initialSessions[0].id);
      }
    }

    if (savedConfig) {
      const parsedConfig = JSON.parse(savedConfig);
      // Jika config yang tersimpan tidak memiliki apiEndpoint, paksa gunakan vikey
      if (!parsedConfig.apiEndpoint) {
        parsedConfig.apiEndpoint = 'https://api.vikey.ai/v1';
      }
      setConfig(parsedConfig);
    }
  }, []);

  // Save sessions & config to storage
  useEffect(() => {
    localStorage.setItem('fahz_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('fahz_config', JSON.stringify(config));
  }, [config]);

  const createNewSession = (initialMessages: ChatMessage[] = []): string => {
    const newId = Date.now().toString();
    const title = initialMessages.length > 0 
      ? initialMessages[0].content.substring(0, 30) + (initialMessages[0].content.length > 30 ? '...' : '')
      : 'Percakapan Baru';
      
    const newSession: ChatSession = {
      id: newId,
      title: title,
      messages: initialMessages,
      lastUpdated: new Date().toISOString()
    };
    
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
    return newId;
  };

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('fahz_user', JSON.stringify(u));
    if (sessions.length === 0) {
      createNewSession();
    } else if (!activeSessionId) {
      setActiveSessionId(sessions[0].id);
    }
  };

  const handleUpdateUser = (updates: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...updates };
      setUser(newUser);
      localStorage.setItem('fahz_user', JSON.stringify(newUser));
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('fahz_user');
  };

  const handleNewChat = () => {
    createNewSession();
    setActiveTab(AppTab.PLAYGROUND);
    setIsSidebarOpen(false);
  };

  const updateActiveSession = (newMessages: ChatMessage[]) => {
    if (!activeSessionId) {
      createNewSession(newMessages);
      return;
    }

    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        const title = (s.title === 'Percakapan Baru' || s.title === '') && newMessages.length > 0 
          ? newMessages[0].content.substring(0, 30) + (newMessages[0].content.length > 30 ? '...' : '')
          : s.title;
        return { ...s, messages: newMessages, title, lastUpdated: new Date().toISOString() };
      }
      return s;
    }));
  };

  const currentSession = sessions.find(s => s.id === activeSessionId) || null;

  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-200">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 z-40 w-72 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={(tab) => { setActiveTab(tab); setIsSidebarOpen(false); }} 
          onNewChat={handleNewChat}
          sessions={sessions}
          activeSessionId={activeSessionId}
          setActiveSessionId={(id) => { setActiveSessionId(id); setActiveTab(AppTab.PLAYGROUND); setIsSidebarOpen(false); }}
          user={user}
          onLogout={handleLogout}
        />
      </div>

      <main className="flex-1 flex flex-col min-w-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative">
        <header className="flex items-center justify-between p-4 border-b border-slate-800 lg:hidden bg-slate-950/50 backdrop-blur-md">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="text-sm font-black tracking-tighter text-indigo-500">{BRANDING.BOT_NAME.toUpperCase()}</div>
          <button onClick={handleNewChat} className="p-2 -mr-2 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </button>
        </header>

        <div className={`flex-1 overflow-y-auto ${activeTab === AppTab.PLAYGROUND ? '' : 'px-4 py-8 lg:px-12 lg:py-12'}`}>
          {activeTab === AppTab.LEARN && <LearnSection />}
          
          {activeTab === AppTab.PLAYGROUND && (
            <Playground 
              messages={currentSession?.messages || []} 
              setMessages={updateActiveSession} 
              config={config}
              setConfig={setConfig}
              onStartNew={handleNewChat}
            />
          )}

          {activeTab === AppTab.TEMPLATES && (
            <TemplatesGrid onApply={(inst) => { setConfig({...config, systemInstruction: inst}); setActiveTab(AppTab.PLAYGROUND); }} />
          )}

          {activeTab === AppTab.CODE && (
            <CodeViewer config={config} />
          )}

          {activeTab === AppTab.DEVELOPER && (
            <DeveloperSection />
          )}

          {activeTab === AppTab.SETTINGS && (
            <SettingsSection user={user} onUpdateUser={handleUpdateUser} config={config} setConfig={setConfig} />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
