import React, { useState, useEffect } from 'react';
import { inventoryService } from '../services/inventoryService';
import { Product } from '../types';
import { X, Save } from 'lucide-react';

interface ProductFormProps {
  product?: Product;
  onClose: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ product, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    material: '',
    size: '',
    weight: '',
    quantity: 0,
    minStock: 0,
    notes: ''
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        type: product.type,
        material: product.material || '',
        size: product.size || '',
        weight: product.weight || '',
        quantity: product.quantity,
        minStock: product.minStock,
        notes: product.notes || ''
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (product?.id) {
        await inventoryService.updateProduct(product.id, formData);
      } else {
        await inventoryService.addProduct(formData);
      }
      onClose();
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Erro ao salvar produto.");
    }
  };

  return (
    <div className="fixed inset-0 bg-[#141414]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#E4E3E0] border border-[#141414] w-full max-w-2xl shadow-[16px_16px_0px_0px_rgba(20,20,20,1)]">
        <div className="bg-[#141414] text-[#E4E3E0] p-4 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-widest font-mono">
            {product ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <button onClick={onClose} className="hover:text-red-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="md:col-span-2">
              <label className="block text-[10px] uppercase tracking-widest font-mono text-[#141414]/60 mb-2">Nome do Produto</label>
              <input
                required
                type="text"
                className="w-full bg-white border border-[#141414] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#141414]/10"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest font-mono text-[#141414]/60 mb-2">Tipo de Ferramenta</label>
              <input
                required
                list="tool-types"
                type="text"
                placeholder="SELECIONE OU DIGITE..."
                className="w-full bg-white border border-[#141414] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#141414]/10"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              />
              <datalist id="tool-types">
                <option value="Martelo" />
                <option value="Chave de Fenda" />
                <option value="Chave Phillips" />
                <option value="Alicate" />
                <option value="Chave Inglesa" />
                <option value="Furadeira" />
                <option value="Parafusadeira" />
                <option value="Serrote" />
                <option value="Trena" />
                <option value="Nível" />
                <option value="Esmerilhadeira" />
                <option value="Martelete" />
              </datalist>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest font-mono text-[#141414]/60 mb-2">Material</label>
              <input
                type="text"
                className="w-full bg-white border border-[#141414] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#141414]/10"
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest font-mono text-[#141414]/60 mb-2">Tamanho</label>
              <input
                type="text"
                className="w-full bg-white border border-[#141414] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#141414]/10"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest font-mono text-[#141414]/60 mb-2">Peso</label>
              <input
                type="text"
                className="w-full bg-white border border-[#141414] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#141414]/10"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest font-mono text-[#141414]/60 mb-2">Quantidade Inicial</label>
              <input
                required
                type="number"
                min="0"
                disabled={!!product}
                className="w-full bg-white border border-[#141414] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#141414]/10 disabled:opacity-50"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest font-mono text-[#141414]/60 mb-2">Estoque Mínimo</label>
              <input
                required
                type="number"
                min="0"
                className="w-full bg-white border border-[#141414] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#141414]/10"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] uppercase tracking-widest font-mono text-[#141414]/60 mb-2">Observações (Opcional)</label>
              <textarea
                rows={3}
                className="w-full bg-white border border-[#141414] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#141414]/10 resize-none"
                placeholder="DETALHES ADICIONAIS SOBRE O PRODUTO..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-xs font-bold uppercase tracking-widest border border-[#141414] hover:bg-[#141414]/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 bg-[#141414] text-[#E4E3E0] px-8 py-3 font-bold uppercase tracking-widest text-xs hover:bg-[#141414]/90 transition-colors"
            >
              <Save size={16} />
              Salvar Produto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
