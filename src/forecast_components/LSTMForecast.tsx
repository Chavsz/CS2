import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { cleanData, sortData, normalizeData, denormalize, createSequences, calculateMetrics } from '../utils/dataPreparation';
import { buildLSTMModel, trainLSTMModel, predictLSTM, saveLSTMModel, loadLSTMModel, deleteLSTMModel, downloadLSTMModel } from '../models/lstmModel';

export default function LSTMForecast({ data }) {
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [model, setModel] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [forecastYears, setForecastYears] = useState(5);
  const [forecasts, setForecasts] = useState([]);
  const [validationResults, setValidationResults] = useState([]);

  const LOOKBACK = 2;
  const FEATURES = ['male', 'female'];
  const TARGETS = ['male', 'female'];

  const handleTrain = async () => {
    setIsTraining(true);
    setTrainingProgress({ epoch: 0, loss: 0, mae: 0 });
    setMetrics(null);

    try {
      let cleanedData = cleanData(data);
      cleanedData = sortData(cleanedData);

      const { normalized, mins, maxs } = normalizeData(cleanedData, FEATURES);
      const { X, y } = createSequences(normalized, LOOKBACK, FEATURES, TARGETS);

      // Build model with 2 output units (male and female)
      const newModel = buildLSTMModel(LOOKBACK, FEATURES.length, TARGETS.length);

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

      const normalizedPredictions = await predictLSTM(newModel, X);

      // Handle multiple targets: predictions is 2D array [[male, female], ...]
      const predictions = normalizedPredictions.map(pred => {
        if (Array.isArray(pred)) {
          return {
            male: denormalize(pred[0], mins.male, maxs.male),
            female: denormalize(pred[1], mins.female, maxs.female)
          };
        }
        // Fallback for single target (shouldn't happen)
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

      // Create validation results table data (20% validation split for testing)
      const trainSize = Math.floor(actualValues.length * 0.8);
      const resultsData = actualValues.slice(trainSize).map((actual, index) => {
        const pred = predictions[trainSize + index];
        return {
          year: cleanedData[trainSize + index + LOOKBACK].year,
          actualMale: Math.round(actual.male),
          predictedMale: Math.round(pred.male),
          errorMale: Math.round(pred.male - actual.male),
          actualFemale: Math.round(actual.female),
          predictedFemale: Math.round(pred.female),
          errorFemale: Math.round(pred.female - actual.female)
        };
      });
      setValidationResults(resultsData);

      // Calculate metrics for both male and female
      const maleActual = actualValues.map(v => v.male);
      const malePred = predictions.map(p => p.male);
      const femaleActual = actualValues.map(v => v.female);
      const femalePred = predictions.map(p => p.female);

      const maleMetrics = calculateMetrics(maleActual, malePred);
      const femaleMetrics = calculateMetrics(femaleActual, femalePred);

      // Average metrics for overall performance
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

      const newMetadata = {
        modelType: 'LSTM',
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

      await saveLSTMModel(newModel, newMetadata);

      setModel(newModel);
      setMetadata(newMetadata);

      alert(`LSTM model trained successfully!\nOverall MAE: ${calculatedMetrics.mae}\nOverall Accuracy: ${calculatedMetrics.accuracy}%`);
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
        alert('LSTM model loaded successfully!');
      } else {
        alert('No saved model found. Please train a model first.');
      }
    } catch (error) {
      console.error('Error loading model:', error);
      alert('Error loading model: ' + error.message);
    }
  };

  const handleDeleteModel = async () => {
    if (!confirm('Are you sure you want to delete the saved LSTM model?')) return;

    try {
      await deleteLSTMModel();
      setModel(null);
      setMetadata(null);
      setMetrics(null);
      setForecasts([]);
      alert('LSTM model deleted successfully!');
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
      alert('LSTM model files downloaded!');
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
        const normalizedPred = await predictLSTM(model, input);
        
        // Denormalize predictions (should be [male, female])
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
      alert(`Generated ${forecastYears} year LSTM forecast for both male and female!`);
    } catch (error) {
      console.error('Forecasting error:', error);
      alert('Error generating forecast: ' + error.message);
    }
  };

  const chartData = [...data, ...forecasts];

  return (
    <div className="bg-white rounded-xl p-8 shadow-md mt-8 border border-gray-300">
      <h2 className="text-gray-800 mb-6 text-2xl">LSTM Forecasting (Long Short-Term Memory)</h2>

      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <button 
          onClick={handleTrain} 
          disabled={isTraining}
          className="px-6 py-3 bg-indigo-600 text-white border-none rounded-md text-base font-medium cursor-pointer transition-colors duration-300 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed md:w-full"
        >
          {isTraining ? 'Training...' : 'Train LSTM Model'}
        </button>
        <button 
          onClick={handleLoadModel} 
          disabled={isTraining}
          className="px-6 py-3 bg-indigo-600 text-white border-none rounded-md text-base font-medium cursor-pointer transition-colors duration-300 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed md:w-full"
        >
          Load Model
        </button>
        <button 
          onClick={handleDeleteModel} 
          disabled={isTraining || !model}
          className="px-6 py-3 bg-indigo-600 text-white border-none rounded-md text-base font-medium cursor-pointer transition-colors duration-300 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed md:w-full"
        >
          Delete Model
        </button>
        <button 
          onClick={handleDownloadModel} 
          disabled={isTraining || !model}
          className="px-6 py-3 bg-indigo-600 text-white border-none rounded-md text-base font-medium cursor-pointer transition-colors duration-300 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed md:w-full"
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
        <>
          <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-6 rounded-md">
            <h3 className="text-green-700 mb-4 text-xl">LSTM Model Performance Metrics (Overall Average)</h3>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-5 mb-6">
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
            {metrics.male && metrics.female && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="bg-blue-50 p-4 rounded-md">
                  <h4 className="text-blue-700 font-semibold mb-3">Male Metrics</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>MAE: <span className="font-bold">{metrics.male.mae}</span></div>
                    <div>RMSE: <span className="font-bold">{metrics.male.rmse}</span></div>
                    <div>MAPE: <span className="font-bold">{metrics.male.mape}%</span></div>
                    <div>R²: <span className="font-bold">{metrics.male.r2}</span></div>
                    <div className="col-span-2">Accuracy: <span className="font-bold">{metrics.male.accuracy}%</span></div>
                  </div>
                </div>
                <div className="bg-pink-50 p-4 rounded-md">
                  <h4 className="text-pink-700 font-semibold mb-3">Female Metrics</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>MAE: <span className="font-bold">{metrics.female.mae}</span></div>
                    <div>RMSE: <span className="font-bold">{metrics.female.rmse}</span></div>
                    <div>MAPE: <span className="font-bold">{metrics.female.mape}%</span></div>
                    <div>R²: <span className="font-bold">{metrics.female.r2}</span></div>
                    <div className="col-span-2">Accuracy: <span className="font-bold">{metrics.female.accuracy}%</span></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {validationResults.length > 0 && (
            <div className="bg-teal-50 border-l-4 border-teal-500 p-6 mb-6 rounded-md">
              <h3 className="text-teal-700 mb-4 text-xl">Testing Results - 20% Split (Actual vs Predicted)</h3>
              <div className="max-h-96 overflow-y-auto rounded-md">
                <table className="w-full border-collapse bg-white rounded-md overflow-hidden">
                  <thead>
                    <tr>
                      <th className="p-3 text-left border-b border-gray-200 bg-teal-500 text-white font-semibold sticky top-0 z-10">Year</th>
                      <th className="p-3 text-left border-b border-gray-200 bg-teal-500 text-white font-semibold sticky top-0 z-10">Actual Male</th>
                      <th className="p-3 text-left border-b border-gray-200 bg-teal-500 text-white font-semibold sticky top-0 z-10">Predicted Male</th>
                      <th className="p-3 text-left border-b border-gray-200 bg-teal-500 text-white font-semibold sticky top-0 z-10">Error Male</th>
                      <th className="p-3 text-left border-b border-gray-200 bg-teal-500 text-white font-semibold sticky top-0 z-10">Actual Female</th>
                      <th className="p-3 text-left border-b border-gray-200 bg-teal-500 text-white font-semibold sticky top-0 z-10">Predicted Female</th>
                      <th className="p-3 text-left border-b border-gray-200 bg-teal-500 text-white font-semibold sticky top-0 z-10">Error Female</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validationResults.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-100 last:border-b-0">
                        <td className="p-3 text-left border-b border-gray-200">{row.year}</td>
                        <td className="p-3 text-left border-b border-gray-200">{row.actualMale.toLocaleString()}</td>
                        <td className="p-3 text-left border-b border-gray-200">{row.predictedMale.toLocaleString()}</td>
                        <td className={`p-3 text-left border-b border-gray-200 font-semibold ${row.errorMale >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {row.errorMale >= 0 ? '+' : ''}{row.errorMale.toLocaleString()}
                        </td>
                        <td className="p-3 text-left border-b border-gray-200">{row.actualFemale.toLocaleString()}</td>
                        <td className="p-3 text-left border-b border-gray-200">{row.predictedFemale.toLocaleString()}</td>
                        <td className={`p-3 text-left border-b border-gray-200 font-semibold ${row.errorFemale >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {row.errorFemale >= 0 ? '+' : ''}{row.errorFemale.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {model && !isTraining && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-6 mb-6 rounded-md">
          <h3 className="text-orange-800 mb-4 text-xl">Generate LSTM Forecast</h3>
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
              className="px-6 py-3 bg-[#ff6b6b] text-white border-none rounded-md text-base font-medium cursor-pointer transition-colors duration-300 hover:bg-[#ee5253]"
            >
              Generate Forecast
            </button>
          </div>
        </div>
      )}

      {forecasts.length > 0 && (
        <>
          <div className="mb-6">
            <h3 className="text-gray-800 mb-4 text-xl">LSTM: Historical + Forecast (Male & Female)</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis
                  label={{ value: 'Emigrants', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="male"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Male (Historical)"
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="female"
                  stroke="#ec4899"
                  strokeWidth={2}
                  name="Female (Historical)"
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey={(entry) => entry.isForecast ? entry.male : null}
                  stroke="#3b82f6"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Male (Forecast)"
                  dot={(props) => {
                    const { cx, cy, payload } = props;
                    if (!payload.isForecast || !payload.male) return null;
                    return <circle cx={cx} cy={cy} r={4} fill="#3b82f6" />;
                  }}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey={(entry) => entry.isForecast ? entry.female : null}
                  stroke="#ec4899"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Female (Forecast)"
                  dot={(props) => {
                    const { cx, cy, payload } = props;
                    if (!payload.isForecast || !payload.female) return null;
                    return <circle cx={cx} cy={cy} r={4} fill="#ec4899" />;
                  }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-pink-50 border-l-4 border-pink-500 p-6 mb-6 rounded-md">
            <h3 className="text-pink-700 mb-4 text-xl">LSTM Forecast Results</h3>
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
        </>
      )}

      <div className="bg-indigo-50 border-l-4 border-indigo-500 p-6 rounded-md">
        <h4 className="text-indigo-800 mb-4 text-lg">LSTM Model Configuration</h4>
        <ul className="list-none p-0 m-0">
          <li className="py-2 text-gray-800 border-b border-indigo-200">Architecture: 2 LSTM layers (60 units each)</li>
          <li className="py-2 text-gray-800 border-b border-indigo-200">Lookback window: {LOOKBACK} years</li>
          <li className="py-2 text-gray-800 border-b border-indigo-200">Input features: Male & Female (historical values)</li>
          <li className="py-2 text-gray-800 border-b border-indigo-200">Targets: Male & Female (next year)</li>
          <li className="py-2 text-gray-800 border-b border-indigo-200">Output units: 2 (male and female)</li>
          <li className="py-2 text-gray-800 border-b border-indigo-200">Dropout: 0.3</li>
          <li className="py-2 text-gray-800 border-b-0">Epochs: 100 | Validation split: 20%</li>
        </ul>
      </div>
    </div>
  );
}
