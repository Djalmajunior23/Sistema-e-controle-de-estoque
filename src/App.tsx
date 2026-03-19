import React, { useState, useEffect } from 'react';
import { auth, signOut } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { ProductList } from './components/ProductList';
import { MovementHistory } from './components/MovementHistory';
import { LayoutDashboard, Package, History, LogOut, Wrench } from 'lucide-react';

type View = 'dashboard' | 'products' | 'history';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('dashboard');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E4E3E0] flex items-center justify-center">
        <div className="animate-spin text-[#141414]">
          <Wrench size={48} />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'products': return <ProductList />;
      case 'history': return <MovementHistory />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] flex font-sans text-[#141414]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#141414] bg-white flex flex-col">
        <div className="p-6 border-bottom border-[#141414] flex items-center gap-3">
          <Wrench size={24} />
          <span className="font-bold tracking-tighter text-xl">TOOLSTOCK</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`w-full flex items-center gap-3 p-3 text-sm font-bold uppercase tracking-wider transition-colors ${
              currentView === 'dashboard' ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/5'
            }`}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>
          <button
            onClick={() => setCurrentView('products')}
            className={`w-full flex items-center gap-3 p-3 text-sm font-bold uppercase tracking-wider transition-colors ${
              currentView === 'products' ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/5'
            }`}
          >
            <Package size={18} />
            Estoque
          </button>
          <button
            onClick={() => setCurrentView('history')}
            className={`w-full flex items-center gap-3 p-3 text-sm font-bold uppercase tracking-wider transition-colors ${
              currentView === 'history' ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/5'
            }`}
          >
            <History size={18} />
            Movimentações
          </button>
        </nav>

        <div className="p-4 border-t border-[#141414]">
          <div className="flex items-center gap-3 mb-4 px-2">
            <img 
              src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
              alt={user.displayName || ''} 
              className="w-8 h-8 rounded-full border border-[#141414]"
              referrerPolicy="no-referrer"
            />
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold truncate">{user.displayName}</span>
              <span className="text-[10px] text-[#141414]/60 truncate">{user.email}</span>
            </div>
          </div>
          <button
            onClick={() => signOut(auth)}
            className="w-full flex items-center gap-3 p-3 text-xs font-bold uppercase tracking-wider hover:bg-red-500 hover:text-white transition-colors border border-transparent hover:border-red-600"
          >
            <LogOut size={16} />
            Sair do Sistema
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {renderView()}
      </main>
    </div>
  );
}
