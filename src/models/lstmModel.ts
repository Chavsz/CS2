import * as tf from '@tensorflow/tfjs';

/**
 * Build LSTM Model for Time Series Forecasting
 * Architecture:
 * - Input: [lookback, features] e.g., [3, 2] for 3 years × 2 features
 * - LSTM Layer 1: 60 units with dropout 0.3
 * - LSTM Layer 2: 60 units with dropout 0.3
 * - Dense Output: outputUnits (1 for single target, 2 for male/female)
 * - Loss: MSE (Mean Squared Error)
 * - Optimizer: Adam (lr=0.001)
 * - Metrics: MAE (Mean Absolute Error)
 */
export function buildLSTMModel(
  lookback = 2,
  features = 2,
  outputUnits = 2
): tf.Sequential {
  const model = tf.sequential();

  // First LSTM layer
  model.add(tf.layers.lstm({
    units: 60,
    returnSequences: true,
    inputShape: [lookback, features],
    dropout: 0.3
  }));

  // Second LSTM layer
  model.add(tf.layers.lstm({
    units: 60,
    dropout: 0.3
  }));

  // Output layer - supports multiple outputs (e.g., male and female)
  model.add(tf.layers.dense({
    units: outputUnits
  }));

  // Compile model
  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'meanSquaredError',
    metrics: ['mae']
  });

  return model;
}

/**
 * Train LSTM Model
 * @param {tf.Sequential} model - The LSTM model
 * @param {Array} X - Input sequences
 * @param {Array} y - Target values (can be 1D array for single target or 2D array for multiple targets)
 * @param {Function} onEpochEnd - Callback for epoch progress
 * @param {number} epochs - Number of training epochs (default: 100)
 * @param {number} validationSplit - Validation split ratio (default: 0.2)
 */
export async function trainLSTMModel(
  model: tf.LayersModel,
  X: number[][][],
  y: number[] | number[][],
  onEpochEnd?: (epoch: number, logs?: tf.Logs) => void,
  epochs = 100,
  validationSplit = 0.2
): Promise<tf.History> {
  // Convert to tensors
  const xs = tf.tensor3d(X);
  
  // Handle both single target (1D array) and multiple targets (2D array)
  let ys: tf.Tensor2D;
  if (Array.isArray(y[0])) {
    // Multiple targets: y is already 2D array
    const rows = y as number[][];
    ys = tf.tensor2d(rows, [rows.length, rows[0]?.length ?? 1]);
  } else {
    // Single target: y is 1D array, convert to 2D
    const targets = y as number[];
    ys = tf.tensor2d(targets, [targets.length, 1]);
  }

  // Determine batch size
  const batchSize = Math.min(32, X.length);

  // Train model
  const history = await model.fit(xs, ys, {
    epochs,
    batchSize,
    validationSplit,
    callbacks: {
      onEpochEnd: async (epoch, logs) => {
        if (onEpochEnd && epoch % 20 === 0) {
          onEpochEnd(epoch, logs);
        }
      }
    }
  });

  // Cleanup tensors
  xs.dispose();
  ys.dispose();

  return history;
}

/**
 * Make predictions using LSTM model
 * Returns array of predictions (each prediction can be single value or array for multiple targets)
 */
export async function predictLSTM(
  model: tf.LayersModel,
  X: number[][][]
): Promise<number[] | number[][]> {
  const xs = tf.tensor3d(X);
  const predictions = model.predict(xs);
  const predictionTensor = Array.isArray(predictions) ? predictions[0] : predictions;
  const result = (await predictionTensor.array()) as number[][] | number[];

  xs.dispose();
  predictionTensor.dispose();

  // If output is 2D (multiple targets), return as-is
  // If output is 1D (single target), return flattened
  if (Array.isArray(result[0])) {
    // Multiple targets: return 2D array
    return result as number[][];
  }

  // Single target: return 1D array (backward compatibility)
  const flatResult = result as number[];
  return flatResult;
}

/**
 * Save LSTM model to IndexedDB
 */
export async function saveLSTMModel(
  model: tf.LayersModel,
  metadata: Record<string, unknown>
) {
  await model.save('indexeddb://emigrants-lstm-model');
  localStorage.setItem('lstm-metadata', JSON.stringify(metadata));
}

/**
 * Load LSTM model from IndexedDB
 */
export async function loadLSTMModel(): Promise<{
  model: tf.LayersModel;
  metadata: Record<string, unknown> | null;
} | null> {
  try {
    const model = await tf.loadLayersModel('indexeddb://emigrants-lstm-model');
    const metadata = JSON.parse(localStorage.getItem('lstm-metadata') ?? 'null');
    return { model, metadata };
  } catch (error) {
    console.error('Error loading LSTM model:', error);
    return null;
  }
}

/**
 * Delete LSTM model from IndexedDB
 */
export async function deleteLSTMModel() {
  try {
    await tf.io.removeModel('indexeddb://emigrants-lstm-model');
    localStorage.removeItem('lstm-metadata');
    return true;
  } catch (error) {
    console.error('Error deleting LSTM model:', error);
    return false;
  }
}

/**
 * Download LSTM model files
 */
export async function downloadLSTMModel(
  model: tf.LayersModel,
  metadata: Record<string, unknown>
) {
  // Save model to downloads
  await model.save('downloads://emigrants-lstm-model');

  // Download metadata
  const metadataBlob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(metadataBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'lstm-metadata.json';
  a.click();
  URL.revokeObjectURL(url);
}