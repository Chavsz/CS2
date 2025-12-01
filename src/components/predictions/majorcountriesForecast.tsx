import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import LSTMForecast from '../../forecast_components/LSTMForecast'
import { getMajorCountries } from '../../services/majorCountries'
import '../../App.css'

interface DataRow {
  year: number;
  Usa: number;
  Canada: number;
  Japan: number;
  Australia: number;
  Italy: number;
  NewZealand: number;
  UnitedKingdom: number;
  Germany: number;
  SouthKorea: number;
  Spain: number;
  Others: number;
  emigrants: number; // Total for backward compatibility
}

function MajorCountriesForecast() {
  const [data, setData] = useState<DataRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch data from Firebase
        const majorCountriesRecords = await getMajorCountries()
        
        // Transform Firebase data to match DataRow format
        const transformedData: DataRow[] = majorCountriesRecords
          .map((record: any) => ({
            year: record.year || 0,
            Usa: record.Usa || 0,
            Canada: record.Canada || 0,
            Japan: record.Japan || 0,
            Australia: record.Australia || 0,
            Italy: record.Italy || 0,
            NewZealand: record.NewZealand || 0,
            UnitedKingdom: record.UnitedKingdom || 0,
            Germany: record.Germany || 0,
            SouthKorea: record.SouthKorea || 0,
            Spain: record.Spain || 0,
            Others: record.Others || 0,
            emigrants: (record.Usa || 0) + (record.Canada || 0) + (record.Japan || 0) + 
                      (record.Australia || 0) + (record.Italy || 0) + (record.NewZealand || 0) + 
                      (record.UnitedKingdom || 0) + (record.Germany || 0) + (record.SouthKorea || 0) + 
                      (record.Spain || 0) + (record.Others || 0) // Total for backward compatibility
          }))
          .filter((row: DataRow) => row.year > 0 && row.year > 1980 && row.year < 2030)
        
        // Sort by year
        transformedData.sort((a, b) => a.year - b.year)
        
        if (transformedData.length === 0) {
          console.warn('No valid data found in Firebase. Please ensure major countries data is uploaded.')
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

  // Color palette for 11 countries
  const countryColors = [
    '#3b82f6', // USA - Blue
    '#ef4444', // Canada - Red
    '#10b981', // Japan - Green
    '#f59e0b', // Australia - Orange
    '#8b5cf6', // Italy - Purple
    '#ec4899', // New Zealand - Pink
    '#06b6d4', // United Kingdom - Cyan
    '#6366f1', // Germany - Indigo
    '#f97316', // South Korea - Orange Red
    '#14b8a6', // Spain - Teal
    '#64748b'  // Others - Gray
  ]

  const countries = [
    { key: 'Usa', name: 'USA', color: countryColors[0] },
    { key: 'Canada', name: 'Canada', color: countryColors[1] },
    { key: 'Japan', name: 'Japan', color: countryColors[2] },
    { key: 'Australia', name: 'Australia', color: countryColors[3] },
    { key: 'Italy', name: 'Italy', color: countryColors[4] },
    { key: 'NewZealand', name: 'New Zealand', color: countryColors[5] },
    { key: 'UnitedKingdom', name: 'United Kingdom', color: countryColors[6] },
    { key: 'Germany', name: 'Germany', color: countryColors[7] },
    { key: 'SouthKorea', name: 'South Korea', color: countryColors[8] },
    { key: 'Spain', name: 'Spain', color: countryColors[9] },
    { key: 'Others', name: 'Others', color: countryColors[10] }
  ]

  return (
    <div className="app py-4 px-8">
      <h1 className="text-2xl font-bold text-indigo-600 mb-4">Emigrant Major Countries Analysis & Forecasting</h1>

      {/* Original Historical Data Graph */}
      <section className="original-section">
        <h2>Historical Data: Emigration Trends by Major Countries</h2>
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
                {countries.map((country) => (
                  <Line
                    key={country.key}
                    type="monotone"
                    dataKey={country.key}
                    stroke={country.color}
                    strokeWidth={2}
                    name={country.name}
                    dot={{ r: 3.5 }}
                    activeDot={{ r: 5 }}
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
              <p>Data shows emigrant trends from {data[0]?.year} to {data[data.length - 1]?.year}</p>
              <p>Total data points: {data.length}</p>
              <p className="text-sm text-gray-600 mt-2">Forecasting for 11 major destination countries</p>
            </>
          ) : (
            <div className="text-red-600">
              <p>⚠️ No data loaded. Please check:</p>
              <ul className="list-disc list-inside mt-2">
                <li>Firebase connection is working</li>
                <li>Major Countries data is uploaded to Firebase</li>
                <li>Data contains valid year and country fields</li>
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

export default MajorCountriesForecast

