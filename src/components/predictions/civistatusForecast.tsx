import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import LSTMForecast from '../../forecast_components/LSTMForecast'
import { getCivilStatuses, type CivilStatusRecord } from '../../services/civilStatus'
import '../../App.css'

interface DataRow {
  year: number;
  single: number;
  married: number;
  widower: number;
  separated: number;
  divorced: number;
  emigrants: number; // Total for backward compatibility
}

function CivilStatusForecast() {
  const [data, setData] = useState<DataRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch data from Firebase
        const civilStatusRecords = await getCivilStatuses()
        
        // Transform Firebase data to match DataRow format (excluding notReported)
        const transformedData: DataRow[] = civilStatusRecords
          .map((record: CivilStatusRecord) => ({
            year: record.year,
            single: record.single || 0,
            married: record.married || 0,
            widower: record.widower || 0,
            separated: record.separated || 0,
            divorced: record.divorced || 0,
            emigrants: (record.single || 0) + (record.married || 0) + (record.widower || 0) + 
                      (record.separated || 0) + (record.divorced || 0) // Total excluding notReported
          }))
          .filter((row: DataRow) => row.year > 0 && row.year > 1980 && row.year < 2030)
        
        // Sort by year
        transformedData.sort((a, b) => a.year - b.year)
        
        if (transformedData.length === 0) {
          console.warn('No valid data found in Firebase. Please ensure civil status data is uploaded.')
        }
        
        setData(transformedData)
        setLoading(false)
      } catch (error) {
        console.error('Error loading data from Firebase:', error)
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="app">
        <h1>Loading data...</h1>
      </div>
    )
  }

  return (
    <div className="app py-4 px-8">
      <h1 className="text-2xl font-bold text-indigo-600 mb-4">Emigrant Civil Status Analysis & Forecasting</h1>

      {/* Original Historical Data Graph */}
      <section className="original-section">
        <h2>Historical Data: Emigration Trends by Civil Status</h2>
        {data.length > 0 ? (
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={500}>
              <LineChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="year"
                  label={{ value: 'Year', position: 'insideBottom', offset: -10 }}
                />
                <YAxis
                  label={{ value: 'Emigrants', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="single"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Single"
                  dot={{ r: 3.5 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="married"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Married"
                  dot={{ r: 3.5 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="widower"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="Widower"
                  dot={{ r: 3.5 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="separated"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Separated"
                  dot={{ r: 3.5 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="divorced"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Divorced"
                  dot={{ r: 3.5 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="chart-container bg-gray-100 p-8 rounded-lg text-center">
            <p className="text-gray-600 text-lg">No data available to display</p>
            <p className="text-gray-500 text-sm mt-2">Please check the browser console for details</p>
          </div>
        )}
        <div className="info">
          {data.length > 0 ? (
            <>
              <p>Data shows emigrant trends from {data[0]?.year} to {data[data.length - 1]?.year}</p>
              <p>Total data points: {data.length}</p>
              <p className="text-sm text-gray-600 mt-2">Note: Not Reported category is excluded from analysis</p>
            </>
          ) : (
            <div className="text-red-600">
              <p>⚠️ No data loaded. Please check:</p>
              <ul className="list-disc list-inside mt-2">
                <li>Firebase connection is working</li>
                <li>Civil Status data is uploaded to Firebase</li>
                <li>Data contains valid year and civil status fields</li>
                <li>Check browser console for detailed error messages</li>
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* LSTM Forecasting Section */}
      <section className="forecast-section">
        <LSTMForecast data={data} />
      </section>
    </div>
  )
}

export default CivilStatusForecast

