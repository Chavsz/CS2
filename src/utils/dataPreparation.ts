/**
 * Data Preparation Utilities for LSTM/MLP Time Series Forecasting
 */

/**
 * Clean and validate data, converting to numerical format
 * Missing values are converted to zero
 */
export function cleanData(data: any[]): any[] {
  return data.map((row: any) => ({
    year: parseInt(row.year) || 0,
    population: parseFloat(row.population) || 0,
    emigrants: parseFloat(row.emigrants) || 0,
    male: parseFloat(row.male) || 0,
    female: parseFloat(row.female) || 0,
    single: parseFloat(row.single) || 0,
    married: parseFloat(row.married) || 0,
    widower: parseFloat(row.widower) || 0,
    separated: parseFloat(row.separated) || 0,
    divorced: parseFloat(row.divorced) || 0,
    Usa: parseFloat(row.Usa) || 0,
    Canada: parseFloat(row.Canada) || 0,
    Japan: parseFloat(row.Japan) || 0,
    Australia: parseFloat(row.Australia) || 0,
    Italy: parseFloat(row.Italy) || 0,
    NewZealand: parseFloat(row.NewZealand) || 0,
    UnitedKingdom: parseFloat(row.UnitedKingdom) || 0,
    Germany: parseFloat(row.Germany) || 0,
    SouthKorea: parseFloat(row.SouthKorea) || 0,
    Spain: parseFloat(row.Spain) || 0,
    Others: parseFloat(row.Others) || 0,
    regionI: parseFloat(row.regionI) || 0,
    regionII: parseFloat(row.regionII) || 0,
    regionIII: parseFloat(row.regionIII) || 0,
    regionIVA: parseFloat(row.regionIVA) || 0,
    regionIVB: parseFloat(row.regionIVB) || 0,
    regionV: parseFloat(row.regionV) || 0,
    regionVI: parseFloat(row.regionVI) || 0,
    regionVII: parseFloat(row.regionVII) || 0,
    regionVIII: parseFloat(row.regionVIII) || 0,
    regionIX: parseFloat(row.regionIX) || 0,
    regionX: parseFloat(row.regionX) || 0,
    regionXI: parseFloat(row.regionXI) || 0,
    regionXII: parseFloat(row.regionXII) || 0,
    regionXIII: parseFloat(row.regionXIII) || 0,
    armm: parseFloat(row.armm) || 0,
    car: parseFloat(row.car) || 0,
    ncr: parseFloat(row.ncr) || 0,
    age14Below: parseFloat(row.age14Below) || 0,
    age15to19: parseFloat(row.age15to19) || 0,
    age20to24: parseFloat(row.age20to24) || 0,
    age25to29: parseFloat(row.age25to29) || 0,
    age30to34: parseFloat(row.age30to34) || 0,
    age35to39: parseFloat(row.age35to39) || 0,
    age40to44: parseFloat(row.age40to44) || 0,
    age45to49: parseFloat(row.age45to49) || 0,
    age50to54: parseFloat(row.age50to54) || 0,
    age55to59: parseFloat(row.age55to59) || 0,
    age60to64: parseFloat(row.age60to64) || 0,
    age65to69: parseFloat(row.age65to69) || 0,
    age70Above: parseFloat(row.age70Above) || 0,
    notOfSchoolingAge: parseFloat(row.notOfSchoolingAge) || 0,
    noFormalEducation: parseFloat(row.noFormalEducation) || 0,
    elementaryLevel: parseFloat(row.elementaryLevel) || 0,
    elementaryGraduate: parseFloat(row.elementaryGraduate) || 0,
    highSchoolLevel: parseFloat(row.highSchoolLevel) || 0,
    highSchoolGraduate: parseFloat(row.highSchoolGraduate) || 0,
    vocationalLevel: parseFloat(row.vocationalLevel) || 0,
    vocationalGraduate: parseFloat(row.vocationalGraduate) || 0,
    collegeLevel: parseFloat(row.collegeLevel) || 0,
    collegeGraduate: parseFloat(row.collegeGraduate) || 0,
    postGraduateLevel: parseFloat(row.postGraduateLevel) || 0,
    postGraduate: parseFloat(row.postGraduate) || 0,
    nonFormalEducation: parseFloat(row.nonFormalEducation) || 0,
    professionalTechnical: parseFloat(row.professionalTechnical) || 0,
    managerialExecutive: parseFloat(row.managerialExecutive) || 0,
    clericalWorkers: parseFloat(row.clericalWorkers) || 0,
    salesWorkers: parseFloat(row.salesWorkers) || 0,
    serviceWorkers: parseFloat(row.serviceWorkers) || 0,
    agriculturalWorkers: parseFloat(row.agriculturalWorkers) || 0,
    productionTransportLaborers: parseFloat(row.productionTransportLaborers) || 0,
    armedForces: parseFloat(row.armedForces) || 0,
    housewives: parseFloat(row.housewives) || 0,
    retirees: parseFloat(row.retirees) || 0,
    students: parseFloat(row.students) || 0,
    minors: parseFloat(row.minors) || 0,
    outOfSchoolYouth: parseFloat(row.outOfSchoolYouth) || 0,
    refugees: parseFloat(row.refugees) || 0
  }));
}

/**
 * Sort data chronologically by year
 */
export function sortData(data: any[]): any[] {
  return [...data].sort((a, b) => a.year - b.year);
}

/**
 * Min-Max Normalization: scales values to [0, 1] range
 * normalized = (value - min) / (max - min)
 * By default, all numeric columns except `year` are normalized so inputs
 * and targets stay on the same scale.
 */
export function normalizeData(data: any[], features?: string[]) {
  // Auto-select all numeric keys (except year) when no feature list is provided.
  const featureList =
    (features && features.length > 0)
      ? features
      : Object.keys(data?.[0] ?? {}).filter(k => k !== 'year');

  const mins: Record<string, number> = {};
  const maxs: Record<string, number> = {};

  // Calculate min and max for each feature
  featureList.forEach(feature => {
    const values = data.map(row => row[feature]);
    mins[feature] = Math.min(...values);
    maxs[feature] = Math.max(...values);
  });

  // Normalize data
  const normalized = data.map((row: any) => {
    const normalizedRow: any = { ...row };
    featureList.forEach((feature: string) => {
      const range = maxs[feature] - mins[feature];
      normalizedRow[feature] = range === 0 ? 0 : (row[feature] - mins[feature]) / range;
    });
    return normalizedRow;
  });

  return { normalized, mins, maxs, features: featureList };
}

/**
 * Denormalize values back to original scale
 * denormalized = normalized * (max - min) + min
 * Supports both single value and array of values
 */
export function denormalize(normalizedValue: any, min: any, max: any) {
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
export function createSequences(
  data: any[],
  lookback: number = 3,
  features: string[] = ['male', 'female'],
  target: string[] | string = ['male', 'female']
) {
  const X: any[] = [];
  const y: any[] = [];

  // Handle both single target (string) and multiple targets (array)
  const targetArray = Array.isArray(target) ? target : [target];

  // Guard against missing features/targets to avoid NaNs in training.
  const missingFeature = features.find(f => data.some(row => row[f] === undefined));
  const missingTarget = targetArray.find(t => data.some(row => row[t] === undefined));
  if (missingFeature || missingTarget) {
    throw new Error(
      `createSequences: missing values for feature '${missingFeature}' or target '${missingTarget}'. ` +
      `Ensure data is normalized with the same feature/target set used here.`
    );
  }

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
export function calculateMetrics(actual: number[], predicted: number[]) {
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
  const accuracy = Math.max(0, 100 - mape);

  return {
    mae: mae.toFixed(2),
    rmse: rmse.toFixed(2),
    mape: mape.toFixed(2),
    r2: r2.toFixed(4),
    accuracy: accuracy.toFixed(2)
  };
}