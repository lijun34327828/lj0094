import { useState, useMemo } from 'react';
import type { ParetoPoint } from '@/types';

interface ParetoChartProps {
  data: ParetoPoint[];
  onPointClick?: (comboId: string) => void;
  selectedComboId?: string | null;
}

const MARGIN = { top: 20, right: 30, bottom: 50, left: 70 };

export default function ParetoChart({ data, onPointClick, selectedComboId }: ParetoChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const { width, height, innerW, innerH, xScale, yScale, rScale, xTicks, yTicks } = useMemo(() => {
    const w = 600;
    const h = 380;
    const iW = w - MARGIN.left - MARGIN.right;
    const iH = h - MARGIN.top - MARGIN.bottom;

    if (data.length === 0) {
      return { width: w, height: h, innerW: iW, innerH: iH, xScale: () => 0, yScale: () => 0, rScale: () => 4, xTicks: [], yTicks: [] };
    }

    const xMin = Math.min(...data.map(d => d.grossProfit));
    const xMax = Math.max(...data.map(d => d.grossProfit));
    const yMin = Math.min(...data.map(d => d.monthlyTurnover));
    const yMax = Math.max(...data.map(d => d.monthlyTurnover));
    const rMin = Math.min(...data.map(d => d.stockUtilization));
    const rMax = Math.max(...data.map(d => d.stockUtilization));

    const xPad = (xMax - xMin) * 0.08 || 1;
    const yPad = (yMax - yMin) * 0.08 || 1;

    const xScale = (v: number) => ((v - xMin + xPad) / (xMax - xMin + 2 * xPad)) * iW;
    const yScale = (v: number) => iH - ((v - yMin + yPad) / (yMax - yMin + 2 * yPad)) * iH;
    const rScale = (v: number) => {
      const norm = rMax > rMin ? (v - rMin) / (rMax - rMin) : 0.5;
      return 4 + norm * 10;
    };

    const xTickCount = 5;
    const xStep = (xMax - xMin) / xTickCount || 1;
    const xTicks = Array.from({ length: xTickCount + 1 }, (_, i) => xMin + xStep * i);

    const yTickCount = 5;
    const yStep = (yMax - yMin) / yTickCount || 1;
    const yTicks = Array.from({ length: yTickCount + 1 }, (_, i) => yMin + yStep * i);

    return { width: w, height: h, innerW: iW, innerH: iH, xScale, yScale, rScale, xTicks, yTicks };
  }, [data]);

  const paretoPoints = data.filter(d => d.isPareto);
  const normalPoints = data.filter(d => !d.isPareto);

  const paretoLine = useMemo(() => {
    if (paretoPoints.length < 2) return '';
    const sorted = [...paretoPoints].sort((a, b) => a.grossProfit - b.grossProfit);
    return sorted.map(p => `${xScale(p.grossProfit)},${yScale(p.monthlyTurnover)}`).join(' L ');
  }, [paretoPoints, xScale, yScale]);

  const hovered = hoveredIdx !== null ? data[hoveredIdx] : null;

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-ink-500 text-sm">
        暂无帕累托前沿数据
      </div>
    );
  }

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        onMouseLeave={() => setHoveredIdx(null)}
      >
        <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
          {xTicks.map((tick, i) => (
            <g key={`xt-${i}`}>
              <line
                x1={xScale(tick)} y1={0}
                x2={xScale(tick)} y2={innerH}
                stroke="rgba(148,163,184,0.08)"
              />
              <text
                x={xScale(tick)} y={innerH + 20}
                textAnchor="middle"
                className="fill-ink-500 text-[10px] font-mono"
              >
                {tick >= 1000 ? `${(tick / 1000).toFixed(1)}k` : tick.toFixed(0)}
              </text>
            </g>
          ))}
          {yTicks.map((tick, i) => (
            <g key={`yt-${i}`}>
              <line
                x1={0} y1={yScale(tick)}
                x2={innerW} y2={yScale(tick)}
                stroke="rgba(148,163,184,0.08)"
              />
              <text
                x={-10} y={yScale(tick) + 4}
                textAnchor="end"
                className="fill-ink-500 text-[10px] font-mono"
              >
                {tick >= 1000 ? `${(tick / 1000).toFixed(1)}k` : tick.toFixed(0)}
              </text>
            </g>
          ))}

          <text
            x={innerW / 2} y={innerH + 42}
            textAnchor="middle"
            className="fill-ink-400 text-[11px] font-medium"
          >
            毛利 (¥)
          </text>
          <text
            x={-innerH / 2} y={-50}
            textAnchor="middle"
            transform="rotate(-90)"
            className="fill-ink-400 text-[11px] font-medium"
          >
            月度周转 (件)
          </text>

          {paretoLine && (
            <path
              d={`M ${paretoLine}`}
              fill="none"
              stroke="rgba(245,158,11,0.4)"
              strokeWidth={2}
              strokeDasharray="6 3"
            />
          )}

          {normalPoints.map((p) => {
            const idx = data.indexOf(p);
            const isSelected = selectedComboId === p.comboId;
            return (
              <circle
                key={p.comboId}
                cx={xScale(p.grossProfit)}
                cy={yScale(p.monthlyTurnover)}
                r={isSelected ? rScale(p.stockUtilization) + 2 : rScale(p.stockUtilization)}
                fill={isSelected ? 'rgba(139,92,246,0.4)' : 'rgba(148,163,184,0.2)'}
                stroke={isSelected ? 'rgba(139,92,246,0.8)' : 'rgba(148,163,184,0.3)'}
                strokeWidth={isSelected ? 2 : 1}
                className="cursor-pointer transition-all duration-150"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => onPointClick?.(p.comboId)}
              />
            );
          })}

          {paretoPoints.map((p) => {
            const idx = data.indexOf(p);
            const isSelected = selectedComboId === p.comboId;
            return (
              <circle
                key={p.comboId}
                cx={xScale(p.grossProfit)}
                cy={yScale(p.monthlyTurnover)}
                r={isSelected ? rScale(p.stockUtilization) + 3 : rScale(p.stockUtilization) + 1}
                fill={isSelected ? 'rgba(139,92,246,0.5)' : 'rgba(245,158,11,0.35)'}
                stroke={isSelected ? 'rgba(139,92,246,0.9)' : 'rgba(245,158,11,0.8)'}
                strokeWidth={isSelected ? 2.5 : 2}
                className="cursor-pointer transition-all duration-150"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => onPointClick?.(p.comboId)}
              />
            );
          })}

          {hoveredIdx !== null && data[hoveredIdx] && (
            <>
              <line
                x1={xScale(data[hoveredIdx].grossProfit)} y1={0}
                x2={xScale(data[hoveredIdx].grossProfit)} y2={innerH}
                stroke="rgba(245,158,11,0.3)"
                strokeDasharray="3 3"
              />
              <line
                x1={0} y1={yScale(data[hoveredIdx].monthlyTurnover)}
                x2={innerW} y2={yScale(data[hoveredIdx].monthlyTurnover)}
                stroke="rgba(245,158,11,0.3)"
                strokeDasharray="3 3"
              />
            </>
          )}
        </g>
      </svg>

      {hovered && (
        <div className="absolute top-2 right-2 p-3 rounded-xl bg-ink-950/90 border border-white/10 backdrop-blur-sm shadow-lg pointer-events-none z-10 min-w-[180px]">
          <div className="flex items-center gap-2 mb-2">
            <span className={`w-2 h-2 rounded-full ${hovered.isPareto ? 'bg-amber-400' : 'bg-ink-400'}`} />
            <span className="text-xs font-medium text-ink-200">{hovered.label}</span>
            {hovered.isPareto && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/20">
                帕累托
              </span>
            )}
          </div>
          <div className="space-y-1 text-[11px] font-mono">
            <div className="flex justify-between gap-4">
              <span className="text-ink-500">毛利</span>
              <span className="text-emerald-400">¥{hovered.grossProfit.toFixed(0)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-ink-500">月周转</span>
              <span className="text-amber-400">{hovered.monthlyTurnover.toLocaleString()}件</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-ink-500">库存利用率</span>
              <span className="text-ink-200">{(hovered.stockUtilization * 100).toFixed(1)}%</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-white/5 text-[10px] text-ink-500">
            点击选择此方案进行敏感度分析
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-6 mt-3 text-[10px] text-ink-500 font-mono">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500/35 border-2 border-amber-500/80" />
          帕累托前沿
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-ink-400/20 border border-ink-400/30" />
          非支配解
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-ink-400/30" />
          <span className="w-4 h-4 rounded-full bg-ink-400/30" />
          气泡大小=库存利用率
        </span>
      </div>
    </div>
  );
}
