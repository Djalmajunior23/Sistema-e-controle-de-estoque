import React, { useState, useEffect } from 'react';
import { inventoryService } from '../services/inventoryService';
import { Product } from '../types';
import { Plus, Search, Edit2, Trash2, ArrowUpDown, Package, AlertTriangle } from 'lucide-react';
import { ProductForm } from './ProductForm';
import { MovementForm } from './MovementForm';

export const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isMovementOpen, setIsMovementOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = inventoryService.subscribeToProducts(setProducts);
    return () => unsubscribe();
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (window.confirm("Deseja realmente excluir este produto?")) {
      await inventoryService.deleteProduct(id);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter mb-2">ESTOQUE</h1>
          <p className="text-[#141414]/60 font-serif italic">Gerenciamento completo de ferramentas e insumos.</p>
        </div>
        <button
          onClick={() => { setEditingProduct(undefined); setIsFormOpen(true); }}
          className="flex items-center gap-2 bg-[#141414] text-[#E4E3E0] px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-[#141414]/90 transition-colors shadow-[4px_4px_0px_0px_rgba(20,20,20,0.2)]"
        >
          <Plus size={16} />
          Novo Produto
        </button>
      </header>

      {/* Toolbar */}
      <div className="mb-8 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#141414]/40" size={18} />
          <input
            type="text"
            placeholder="PESQUISAR POR NOME OU TIPO..."
            className="w-full bg-white border border-[#141414] py-3 pl-12 pr-4 font-mono text-xs uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-[#141414]/10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#141414] overflow-hidden shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#141414] text-[#E4E3E0] font-mono text-[10px] uppercase tracking-widest">
              <th className="p-4 border-r border-[#E4E3E0]/10">Produto</th>
              <th className="p-4 border-r border-[#E4E3E0]/10">Tipo</th>
              <th className="p-4 border-r border-[#E4E3E0]/10 text-center">Material/Tam</th>
              <th className="p-4 border-r border-[#E4E3E0]/10 text-center">Estoque</th>
              <th className="p-4 border-r border-[#E4E3E0]/10 text-center">Mínimo</th>
              <th className="p-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#141414]">
            {filteredProducts.map(product => {
              const isLowStock = product.quantity <= product.minStock;
              return (
                <tr key={product.id} className={`hover:bg-[#141414]/5 transition-colors ${isLowStock ? 'bg-red-50' : ''}`}>
                  <td className="p-4">
                    <div className="font-bold text-sm uppercase">{product.name}</div>
                    <div className="text-[10px] text-[#141414]/40 font-mono">ID: {product.id?.slice(0, 8)}</div>
                  </td>
                  <td className="p-4 text-xs uppercase font-medium">{product.type}</td>
                  <td className="p-4 text-center text-xs text-[#141414]/60">
                    {product.material || '-'} / {product.size || '-'}
                  </td>
                  <td className="p-4 text-center">
                    <div className={`font-bold text-lg ${isLowStock ? 'text-red-500' : ''}`}>
                      {product.quantity}
                    </div>
                  </td>
                  <td className="p-4 text-center text-xs font-mono text-[#141414]/40">
                    {product.minStock}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => { setSelectedProduct(product); setIsMovementOpen(true); }}
                        title="Movimentar Estoque"
                        className="p-2 border border-[#141414] hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors"
                      >
                        <ArrowUpDown size={14} />
                      </button>
                      <button
                        onClick={() => { setEditingProduct(product); setIsFormOpen(true); }}
                        title="Editar Produto"
                        className="p-2 border border-[#141414] hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id!)}
                        title="Excluir Produto"
                        className="p-2 border border-[#141414] hover:bg-red-500 hover:text-white transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredProducts.length === 0 && (
          <div className="p-12 text-center text-[#141414]/40 italic font-serif">
            Nenhum produto encontrado.
          </div>
        )}
      </div>

      {isFormOpen && (
        <ProductForm 
          product={editingProduct} 
          onClose={() => setIsFormOpen(false)} 
        />
      )}

      {isMovementOpen && selectedProduct && (
        <MovementForm 
          product={selectedProduct} 
          onClose={() => setIsMovementOpen(false)} 
        />
      )}
    </div>
  );
};
