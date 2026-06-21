import type { ComboResult, ParetoPoint } from '@/types';

export function computeParetoFront(results: ComboResult[]): ParetoPoint[] {
  if (results.length === 0) return [];

  const points: ParetoPoint[] = results.map(r => ({
    comboId: r.id,
    rank: r.rank,
    grossProfit: r.grossProfit,
    monthlyTurnover: r.monthlyTurnover,
    stockUtilization: r.totalStock > 0
      ? r.totalStock / (r.items.reduce((s, it) => s + it.product.stockLimit, 0) || 1)
      : 0,
    isPareto: false,
    label: `#${r.rank} · ${r.items.length}品 · ¥${r.grossProfit.toFixed(0)}`,
  }));

  const sortedIndices = points
    .map((_, i) => i)
    .sort((a, b) => {
      if (points[b].grossProfit !== points[a].grossProfit) {
      return points[b].grossProfit - points[a].grossProfit;
    }
      if (points[b].monthlyTurnover !== points[a].monthlyTurnover) {
      return points[b].monthlyTurnover - points[a].monthlyTurnover;
    }
    return points[b].stockUtilization - points[a].stockUtilization;
  });

  for (let i = 0; i < sortedIndices.length; i++) {
    const idx = sortedIndices[i];
    let dominated = false;

    for (let j = 0; j < i; j++) {
      const jIdx = sortedIndices[j];
      if (
        points[jIdx].monthlyTurnover >= points[idx].monthlyTurnover &&
        points[jIdx].stockUtilization >= points[idx].stockUtilization &&
        (
          points[jIdx].grossProfit > points[idx].grossProfit ||
          points[jIdx].monthlyTurnover > points[idx].monthlyTurnover ||
          points[jIdx].stockUtilization > points[idx].stockUtilization
        )
      ) {
        dominated = true;
        break;
      }
    }

    points[idx].isPareto = !dominated;
  }

  return points;
}
