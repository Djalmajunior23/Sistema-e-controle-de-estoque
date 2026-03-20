import React, { useState, useEffect } from 'react';
import { inventoryService } from '../services/inventoryService';
import { Movement } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Search, ArrowUpRight, ArrowDownLeft, Filter, Calendar, XCircle, ChevronUp, ChevronDown, Download } from 'lucide-react';

export const MovementHistory: React.FC = () => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'in' | 'out'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const unsubscribe = inventoryService.subscribeToMovements(setMovements);
    return () => unsubscribe();
  }, []);

  const filteredMovements = movements.filter(m => {
    const matchesSearch = m.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         m.responsible.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || m.type === filterType;
    
    const movementDate = m.date.toDate();
    const matchesStartDate = !startDate || movementDate >= new Date(startDate + 'T00:00:00');
    const matchesEndDate = !endDate || movementDate <= new Date(endDate + 'T23:59:59');

    return matchesSearch && matchesType && matchesStartDate && matchesEndDate;
  }).sort((a, b) => {
    const timeA = a.date.toDate().getTime();
    const timeB = b.date.toDate().getTime();
    return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setStartDate('');
    setEndDate('');
  };

  const exportToCSV = () => {
    const headers = ['Date/Time', 'Product Name', 'Type', 'Quantity', 'Responsible', 'Notes'];
    const rows = filteredMovements.map(m => [
      format(m.date.toDate(), "dd/MM/yyyy HH:mm"),
      m.productName,
      m.type === 'in' ? 'Entrada' : 'Saída',
      m.quantity,
      m.responsible,
      m.notes || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historico_movimentacoes_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter mb-2">HISTÓRICO</h1>
          <p className="text-[#141414]/60 font-serif italic">Registro completo de todas as movimentações de estoque.</p>
        </div>
        <button
          onClick={exportToCSV}
          disabled={filteredMovements.length === 0}
          className="flex items-center gap-2 bg-white border border-[#141414] px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#141414] hover:text-[#E4E3E0] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          <Download size={16} />
          Exportar CSV
        </button>
      </header>

      {/* Toolbar */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
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

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex-1 md:w-48">
              <label className="block text-[10px] uppercase font-mono text-[#141414]/40 mb-1">Início</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#141414]/40" size={14} />
                <input
                  type="date"
                  className="w-full bg-white border border-[#141414] py-2 pl-9 pr-3 text-xs font-mono focus:outline-none"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            </div>
            <div className="flex-1 md:w-48">
              <label className="block text-[10px] uppercase font-mono text-[#141414]/40 mb-1">Fim</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#141414]/40" size={14} />
                <input
                  type="date"
                  className="w-full bg-white border border-[#141414] py-2 pl-9 pr-3 text-xs font-mono focus:outline-none"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button
            onClick={clearFilters}
            disabled={!(searchTerm || filterType !== 'all' || startDate || endDate)}
            className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${
              (searchTerm || filterType !== 'all' || startDate || endDate)
                ? 'text-red-500 hover:text-red-600'
                : 'text-[#141414]/20 cursor-default'
            }`}
          >
            <XCircle size={14} />
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* List */}
      <div className="bg-white border border-[#141414] shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
        {/* Header Row */}
        <div className="hidden md:flex items-center justify-between p-4 bg-[#141414] text-[#E4E3E0] font-mono text-[10px] uppercase tracking-widest">
          <div className="flex-1">Movimentação</div>
          <div className="flex items-center gap-12">
            <div className="w-24 text-right">Quantidade</div>
            <button 
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="w-32 text-right flex items-center justify-end gap-1 hover:text-white transition-colors group"
            >
              Data/Hora
              <span className="text-[#E4E3E0]/40 group-hover:text-white transition-colors">
                {sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </span>
            </button>
          </div>
        </div>

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
                  {movement.notes && (
                    <div className="mt-2 text-[10px] text-[#141414]/80 italic border-l-2 border-[#141414]/20 pl-2">
                      "{movement.notes}"
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-12">
                <div className="text-right md:w-24">
                  <div className="text-[10px] uppercase font-mono text-[#141414]/40 md:hidden">Quantidade</div>
                  <div className={`font-bold text-lg ${movement.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                    {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                  </div>
                </div>
                <div className="text-right md:w-32">
                  <div className="text-[10px] uppercase font-mono text-[#141414]/40 md:hidden">Data/Hora</div>
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
