'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ConfiguracionPage() {
  const [email, setEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailMsg, setEmailMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passMsg, setPassMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingPass, setLoadingPass] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email);
    });
  }, []);

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;
    setLoadingEmail(true);
    setEmailMsg(null);
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    setLoadingEmail(false);
    if (error) {
      setEmailMsg({ type: 'error', text: error.message });
    } else {
      setEmailMsg({ type: 'success', text: 'Te enviamos un email de confirmación. Revisá tu casilla.' });
      setNewEmail('');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) return;
    if (newPassword !== confirmPassword) {
      setPassMsg({ type: 'error', text: 'Las contraseñas no coinciden.' });
      return;
    }
    if (newPassword.length < 6) {
      setPassMsg({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres.' });
      return;
    }
    setLoadingPass(true);
    setPassMsg(null);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoadingPass(false);
    if (error) {
      setPassMsg({ type: 'error', text: error.message });
    } else {
      setPassMsg({ type: 'success', text: '¡Contraseña actualizada correctamente!' });
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="flex-1 p-6 md:p-10 overflow-y-auto">
      <div className="max-w-xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-black-accent">Configuración</h1>
          <p className="text-sm text-slate-400 mt-1">Administrá la información de tu cuenta.</p>
        </div>

        {/* Account info */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-3">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-slate-400">account_circle</span>
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">Información de cuenta</h2>
          </div>
          <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
            <span className="material-symbols-outlined text-slate-400 text-lg">mail</span>
            <div>
              <p className="text-[0.7rem] text-slate-400 uppercase tracking-wider">Email actual</p>
              <p className="text-sm font-medium text-black-accent">{email || '—'}</p>
            </div>
          </div>
        </div>

        {/* Change email */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-5">
            <span className="material-symbols-outlined text-slate-400">edit</span>
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">Cambiar email</h2>
          </div>
          <form onSubmit={handleUpdateEmail} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Nuevo email</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="nuevo@email.com"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black-accent/20 transition"
                required
              />
            </div>
            {emailMsg && (
              <p className={`text-xs px-3 py-2 rounded-lg ${emailMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                {emailMsg.text}
              </p>
            )}
            <button
              type="submit"
              disabled={loadingEmail}
              className="w-full bg-black-accent text-white rounded-xl py-3 text-sm font-bold hover:opacity-90 transition disabled:opacity-50"
            >
              {loadingEmail ? 'Guardando...' : 'Actualizar email'}
            </button>
          </form>
        </div>

        {/* Change password */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-5">
            <span className="material-symbols-outlined text-slate-400">lock</span>
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">Cambiar contraseña</h2>
          </div>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Nueva contraseña</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black-accent/20 transition"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Confirmar contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repetí la contraseña"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black-accent/20 transition"
                required
              />
            </div>
            {passMsg && (
              <p className={`text-xs px-3 py-2 rounded-lg ${passMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                {passMsg.text}
              </p>
            )}
            <button
              type="submit"
              disabled={loadingPass}
              className="w-full bg-black-accent text-white rounded-xl py-3 text-sm font-bold hover:opacity-90 transition disabled:opacity-50"
            >
              {loadingPass ? 'Guardando...' : 'Actualizar contraseña'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
