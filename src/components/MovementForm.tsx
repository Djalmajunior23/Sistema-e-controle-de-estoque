import React, { useState } from 'react';
import { inventoryService } from '../services/inventoryService';
import { Product, MovementType } from '../types';
import { auth } from '../firebase';
import { X, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface MovementFormProps {
  product: Product;
  onClose: () => void;
}

export const MovementForm: React.FC<MovementFormProps> = ({ product, onClose }) => {
  const [type, setType] = useState<MovementType>('in');
  const [quantity, setQuantity] = useState(1);
  const [responsible, setResponsible] = useState(auth.currentUser?.displayName || '');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product.id) return;

    setLoading(true);
    try {
      await inventoryService.recordMovement(
        product.id,
        product.name,
        quantity,
        type,
        responsible,
        product.quantity,
        notes
      );
      onClose();
    } catch (error) {
      console.error("Error recording movement:", error);
      alert(error instanceof Error ? error.message : "Erro ao registrar movimentação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#141414]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#E4E3E0] border border-[#141414] w-full max-w-md shadow-[16px_16px_0px_0px_rgba(20,20,20,1)]">
        <div className="bg-[#141414] text-[#E4E3E0] p-4 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-widest font-mono">
            Movimentar Estoque
          </h2>
          <button onClick={onClose} className="hover:text-red-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="mb-8 p-4 bg-white border border-[#141414] border-dashed">
            <div className="text-[10px] uppercase tracking-widest font-mono text-[#141414]/40">Produto Selecionado</div>
            <div className="font-bold text-lg uppercase">{product.name}</div>
            <div className="text-xs text-[#141414]/60">Estoque Atual: <span className="font-bold">{product.quantity}</span></div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              type="button"
              onClick={() => setType('in')}
              className={`flex items-center justify-center gap-2 p-4 border border-[#141414] font-bold uppercase text-xs transition-colors ${
                type === 'in' ? 'bg-green-500 text-white' : 'bg-white text-[#141414] hover:bg-green-50'
              }`}
            >
              <ArrowUpRight size={16} />
              Entrada
            </button>
            <button
              type="button"
              onClick={() => setType('out')}
              className={`flex items-center justify-center gap-2 p-4 border border-[#141414] font-bold uppercase text-xs transition-colors ${
                type === 'out' ? 'bg-red-500 text-white' : 'bg-white text-[#141414] hover:bg-red-50'
              }`}
            >
              <ArrowDownLeft size={16} />
              Saída
            </button>
          </div>

          <div className="space-y-6 mb-8">
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-mono text-[#141414]/60 mb-2">Quantidade</label>
              <input
                required
                type="number"
                min="1"
                className="w-full bg-white border border-[#141414] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#141414]/10"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest font-mono text-[#141414]/60 mb-2">Responsável</label>
              <input
                required
                type="text"
                className="w-full bg-white border border-[#141414] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#141414]/10"
                value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest font-mono text-[#141414]/60 mb-2">Observações / Motivo (Opcional)</label>
              <textarea
                className="w-full bg-white border border-[#141414] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#141414]/10 min-h-[80px] resize-none"
                placeholder="EX: MANUTENÇÃO PREVENTIVA, REPOSIÇÃO DE ESTOQUE..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 text-xs font-bold uppercase tracking-widest border border-[#141414] hover:bg-[#141414]/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-[#141414] text-[#E4E3E0] px-8 py-3 font-bold uppercase tracking-widest text-xs hover:bg-[#141414]/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Processando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
