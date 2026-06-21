import type { Product, Constraints, ComboResult, SensitivityPoint, SensitivityResult, MultiSensitivityResult } from '@/types';
import { generateCombinations } from './combinatorics';
import { optimizeQuantities } from './optimizer';

const SENSITIVITY_STEPS = 20;

interface ComboRawMetrics {
  grossProfit: number;
  profitMargin: number;
  avgWeight: number;
  monthlyTurnover: number;
  stockUtilization: number;
}

interface RankedCombo {
  comboIds: string;
  score: number;
  metrics: ComboRawMetrics;
}

function evaluateCombo(
  combo: Product[],
  quantities: number[],
  constraints: Constraints,
): ComboRawMetrics {
  const totalCost = quantities.reduce((s, q, i) => s + combo[i].cost * q, 0);
  const totalRevenue = quantities.reduce((s, q, i) => s + combo[i].price * q, 0);
  const grossProfit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? grossProfit / totalRevenue : 0;
  const avgWeight = combo.reduce((s, p) => s + p.turnoverWeight, 0) / combo.length;
  const totalStock = quantities.reduce((s, q) => s + q, 0);
  const monthlyTurnover = Math.round(totalStock * 4.3 * (avgWeight / 10));
  const stockUtilization = constraints.globalStockLimit > 0
    ? totalStock / constraints.globalStockLimit
    : 0.5;

  return { grossProfit, profitMargin, avgWeight, monthlyTurnover, stockUtilization };
}

function computeWeightedScore(
  metrics: ComboRawMetrics,
  maxMetrics: { maxGP: number; maxPM: number; maxAW: number; maxMT: number; maxSU: number },
  weights: { wGP: number; wPM: number; wAW: number; wMT: number; wSU: number },
): number {
  const nGP = metrics.grossProfit / maxMetrics.maxGP;
  const nPM = metrics.profitMargin / maxMetrics.maxPM;
  const nAW = metrics.avgWeight / maxMetrics.maxAW;
  const nMT = metrics.monthlyTurnover / maxMetrics.maxMT;
  const nSU = metrics.stockUtilization / maxMetrics.maxSU;
  return nGP * weights.wGP + nPM * weights.wPM + nAW * weights.wAW + nMT * weights.wMT + nSU * weights.wSU;
}

function getWeightCoeffs(constraints: Constraints) {
  const {
    grossProfitWeight, profitMarginWeight, avgTurnoverWeight,
    monthlyTurnoverWeight, stockUtilizationWeight,
  } = constraints;
  const totalWeight = grossProfitWeight + profitMarginWeight + avgTurnoverWeight +
    monthlyTurnoverWeight + stockUtilizationWeight || 1;
  return {
    wGP: grossProfitWeight / totalWeight,
    wPM: profitMarginWeight / totalWeight,
    wAW: avgTurnoverWeight / totalWeight,
    wMT: monthlyTurnoverWeight / totalWeight,
    wSU: stockUtilizationWeight / totalWeight,
  };
}

function evaluateAllCombos(
  allProducts: Product[],
  constraints: Constraints,
  weightCoeffs: ReturnType<typeof getWeightCoeffs>,
): RankedCombo[] {
  const { minTurnoverWeight, minComboSize, maxComboSize, globalStockLimit } = constraints;

  const filteredByWeight = allProducts.filter(p => p.turnoverWeight >= minTurnoverWeight);
  const allCombos = generateCombinations(filteredByWeight, minComboSize, maxComboSize);

  const validCombos: RankedCombo[] = [];
  const allMetrics: ComboRawMetrics[] = [];

  for (const combo of allCombos) {
    const minW = Math.min(...combo.map(p => p.turnoverWeight));
    const avgW = combo.reduce((acc, p) => acc + p.turnoverWeight, 0) / combo.length;
    if (minW < minTurnoverWeight || avgW < minTurnoverWeight * 1.1) continue;

    const opt = optimizeQuantities(combo, constraints, weightCoeffs);
    if (opt.status === 'no_feasible') continue;

    const metrics = evaluateCombo(combo, opt.quantities, constraints);
    const totalStock = opt.quantities.reduce((acc, q) => acc + q, 0);
    if (globalStockLimit > 0 && totalStock > globalStockLimit) continue;

    const comboIds = combo.map(p => p.id).sort().join(',');
    allMetrics.push(metrics);
    validCombos.push({ comboIds, score: 0, metrics });
  }

  if (validCombos.length === 0) return validCombos;

  const maxGP = Math.max(...allMetrics.map(m => m.grossProfit), 1);
  const maxPM = Math.max(...allMetrics.map(m => m.profitMargin), 1);
  const maxAW = Math.max(...allMetrics.map(m => m.avgWeight), 1);
  const maxMT = Math.max(...allMetrics.map(m => m.monthlyTurnover), 1);
  const maxSU = Math.max(...allMetrics.map(m => m.stockUtilization), 1);
  const maxMetrics = { maxGP, maxPM, maxAW, maxMT, maxSU };

  for (const vc of validCombos) {
    vc.score = computeWeightedScore(vc.metrics, maxMetrics, weightCoeffs);
  }

  validCombos.sort((a, b) => b.score - a.score);

  return validCombos;
}

export function computeSensitivity(
  allProducts: Product[],
  constraints: Constraints,
  targetCombo: ComboResult,
  paramName: 'cost' | 'turnoverWeight',
  productId: string,
): SensitivityResult {
  const weightCoeffs = getWeightCoeffs(constraints);
  const product = allProducts.find(p => p.id === productId);
  if (!product) {
    return emptySensitivityResult(paramName, productId, '', 0);
  }

  const baseValue = paramName === 'cost' ? product.cost : product.turnoverWeight;
  const rangeFactor = 0.3;
  const minValue = paramName === 'cost'
    ? Math.max(0.1, baseValue * (1 - rangeFactor))
    : Math.max(1, Math.round(baseValue * (1 - rangeFactor)));
  const maxValue = paramName === 'cost'
    ? baseValue * (1 + rangeFactor)
    : Math.min(10, Math.round(baseValue * (1 + rangeFactor)));

  const step = (maxValue - minValue) / SENSITIVITY_STEPS;

  const comboProducts = targetCombo.items.map(it => ({ ...it.product }));
  const comboProductIdx = comboProducts.findIndex(p => p.id === productId);
  if (comboProductIdx < 0) {
    return emptySensitivityResult(paramName, productId, product.name, baseValue);
  }

  const points: SensitivityPoint[] = [];
  const targetIds = comboProducts.map(p => p.id).sort().join(',');

  for (let s = 0; s <= SENSITIVITY_STEPS; s++) {
    const paramValue = minValue + step * s;
    const modifiedProducts = allProducts.map(p =>
      p.id === productId
        ? { ...p, [paramName]: paramName === 'turnoverWeight' ? Math.round(paramValue) : paramValue }
        : p
    );

    const validCombos = evaluateAllCombos(modifiedProducts, constraints, weightCoeffs);

    if (validCombos.length === 0) {
      points.push({ paramValue, score: 0, rank: 1 });
      continue;
    }

    const targetIdx = validCombos.findIndex(vc => vc.comboIds === targetIds);
    const targetScore = targetIdx >= 0 ? validCombos[targetIdx].score : 0;
    const targetRank = targetIdx >= 0 ? targetIdx + 1 : validCombos.length + 1;

    points.push({
      paramValue: paramName === 'turnoverWeight' ? Math.round(paramValue) : Math.round(paramValue * 100) / 100,
      score: Math.round(targetScore * 10000) / 100,
      rank: targetRank,
    });
  }

  const scoreRange = Math.max(...points.map(p => p.score)) - Math.min(...points.map(p => p.score));
  const paramRange = maxValue - minValue || 1;
  const sensitivityCoefficient = scoreRange / paramRange;

  return {
    paramName,
    paramLabel: paramName === 'cost' ? '进货成本' : '周转权重',
    productId,
    productName: product.name,
    baseValue,
    minValue: paramName === 'turnoverWeight' ? Math.round(minValue) : Math.round(minValue * 100) / 100,
    maxValue: paramName === 'turnoverWeight' ? Math.round(maxValue) : Math.round(maxValue * 100) / 100,
    points,
    sensitivityCoefficient: Math.round(sensitivityCoefficient * 100) / 100,
  };
}

export function computeMultiSensitivity(
  allProducts: Product[],
  constraints: Constraints,
  targetCombo: ComboResult,
): MultiSensitivityResult {
  const comboProducts = targetCombo.items.map(it => it.product);
  const results: SensitivityResult[] = [];

  for (const product of comboProducts) {
    const costResult = computeSensitivity(allProducts, constraints, targetCombo, 'cost', product.id);
    results.push(costResult);
  }

  for (const product of comboProducts) {
    const turnoverResult = computeSensitivity(allProducts, constraints, targetCombo, 'turnoverWeight', product.id);
    results.push(turnoverResult);
  }

  let mostSensitive: MultiSensitivityResult['mostSensitive'] = null;
  let maxCoeff = 0;

  for (const r of results) {
    if (r.sensitivityCoefficient > maxCoeff) {
      maxCoeff = r.sensitivityCoefficient;
      mostSensitive = {
        paramName: r.paramName,
        paramLabel: r.paramLabel,
        productId: r.productId,
        productName: r.productName,
        coefficient: r.sensitivityCoefficient,
      };
    }
  }

  return {
    comboId: targetCombo.id,
    comboRank: targetCombo.rank,
    comboScore: targetCombo.weightedScore,
    results,
    mostSensitive,
  };
}

function emptySensitivityResult(
  paramName: string,
  productId: string,
  productName: string,
  baseValue: number,
): SensitivityResult {
  return {
    paramName,
    paramLabel: paramName === 'cost' ? '进货成本' : '周转权重',
    productId,
    productName,
    baseValue,
    minValue: baseValue,
    maxValue: baseValue,
    points: [],
    sensitivityCoefficient: 0,
  };
}
