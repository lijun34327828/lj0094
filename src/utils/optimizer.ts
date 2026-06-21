import type { Product, Constraints, OptimizationStatus } from '@/types';

export interface OptimizeResult {
  quantities: number[];
  totalStock: number;
  status: OptimizationStatus;
  alternateSolutions?: number;
}

interface ObjectiveParams {
  wGP: number;
  wPM: number;
  wMT: number;
  wSU: number;
  totalWeight: number;
  avgWeight: number;
  globalStockLimit: number;
}

function computeScore(
  gp: number,
  tr: number,
  totalStock: number,
  params: ObjectiveParams,
): number {
  const pm = tr > 0 ? gp / tr : 0;
  const mt = totalStock * 4.3 * (params.avgWeight / 10);
  const su = params.globalStockLimit > 0
    ? totalStock / params.globalStockLimit
    : 0.5;

  return (
    (gp / 10000) * (params.wGP / params.totalWeight) +
    pm * (params.wPM / params.totalWeight) +
    (mt / 10000) * (params.wMT / params.totalWeight) +
    su * (params.wSU / params.totalWeight)
  );
}

function computeScoreFromQuantities(
  combo: Product[],
  quantities: number[],
  params: ObjectiveParams,
): { score: number; gp: number; tr: number; totalStock: number } {
  let gp = 0;
  let tr = 0;
  let totalStock = 0;
  for (let i = 0; i < combo.length; i++) {
    gp += (combo[i].price - combo[i].cost) * quantities[i];
    tr += combo[i].price * quantities[i];
    totalStock += quantities[i];
  }
  return { score: computeScore(gp, tr, totalStock, params), gp, tr, totalStock };
}

function greedyOptimize(
  combo: Product[],
  maxTotalStock: number,
  params: ObjectiveParams,
): number[] {
  const k = combo.length;
  const quantities = new Array(k).fill(1) as number[];
  let totalStock = k;
  let gp = combo.reduce((s, p) => s + (p.price - p.cost), 0);
  let tr = combo.reduce((s, p) => s + p.price, 0);

  while (totalStock < maxTotalStock) {
    let bestIdx = -1;
    let bestDelta = -Infinity;

    for (let i = 0; i < k; i++) {
      if (quantities[i] >= combo[i].stockLimit) continue;

      const unitMargin = combo[i].price - combo[i].cost;
      const newGp = gp + unitMargin;
      const newTr = tr + combo[i].price;
      const newPm = newTr > 0 ? newGp / newTr : 0;
      const oldPm = tr > 0 ? gp / tr : 0;
      const deltaPm = newPm - oldPm;

      const deltaGpScore = (unitMargin / 10000) * (params.wGP / params.totalWeight);
      const deltaPmScore = deltaPm * (params.wPM / params.totalWeight);
      const deltaMtScore = (4.3 * (params.avgWeight / 10) / 10000) * (params.wMT / params.totalWeight);
      const deltaSuScore = (params.globalStockLimit > 0 ? 1 / params.globalStockLimit : 0) * (params.wSU / params.totalWeight);

      const delta = deltaGpScore + deltaPmScore + deltaMtScore + deltaSuScore;

      if (delta > bestDelta) {
        bestDelta = delta;
        bestIdx = i;
      }
    }

    if (bestIdx < 0 || bestDelta <= 0) break;

    quantities[bestIdx]++;
    totalStock++;
    gp += combo[bestIdx].price - combo[bestIdx].cost;
    tr += combo[bestIdx].price;
  }

  return quantities;
}

function optimizeSingleProduct(
  combo: Product[],
  quantities: number[],
  idx: number,
  maxTotalStock: number,
  params: ObjectiveParams,
): { quantities: number[]; improved: boolean } {
  const k = combo.length;
  const product = combo[idx];
  const otherStock = quantities.reduce((s, q, i) => i === idx ? s : s + q, 0);
  const maxQty = Math.min(product.stockLimit, maxTotalStock - otherStock);
  const minQty = 1;

  if (maxQty <= minQty) {
    return { quantities: [...quantities], improved: false };
  }

  const baseGp = quantities.reduce((s, q, i) => i === idx ? s : s + (combo[i].price - combo[i].cost) * q, 0);
  const baseTr = quantities.reduce((s, q, i) => i === idx ? s : s + combo[i].price * q, 0);

  const unitMargin = product.price - product.cost;
  const unitPrice = product.price;
  const mtPerUnit = 4.3 * (params.avgWeight / 10);
  const suPerUnit = params.globalStockLimit > 0 ? 1 / params.globalStockLimit : 0;

  function scoreAt(qty: number): number {
    const gp = baseGp + unitMargin * qty;
    const tr = baseTr + unitPrice * qty;
    const totalStock = otherStock + qty;
    return computeScore(gp, tr, totalStock, params);
  }

  let bestQty = quantities[idx];
  let bestScore = scoreAt(bestQty);

  let low = minQty;
  let high = maxQty;

  while (high - low > 3) {
    const m1 = Math.floor(low + (high - low) / 3);
    const m2 = Math.floor(high - (high - low) / 3);
    const s1 = scoreAt(m1);
    const s2 = scoreAt(m2);

    if (s1 < s2) {
      low = m1;
      if (s2 > bestScore) {
        bestScore = s2;
        bestQty = m2;
      }
    } else {
      high = m2;
      if (s1 > bestScore) {
        bestScore = s1;
        bestQty = m1;
      }
    }
  }

  for (let q = low; q <= high; q++) {
    const s = scoreAt(q);
    if (s > bestScore) {
      bestScore = s;
      bestQty = q;
    }
  }

  const improved = bestQty !== quantities[idx];
  const newQuantities = [...quantities];
  newQuantities[idx] = bestQty;

  return { quantities: newQuantities, improved };
}

function optimizePair(
  combo: Product[],
  quantities: number[],
  i: number,
  j: number,
  maxTotalStock: number,
  params: ObjectiveParams,
): { quantities: number[]; improved: boolean } {
  const k = combo.length;
  const pairStock = quantities[i] + quantities[j];
  const otherStock = quantities.reduce((s, q, idx) => (idx === i || idx === j) ? s : s + q, 0);

  const maxPairStock = Math.min(
    combo[i].stockLimit + combo[j].stockLimit,
    maxTotalStock - otherStock,
  );

  if (maxPairStock < 2) {
    return { quantities: [...quantities], improved: false };
  }

  const minPairStock = Math.max(2, pairStock - 200, 2);
  const actualMaxPair = Math.min(maxPairStock, pairStock + 200);

  const baseGp = quantities.reduce((s, q, idx) => (idx === i || idx === j) ? s : s + (combo[idx].price - combo[idx].cost) * q, 0);
  const baseTr = quantities.reduce((s, q, idx) => (idx === i || idx === j) ? s : s + combo[idx].price * q, 0);

  const mi = combo[i].price - combo[i].cost;
  const mj = combo[j].price - combo[j].cost;
  const pi = combo[i].price;
  const pj = combo[j].price;

  let bestQi = quantities[i];
  let bestQj = quantities[j];
  let bestScore = -Infinity;

  for (let total = minPairStock; total <= actualMaxPair; total++) {
    const minQi = Math.max(1, total - combo[j].stockLimit);
    const maxQi = Math.min(combo[i].stockLimit, total - 1);

    if (minQi > maxQi) continue;

    function scoreAtQi(qi: number): number {
      const qj = total - qi;
      const gp = baseGp + mi * qi + mj * qj;
      const tr = baseTr + pi * qi + pj * qj;
      const totalStock = otherStock + total;
      return computeScore(gp, tr, totalStock, params);
    }

    let low = minQi;
    let high = maxQi;
    let localBestQi = minQi;
    let localBestScore = -Infinity;

    while (high - low > 3) {
      const m1 = Math.floor(low + (high - low) / 3);
      const m2 = Math.floor(high - (high - low) / 3);
      const s1 = scoreAtQi(m1);
      const s2 = scoreAtQi(m2);

      if (s1 < s2) {
        low = m1;
        if (s2 > localBestScore) {
          localBestScore = s2;
          localBestQi = m2;
        }
      } else {
        high = m2;
        if (s1 > localBestScore) {
          localBestScore = s1;
          localBestQi = m1;
        }
      }
    }

    for (let qi = low; qi <= high; qi++) {
      const s = scoreAtQi(qi);
      if (s > localBestScore) {
        localBestScore = s;
        localBestQi = qi;
      }
    }

    if (localBestScore > bestScore) {
      bestScore = localBestScore;
      bestQi = localBestQi;
      bestQj = total - localBestQi;
    }
  }

  const improved = bestQi !== quantities[i] || bestQj !== quantities[j];
  const newQuantities = [...quantities];
  newQuantities[i] = bestQi;
  newQuantities[j] = bestQj;

  return { quantities: newQuantities, improved };
}

export function optimizeQuantities(
  combo: Product[],
  constraints: Constraints,
  weightCoeffs: { wGP: number; wPM: number; wAW: number; wMT: number; wSU: number },
): OptimizeResult {
  const k = combo.length;
  const { globalStockLimit } = constraints;
  const totalWeight = weightCoeffs.wGP + weightCoeffs.wPM + weightCoeffs.wAW +
    weightCoeffs.wMT + weightCoeffs.wSU || 1;
  const avgWeight = combo.reduce((s, p) => s + p.turnoverWeight, 0) / k;

  const params: ObjectiveParams = {
    wGP: weightCoeffs.wGP,
    wPM: weightCoeffs.wPM,
    wMT: weightCoeffs.wMT,
    wSU: weightCoeffs.wSU,
    totalWeight,
    avgWeight,
    globalStockLimit,
  };

  for (let i = 0; i < k; i++) {
    if (combo[i].stockLimit < 1) {
      return { quantities: [], totalStock: 0, status: 'no_feasible' };
    }
  }

  if (globalStockLimit > 0 && globalStockLimit < k) {
    return { quantities: [], totalStock: 0, status: 'no_feasible' };
  }

  const sumStockLimits = combo.reduce((s, p) => s + p.stockLimit, 0);
  const maxTotalStock = globalStockLimit > 0
    ? Math.min(globalStockLimit, sumStockLimits)
    : sumStockLimits;

  let quantities = greedyOptimize(combo, maxTotalStock, params);

  const MAX_PASSES = 20;
  let pass = 0;
  let improved = true;

  while (improved && pass < MAX_PASSES) {
    improved = false;
    pass++;

    for (let i = 0; i < k; i++) {
      const result = optimizeSingleProduct(combo, quantities, i, maxTotalStock, params);
      if (result.improved) {
        quantities = result.quantities;
        improved = true;
      }
    }

    for (let i = 0; i < k; i++) {
      for (let j = i + 1; j < k; j++) {
        const result = optimizePair(combo, quantities, i, j, maxTotalStock, params);
        if (result.improved) {
          quantities = result.quantities;
          improved = true;
        }
      }
    }
  }

  const result = computeScoreFromQuantities(combo, quantities, params);

  if (result.totalStock < k) {
    return { quantities: [], totalStock: 0, status: 'no_feasible' };
  }

  const alternateSolutions = countNearOptimalSolutions(
    combo, quantities, result.score, params, maxTotalStock,
  );

  let status: OptimizationStatus = 'optimal';
  if (alternateSolutions > 0) {
    status = 'multiple';
  }

  return {
    quantities,
    totalStock: result.totalStock,
    status,
    alternateSolutions: alternateSolutions > 0 ? alternateSolutions : undefined,
  };
}

function countNearOptimalSolutions(
  combo: Product[],
  baseQuantities: number[],
  baseScore: number,
  params: ObjectiveParams,
  maxTotalStock: number,
): number {
  const k = combo.length;
  if (k < 2) return 0;

  const threshold = Math.abs(baseScore) * 0.001;
  let count = 0;

  for (let i = 0; i < k; i++) {
    for (let j = 0; j < k; j++) {
      if (i === j) continue;
      if (baseQuantities[i] <= 1) continue;
      if (baseQuantities[j] >= combo[j].stockLimit) continue;

      const testQ = [...baseQuantities];
      testQ[i]--;
      testQ[j]++;

      const totalStock = testQ.reduce((s, q) => s + q, 0);
      if (totalStock > maxTotalStock) continue;

      const gp = testQ.reduce((s, q, idx) => s + (combo[idx].price - combo[idx].cost) * q, 0);
      const tr = testQ.reduce((s, q, idx) => s + combo[idx].price * q, 0);
      const score = computeScore(gp, tr, totalStock, params);

      if (Math.abs(score - baseScore) <= threshold) {
        count++;
      }
    }
  }

  return count;
}
