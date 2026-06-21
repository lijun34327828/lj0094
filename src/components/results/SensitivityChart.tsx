import { useMemo } from 'react';
import type { SensitivityResult } from '@/types';

interface SensitivityChartProps {
  data: SensitivityResult;
}

const MARGIN = { top: 20, right: 60, bottom: 50, left: 70 };

export default function SensitivityChart({ data }: SensitivityChartProps) {
  const { width, height, innerW, innerH, xScale, yScaleLeft, yScaleRight, xTicks } = useMemo(() => {
    const w = 600;
    const h = 320;
    const iW = w - MARGIN.left - MARGIN.right;
    const iH = h - MARGIN.top - MARGIN.bottom;

    if (data.points.length === 0) {
      return { width: w, height: h, innerW: iW, innerH: iH, xScale: () => 0, yScaleLeft: () => 0, yScaleRight: () => 0, xTicks: [] as number[] };
    }

    const xMin = data.minValue;
    const xMax = data.maxValue;
    const xPad = (xMax - xMin) * 0.05 || 1;
    const xScale = (v: number) => ((v - xMin + xPad) / (xMax - xMin + 2 * xPad)) * iW;

    const scores = data.points.map(p => p.score);
    const sMin = Math.min(...scores);
    const sMax = Math.max(...scores);
    const sPad = (sMax - sMin) * 0.1 || 1;
    const yScaleLeft = (v: number) => iH - ((v - sMin + sPad) / (sMax - sMin + 2 * sPad)) * iH;

    const ranks = data.points.map(p => p.rank);
    const rMax = Math.max(...ranks);
    const rMin = Math.min(...ranks);
    const rPad = Math.max(1, (rMax - rMin) * 0.1);
    const yScaleRight = (v: number) => iH - ((v - Math.max(0, rMin - rPad)) / (rMax + rPad - Math.max(0, rMin - rPad))) * iH;

    const xTickCount = 6;
    const xStep = (xMax - xMin) / xTickCount || 1;
    const xTicks = Array.from({ length: xTickCount + 1 }, (_, i) => xMin + xStep * i);

    return { width: w, height: h, innerW: iW, innerH: iH, xScale, yScaleLeft, yScaleRight, xTicks };
  }, [data]);

  const scoreLine = useMemo(() => {
    if (data.points.length < 2) return '';
    return data.points.map(p => `${xScale(p.paramValue)},${yScaleLeft(p.score)}`).join(' L ');
  }, [data.points, xScale, yScaleLeft]);

  const rankLine = useMemo(() => {
    if (data.points.length < 2) return '';
    return data.points.map(p => `${xScale(p.paramValue)},${yScaleRight(p.rank)}`).join(' L ');
  }, [data.points, xScale, yScaleRight]);

  const baseIdx = useMemo(() => {
    let closest = 0;
    let closestDist = Infinity;
    data.points.forEach((p, i) => {
      const dist = Math.abs(p.paramValue - data.baseValue);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    return closest;
  }, [data.points, data.baseValue]);

  const scores = data.points.map(p => p.score);
  const sMin = Math.min(...scores);
  const sMax = Math.max(...scores);
  const leftTicks = [sMin, (sMin + sMax) / 2, sMax];

  const ranks = data.points.map(p => p.rank);
  const rMax = Math.max(...ranks);
  const rMin = Math.min(...ranks);
  const rightTicks = [rMin, Math.round((rMin + rMax) / 2), rMax];

  const sensitivityLevel = data.sensitivityCoefficient > 50 ? 'high' : data.sensitivityCoefficient > 10 ? 'medium' : 'low';
  const sensitivityColor = sensitivityLevel === 'high' ? 'text-rose-400' : sensitivityLevel === 'medium' ? 'text-amber-400' : 'text-emerald-400';
  const sensitivityLabel = sensitivityLevel === 'high' ? '高敏感' : sensitivityLevel === 'medium' ? '中敏感' : '低敏感';

  if (data.points.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-ink-500 text-sm">
        暂无敏感度数据
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="text-xs text-ink-400">
          参数范围: <span className="font-mono text-ink-300">{data.minValue}</span>
          <span className="mx-1 text-ink-600">→</span>
          <span className="font-mono text-ink-300">{data.maxValue}</span>
          <span className="ml-2 text-ink-600">|</span>
          <span className="ml-2">基准值: <span className="font-mono text-amber-400">{data.baseValue}</span></span>
        </div>
        <div className={`text-xs font-mono font-bold ${sensitivityColor}`}>
          {sensitivityLabel} · 系数 {data.sensitivityCoefficient}
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
          {xTicks.map((tick, i) => (
            <g key={`xt-${i}`}>
              <line
                x1={xScale(tick)} y1={0}
                x2={xScale(tick)} y2={innerH}
                stroke="rgba(148,163,184,0.06)"
              />
              <text
                x={xScale(tick)} y={innerH + 20}
                textAnchor="middle"
                className="fill-ink-500 text-[10px] font-mono"
              >
                {typeof tick === 'number' && tick % 1 !== 0 ? tick.toFixed(1) : tick}
              </text>
            </g>
          ))}

          {leftTicks.map((tick, i) => (
            <g key={`yl-${i}`}>
              <line
                x1={0} y1={yScaleLeft(tick)}
                x2={innerW} y2={yScaleLeft(tick)}
                stroke="rgba(148,163,184,0.06)"
              />
              <text
                x={-10} y={yScaleLeft(tick) + 4}
                textAnchor="end"
                className="fill-emerald-400/70 text-[10px] font-mono"
              >
                {tick.toFixed(1)}
              </text>
            </g>
          ))}

          {rightTicks.map((tick, i) => (
            <g key={`yr-${i}`}>
              <text
                x={innerW + 10} y={yScaleRight(tick) + 4}
                textAnchor="start"
                className="fill-violet-400/70 text-[10px] font-mono"
              >
                #{tick}
              </text>
            </g>
          ))}

          <text
            x={innerW / 2} y={innerH + 42}
            textAnchor="middle"
            className="fill-ink-400 text-[11px] font-medium"
          >
            {data.paramLabel} ({data.productName})
          </text>
          <text
            x={-innerH / 2} y={-50}
            textAnchor="middle"
            transform="rotate(-90)"
            className="fill-emerald-400/60 text-[11px] font-medium"
          >
            综合得分
          </text>
          <text
            x={innerH / 2} y={-(innerW + 45)}
            textAnchor="middle"
            transform="rotate(90)"
            className="fill-violet-400/60 text-[11px] font-medium"
          >
            排名
          </text>

          {data.points[baseIdx] && (
            <line
              x1={xScale(data.points[baseIdx].paramValue)} y1={0}
              x2={xScale(data.points[baseIdx].paramValue)} y2={innerH}
              stroke="rgba(245,158,11,0.3)"
              strokeDasharray="4 4"
            />
          )}

          {scoreLine && (
            <path
              d={`M ${scoreLine}`}
              fill="none"
              stroke="rgba(16,185,129,0.8)"
              strokeWidth={2.5}
              strokeLinejoin="round"
            />
          )}

          {rankLine && (
            <path
              d={`M ${rankLine}`}
              fill="none"
              stroke="rgba(139,92,246,0.7)"
              strokeWidth={2}
              strokeDasharray="6 3"
              strokeLinejoin="round"
            />
          )}

          {data.points.map((p, i) => (
            <g key={i}>
              <circle
                cx={xScale(p.paramValue)}
                cy={yScaleLeft(p.score)}
                r={i === baseIdx ? 5 : 3}
                fill={i === baseIdx ? '#10b981' : 'rgba(16,185,129,0.5)'}
                stroke={i === baseIdx ? '#10b981' : 'none'}
                strokeWidth={i === baseIdx ? 2 : 0}
              />
              <circle
                cx={xScale(p.paramValue)}
                cy={yScaleRight(p.rank)}
                r={i === baseIdx ? 4 : 2.5}
                fill={i === baseIdx ? '#8b5cf6' : 'rgba(139,92,246,0.4)'}
              />
            </g>
          ))}
        </g>
      </svg>

      <div className="flex items-center justify-center gap-6 text-[10px] text-ink-500 font-mono">
        <span className="flex items-center gap-1.5">
          <span className="w-6 h-0.5 bg-emerald-500/80 rounded" />
          综合得分
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-6 h-0.5 bg-violet-500/70 rounded border-dashed" />
          排名
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 bg-amber-500/30 rounded border-dashed" />
          基准值
        </span>
      </div>
    </div>
  );
}
