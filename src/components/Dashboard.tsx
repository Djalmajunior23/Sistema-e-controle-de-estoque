import React, { useState, useEffect, useMemo } from 'react';
import { inventoryService } from '../services/inventoryService';
import { Product, Movement } from '../types';
import { AlertTriangle, Package, TrendingUp, TrendingDown, ArrowRight, BarChart3 } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { subDays, startOfDay, endOfDay, isSameDay, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const Dashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubProducts = inventoryService.subscribeToProducts(setProducts);
    const unsubMovements = inventoryService.subscribeToMovements(setMovements);
    setLoading(false);
    return () => {
      unsubProducts();
      unsubMovements();
    };
  }, []);

  const lowStockProducts = products.filter(p => p.quantity <= p.minStock);
  const totalQuantity = products.reduce((acc, p) => acc + p.quantity, 0);

  // Calculate chart data for top 3 critical products
  const chartData = useMemo(() => {
    if (lowStockProducts.length === 0 || movements.length === 0) return [];

    // Take top 3 most critical (lowest quantity relative to minStock)
    const topCritical = [...lowStockProducts]
      .sort((a, b) => (a.quantity - a.minStock) - (b.quantity - b.minStock))
      .slice(0, 3);

    const days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), i)).reverse();
    
    return days.map(day => {
      const dataPoint: any = {
        name: format(day, 'dd/MM', { locale: ptBR }),
      };

      topCritical.forEach(product => {
        // Calculate stock at the end of this day
        // We start from current quantity and work backwards
        let stockAtEnd = product.quantity;
        
        // Find all movements for this product that happened AFTER this day
        const movementsAfter = movements.filter(m => 
          m.productId === product.id && 
          m.date.toDate() > endOfDay(day)
        );

        movementsAfter.forEach(m => {
          if (m.type === 'in') stockAtEnd -= m.quantity;
          else stockAtEnd += m.quantity;
        });

        dataPoint[product.name] = stockAtEnd;
      });

      return dataPoint;
    });
  }, [lowStockProducts, movements]);

  const topCriticalProducts = [...lowStockProducts]
    .sort((a, b) => (a.quantity - a.minStock) - (b.quantity - b.minStock))
    .slice(0, 3);

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Chart Section */}
        <div className="bg-white border border-[#141414] shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
          <div className="p-4 border-b border-[#141414] bg-[#141414] text-[#E4E3E0] flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest font-mono">Tendência de Estoque (Críticos)</h2>
            <BarChart3 size={14} />
          </div>
          <div className="p-6 h-[300px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#141414" opacity={0.1} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#141414" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    fontFamily="monospace"
                  />
                  <YAxis 
                    stroke="#141414" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    fontFamily="monospace"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#E4E3E0', 
                      border: '1px solid #141414',
                      fontSize: '10px',
                      fontFamily: 'monospace'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ 
                      fontSize: '10px', 
                      fontFamily: 'monospace',
                      textTransform: 'uppercase',
                      paddingTop: '20px'
                    }}
                  />
                  {topCriticalProducts.map((product, index) => (
                    <Line
                      key={product.id}
                      type="stepAfter"
                      dataKey={product.name}
                      stroke={index === 0 ? '#ef4444' : index === 1 ? '#f97316' : '#eab308'}
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#141414' }}
                      activeDot={{ r: 5 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[#141414]/40 italic font-serif text-sm">
                Dados insuficientes para gerar o gráfico.
              </div>
            )}
          </div>
        </div>

        {/* Critical List */}
        <div className="bg-white border border-[#141414] shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
          <div className="p-4 border-b border-[#141414] bg-[#141414] text-[#E4E3E0] flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest font-mono">Produtos em Estado Crítico</h2>
            <AlertTriangle size={14} />
          </div>
          
          <div className="divide-y divide-[#141414] max-h-[300px] overflow-y-auto">
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

      {/* Recent Movements Section */}
      <div className="bg-white border border-[#141414] shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
        <div className="p-4 border-b border-[#141414] bg-[#141414] text-[#E4E3E0] flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-widest font-mono">Últimas Movimentações</h2>
          <ArrowRight size={14} />
        </div>
        
        <div className="divide-y divide-[#141414]">
          {movements.length === 0 ? (
            <div className="p-12 text-center text-[#141414]/40 italic font-serif">
              Nenhuma movimentação registrada.
            </div>
          ) : (
            movements.slice(0, 5).map(movement => (
              <div key={movement.id} className="p-4 flex items-center justify-between hover:bg-[#141414]/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 flex items-center justify-center border border-[#141414] ${
                    movement.type === 'in' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {movement.type === 'in' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                  </div>
                  <div>
                    <div className="font-bold text-sm uppercase">{movement.productName}</div>
                    <div className="text-[10px] text-[#141414]/60 font-mono uppercase">
                      {movement.responsible} • {format(movement.date.toDate(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-mono text-[#141414]/40">Qtd</div>
                    <div className={`font-bold ${movement.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                      {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                    </div>
                  </div>
                  {movement.notes && (
                    <div className="hidden md:block max-w-[200px] text-right">
                      <div className="text-[10px] uppercase font-mono text-[#141414]/40">Notas</div>
                      <div className="text-[10px] italic truncate">{movement.notes}</div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        
        {movements.length > 5 && (
          <div className="p-4 bg-[#141414]/5 text-center">
            <p className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#141414]/40">
              Veja o histórico completo na aba de movimentações
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
