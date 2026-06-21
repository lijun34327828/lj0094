import { useState } from 'react';
import { Plus, Package, DollarSign, Tag, Boxes, TrendingUp } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { ModelType } from '@/types';
import NumberInput from '@/components/common/NumberInput';

export default function ProductForm() {
  const { activeModel, addProduct, getProductsByModel } = useAppStore();
  const model = activeModel as ModelType;

  const [form, setForm] = useState({
    name: '',
    cost: '',
    price: '',
    stockLimit: '',
    turnoverWeight: '5',
  });

  const profit = Number(form.price) - Number(form.cost);
  const margin = Number(form.price) > 0 ? (profit / Number(form.price)) * 100 : 0;
  const count = getProductsByModel(model).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.cost || !form.price || !form.stockLimit) return;
    addProduct({
      name: form.name,
      model,
      cost: Number(form.cost),
      price: Number(form.price),
      stockLimit: Number(form.stockLimit),
      turnoverWeight: Number(form.turnoverWeight),
    });
    setForm({ name: '', cost: '', price: '', stockLimit: '', turnoverWeight: '5' });
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center">
            <Package className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="font-display font-bold text-ink-100 text-lg">商品参数录入</h2>
            <p className="text-xs text-ink-500 mt-0.5">
              当前型号 <span className="text-amber-400 font-mono font-bold">AI-{model}</span>
              <span className="mx-1.5 text-ink-700">·</span>
              已录入 <span className="text-ink-200 font-mono font-bold">{count}</span> 件
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-xs font-medium text-ink-300 uppercase tracking-wider">
          <Tag className="w-3.5 h-3.5 text-amber-500" />
          商品名称
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="例如：卤香牛肉干"
          className="input-base font-sans"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <NumberInput
          label="进货成本"
          icon={DollarSign}
          prefix="¥"
          placeholder="0.00"
          step="0.01"
          min="0"
          value={form.cost}
          onChange={(e) => setForm({ ...form, cost: e.target.value })}
        />
        <NumberInput
          label="销售价格"
          icon={Tag}
          prefix="¥"
          placeholder="0.00"
          step="0.01"
          min="0"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <NumberInput
          label="月度库存上限"
          icon={Boxes}
          suffix="件"
          placeholder="0"
          step="1"
          min="0"
          value={form.stockLimit}
          onChange={(e) => setForm({ ...form, stockLimit: e.target.value })}
        />
        <NumberInput
          label="商品周转权重"
          icon={TrendingUp}
          suffix="/10"
          placeholder="1-10"
          step="1"
          min="1"
          max="10"
          value={form.turnoverWeight}
          onChange={(e) => setForm({ ...form, turnoverWeight: e.target.value })}
          hint="越高表示周转越快"
        />
      </div>

      {form.cost && form.price && (
        <div className="grid grid-cols-2 gap-3 px-4 py-3 rounded-xl bg-ink-950/60 border border-white/5">
          <div>
            <div className="text-[11px] text-ink-500 uppercase tracking-wider font-medium">预估毛利</div>
            <div className={`font-mono font-bold text-lg mt-0.5 ${profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ¥{profit.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-ink-500 uppercase tracking-wider font-medium">毛利率</div>
            <div className={`font-mono font-bold text-lg mt-0.5 ${margin >= 30 ? 'text-emerald-400' : margin >= 15 ? 'text-amber-400' : 'text-rose-400'}`}>
              {margin.toFixed(1)}%
            </div>
          </div>
        </div>
      )}

      <button type="submit" className="btn-primary w-full py-3.5">
        <Plus className="w-4.5 h-4.5" strokeWidth={2.5} />
        添加商品至 AI-{model} 配置库
      </button>
    </form>
  );
}
