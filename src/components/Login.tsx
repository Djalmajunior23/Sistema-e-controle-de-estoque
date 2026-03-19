import React from 'react';
import { auth, googleProvider, signInWithPopup } from '../firebase';
import { LogIn, Wrench } from 'lucide-react';

export const Login: React.FC = () => {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-[#141414] shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] p-8">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-[#141414] text-[#E4E3E0] flex items-center justify-center mb-4">
            <Wrench size={32} />
          </div>
          <h1 className="text-2xl font-bold text-[#141414] tracking-tight mb-2">TOOLSTOCK</h1>
          <p className="text-[#141414]/60 text-sm italic font-serif">
            Sistema Profissional de Controle de Estoque
          </p>
        </div>

        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-[#141414] text-[#E4E3E0] py-3 px-4 font-bold hover:bg-[#141414]/90 transition-colors"
        >
          <LogIn size={20} />
          ENTRAR COM GOOGLE
        </button>

        <div className="mt-8 pt-8 border-t border-[#141414]/10 text-center">
          <p className="text-[10px] uppercase tracking-widest text-[#141414]/40 font-mono">
            v1.0.0 • 2026 ToolStock Inc.
          </p>
        </div>
      </div>
    </div>
  );
};
