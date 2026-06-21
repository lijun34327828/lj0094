import { Sliders, Shield, Package, Users, Zap } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import SliderInput from '@/components/common/SliderInput';
import NumberInput from '@/components/common/NumberInput';

export default function ConstraintsPanel() {
  const { activeModel, constraints, updateConstraints } = useAppStore();
  const c = constraints[activeModel];

  return (
    <div className="glass-card p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 flex items-center justify-center">
            <Sliders className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="font-display font-bold text-ink-100 text-lg">约束条件配置</h2>
            <p className="text-xs text-ink-500 mt-0.5">双约束过滤 · 自动剔除低效组合</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider">
          <Shield className="w-3 h-3 inline mr-1" />Active
        </span>
      </div>

      <SliderInput
        label="单品最低销量权重阈值"
        icon={Zap}
        value={c.minTurnoverWeight}
        min={1}
        max={10}
        step={1}
        displayValue={`${c.minTurnoverWeight} / 10`}
        accent="amber"
        onChange={(v) => updateConstraints(activeModel, { minTurnoverWeight: v })}
      />

      <div className="grid grid-cols-2 gap-4">
        <SliderInput
          label="组合最小商品数"
          icon={Package}
          value={c.minComboSize}
          min={1}
          max={8}
          step={1}
          accent="emerald"
          onChange={(v) => {
            if (v > c.maxComboSize) return;
            updateConstraints(activeModel, { minComboSize: v });
          }}
        />
        <SliderInput
          label="组合最大商品数"
          icon={Users}
          value={c.maxComboSize}
          min={2}
          max={10}
          step={1}
          accent="emerald"
          onChange={(v) => {
            if (v < c.minComboSize) return;
            updateConstraints(activeModel, { maxComboSize: v });
          }}
        />
      </div>

      <NumberInput
        label="全局库存总上限"
        icon={Package}
        suffix="件"
        placeholder="0 表示不限制"
        min="0"
        step="100"
        value={c.globalStockLimit || ''}
        onChange={(e) => updateConstraints(activeModel, { globalStockLimit: Number(e.target.value) || 0 })}
        hint="设置 0 则不启用全局库存约束"
      />

      <div className="p-3.5 rounded-xl bg-gradient-to-br from-ink-950/80 to-ink-900/40 border border-white/5 space-y-2">
        <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold text-ink-400">
          <Zap className="w-3 h-3 text-amber-400" />
          AI 筛选规则摘要
        </div>
        <ul className="space-y-1.5 text-xs text-ink-400">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
            <span>周转权重 ≥ <b className="text-emerald-400 font-mono">{c.minTurnoverWeight}</b> 的单品方可入选</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
            <span>组合商品数范围: <b className="text-amber-400 font-mono">{c.minComboSize} - {c.maxComboSize}</b> 件</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0" />
            <span>库存约束: <b className="text-rose-400 font-mono">{c.globalStockLimit > 0 ? c.globalStockLimit + ' 件' : '单品上限'}</b></span>
          </li>
        </ul>
      </div>
    </div>
  );
}
