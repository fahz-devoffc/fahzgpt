
import React, { useState } from 'react';
import { User } from '../types';
import { BRANDING } from '../constants';

interface AuthPageProps {
  onLogin: (user: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulating auth
    onLogin({
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name || 'Fahz User',
      email: formData.email,
    });
  };

  const handleGoogleLogin = () => {
    onLogin({
      id: 'google-123',
      name: 'Google User',
      email: 'user@gmail.com',
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-slate-900/50 backdrop-blur-2xl border border-slate-800 p-8 rounded-[2rem] shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-white/5">
              <span className="text-3xl font-black text-slate-950">{BRANDING.LOGO_LETTER}</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">{isLogin ? 'Selamat Datang Kembali' : `Buat Akun ${BRANDING.LOGO_LETTER}ahz`}</h1>
            <p className="text-slate-400 text-sm">Masuk untuk mengakses AI pribadi Anda.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Nama Lengkap</label>
                <input 
                  type="text" required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all text-sm"
                  placeholder="John Doe"
                />
              </div>
            )}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Alamat Email</label>
              <input 
                type="email" required
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all text-sm"
                placeholder="name@company.com"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Kata Sandi</label>
              <input 
                type="password" required
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all text-sm"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-white text-slate-950 font-bold py-3 rounded-xl hover:bg-slate-200 transition-all shadow-xl shadow-white/5 mt-4"
            >
              {isLogin ? 'Masuk Sekarang' : 'Daftar Akun'}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-[0.2em]"><span className="bg-slate-900/50 px-3 text-slate-500">Atau Pakai</span></div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            className="w-full bg-slate-800/50 border border-slate-700 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>

          <p className="text-center mt-8 text-xs text-slate-500">
            {isLogin ? 'Belum punya akun?' : 'Sudah punya akun?'} {' '}
            <button onClick={() => setIsLogin(!isLogin)} className="text-indigo-400 font-bold hover:underline">
              {isLogin ? 'Daftar di sini' : 'Masuk di sini'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
