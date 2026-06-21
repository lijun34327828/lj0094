import { Trash2, Edit3, Check, X, DollarSign, Boxes, TrendingUp, Percent } from 'lucide-react';
import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import type { Product } from '@/types';
import { formatCurrency } from '@/utils/formatters';

export default function ProductList() {
  const { activeModel, getProductsByModel, updateProduct, removeProduct } = useAppStore();
  const products = getProductsByModel(activeModel);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setEditForm({ ...p });
  };

  const saveEdit = () => {
    if (!editingId) return;
    updateProduct(editingId, editForm);
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  if (products.length === 0) {
    return (
      <div className="glass-card p-10 text-center">
        <Boxes className="w-12 h-12 text-ink-600 mx-auto mb-3" />
        <h3 className="font-display font-bold text-ink-300 text-lg">暂无商品数据</h3>
        <p className="text-sm text-ink-500 mt-2">请先在上方表单中录入商品参数</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-ink-100 text-base flex items-center gap-2">
          <Boxes className="w-4.5 h-4.5 text-amber-400" />
          商品配置库
          <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-xs font-mono border border-amber-500/20">
            {products.length} SKU
          </span>
        </h3>
      </div>

      <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
        {products.map((p) => {
          const isEditing = editingId === p.id;
          const margin = p.price > 0 ? ((p.price - p.cost) / p.price) * 100 : 0;
          const weightColor =
            p.turnoverWeight >= 8 ? 'text-emerald-400' :
            p.turnoverWeight >= 5 ? 'text-amber-400' : 'text-rose-400';

          return (
            <div
              key={p.id}
              className="group relative p-4 rounded-xl bg-ink-950/50 border border-white/5 hover:border-amber-500/30 hover:bg-ink-950/80 transition-all duration-200"
            >
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editForm.name ?? ''}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="input-base !py-2"
                  />
                  <div className="grid grid-cols-4 gap-2">
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.cost ?? ''}
                      onChange={(e) => setEditForm({ ...editForm, cost: Number(e.target.value) })}
                      placeholder="成本"
                      className="input-base !py-2 !text-xs"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.price ?? ''}
                      onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                      placeholder="售价"
                      className="input-base !py-2 !text-xs"
                    />
                    <input
                      type="number"
                      value={editForm.stockLimit ?? ''}
                      onChange={(e) => setEditForm({ ...editForm, stockLimit: Number(e.target.value) })}
                      placeholder="库存"
                      className="input-base !py-2 !text-xs"
                    />
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={editForm.turnoverWeight ?? ''}
                      onChange={(e) => setEditForm({ ...editForm, turnoverWeight: Number(e.target.value) })}
                      placeholder="权重"
                      className="input-base !py-2 !text-xs"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={cancelEdit} className="btn-ghost !py-1.5 !px-3 text-xs">
                      <X className="w-3.5 h-3.5" /> 取消
                    </button>
                    <button onClick={saveEdit} className="btn-primary !py-1.5 !px-3 text-xs">
                      <Check className="w-3.5 h-3.5" /> 保存
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-ink-100 text-sm truncate">{p.name}</h4>
                        <span className={`font-mono text-xs font-bold ${weightColor} flex items-center gap-0.5`}>
                          <TrendingUp className="w-3 h-3" />
                          {p.turnoverWeight}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 mt-3">
                        <div className="flex items-center gap-1 text-xs">
                          <DollarSign className="w-3 h-3 text-ink-500" />
                          <span className="text-ink-500">成本</span>
                          <span className="font-mono text-ink-300 ml-auto">{formatCurrency(p.cost)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <Percent className="w-3 h-3 text-ink-500" />
                          <span className="text-ink-500">售价</span>
                          <span className="font-mono text-amber-400 ml-auto font-bold">{formatCurrency(p.price)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <Boxes className="w-3 h-3 text-ink-500" />
                          <span className="text-ink-500">库存</span>
                          <span className="font-mono text-ink-300 ml-auto">{p.stockLimit}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <TrendingUp className="w-3 h-3 text-ink-500" />
                          <span className="text-ink-500">毛利</span>
                          <span className={`font-mono font-bold ml-auto ${margin >= 30 ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {margin.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(p)}
                        className="p-2 rounded-lg text-ink-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                        title="编辑"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeProduct(p.id)}
                        className="p-2 rounded-lg text-ink-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
