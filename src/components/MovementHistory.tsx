import React, { useState, useEffect } from 'react';
import { inventoryService } from '../services/inventoryService';
import { Movement } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Search, ArrowUpRight, ArrowDownLeft, Filter } from 'lucide-react';

export const MovementHistory: React.FC = () => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'in' | 'out'>('all');

  useEffect(() => {
    const unsubscribe = inventoryService.subscribeToMovements(setMovements);
    return () => unsubscribe();
  }, []);

  const filteredMovements = movements.filter(m => {
    const matchesSearch = m.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         m.responsible.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || m.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-12">
        <h1 className="text-4xl font-bold tracking-tighter mb-2">HISTÓRICO</h1>
        <p className="text-[#141414]/60 font-serif italic">Registro completo de todas as movimentações de estoque.</p>
      </header>

      {/* Toolbar */}
      <div className="mb-8 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#141414]/40" size={18} />
          <input
            type="text"
            placeholder="PESQUISAR POR PRODUTO OU RESPONSÁVEL..."
            className="w-full bg-white border border-[#141414] py-3 pl-12 pr-4 font-mono text-xs uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-[#141414]/10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 bg-white border border-[#141414] p-1">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${
              filterType === 'all' ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/5'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilterType('in')}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${
              filterType === 'in' ? 'bg-green-500 text-white' : 'hover:bg-green-50 text-green-600'
            }`}
          >
            Entradas
          </button>
          <button
            onClick={() => setFilterType('out')}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${
              filterType === 'out' ? 'bg-red-500 text-white' : 'hover:bg-red-50 text-red-600'
            }`}
          >
            Saídas
          </button>
        </div>
      </div>

      {/* List */}
      <div className="bg-white border border-[#141414] shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
        <div className="grid grid-cols-1 divide-y divide-[#141414]">
          {filteredMovements.map(movement => (
            <div key={movement.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between hover:bg-[#141414]/5 transition-colors gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 flex items-center justify-center border border-[#141414] ${
                  movement.type === 'in' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {movement.type === 'in' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                </div>
                <div>
                  <div className="font-bold text-sm uppercase">{movement.productName}</div>
                  <div className="text-[10px] text-[#141414]/60 font-mono uppercase">
                    Responsável: {movement.responsible}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-12">
                <div className="text-right">
                  <div className="text-[10px] uppercase font-mono text-[#141414]/40">Quantidade</div>
                  <div className={`font-bold text-lg ${movement.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                    {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase font-mono text-[#141414]/40">Data/Hora</div>
                  <div className="text-xs font-medium">
                    {format(movement.date.toDate(), "dd 'de' MMM, HH:mm", { locale: ptBR })}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filteredMovements.length === 0 && (
            <div className="p-12 text-center text-[#141414]/40 italic font-serif">
              Nenhuma movimentação encontrada.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
