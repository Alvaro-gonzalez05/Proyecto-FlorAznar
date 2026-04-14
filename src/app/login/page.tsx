'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      setIsSuccess(true);
      setTimeout(() => {
        router.refresh();
        router.push('/dashboard');
      }, 2500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface w-full p-4 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-[#e6f4f1] via-[#f0eafc] to-[#fff1e6] opacity-60 -z-10"></div>
      
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)] w-full max-w-md relative z-10 border border-slate-100 min-h-[500px] flex flex-col justify-center">
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center transition-all duration-500 opacity-100 scale-100">
            <span className="material-symbols-outlined text-[6rem] text-on-secondary-container mb-6 animate-bounce">check_circle</span>
            <h2 className="text-2xl font-bold text-center mb-2">¡Bienvenido!</h2>
            <p className="text-center text-slate-500">Iniciando sesión correctamente...</p>
          </div>
        ) : (
          <div className="flex flex-col w-full opacity-100 transition-opacity duration-300">
            <h1 className="text-3xl font-light text-center mb-2">Bienvenido</h1>
            <p className="text-center text-slate-500 mb-8 text-sm">Ingresa tus credenciales para acceder</p>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="email">Email</label>
                <input 
                  id="email"
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="tu@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="password">Contraseña</label>
                <input 
                  id="password"
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
              
              {error && <p className="text-red-500 text-sm">{error}</p>}
              
              <button 
                type="submit" 
                className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-[0_4px_14px_0_rgba(0,0,0,0.1)]"
              >
                Iniciar Sesión
              </button>
            </form>
            
            <p className="mt-2 text-center text-sm">
              <Link href="/" className="text-slate-400 hover:text-slate-600 transition-colors">← Volver al inicio</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
