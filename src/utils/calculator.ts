import type { Product, Constraints, ComboResult, ComboItem, CalcOutput } from '@/types';
import { generateCombinations } from './combinatorics';
import { optimizeQuantities } from './optimizer';
import { computeParetoFront } from './pareto';

const MAX_DISPLAY = 20;

interface ComboRawMetrics {
  grossProfit: number;
  profitMargin: number;
  avgWeight: number;
  monthlyTurnover: number;
  stockUtilization: number;
}

export function calculateCombinations(
  products: Product[],
  constraints: Constraints,
): CalcOutput {
  const startTime = performance.now();
  const { minTurnoverWeight, minComboSize, maxComboSize, globalStockLimit } = constraints;

  const {
    grossProfitWeight, profitMarginWeight, avgTurnoverWeight,
    monthlyTurnoverWeight, stockUtilizationWeight,
  } = constraints;
  const totalWeight = grossProfitWeight + profitMarginWeight + avgTurnoverWeight +
    monthlyTurnoverWeight + stockUtilizationWeight || 1;
  const wGP = grossProfitWeight / totalWeight;
  const wPM = profitMarginWeight / totalWeight;
  const wAW = avgTurnoverWeight / totalWeight;
  const wMT = monthlyTurnoverWeight / totalWeight;
  const wSU = stockUtilizationWeight / totalWeight;

  const weightCoeffs = { wGP, wPM, wAW, wMT, wSU };

  const filteredByWeightInit = products.filter(p => p.turnoverWeight >= minTurnoverWeight);
  const allCombos = generateCombinations(filteredByWeightInit, minComboSize, maxComboSize);
  const totalCombinations = allCombos.length;

  let filteredByStock = 0;
  let filteredByWeight = 0;

  interface PendingResult {
    index: number;
    items: ComboItem[];
    totalCost: number;
    totalRevenue: number;
    grossProfit: number;
    profitMargin: number;
    monthlyTurnover: number;
    avgWeight: number;
    totalStock: number;
    rawMetrics: ComboRawMetrics;
    optimizationStatus: 'optimal' | 'no_feasible' | 'multiple';
    alternateSolutions?: number;
  }

  const pendingResults: PendingResult[] = [];

  for (let i = 0; i < allCombos.length; i++) {
    const combo = allCombos[i];

    const minWeight = Math.min(...combo.map(p => p.turnoverWeight));
    const avgWeight = combo.reduce((s, p) => s + p.turnoverWeight, 0) / combo.length;
    if (minWeight < minTurnoverWeight || avgWeight < minTurnoverWeight * 1.1) {
      filteredByWeight++;
      continue;
    }

    const opt = optimizeQuantities(combo, constraints, weightCoeffs);
    if (opt.status === 'no_feasible') {
      filteredByStock++;
      continue;
    }

    const items: ComboItem[] = combo.map((p, j) => ({
      product: p,
      quantity: opt.quantities[j],
    }));

    const totalStock = items.reduce((s, it) => s + it.quantity, 0);
    if (globalStockLimit > 0 && totalStock > globalStockLimit) {
      filteredByStock++;
      continue;
    }

    let stockExceeded = false;
    for (let j = 0; j < items.length; j++) {
      if (items[j].quantity > items[j].product.stockLimit) {
        stockExceeded = true;
        break;
      }
    }
    if (stockExceeded) {
      filteredByStock++;
      continue;
    }

    const totalCost = items.reduce((s, it) => s + it.product.cost * it.quantity, 0);
    const totalRevenue = items.reduce((s, it) => s + it.product.price * it.quantity, 0);
    const grossProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? grossProfit / totalRevenue : 0;

    const baseMonthFactor = 4.3;
    const monthlyTurnover = Math.round(totalStock * baseMonthFactor * (avgWeight / 10));

    const stockUtilization = globalStockLimit > 0 ? totalStock / globalStockLimit : 0.5;

    pendingResults.push({
      index: i,
      items,
      totalCost,
      totalRevenue,
      grossProfit,
      profitMargin,
      monthlyTurnover,
      avgWeight,
      totalStock,
      rawMetrics: {
        grossProfit,
        profitMargin,
        avgWeight,
        monthlyTurnover,
        stockUtilization,
      },
      optimizationStatus: opt.status,
      alternateSolutions: opt.alternateSolutions,
    });
  }

  const maxGP = Math.max(...pendingResults.map(r => r.rawMetrics.grossProfit), 1);
  const maxPM = Math.max(...pendingResults.map(r => r.rawMetrics.profitMargin), 1);
  const maxAW = Math.max(...pendingResults.map(r => r.rawMetrics.avgWeight), 1);
  const maxMT = Math.max(...pendingResults.map(r => r.rawMetrics.monthlyTurnover), 1);
  const maxSU = Math.max(...pendingResults.map(r => r.rawMetrics.stockUtilization), 1);

  const validResults: ComboResult[] = pendingResults.map(pending => {
    const { rawMetrics } = pending;
    const nGP = rawMetrics.grossProfit / maxGP;
    const nPM = rawMetrics.profitMargin / maxPM;
    const nAW = rawMetrics.avgWeight / maxAW;
    const nMT = rawMetrics.monthlyTurnover / maxMT;
    const nSU = rawMetrics.stockUtilization / maxSU;

    const weightedScore = nGP * wGP + nPM * wPM + nAW * wAW + nMT * wMT + nSU * wSU;

    return {
      id: `combo-${pending.index}`,
      rank: 0,
      items: pending.items,
      totalCost: Math.round(pending.totalCost * 100) / 100,
      totalRevenue: Math.round(pending.totalRevenue * 100) / 100,
      grossProfit: Math.round(pending.grossProfit * 100) / 100,
      profitMargin: Math.round(pending.profitMargin * 10000) / 10000,
      weightedScore: Math.round(weightedScore * 10000) / 100,
      monthlyTurnover: pending.monthlyTurnover,
      avgTurnoverWeight: Math.round(pending.avgWeight * 10) / 10,
      totalStock: pending.totalStock,
      optimizationStatus: pending.optimizationStatus,
      alternateSolutions: pending.alternateSolutions,
      isParetoOptimal: false,
    };
  });

  validResults.sort((a, b) => b.weightedScore - a.weightedScore);
  const allRanked = validResults.map((r, idx) => ({ ...r, rank: idx + 1 }));

  const paretoFront = computeParetoFront(allRanked);
  const paretoIds = new Set(paretoFront.filter(p => p.isPareto).map(p => p.comboId));

  const allWithPareto = allRanked.map(r => ({
    ...r,
    isParetoOptimal: paretoIds.has(r.id),
  }));

  const topResults = allWithPareto.slice(0, MAX_DISPLAY);

  const endTime = performance.now();

  return {
    results: topResults,
    allResults: allWithPareto,
    paretoFront,
    summary: {
      totalCombinations,
      filteredByStock,
      filteredByWeight,
      validCombinations: validResults.length,
      paretoCount: paretoIds.size,
      calculateTimeMs: Math.round(endTime - startTime),
    },
  };
}
