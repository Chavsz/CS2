import { useState } from 'react';
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { cleanData, sortData, normalizeData, denormalize, createSequences, calculateMetrics } from '../utils/dataPreparation';
import { buildLSTMModel, trainLSTMModel, predictLSTM, saveLSTMModel, loadLSTMModel, deleteLSTMModel, downloadLSTMModel } from '../models/lstmModel';

interface LSTMForecastProps {
  data: any[];
}

export default function LSTMForecast({ data }: LSTMForecastProps) {
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [model, setModel] = useState<any>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [forecastYears, setForecastYears] = useState(5);
  const [forecasts, setForecasts] = useState<any[]>([]);
  const [validationResults, setValidationResults] = useState<any[]>([]);

  const LOOKBACK = 2;

  // Detect data type: check if data has age, education, place of origin, major countries, civil status, occupation, or sex fields
  const detectDataType = () => {
    if (data.length === 0) return { type: 'sex', features: ['male', 'female'], targets: ['male', 'female'] };
    
    const firstRow = data[0];
    // Check for age group fields
    if (firstRow.age14Below !== undefined || firstRow.age15to19 !== undefined || firstRow.age20to24 !== undefined) {
      return {
        type: 'age',
        features: [
          'age14Below', 'age15to19', 'age20to24', 'age25to29', 'age30to34',
          'age35to39', 'age40to44', 'age45to49', 'age50to54', 'age55to59',
          'age60to64', 'age65to69', 'age70Above'
        ],
        targets: [
          'age14Below', 'age15to19', 'age20to24', 'age25to29', 'age30to34',
          'age35to39', 'age40to44', 'age45to49', 'age50to54', 'age55to59',
          'age60to64', 'age65to69', 'age70Above'
        ]
      };
    }
    // Check for education fields
    if (firstRow.notOfSchoolingAge !== undefined || firstRow.noFormalEducation !== undefined) {
      return {
        type: 'education',
        features: [
          'notOfSchoolingAge', 'noFormalEducation', 'elementaryLevel', 'elementaryGraduate',
          'highSchoolLevel', 'highSchoolGraduate', 'vocationalLevel', 'vocationalGraduate',
          'collegeLevel', 'collegeGraduate', 'postGraduateLevel', 'postGraduate',
          'nonFormalEducation'
        ],
        targets: [
          'notOfSchoolingAge', 'noFormalEducation', 'elementaryLevel', 'elementaryGraduate',
          'highSchoolLevel', 'highSchoolGraduate', 'vocationalLevel', 'vocationalGraduate',
          'collegeLevel', 'collegeGraduate', 'postGraduateLevel', 'postGraduate',
          'nonFormalEducation'
        ]
      };
    }
    // Check for place of origin fields
    if (firstRow.regionI !== undefined || firstRow.regionII !== undefined || firstRow.regionIII !== undefined) {
      return {
        type: 'placeOfOrigin',
        features: ['regionI', 'regionII', 'regionIII', 'regionIVA', 'regionIVB', 'regionV', 'regionVI', 'regionVII', 'regionVIII', 'regionIX', 'regionX', 'regionXI', 'regionXII', 'regionXIII', 'armm', 'car', 'ncr'],
        targets: ['regionI', 'regionII', 'regionIII', 'regionIVA', 'regionIVB', 'regionV', 'regionVI', 'regionVII', 'regionVIII', 'regionIX', 'regionX', 'regionXI', 'regionXII', 'regionXIII', 'armm', 'car', 'ncr']
      };
    }
    // Check for major countries fields
    if (firstRow.Usa !== undefined || firstRow.Canada !== undefined || firstRow.Japan !== undefined) {
      return {
        type: 'majorCountries',
        features: ['Usa', 'Canada', 'Japan', 'Australia', 'Italy', 'NewZealand', 'UnitedKingdom', 'Germany', 'SouthKorea', 'Spain', 'Others'],
        targets: ['Usa', 'Canada', 'Japan', 'Australia', 'Italy', 'NewZealand', 'UnitedKingdom', 'Germany', 'SouthKorea', 'Spain', 'Others']
      };
    }
    // Check for civil status fields (excluding notReported)
    if (firstRow.single !== undefined || firstRow.married !== undefined) {
      return {
        type: 'civilStatus',
        features: ['single', 'married', 'widower', 'separated', 'divorced'],
        targets: ['single', 'married', 'widower', 'separated', 'divorced']
      };
    }
    // Check for occupation fields (excluding noOccupationReported)
    if (firstRow.professionalTechnical !== undefined || firstRow.managerialExecutive !== undefined) {
      return {
        type: 'occupation',
        features: [
          'professionalTechnical', 'managerialExecutive', 'clericalWorkers', 'salesWorkers',
          'serviceWorkers', 'agriculturalWorkers', 'productionTransportLaborers', 'armedForces',
          'housewives', 'retirees', 'students', 'minors', 'outOfSchoolYouth', 'refugees'
        ],
        targets: [
          'professionalTechnical', 'managerialExecutive', 'clericalWorkers', 'salesWorkers',
          'serviceWorkers', 'agriculturalWorkers', 'productionTransportLaborers', 'armedForces',
          'housewives', 'retirees', 'students', 'minors', 'outOfSchoolYouth', 'refugees'
        ]
      };
    }
    // Default to sex
    return {
      type: 'sex',
      features: ['male', 'female'],
      targets: ['male', 'female']
    };
  };

  const dataConfig = detectDataType();
  const FEATURES = dataConfig.features;
  const TARGETS = dataConfig.targets;

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

      const onEpochEnd = (epoch: number, logs: any) => {
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

      // Handle multiple targets: predictions is 2D array
      const predictions = normalizedPredictions.map((pred: any) => {
        if (Array.isArray(pred)) {
          const result: any = {};
          TARGETS.forEach((target, idx) => {
            result[target] = denormalize(pred[idx], (mins as any)[target], (maxs as any)[target]);
          });
          return result;
        }
        // Fallback for single target (shouldn't happen)
        const result: any = {};
        TARGETS.forEach(target => { result[target] = 0; });
        return result;
      });

      const actualValues = y.map((val: any) => {
        if (Array.isArray(val)) {
          const result: any = {};
          TARGETS.forEach((target, idx) => {
            result[target] = denormalize(val[idx], (mins as any)[target], (maxs as any)[target]);
          });
          return result;
        }
        const result: any = {};
        TARGETS.forEach(target => { result[target] = 0; });
        return result;
      });

      // Create validation results table data (20% validation split for testing)
      const trainSize = Math.floor(actualValues.length * 0.8);
      const resultsData = actualValues.slice(trainSize).map((actual: any, index: number) => {
        const pred = predictions[trainSize + index];
        const result: any = { year: cleanedData[trainSize + index + LOOKBACK].year };
        TARGETS.forEach(target => {
          result[`actual${target.charAt(0).toUpperCase() + target.slice(1)}`] = Math.round(actual[target]);
          result[`predicted${target.charAt(0).toUpperCase() + target.slice(1)}`] = Math.round(pred[target]);
          result[`error${target.charAt(0).toUpperCase() + target.slice(1)}`] = Math.round(pred[target] - actual[target]);
        });
        return result;
      });
      setValidationResults(resultsData);

      // Calculate metrics for each target
      const targetMetrics: any = {};
      TARGETS.forEach(target => {
        const actual = actualValues.map((v: any) => v[target]);
        const pred = predictions.map((p: any) => p[target]);
        targetMetrics[target] = calculateMetrics(actual, pred);
      });

      // Average metrics for overall performance
      const avgMetrics = {
        mae: (TARGETS.reduce((sum, t) => sum + parseFloat(targetMetrics[t].mae), 0) / TARGETS.length).toFixed(2),
        rmse: (TARGETS.reduce((sum, t) => sum + parseFloat(targetMetrics[t].rmse), 0) / TARGETS.length).toFixed(2),
        mape: (TARGETS.reduce((sum, t) => sum + parseFloat(targetMetrics[t].mape), 0) / TARGETS.length).toFixed(2),
        r2: (TARGETS.reduce((sum, t) => sum + parseFloat(targetMetrics[t].r2), 0) / TARGETS.length).toFixed(4),
        accuracy: (TARGETS.reduce((sum, t) => sum + parseFloat(targetMetrics[t].accuracy), 0) / TARGETS.length).toFixed(2)
      };

      const calculatedMetrics = {
        ...avgMetrics,
        ...targetMetrics
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
    } catch (error: any) {
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
    } catch (error: any) {
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
    } catch (error: any) {
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
    } catch (error: any) {
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
      const { mins, maxs, lastData, targets } = metadata;
      const targetFields = targets || TARGETS;
      
      let currentSequence = lastData.map((row: any) => {
        const result: any = { year: row.year };
        targetFields.forEach((field: string) => {
          result[field] = row[field] || 0;
        });
        return result;
      });

      const predictions: any[] = [];
      let currentYear = metadata.lastYear;

      for (let i = 0; i < forecastYears; i++) {
        // Normalize current sequence
        const normalized = currentSequence.map((row: any) => {
          const result: any = {};
          targetFields.forEach((field: string) => {
            const range = maxs[field] - mins[field];
            result[field] = range === 0 ? 0 : (row[field] - mins[field]) / range;
          });
          return result;
        });

        // Prepare input
        const input = [normalized.map((row: any) => FEATURES.map(f => row[f]))];
        const normalizedPred = await predictLSTM(model, input);
        
        // Denormalize predictions
        const pred = Array.isArray(normalizedPred[0]) ? normalizedPred[0] : normalizedPred;
        const forecastResult: any = {
          year: (currentYear + 1).toString(),
          isForecast: true
        };
        
        let total = 0;
        targetFields.forEach((field: string, idx: number) => {
          const predicted = denormalize(pred[idx], mins[field], maxs[field]);
          forecastResult[field] = Math.round(predicted);
          total += predicted;
        });
        forecastResult.emigrants = Math.round(total); // Total for backward compatibility

        currentYear++;
        predictions.push(forecastResult);

        // Update sequence (sliding window)
        const nextRow: any = { year: currentYear };
        targetFields.forEach((field: string, idx: number) => {
          nextRow[field] = denormalize(pred[idx], mins[field], maxs[field]);
        });
        currentSequence = [
          ...currentSequence.slice(1),
          nextRow
        ];
      }

      setForecasts(predictions);
      alert(`Generated ${forecastYears} year LSTM forecast for ${targetFields.length} target(s)!`);
    } catch (error: any) {
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
            {TARGETS.length > 0 && TARGETS.some(t => metrics[t]) && (
              <div className={`grid gap-4 ${TARGETS.length <= 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 md:grid-cols-3'}`}>
                {TARGETS.map((target, idx) => {
                  const targetMetrics = metrics[target];
                  if (!targetMetrics) return null;
                  const colors = [
                    { bg: 'bg-blue-50', text: 'text-blue-700' },
                    { bg: 'bg-pink-50', text: 'text-pink-700' },
                    { bg: 'bg-green-50', text: 'text-green-700' },
                    { bg: 'bg-yellow-50', text: 'text-yellow-700' },
                    { bg: 'bg-purple-50', text: 'text-purple-700' }
                  ];
                  const color = colors[idx % colors.length];
                  return (
                    <div key={target} className={`${color.bg} p-4 rounded-md`}>
                      <h4 className={`${color.text} font-semibold mb-3 capitalize`}>{target} Metrics</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>MAE: <span className="font-bold">{targetMetrics.mae}</span></div>
                        <div>RMSE: <span className="font-bold">{targetMetrics.rmse}</span></div>
                        <div>MAPE: <span className="font-bold">{targetMetrics.mape}%</span></div>
                        <div>R²: <span className="font-bold">{targetMetrics.r2}</span></div>
                        <div className="col-span-2">Accuracy: <span className="font-bold">{targetMetrics.accuracy}%</span></div>
                      </div>
                    </div>
                  );
                })}
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
                      {TARGETS.map(target => (
                        <React.Fragment key={target}>
                          <th className="p-3 text-left border-b border-gray-200 bg-teal-500 text-white font-semibold sticky top-0 z-10 capitalize">
                            Actual {target}
                          </th>
                          <th className="p-3 text-left border-b border-gray-200 bg-teal-500 text-white font-semibold sticky top-0 z-10 capitalize">
                            Predicted {target}
                          </th>
                          <th className="p-3 text-left border-b border-gray-200 bg-teal-500 text-white font-semibold sticky top-0 z-10 capitalize">
                            Error {target}
                          </th>
                        </React.Fragment>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {validationResults.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-100 last:border-b-0">
                        <td className="p-3 text-left border-b border-gray-200">{row.year}</td>
                        {TARGETS.map(target => {
                          const actualKey = `actual${target.charAt(0).toUpperCase() + target.slice(1)}`;
                          const predKey = `predicted${target.charAt(0).toUpperCase() + target.slice(1)}`;
                          const errorKey = `error${target.charAt(0).toUpperCase() + target.slice(1)}`;
                          return (
                            <React.Fragment key={target}>
                              <td className="p-3 text-left border-b border-gray-200">{row[actualKey]?.toLocaleString() || 0}</td>
                              <td className="p-3 text-left border-b border-gray-200">{row[predKey]?.toLocaleString() || 0}</td>
                              <td className={`p-3 text-left border-b border-gray-200 font-semibold ${row[errorKey] >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {row[errorKey] >= 0 ? '+' : ''}{row[errorKey]?.toLocaleString() || 0}
                              </td>
                            </React.Fragment>
                          );
                        })}
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
            <h3 className="text-gray-800 mb-4 text-xl">LSTM: Historical + Forecast</h3>
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
                {TARGETS.map((target, idx) => {
                  const colors = ['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'];
                  const color = colors[idx % colors.length];
                  return (
                    <React.Fragment key={target}>
                      <Line
                        type="monotone"
                        dataKey={target}
                        stroke={color}
                        strokeWidth={2}
                        name={`${target.charAt(0).toUpperCase() + target.slice(1)} (Historical)`}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey={(entry) => entry.isForecast ? entry[target] : null}
                        stroke={color}
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name={`${target.charAt(0).toUpperCase() + target.slice(1)} (Forecast)`}
                        dot={(props: any) => {
                          const { cx, cy, payload } = props;
                          if (!payload.isForecast || !payload[target]) return <></>;
                          return <circle cx={cx} cy={cy} r={4} fill={color} />;
                        }}
                        connectNulls={false}
                      />
                    </React.Fragment>
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-pink-50 border-l-4 border-pink-500 p-6 mb-6 rounded-md">
            <h3 className="text-pink-700 mb-4 text-xl">LSTM Forecast Results</h3>
            <table className="w-full border-collapse bg-white rounded-md overflow-hidden">
              <thead>
                <tr>
                  <th className="p-3 text-left border-b border-gray-200 bg-pink-500 text-white font-semibold">Year</th>
                  {TARGETS.map(target => (
                    <th key={target} className="p-3 text-left border-b border-gray-200 bg-pink-500 text-white font-semibold capitalize">
                      Predicted {target}
                    </th>
                  ))}
                  <th className="p-3 text-left border-b border-gray-200 bg-pink-500 text-white font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {forecasts.map((f, i) => (
                  <tr key={i} className="hover:bg-gray-100 last:border-b-0">
                    <td className="p-3 text-left border-b border-gray-200">{f.year}</td>
                    {TARGETS.map(target => (
                      <td key={target} className="p-3 text-left border-b border-gray-200">
                        {f[target]?.toLocaleString() || 0}
                      </td>
                    ))}
                    <td className="p-3 text-left border-b border-gray-200 font-semibold">
                      {TARGETS.reduce((sum, t) => sum + (f[t] || 0), 0).toLocaleString()}
                    </td>
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
          <li className="py-2 text-gray-800 border-b border-indigo-200">Input features: {FEATURES.map(f => f.charAt(0).toUpperCase() + f.slice(1)).join(' & ')} (historical values)</li>
          <li className="py-2 text-gray-800 border-b border-indigo-200">Targets: {TARGETS.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ')} (next year)</li>
          <li className="py-2 text-gray-800 border-b border-indigo-200">Output units: {TARGETS.length} ({TARGETS.join(', ')})</li>
          <li className="py-2 text-gray-800 border-b border-indigo-200">Dropout: 0.3</li>
          <li className="py-2 text-gray-800 border-b-0">Epochs: 100 | Validation split: 20%</li>
        </ul>
      </div>
    </div>
  );
}
