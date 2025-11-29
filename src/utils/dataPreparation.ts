/**
 * Data Preparation Utilities for LSTM/MLP Time Series Forecasting
 */

/**
 * Clean and validate data, converting to numerical format
 * Missing values are converted to zero
 */
export function cleanData(data) {
  return data.map(row => ({
    year: parseInt(row.year) || 0,
    population: parseFloat(row.population) || 0,
    emigrants: parseFloat(row.emigrants) || 0,
    male: parseFloat(row.male) || 0,
    female: parseFloat(row.female) || 0
  }));
}

/**
 * Sort data chronologically by year
 */
export function sortData(data) {
  return [...data].sort((a, b) => a.year - b.year);
}

/**
 * Min-Max Normalization: scales values to [0, 1] range
 * normalized = (value - min) / (max - min)
 */
export function normalizeData(data, features = ['population', 'emigrants']) {
  const mins = {};
  const maxs = {};

  // Calculate min and max for each feature
  features.forEach(feature => {
    const values = data.map(row => row[feature]);
    mins[feature] = Math.min(...values);
    maxs[feature] = Math.max(...values);
  });

  // Normalize data
  const normalized = data.map(row => {
    const normalizedRow = { ...row };
    features.forEach(feature => {
      const range = maxs[feature] - mins[feature];
      normalizedRow[feature] = range === 0 ? 0 : (row[feature] - mins[feature]) / range;
    });
    return normalizedRow;
  });

  return { normalized, mins, maxs };
}

/**
 * Denormalize values back to original scale
 * denormalized = normalized * (max - min) + min
 * Supports both single value and array of values
 */
export function denormalize(normalizedValue, min, max) {
  if (Array.isArray(normalizedValue)) {
    // Handle array of values (multiple targets)
    if (Array.isArray(min) && Array.isArray(max)) {
      return normalizedValue.map((val, idx) => {
        const range = max[idx] - min[idx];
        return range === 0 ? 0 : val * range + min[idx];
      });
    }
    // If min/max are single values, apply to all
    const range = max - min;
    return normalizedValue.map(val => range === 0 ? 0 : val * range + min);
  }
  // Single value
  return normalizedValue * (max - min) + min;
}

/**
 * Create sequences using sliding window approach
 * @param {Array} data - Normalized data
 * @param {number} lookback - Window size (default: 3)
 * @param {Array} features - Features to use as input ['male', 'female'] or ['population', 'emigrants']
 * @param {Array|string} target - Target feature(s) to predict ('emigrants' or ['male', 'female'])
 * @returns {Object} - { X: input sequences, y: target values }
 */
export function createSequences(data, lookback = 3, features = ['male', 'female'], target = ['male', 'female']) {
  const X = [];
  const y = [];

  // Handle both single target (string) and multiple targets (array)
  const targetArray = Array.isArray(target) ? target : [target];

  for (let i = lookback; i < data.length; i++) {
    // Get lookback window of features
    const sequence = [];
    for (let j = i - lookback; j < i; j++) {
      const featureValues = features.map(f => data[j][f]);
      sequence.push(featureValues);
    }
    X.push(sequence);

    // Target is the next value(s) of the target feature(s)
    if (targetArray.length === 1) {
      // Single target (backward compatibility)
      y.push(data[i][targetArray[0]]);
    } else {
      // Multiple targets (e.g., [male, female])
      y.push(targetArray.map(t => data[i][t]));
    }
  }

  return { X, y };
}

/**
 * Calculate performance metrics
 */
export function calculateMetrics(actual, predicted) {
  const n = actual.length;

  // Mean Absolute Error (MAE)
  const mae = actual.reduce((sum, val, i) => sum + Math.abs(val - predicted[i]), 0) / n;

  // Root Mean Squared Error (RMSE)
  const mse = actual.reduce((sum, val, i) => sum + Math.pow(val - predicted[i], 2), 0) / n;
  const rmse = Math.sqrt(mse);

  // Mean Absolute Percentage Error (MAPE)
  const mape = actual.reduce((sum, val, i) => {
    return sum + (val !== 0 ? Math.abs((val - predicted[i]) / val) : 0);
  }, 0) / n * 100;

  // R-squared (R²)
  const mean = actual.reduce((sum, val) => sum + val, 0) / n;
  const ssRes = actual.reduce((sum, val, i) => sum + Math.pow(val - predicted[i], 2), 0);
  const ssTot = actual.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0);
  const r2 = 1 - (ssRes / ssTot);

  // Accuracy (100 - MAPE)
  const accuracy = 100 - mape;

  return {
    mae: mae.toFixed(2),
    rmse: rmse.toFixed(2),
    mape: mape.toFixed(2),
    r2: r2.toFixed(4),
    accuracy: accuracy.toFixed(2)
  };
}