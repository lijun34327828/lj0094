import type { Product, Constraints, ComboResult, ComboItem, CalculationSummary } from '@/types';
import { generateCombinations, gcdArray } from './combinatorics';

const MAX_RESULTS = 20;

interface CalculateResult {
  results: ComboResult[];
  summary: CalculationSummary;
}

export function calculateCombinations(
  products: Product[],
  constraints: Constraints
): CalculateResult {
  const startTime = performance.now();
  const { minTurnoverWeight, minComboSize, maxComboSize, globalStockLimit } = constraints;

  const filteredByWeightInit = products.filter(p => p.turnoverWeight >= minTurnoverWeight);
  const allCombos = generateCombinations(filteredByWeightInit, minComboSize, maxComboSize);
  const totalCombinations = allCombos.length;

  let filteredByStock = 0;
  let filteredByWeight = 0;
  const validResults: ComboResult[] = [];

  for (let i = 0; i < allCombos.length; i++) {
    const combo = allCombos[i];

    const minWeight = Math.min(...combo.map(p => p.turnoverWeight));
    const avgWeight = combo.reduce((s, p) => s + p.turnoverWeight, 0) / combo.length;
    if (minWeight < minTurnoverWeight || avgWeight < minTurnoverWeight * 1.1) {
      filteredByWeight++;
      continue;
    }

    const weights = combo.map(p => p.turnoverWeight);
    const g = Math.max(1, gcdArray(weights));
    const ratios = weights.map(w => w / g);
    const sumRatios = ratios.reduce((a, b) => a + b, 0);

    let scaleFactor = Infinity;
    for (let j = 0; j < combo.length; j++) {
      const maxByStock = Math.floor(combo[j].stockLimit / ratios[j]);
      if (maxByStock < scaleFactor) scaleFactor = maxByStock;
    }
    if (globalStockLimit > 0) {
      const maxByGlobal = Math.floor(globalStockLimit / sumRatios);
      if (maxByGlobal < scaleFactor) scaleFactor = maxByGlobal;
    }

    scaleFactor = Math.max(1, scaleFactor);

    const items: ComboItem[] = combo.map((p, j) => ({
      product: p,
      quantity: ratios[j] * scaleFactor,
    }));

    const totalStock = items.reduce((s, it) => s + it.quantity, 0);
    if (globalStockLimit > 0 && totalStock > globalStockLimit) {
      filteredByStock++;
      continue;
    }
    for (let j = 0; j < items.length; j++) {
      if (items[j].quantity > items[j].product.stockLimit) {
        filteredByStock++;
        break;
      }
    }
    if (validResults.length > 0 && validResults[validResults.length - 1].items.length === items.length) {
      const prev = validResults[validResults.length - 1].items;
      let isSameSet = true;
      for (let j = 0; j < items.length; j++) {
        if (prev[j].product.id !== items[j].product.id) { isSameSet = false; break; }
      }
      if (!isSameSet || prev.length !== items.length) {
        // ok
      }
    }

    const totalCost = items.reduce((s, it) => s + it.product.cost * it.quantity, 0);
    const totalRevenue = items.reduce((s, it) => s + it.product.price * it.quantity, 0);
    const grossProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? grossProfit / totalRevenue : 0;

    const baseMonthFactor = 4.3;
    const monthlyTurnover = Math.round(totalStock * baseMonthFactor * (avgWeight / 10));

    const stockUtilization = globalStockLimit > 0 ? totalStock / globalStockLimit : 0.5;

    const weightedScore =
      grossProfit * 0.50 +
      profitMargin * 100 * 0.20 +
      avgWeight * 0.15 * 100 +
      (monthlyTurnover / 100) * 0.10 * 100 +
      stockUtilization * 0.05 * 1000;

    validResults.push({
      id: `combo-${i}`,
      rank: 0,
      items,
      totalCost: Math.round(totalCost * 100) / 100,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      grossProfit: Math.round(grossProfit * 100) / 100,
      profitMargin: Math.round(profitMargin * 10000) / 10000,
      weightedScore: Math.round(weightedScore * 100) / 100,
      monthlyTurnover,
      avgTurnoverWeight: Math.round(avgWeight * 10) / 10,
      totalStock,
    });
  }

  validResults.sort((a, b) => b.weightedScore - a.weightedScore);
  const topResults = validResults.slice(0, MAX_RESULTS).map((r, idx) => ({ ...r, rank: idx + 1 }));

  const endTime = performance.now();

  return {
    results: topResults,
    summary: {
      totalCombinations,
      filteredByStock,
      filteredByWeight,
      validCombinations: validResults.length,
      calculateTimeMs: Math.round(endTime - startTime),
    },
  };
}
