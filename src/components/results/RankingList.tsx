import { useAppStore } from '@/store/useAppStore';
import { Trophy, Sparkles, Inbox, Loader2 } from 'lucide-react';
import ComboCard from './ComboCard';

export default function RankingList() {
  const { results, isCalculating, summary, activeModel } = useAppStore();
  const topScore = results.length > 0 ? results[0].weightedScore : 1;

  if (isCalculating) {
    return (
      <div className="glass-card p-16 text-center">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-amber-400 animate-spin" strokeWidth={1.5} />
          </div>
        </div>
        <h3 className="font-display font-bold text-ink-200 text-xl mb-2">AI 组合推演进行中</h3>
        <p className="text-sm text-ink-400">
          正在遍历 AI-{activeModel} 全部商品组合，执行多约束过滤与加权排序...
        </p>
        <div className="mt-8 max-w-sm mx-auto space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-3 rounded-full bg-ink-900/80 overflow-hidden border border-white/5"
            >
              <div
                className="h-full bg-gradient-to-r from-amber-500/60 to-amber-400/60 rounded-full animate-pulse"
                style={{
                  width: `${[75, 55, 35][i]}%`,
                  animationDelay: `${i * 150}ms`,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="glass-card p-16 text-center">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-ink-800 to-ink-900 border border-white/10 flex items-center justify-center">
            <Inbox className="w-10 h-10 text-ink-600" strokeWidth={1.5} />
          </div>
        </div>
        <h3 className="font-display font-bold text-ink-200 text-xl mb-2">暂无有效组合方案</h3>
        <p className="text-sm text-ink-400 max-w-md mx-auto leading-relaxed">
          {summary
            ? '当前约束条件过于严格，请降低最低周转权重或扩大组合商品数范围。'
            : '请在左侧录入商品参数并配置约束条件，系统将实时自动推演最优组合。'}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 max-w-md mx-auto">
          {[
            { k: '1', v: '录入商品成本与售价' },
            { k: '2', v: '设定库存上限与周转权重' },
            { k: '3', v: '查看实时推演结果' },
          ].map((s) => (
            <div
              key={s.k}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-ink-900/50 border border-white/5"
            >
              <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 text-xs font-mono font-bold flex items-center justify-center">
                {s.k}
              </span>
              <span className="text-xs text-ink-300">{s.v}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/25 to-amber-600/10 border border-amber-500/30 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="font-display font-bold text-ink-100 text-lg flex items-center gap-2">
              最优组合排行榜
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h2>
            <p className="text-xs text-ink-500 mt-0.5">
              TOP {results.length} · 按综合加权收益分降序排列 · 实时重算
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-ink-900/50 border border-white/5 text-xs text-ink-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Live Update · AI-{activeModel}
        </div>
      </div>

      <div className="space-y-4">
        {results.map((combo, idx) => (
          <ComboCard
            key={combo.id}
            combo={combo}
            topScore={topScore}
            delay={idx * 60}
          />
        ))}
      </div>
    </div>
  );
}
