import { useState } from 'react';
import { cleanData, sortData, normalizeData, denormalize, createSequences, calculateMetrics } from '../utils/dataPreparation';
import { buildLSTMModel, trainLSTMModel, predictLSTM, saveLSTMModel, loadLSTMModel, deleteLSTMModel, downloadLSTMModel } from '../models/lstmModel';

export default function ForecastPanel({ data, onForecastUpdate }) {
  const [modelType, setModelType] = useState('LSTM');
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [model, setModel] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [forecastYears, setForecastYears] = useState(5);
  const [forecasts, setForecasts] = useState(null);

  const LOOKBACK = 2;
  const FEATURES = ['male', 'female'];
  const TARGETS = ['male', 'female'];

  const handleTrain = async () => {
    setIsTraining(true);
    setTrainingProgress({ epoch: 0, loss: 0, mae: 0 });
    setMetrics(null);

    try {
      // 1. Data Preparation
      let cleanedData = cleanData(data);
      cleanedData = sortData(cleanedData);

      // 2. Normalization
      const { normalized, mins, maxs } = normalizeData(cleanedData, FEATURES);

      // 3. Create sequences
      const { X, y } = createSequences(normalized, LOOKBACK, FEATURES, TARGETS);

      // 4. Build model
      const newModel = modelType === 'LSTM'
        ? buildLSTMModel(LOOKBACK, FEATURES.length, TARGETS.length)
        : buildLSTMModel(LOOKBACK, FEATURES.length, TARGETS.length); // Fallback to LSTM if MLP not available

      // 5. Train model
      const onEpochEnd = (epoch, logs) => {
        setTrainingProgress({
          epoch: epoch + 1,
          loss: logs.loss.toFixed(6),
          mae: logs.mae.toFixed(6),
          val_loss: logs.val_loss?.toFixed(6),
          val_mae: logs.val_mae?.toFixed(6)
        });
      };

      await trainLSTMModel(newModel, X, y, onEpochEnd, 100, 0.2);

      // 6. Make predictions on training data
      const normalizedPredictions = await predictLSTM(newModel, X);

      // 7. Denormalize predictions (handle multiple targets)
      const predictions = normalizedPredictions.map(pred => {
        if (Array.isArray(pred)) {
          return {
            male: denormalize(pred[0], mins.male, maxs.male),
            female: denormalize(pred[1], mins.female, maxs.female)
          };
        }
        return { male: 0, female: 0 };
      });

      const actualValues = y.map(val => {
        if (Array.isArray(val)) {
          return {
            male: denormalize(val[0], mins.male, maxs.male),
            female: denormalize(val[1], mins.female, maxs.female)
          };
        }
        return { male: 0, female: 0 };
      });

      // 8. Calculate metrics for both targets
      const maleActual = actualValues.map(v => v.male);
      const malePred = predictions.map(p => p.male);
      const femaleActual = actualValues.map(v => v.female);
      const femalePred = predictions.map(p => p.female);

      const maleMetrics = calculateMetrics(maleActual, malePred);
      const femaleMetrics = calculateMetrics(femaleActual, femalePred);

      const calculatedMetrics = {
        mae: ((parseFloat(maleMetrics.mae) + parseFloat(femaleMetrics.mae)) / 2).toFixed(2),
        rmse: ((parseFloat(maleMetrics.rmse) + parseFloat(femaleMetrics.rmse)) / 2).toFixed(2),
        mape: ((parseFloat(maleMetrics.mape) + parseFloat(femaleMetrics.mape)) / 2).toFixed(2),
        r2: ((parseFloat(maleMetrics.r2) + parseFloat(femaleMetrics.r2)) / 2).toFixed(4),
        accuracy: ((parseFloat(maleMetrics.accuracy) + parseFloat(femaleMetrics.accuracy)) / 2).toFixed(2),
        male: maleMetrics,
        female: femaleMetrics
      };
      setMetrics(calculatedMetrics);

      // 9. Save metadata
      const newMetadata = {
        modelType,
        lookback: LOOKBACK,
        features: FEATURES,
        targets: TARGETS,
        mins,
        maxs,
        lastYear: cleanedData[cleanedData.length - 1].year,
        lastData: cleanedData.slice(-LOOKBACK),
        metrics: calculatedMetrics,
        trainedAt: new Date().toISOString()
      };

      // 10. Save model
      await saveLSTMModel(newModel, newMetadata);

      setModel(newModel);
      setMetadata(newMetadata);

      alert(`${modelType} model trained successfully!\nMAE: ${calculatedMetrics.mae}\nAccuracy: ${calculatedMetrics.accuracy}%`);
    } catch (error) {
      console.error('Training error:', error);
      alert('Error training model: ' + error.message);
    } finally {
      setIsTraining(false);
    }
  };

  const handleLoadModel = async () => {
    try {
      const result = await loadLSTMModel();

      if (result) {
        setModel(result.model);
        setMetadata(result.metadata);
        setMetrics(result.metadata.metrics);
        alert(`${modelType} model loaded successfully!`);
      } else {
        alert('No saved model found. Please train a model first.');
      }
    } catch (error) {
      console.error('Error loading model:', error);
      alert('Error loading model: ' + error.message);
    }
  };

  const handleDeleteModel = async () => {
    if (!confirm('Are you sure you want to delete the saved model?')) return;

    try {
      await deleteLSTMModel();
      setModel(null);
      setMetadata(null);
      setMetrics(null);
      setForecasts(null);
      alert('Model deleted successfully!');
    } catch (error) {
      console.error('Error deleting model:', error);
      alert('Error deleting model: ' + error.message);
    }
  };

  const handleDownloadModel = async () => {
    if (!model || !metadata) {
      alert('No model to download. Please train a model first.');
      return;
    }

    try {
      await downloadLSTMModel(model, metadata);
      alert('Model files downloaded!');
    } catch (error) {
      console.error('Error downloading model:', error);
      alert('Error downloading model: ' + error.message);
    }
  };

  const handleForecast = async () => {
    if (!model || !metadata) {
      alert('Please train or load a model first.');
      return;
    }

    try {
      const { mins, maxs, lastData } = metadata;
      let currentSequence = lastData.map(row => ({
        year: row.year,
        male: row.male || 0,
        female: row.female || 0
      }));

      const predictions = [];
      let currentYear = metadata.lastYear;

      for (let i = 0; i < forecastYears; i++) {
        // Normalize current sequence
        const normalized = currentSequence.map(row => ({
          male: (row.male - mins.male) / (maxs.male - mins.male),
          female: (row.female - mins.female) / (maxs.female - mins.female)
        }));

        // Prepare input
        const input = [normalized.map(row => FEATURES.map(f => row[f]))];

        // Predict
        const normalizedPred = await predictLSTM(model, input);

        // Denormalize (should be [male, female])
        const pred = Array.isArray(normalizedPred[0]) ? normalizedPred[0] : [normalizedPred[0], normalizedPred[0]];
        const predictedMale = denormalize(pred[0], mins.male, maxs.male);
        const predictedFemale = denormalize(pred[1], mins.female, maxs.female);

        currentYear++;
        predictions.push({
          year: currentYear.toString(),
          male: Math.round(predictedMale),
          female: Math.round(predictedFemale),
          emigrants: Math.round(predictedMale + predictedFemale), // Total for backward compatibility
          isForecast: true
        });

        // Update sequence (sliding window)
        currentSequence = [
          ...currentSequence.slice(1),
          {
            year: currentYear,
            male: predictedMale,
            female: predictedFemale
          }
        ];
      }

      setForecasts(predictions);
      onForecastUpdate(predictions);
      alert(`Generated ${forecastYears} year forecast!`);
    } catch (error) {
      console.error('Forecasting error:', error);
      alert('Error generating forecast: ' + error.message);
    }
  };

  return (
    <div className="bg-white rounded-xl p-8 shadow-md mt-8">
      <h2 className="text-gray-800 mb-6 text-3xl">Emigrant Forecasting ({modelType})</h2>

      <div className="flex gap-8 mb-6 p-4 bg-gray-100 rounded-lg md:flex-col md:gap-4">
        <label className="flex items-center gap-2 cursor-pointer text-base text-gray-800">
          <input
            type="radio"
            value="LSTM"
            checked={modelType === 'LSTM'}
            onChange={(e) => setModelType(e.target.value)}
            disabled={isTraining}
            className="cursor-pointer"
          />
          LSTM (Long Short-Term Memory)
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-base text-gray-800">
          <input
            type="radio"
            value="MLP"
            checked={modelType === 'MLP'}
            onChange={(e) => setModelType(e.target.value)}
            disabled={isTraining}
            className="cursor-pointer"
          />
          MLP (Multi-Layer Perceptron)
        </label>
      </div>

      <div className="flex gap-4 flex-wrap mb-6 md:flex-col">
        <button 
          onClick={handleTrain} 
          disabled={isTraining}
          className={`px-6 py-3 text-white border-none rounded-md text-base font-medium cursor-pointer transition-colors duration-300 md:w-full ${
            modelType === 'LSTM' 
              ? 'bg-[#ff6b6b] hover:bg-[#ee5253] disabled:bg-gray-300 disabled:cursor-not-allowed' 
              : modelType === 'MLP'
              ? 'bg-[#9b59b6] hover:bg-[#8e44ad] disabled:bg-gray-300 disabled:cursor-not-allowed'
              : 'bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed'
          }`}
        >
          {isTraining ? 'Training...' : 'Train Model'}
        </button>
        <button 
          onClick={handleLoadModel} 
          disabled={isTraining}
          className={`px-6 py-3 text-white border-none rounded-md text-base font-medium cursor-pointer transition-colors duration-300 md:w-full ${
            modelType === 'LSTM' 
              ? 'bg-[#ff6b6b] hover:bg-[#ee5253] disabled:bg-gray-300 disabled:cursor-not-allowed' 
              : modelType === 'MLP'
              ? 'bg-[#9b59b6] hover:bg-[#8e44ad] disabled:bg-gray-300 disabled:cursor-not-allowed'
              : 'bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed'
          }`}
        >
          Load Model
        </button>
        <button 
          onClick={handleDeleteModel} 
          disabled={isTraining || !model}
          className={`px-6 py-3 text-white border-none rounded-md text-base font-medium cursor-pointer transition-colors duration-300 md:w-full ${
            modelType === 'LSTM' 
              ? 'bg-[#ff6b6b] hover:bg-[#ee5253] disabled:bg-gray-300 disabled:cursor-not-allowed' 
              : modelType === 'MLP'
              ? 'bg-[#9b59b6] hover:bg-[#8e44ad] disabled:bg-gray-300 disabled:cursor-not-allowed'
              : 'bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed'
          }`}
        >
          Delete Model
        </button>
        <button 
          onClick={handleDownloadModel} 
          disabled={isTraining || !model}
          className={`px-6 py-3 text-white border-none rounded-md text-base font-medium cursor-pointer transition-colors duration-300 md:w-full ${
            modelType === 'LSTM' 
              ? 'bg-[#ff6b6b] hover:bg-[#ee5253] disabled:bg-gray-300 disabled:cursor-not-allowed' 
              : modelType === 'MLP'
              ? 'bg-[#9b59b6] hover:bg-[#8e44ad] disabled:bg-gray-300 disabled:cursor-not-allowed'
              : 'bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed'
          }`}
        >
          Download Model
        </button>
      </div>

      {isTraining && trainingProgress && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-6 rounded-md">
          <h3 className="text-blue-700 mb-4 text-xl">Training Progress</h3>
          <p className="my-2 text-gray-800 font-mono">Epoch: {trainingProgress.epoch} / 100</p>
          <p className="my-2 text-gray-800 font-mono">Loss: {trainingProgress.loss}</p>
          <p className="my-2 text-gray-800 font-mono">MAE: {trainingProgress.mae}</p>
          {trainingProgress.val_loss && (
            <>
              <p className="my-2 text-gray-800 font-mono">Val Loss: {trainingProgress.val_loss}</p>
              <p className="my-2 text-gray-800 font-mono">Val MAE: {trainingProgress.val_mae}</p>
            </>
          )}
        </div>
      )}

      {metrics && !isTraining && (
        <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-6 rounded-md">
          <h3 className="text-green-700 mb-4 text-xl">Model Performance Metrics</h3>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4 md:grid-cols-1">
            <div className="flex flex-col p-4 bg-white rounded-md shadow-sm">
              <span className="text-sm text-gray-600 mb-2">MAE:</span>
              <span className="text-2xl font-bold text-gray-800">{metrics.mae}</span>
            </div>
            <div className="flex flex-col p-4 bg-white rounded-md shadow-sm">
              <span className="text-sm text-gray-600 mb-2">RMSE:</span>
              <span className="text-2xl font-bold text-gray-800">{metrics.rmse}</span>
            </div>
            <div className="flex flex-col p-4 bg-white rounded-md shadow-sm">
              <span className="text-sm text-gray-600 mb-2">MAPE:</span>
              <span className="text-2xl font-bold text-gray-800">{metrics.mape}%</span>
            </div>
            <div className="flex flex-col p-4 bg-white rounded-md shadow-sm">
              <span className="text-sm text-gray-600 mb-2">R²:</span>
              <span className="text-2xl font-bold text-gray-800">{metrics.r2}</span>
            </div>
            <div className="flex flex-col p-4 bg-white rounded-md shadow-sm">
              <span className="text-sm text-gray-600 mb-2">Accuracy:</span>
              <span className="text-2xl font-bold text-gray-800">{metrics.accuracy}%</span>
            </div>
          </div>
        </div>
      )}

      {model && !isTraining && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-6 mb-6 rounded-md">
          <h3 className="text-orange-800 mb-4 text-xl">Generate Forecast</h3>
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-2 text-gray-800">
              Years to forecast:
              <input
                type="number"
                min="1"
                max="10"
                value={forecastYears}
                onChange={(e) => setForecastYears(parseInt(e.target.value))}
                className="p-2 border border-gray-300 rounded w-20 text-base"
              />
            </label>
            <button 
              onClick={handleForecast}
              className={`px-6 py-3 text-white border-none rounded-md text-base font-medium cursor-pointer transition-colors duration-300 ${
                modelType === 'LSTM' 
                  ? 'bg-[#ff6b6b] hover:bg-[#ee5253]' 
                  : modelType === 'MLP'
                  ? 'bg-[#9b59b6] hover:bg-[#8e44ad]'
                  : 'bg-indigo-500 hover:bg-indigo-600'
              }`}
            >
              Generate Forecast
            </button>
          </div>
        </div>
      )}

      {forecasts && (
        <div className="bg-pink-50 border-l-4 border-pink-500 p-6 mb-6 rounded-md">
          <h3 className="text-pink-700 mb-4 text-xl">Forecast Results</h3>
          <table className="w-full border-collapse bg-white rounded-md overflow-hidden">
            <thead>
              <tr>
                <th className="p-3 text-left border-b border-gray-200 bg-pink-500 text-white font-semibold">Year</th>
                <th className="p-3 text-left border-b border-gray-200 bg-pink-500 text-white font-semibold">Predicted Male</th>
                <th className="p-3 text-left border-b border-gray-200 bg-pink-500 text-white font-semibold">Predicted Female</th>
                <th className="p-3 text-left border-b border-gray-200 bg-pink-500 text-white font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {forecasts.map((f, i) => (
                <tr key={i} className="hover:bg-gray-100 last:border-b-0">
                  <td className="p-3 text-left border-b border-gray-200">{f.year}</td>
                  <td className="p-3 text-left border-b border-gray-200">{f.male.toLocaleString()}</td>
                  <td className="p-3 text-left border-b border-gray-200">{f.female.toLocaleString()}</td>
                  <td className="p-3 text-left border-b border-gray-200 font-semibold">{(f.male + f.female).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="bg-indigo-50 border-l-4 border-indigo-500 p-6 rounded-md">
        <h4 className="text-indigo-800 mb-4 text-lg">Model Configuration</h4>
        <ul className="list-none p-0 m-0">
          <li className="py-2 text-gray-800 border-b border-indigo-200">Lookback window: {LOOKBACK} years</li>
          <li className="py-2 text-gray-800 border-b border-indigo-200">Input features: Male & Female</li>
          <li className="py-2 text-gray-800 border-b border-indigo-200">Targets: Male & Female (next year)</li>
          <li className="py-2 text-gray-800 border-b border-indigo-200">Output units: 2 (male and female)</li>
          <li className="py-2 text-gray-800 border-b border-indigo-200">Normalization: Min-Max [0, 1]</li>
          <li className="py-2 text-gray-800 border-b border-indigo-200">Epochs: 100</li>
          <li className="py-2 text-gray-800 border-b-0">Validation split: 20%</li>
        </ul>
      </div>
    </div>
  );
}
