import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import LSTMForecast from '../../forecast_components/LSTMForecast'
import { getAges, type AgeRecord } from '../../services/age'
import '../../App.css'

interface DataRow {
  year: number
  age14Below: number
  age15to19: number
  age20to24: number
  age25to29: number
  age30to34: number
  age35to39: number
  age40to44: number
  age45to49: number
  age50to54: number
  age55to59: number
  age60to64: number
  age65to69: number
  age70Above: number
  emigrants: number // Total excluding notReported
}

function AgeForecast() {
  const [data, setData] = useState<DataRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const ageRecords = await getAges()

        const transformedData: DataRow[] = ageRecords
          .map((record: AgeRecord) => ({
            year: record.year,
            age14Below: record.age14Below || 0,
            age15to19: record.age15to19 || 0,
            age20to24: record.age20to24 || 0,
            age25to29: record.age25to29 || 0,
            age30to34: record.age30to34 || 0,
            age35to39: record.age35to39 || 0,
            age40to44: record.age40to44 || 0,
            age45to49: record.age45to49 || 0,
            age50to54: record.age50to54 || 0,
            age55to59: record.age55to59 || 0,
            age60to64: record.age60to64 || 0,
            age65to69: record.age65to69 || 0,
            age70Above: record.age70Above || 0,
            emigrants:
              (record.age14Below || 0) +
              (record.age15to19 || 0) +
              (record.age20to24 || 0) +
              (record.age25to29 || 0) +
              (record.age30to34 || 0) +
              (record.age35to39 || 0) +
              (record.age40to44 || 0) +
              (record.age45to49 || 0) +
              (record.age50to54 || 0) +
              (record.age55to59 || 0) +
              (record.age60to64 || 0) +
              (record.age65to69 || 0) +
              (record.age70Above || 0) // Excludes notReported
          }))
          .filter((row: DataRow) => row.year > 0 && row.year > 1980 && row.year < 2030)

        transformedData.sort((a, b) => a.year - b.year)

        if (transformedData.length === 0) {
          console.warn('No valid data found in Firebase. Please ensure age data is uploaded.')
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

  const ageGroups = [
    { key: 'age14Below', name: '14 and Below' },
    { key: 'age15to19', name: '15–19' },
    { key: 'age20to24', name: '20–24' },
    { key: 'age25to29', name: '25–29' },
    { key: 'age30to34', name: '30–34' },
    { key: 'age35to39', name: '35–39' },
    { key: 'age40to44', name: '40–44' },
    { key: 'age45to49', name: '45–49' },
    { key: 'age50to54', name: '50–54' },
    { key: 'age55to59', name: '55–59' },
    { key: 'age60to64', name: '60–64' },
    { key: 'age65to69', name: '65–69' },
    { key: 'age70Above', name: '70 and Above' }
  ] as const

  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4',
    '#6366f1', '#f97316', '#14b8a6', '#64748b', '#22c55e', '#eab308'
  ]

  return (
    <div className="app py-4 px-8">
      <h1 className="text-2xl font-bold text-indigo-600 mb-4">Emigrant Age Group Analysis & Forecasting</h1>

      {/* Original Historical Data Graph */}
      <section className="original-section">
        <h2>Historical Data: Emigration by Age Group</h2>
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
                {ageGroups.map((group, index) => (
                  <Line
                    key={group.key}
                    type="monotone"
                    dataKey={group.key}
                    stroke={colors[index % colors.length]}
                    strokeWidth={2}
                    name={group.name}
                    dot={{ r: 2.5 }}
                    activeDot={{ r: 4 }}
                  />
                ))}
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
              <p>Data shows emigrant age distribution from {data[0]?.year} to {data[data.length - 1]?.year}</p>
              <p>Total data points: {data.length}</p>
              <p className="text-sm text-gray-600 mt-2">Note: Not Reported category is excluded from analysis</p>
            </>
          ) : (
            <div className="text-red-600">
              <p>⚠️ No data loaded. Please check:</p>
              <ul className="list-disc list-inside mt-2">
                <li>Firebase connection is working</li>
                <li>Age data is uploaded to Firebase</li>
                <li>Data contains valid year and age group fields</li>
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

export default AgeForecast


