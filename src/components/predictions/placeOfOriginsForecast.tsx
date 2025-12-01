import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import LSTMForecast from '../../forecast_components/LSTMForecast'
import { getPlaceOfOrigin, type PlaceOfOriginData } from '../../services/placeOfOrigin'
import '../../App.css'

interface DataRow {
  year: number
  regionI: number
  regionII: number
  regionIII: number
  regionIVA: number
  regionIVB: number
  regionV: number
  regionVI: number
  regionVII: number
  regionVIII: number
  regionIX: number
  regionX: number
  regionXI: number
  regionXII: number
  regionXIII: number
  armm: number
  car: number
  ncr: number
  emigrants: number // Total excluding notReported
}

function PlaceOfOriginsForecast() {
  const [data, setData] = useState<DataRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const placeOfOriginRecords = await getPlaceOfOrigin()

        const transformedData: DataRow[] = placeOfOriginRecords
          .map((record: PlaceOfOriginData) => ({
            year: record.year,
            regionI: record.regionI || 0,
            regionII: record.regionII || 0,
            regionIII: record.regionIII || 0,
            regionIVA: record.regionIVA || 0,
            regionIVB: record.regionIVB || 0,
            regionV: record.regionV || 0,
            regionVI: record.regionVI || 0,
            regionVII: record.regionVII || 0,
            regionVIII: record.regionVIII || 0,
            regionIX: record.regionIX || 0,
            regionX: record.regionX || 0,
            regionXI: record.regionXI || 0,
            regionXII: record.regionXII || 0,
            regionXIII: record.regionXIII || 0,
            armm: record.armm || 0,
            car: record.car || 0,
            ncr: record.ncr || 0,
            emigrants:
              (record.regionI || 0) +
              (record.regionII || 0) +
              (record.regionIII || 0) +
              (record.regionIVA || 0) +
              (record.regionIVB || 0) +
              (record.regionV || 0) +
              (record.regionVI || 0) +
              (record.regionVII || 0) +
              (record.regionVIII || 0) +
              (record.regionIX || 0) +
              (record.regionX || 0) +
              (record.regionXI || 0) +
              (record.regionXII || 0) +
              (record.regionXIII || 0) +
              (record.armm || 0) +
              (record.car || 0) +
              (record.ncr || 0)
          }))
          .filter((row: DataRow) => row.year > 0 && row.year > 1980 && row.year < 2030)

        transformedData.sort((a, b) => a.year - b.year)

        if (transformedData.length === 0) {
          console.warn('No valid data found in Firebase. Please ensure place of origin data is uploaded.')
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

  const regions = [
    { key: 'regionI', name: 'Region I - Ilocos' },
    { key: 'regionII', name: 'Region II - Cagayan Valley' },
    { key: 'regionIII', name: 'Region III - Central Luzon' },
    { key: 'regionIVA', name: 'Region IV-A - CALABARZON' },
    { key: 'regionIVB', name: 'Region IV-B - MIMAROPA' },
    { key: 'regionV', name: 'Region V - Bicol' },
    { key: 'regionVI', name: 'Region VI - Western Visayas' },
    { key: 'regionVII', name: 'Region VII - Central Visayas' },
    { key: 'regionVIII', name: 'Region VIII - Eastern Visayas' },
    { key: 'regionIX', name: 'Region IX - Zamboanga Peninsula' },
    { key: 'regionX', name: 'Region X - Northern Mindanao' },
    { key: 'regionXI', name: 'Region XI - Davao' },
    { key: 'regionXII', name: 'Region XII - SOCCSKSARGEN' },
    { key: 'regionXIII', name: 'Region XIII - Caraga' },
    { key: 'armm', name: 'ARMM' },
    { key: 'car', name: 'CAR' },
    { key: 'ncr', name: 'NCR' }
  ] as const

  const regionColors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4',
    '#6366f1', '#f97316', '#14b8a6', '#64748b', '#22c55e', '#eab308', '#0ea5e9',
    '#a855f7', '#f97316', '#059669'
  ]

  return (
    <div className="app py-4 px-8">
      <h1 className="text-2xl font-bold text-indigo-600 mb-4">Emigrant Place of Origin Analysis & Forecasting</h1>

      {/* Original Historical Data Graph */}
      <section className="original-section">
        <h2>Historical Data: Emigration by Place of Origin</h2>
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
                {regions.map((region, index) => (
                  <Line
                    key={region.key}
                    type="monotone"
                    dataKey={region.key}
                    stroke={regionColors[index % regionColors.length]}
                    strokeWidth={2}
                    name={region.name}
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
              <p>Data shows emigrant origins from {data[0]?.year} to {data[data.length - 1]?.year}</p>
              <p>Total data points: {data.length}</p>
              <p className="text-sm text-gray-600 mt-2">Note: Not Reported category is excluded from analysis</p>
            </>
          ) : (
            <div className="text-red-600">
              <p>⚠️ No data loaded. Please check:</p>
              <ul className="list-disc list-inside mt-2">
                <li>Firebase connection is working</li>
                <li>Place of Origin data is uploaded to Firebase</li>
                <li>Data contains valid year and region fields</li>
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

export default PlaceOfOriginsForecast


