import type { WorkerMessage, WorkerResponse } from '../types';
import { calculateCombinations } from '../utils/calculator';
import { computeSensitivity, computeMultiSensitivity } from '../utils/sensitivity';

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const msg = e.data;

  if (msg.type === 'calculate') {
    const output = calculateCombinations(msg.products, msg.constraints);
    const response: WorkerResponse = { type: 'calcResult', output };
    self.postMessage(response);
  }

  if (msg.type === 'sensitivity') {
    const allProducts = msg.products;
    const constraints = msg.constraints;
    const comboId = msg.comboId;
    const paramName = msg.paramName as 'cost' | 'turnoverWeight';
    const productId = msg.productId;

    const calcOutput = calculateCombinations(allProducts, constraints);
    const targetCombo = calcOutput.allResults.find(r => r.id === comboId);
    if (!targetCombo) {
      const response: WorkerResponse = {
        type: 'sensitivityResult',
        data: {
          paramName,
          paramLabel: paramName === 'cost' ? '进货成本' : '周转权重',
          productId,
          productName: '',
          baseValue: 0,
          minValue: 0,
          maxValue: 0,
          points: [],
          sensitivityCoefficient: 0,
        },
      };
      self.postMessage(response);
      return;
    }

    const data = computeSensitivity(allProducts, constraints, targetCombo, paramName, productId);
    const response: WorkerResponse = { type: 'sensitivityResult', data };
    self.postMessage(response);
  }

  if (msg.type === 'multiSensitivity') {
    const allProducts = msg.products;
    const constraints = msg.constraints;
    const comboId = msg.comboId;

    const calcOutput = calculateCombinations(allProducts, constraints);
    const targetCombo = calcOutput.allResults.find(r => r.id === comboId);
    if (!targetCombo) {
      const response: WorkerResponse = {
        type: 'multiSensitivityResult',
        data: {
          comboId,
          comboRank: 0,
          comboScore: 0,
          results: [],
          mostSensitive: null,
        },
      };
      self.postMessage(response);
      return;
    }

    const data = computeMultiSensitivity(allProducts, constraints, targetCombo);
    const response: WorkerResponse = { type: 'multiSensitivityResult', data };
    self.postMessage(response);
  }
};
