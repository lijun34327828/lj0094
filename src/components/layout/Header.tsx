import { Cpu, Sparkles, RefreshCw, Activity } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { ModelType } from '@/types';

export default function Header() {
  const { activeModel, setActiveModel, summary, isCalculating, resetAll } = useAppStore();

  const models: { id: ModelType; label: string; desc: string }[] = [
    { id: '8874', label: 'AI-8874', desc: '旗舰型算力 · 全量推演' },
    { id: '3874', label: 'AI-3874', desc: '轻量型算力 · 极速筛选' },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-2xl bg-ink-950/70 border-b border-white/5">
      <div className="max-w-[1600px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 via-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Cpu className="w-6 h-6 text-ink-950" strokeWidth={2.5} />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 animate-pulse border-2 border-ink-950" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold tracking-tight text-ink-50 leading-none">
                零食组合收益推演系统
              </h1>
              <p className="text-xs text-ink-400 mt-1 font-medium flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                AI 智能筛选 · 加权收益排序 · 多约束优化
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-1 rounded-xl bg-ink-900/80 border border-white/5">
            {models.map((m) => (
              <button
                key={m.id}
                onClick={() => setActiveModel(m.id)}
                className={`relative px-5 py-2.5 rounded-lg border transition-all duration-300 ${
                  activeModel === m.id ? 'tab-active' : 'tab-idle'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-sm tracking-wider">{m.label}</span>
                  <span className="hidden lg:inline-block text-[10px] opacity-75">{m.desc}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-ink-900/60 border border-white/5">
              {isCalculating ? (
                <>
                  <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                  <span className="text-xs font-mono text-amber-400 font-medium">AI 推演中...</span>
                </>
              ) : summary ? (
                <>
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono text-ink-300">
                    <span className="text-emerald-400 font-bold">{summary.validCombinations}</span>
                    <span className="text-ink-500 mx-1">/</span>
                    {summary.totalCombinations} 有效方案
                  </span>
                  <span className="text-[10px] text-ink-500 font-mono border-l border-white/10 pl-2 ml-1">
                    {summary.calculateTimeMs}ms
                  </span>
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4 text-ink-500" />
                  <span className="text-xs font-mono text-ink-500">等待参数输入</span>
                </>
              )}
            </div>
            <button onClick={resetAll} className="btn-ghost">
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">重置</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
