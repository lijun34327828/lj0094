import { Calculator, Filter, Sparkles, BarChart3, Clock, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import StatBadge from '@/components/common/StatBadge';

export default function SummaryCard() {
  const { summary, isCalculating } = useAppStore();

  if (!summary && !isCalculating) return null;

  const filterRate = summary
    ? summary.totalCombinations > 0
      ? ((summary.totalCombinations - summary.validCombinations) / summary.totalCombinations) * 100
      : 0
    : 0;

  return (
    <div className="glass-card p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/25 to-amber-600/10 border border-amber-500/30 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="font-display font-bold text-ink-100 text-lg">推演统计概览</h2>
            <p className="text-xs text-ink-500 mt-0.5">AI 算力引擎实时输出</p>
          </div>
        </div>
        {isCalculating && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-bold animate-pulse">
            <Sparkles className="w-3 h-3" /> 推演中
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatBadge
          label="遍历总组合"
          icon={Calculator}
          value={summary?.totalCombinations.toLocaleString() ?? '—'}
          variant="default"
        />
        <StatBadge
          label="库存约束过滤"
          icon={Filter}
          value={summary?.filteredByStock.toLocaleString() ?? '—'}
          variant="negative"
        />
        <StatBadge
          label="权重约束过滤"
          icon={Filter}
          value={summary?.filteredByWeight.toLocaleString() ?? '—'}
          variant="negative"
        />
        <StatBadge
          label="有效方案数"
          icon={CheckCircle2}
          value={summary?.validCombinations.toLocaleString() ?? '—'}
          variant="positive"
        />
        <StatBadge
          label="计算耗时"
          icon={Clock}
          value={summary?.calculateTimeMs ?? '—'}
          variant="highlight"
          suffix="ms"
        />
      </div>

      {summary && summary.totalCombinations > 0 && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <div className="flex items-center justify-between mb-2 text-xs">
            <span className="text-ink-400 font-medium">筛选通过率</span>
            <span className="font-mono font-bold text-emerald-400">
              {((100 - filterRate)).toFixed(1)}%
            </span>
          </div>
          <div className="relative h-2 rounded-full bg-ink-950 overflow-hidden border border-white/5">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400/70 to-emerald-500 transition-all duration-500"
              style={{ width: `${Math.max(2, 100 - filterRate)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
