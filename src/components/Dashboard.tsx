import React, { useState, useEffect } from 'react';
import { inventoryService } from '../services/inventoryService';
import { Product } from '../types';
import { AlertTriangle, Package, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = inventoryService.subscribeToProducts(setProducts);
    setLoading(false);
    return () => unsubscribe();
  }, []);

  const lowStockProducts = products.filter(p => p.quantity <= p.minStock);
  const totalQuantity = products.reduce((acc, p) => acc + p.quantity, 0);

  if (loading) return <div className="p-8 font-mono text-xs">CARREGANDO DADOS...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-12">
        <h1 className="text-4xl font-bold tracking-tighter mb-2">DASHBOARD</h1>
        <p className="text-[#141414]/60 font-serif italic">Visão geral do estoque e alertas críticos.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white border border-[#141414] p-6 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase tracking-widest font-mono text-[#141414]/60">Total de Itens</span>
            <Package size={16} className="text-[#141414]/40" />
          </div>
          <div className="text-4xl font-bold tracking-tighter">{totalQuantity}</div>
          <div className="text-[10px] mt-2 text-[#141414]/40 uppercase font-mono">Unidades em estoque</div>
        </div>

        <div className={`bg-white border border-[#141414] p-6 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] ${lowStockProducts.length > 0 ? 'border-red-500' : ''}`}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase tracking-widest font-mono text-[#141414]/60">Alertas Críticos</span>
            <AlertTriangle size={16} className={lowStockProducts.length > 0 ? 'text-red-500' : 'text-[#141414]/40'} />
          </div>
          <div className={`text-4xl font-bold tracking-tighter ${lowStockProducts.length > 0 ? 'text-red-500' : ''}`}>
            {lowStockProducts.length}
          </div>
          <div className="text-[10px] mt-2 text-[#141414]/40 uppercase font-mono">Produtos abaixo do mínimo</div>
        </div>

        <div className="bg-white border border-[#141414] p-6 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase tracking-widest font-mono text-[#141414]/60">Categorias</span>
            <TrendingUp size={16} className="text-[#141414]/40" />
          </div>
          <div className="text-4xl font-bold tracking-tighter">
            {new Set(products.map(p => p.type)).size}
          </div>
          <div className="text-[10px] mt-2 text-[#141414]/40 uppercase font-mono">Tipos de ferramentas</div>
        </div>
      </div>

      {/* Critical List */}
      <div className="bg-white border border-[#141414] overflow-hidden">
        <div className="p-4 border-b border-[#141414] bg-[#141414] text-[#E4E3E0] flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-widest font-mono">Produtos em Estado Crítico</h2>
          <AlertTriangle size={14} />
        </div>
        
        <div className="divide-y divide-[#141414]">
          {lowStockProducts.length === 0 ? (
            <div className="p-12 text-center text-[#141414]/40 italic font-serif">
              Nenhum produto com estoque baixo no momento.
            </div>
          ) : (
            lowStockProducts.map(product => (
              <div key={product.id} className="p-4 flex items-center justify-between hover:bg-red-50 transition-colors">
                <div>
                  <div className="font-bold text-sm uppercase">{product.name}</div>
                  <div className="text-[10px] text-[#141414]/60 font-mono uppercase">{product.type} • {product.material}</div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-mono text-[#141414]/40">Atual</div>
                    <div className="font-bold text-red-500">{product.quantity}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-mono text-[#141414]/40">Mínimo</div>
                    <div className="font-bold">{product.minStock}</div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                    <TrendingDown size={14} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
