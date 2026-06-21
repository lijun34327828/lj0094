import { Sliders, Shield, Package, Users, Zap, DollarSign, Percent, TrendingUp, BarChart3, Boxes } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import SliderInput from '@/components/common/SliderInput';
import NumberInput from '@/components/common/NumberInput';

export default function ConstraintsPanel() {
  const { activeModel, constraints, updateConstraints } = useAppStore();
  const c = constraints[activeModel];

  const totalWeight = c.grossProfitWeight + c.profitMarginWeight + c.avgTurnoverWeight + c.monthlyTurnoverWeight + c.stockUtilizationWeight;

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

      <div className="border-t border-white/5 pt-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-violet-600/10 border border-violet-500/30 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <h3 className="font-display font-bold text-ink-100 text-sm">排序维度权重</h3>
              <p className="text-[10px] text-ink-500">各维度归一化后按权重加权求和</p>
            </div>
          </div>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${totalWeight === 100 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
            合计 {totalWeight}
          </span>
        </div>

        <SliderInput
          label="毛利金额权重"
          icon={DollarSign}
          value={c.grossProfitWeight}
          min={0}
          max={100}
          step={1}
          displayValue={`${c.grossProfitWeight}%`}
          accent="amber"
          onChange={(v) => updateConstraints(activeModel, { grossProfitWeight: v })}
        />

        <SliderInput
          label="毛利率权重"
          icon={Percent}
          value={c.profitMarginWeight}
          min={0}
          max={100}
          step={1}
          displayValue={`${c.profitMarginWeight}%`}
          accent="emerald"
          onChange={(v) => updateConstraints(activeModel, { profitMarginWeight: v })}
        />

        <SliderInput
          label="周转权重权重"
          icon={TrendingUp}
          value={c.avgTurnoverWeight}
          min={0}
          max={100}
          step={1}
          displayValue={`${c.avgTurnoverWeight}%`}
          accent="rose"
          onChange={(v) => updateConstraints(activeModel, { avgTurnoverWeight: v })}
        />

        <SliderInput
          label="月度周转权重"
          icon={Zap}
          value={c.monthlyTurnoverWeight}
          min={0}
          max={100}
          step={1}
          displayValue={`${c.monthlyTurnoverWeight}%`}
          accent="amber"
          onChange={(v) => updateConstraints(activeModel, { monthlyTurnoverWeight: v })}
        />

        <SliderInput
          label="库存利用率权重"
          icon={Boxes}
          value={c.stockUtilizationWeight}
          min={0}
          max={100}
          step={1}
          displayValue={`${c.stockUtilizationWeight}%`}
          accent="emerald"
          onChange={(v) => updateConstraints(activeModel, { stockUtilizationWeight: v })}
        />
      </div>

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
