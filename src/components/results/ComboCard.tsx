import { Trophy, TrendingUp, Boxes, CircleDollarSign, RefreshCw, Award } from 'lucide-react';
import type { ComboResult } from '@/types';
import { formatCurrency, formatNumber, formatPercent } from '@/utils/formatters';

interface ComboCardProps {
  combo: ComboResult;
  topScore: number;
  delay?: number;
}

export default function ComboCard({ combo, topScore, delay = 0 }: ComboCardProps) {
  const scorePercent = topScore > 0 ? Math.max(5, (combo.weightedScore / topScore) * 100) : 100;

  const rankClass =
    combo.rank === 1 ? 'rank-badge-1' :
    combo.rank === 2 ? 'rank-badge-2' :
    combo.rank === 3 ? 'rank-badge-3' : 'rank-badge-n';

  const borderClass =
    combo.rank === 1 ? 'border-amber-500/50 shadow-[0_0_30px_-10px_rgba(245,158,11,0.4)]' :
    combo.rank === 2 ? 'border-ink-400/30' :
    combo.rank === 3 ? 'border-orange-500/30' : 'border-white/5 hover:border-white/15';

  return (
    <div
      className={`relative glass-card p-5 transition-all duration-300 hover:-translate-y-1 ${borderClass}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {combo.rank === 1 && (
        <div className="absolute -top-3 left-5 px-2.5 py-1 rounded-md bg-gradient-to-r from-amber-500 to-amber-400 text-ink-950 text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-amber-500/30 flex items-center gap-1">
          <Award className="w-3 h-3" /> 最优方案
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-display font-black text-xl shadow-lg ${rankClass}`}>
            {combo.rank <= 3 ? <Trophy className="w-5 h-5" /> : `#${combo.rank}`}
          </div>
          <div>
            <div className="text-xs text-ink-400 font-medium uppercase tracking-wider flex items-center gap-1.5">
              <Boxes className="w-3 h-3" />
              组合方案 · {combo.items.length} 件商品
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-xs font-bold text-amber-400">
                综合得分 {formatNumber(combo.weightedScore, 1)}
              </span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[11px] text-ink-400 uppercase tracking-wider font-medium">预估毛利</div>
          <div className="font-display font-black text-2xl text-emerald-400 leading-tight mt-0.5">
            {formatCurrency(combo.grossProfit)}
          </div>
          <div className="font-mono text-[11px] text-emerald-400/70 mt-0.5">
            毛利率 {formatPercent(combo.profitMargin)}
          </div>
        </div>
      </div>

      <div className="relative h-1.5 rounded-full bg-ink-950 mb-4 overflow-hidden border border-white/5">
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ${
            combo.rank === 1
              ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600'
              : 'bg-gradient-to-r from-emerald-400/70 to-emerald-600/70'
          }`}
          style={{ width: `${scorePercent}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-xl bg-ink-950/60 border border-white/5 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] text-ink-400 uppercase tracking-wider font-medium">
            <RefreshCw className="w-3 h-3 text-amber-400" />
            月度周转总量
          </div>
          <div className="font-mono font-bold text-lg text-amber-400">
            {formatNumber(combo.monthlyTurnover)}
            <span className="text-xs text-ink-500 ml-1">件</span>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-ink-950/60 border border-white/5 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] text-ink-400 uppercase tracking-wider font-medium">
            <Boxes className="w-3 h-3 text-ink-400" />
            库存占用
          </div>
          <div className="font-mono font-bold text-lg text-ink-200">
            {formatNumber(combo.totalStock)}
            <span className="text-xs text-ink-500 ml-1">件</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] text-ink-400 font-medium uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3 text-amber-400" />
            商品构成 · 周转配比
          </span>
          <span className="font-mono">
            平均权重 <span className="text-amber-400 font-bold">{formatNumber(combo.avgTurnoverWeight, 1)}</span>
          </span>
        </div>
        <div className="space-y-1.5">
          {combo.items.map((it, idx) => {
            const margin = it.product.price > 0
              ? ((it.product.price - it.product.cost) / it.product.price) * 100
              : 0;
            return (
              <div
                key={it.product.id}
                className="group flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors"
                style={{ animationDelay: `${delay + idx * 40}ms` }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-gradient-to-br from-amber-500/30 to-amber-600/20 border border-amber-500/20 text-amber-400 text-[10px] font-mono font-bold flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-sm text-ink-100 truncate">{it.product.name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="font-mono text-xs text-ink-400">
                    成本 <span className="text-ink-300">{formatCurrency(it.product.cost)}</span>
                  </span>
                  <span className="font-mono text-xs">
                    售价 <span className="text-amber-400 font-bold">{formatCurrency(it.product.price)}</span>
                  </span>
                  <span className={`font-mono text-xs font-bold ${margin >= 30 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {margin.toFixed(0)}%
                  </span>
                  <div className="w-px h-4 bg-white/10" />
                  <CircleDollarSign className="w-3.5 h-3.5 text-ink-500" />
                  <span className="font-mono text-sm font-bold text-ink-100 min-w-[48px] text-right">
                    × {it.quantity}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-3 gap-3">
        <div>
          <div className="text-[10px] text-ink-500 uppercase tracking-wider font-medium">总成本</div>
          <div className="font-mono font-bold text-sm text-ink-300 mt-0.5">{formatCurrency(combo.totalCost)}</div>
        </div>
        <div>
          <div className="text-[10px] text-ink-500 uppercase tracking-wider font-medium">总收入</div>
          <div className="font-mono font-bold text-sm text-amber-400 mt-0.5">{formatCurrency(combo.totalRevenue)}</div>
        </div>
        <div>
          <div className="text-[10px] text-ink-500 uppercase tracking-wider font-medium">毛利/投入比</div>
          <div className="font-mono font-bold text-sm text-emerald-400 mt-0.5">
            {combo.totalCost > 0 ? `1 : ${(1 + combo.profitMargin).toFixed(2)}` : '—'}
          </div>
        </div>
      </div>
    </div>
  );
}
