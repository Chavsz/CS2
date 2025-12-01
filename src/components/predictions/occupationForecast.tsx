import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import LSTMForecast from '../../forecast_components/LSTMForecast'
import { getOccupation, type OccupationData } from '../../services/occupation'
import '../../App.css'

interface DataRow {
  year: number
  professionalTechnical: number
  managerialExecutive: number
  clericalWorkers: number
  salesWorkers: number
  serviceWorkers: number
  agriculturalWorkers: number
  productionTransportLaborers: number
  armedForces: number
  housewives: number
  retirees: number
  students: number
  minors: number
  outOfSchoolYouth: number
  refugees: number
  emigrants: number // Total excluding noOccupationReported
}

function OccupationForecast() {
  const [data, setData] = useState<DataRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const occupationRecords = await getOccupation()

        const transformedData: DataRow[] = occupationRecords
          .map((record: OccupationData) => ({
            year: record.year,
            professionalTechnical: record.professionalTechnical || 0,
            managerialExecutive: record.managerialExecutive || 0,
            clericalWorkers: record.clericalWorkers || 0,
            salesWorkers: record.salesWorkers || 0,
            serviceWorkers: record.serviceWorkers || 0,
            agriculturalWorkers: record.agriculturalWorkers || 0,
            productionTransportLaborers: record.productionTransportLaborers || 0,
            armedForces: record.armedForces || 0,
            housewives: record.housewives || 0,
            retirees: record.retirees || 0,
            students: record.students || 0,
            minors: record.minors || 0,
            outOfSchoolYouth: record.outOfSchoolYouth || 0,
            refugees: record.refugees || 0,
            emigrants:
              (record.professionalTechnical || 0) +
              (record.managerialExecutive || 0) +
              (record.clericalWorkers || 0) +
              (record.salesWorkers || 0) +
              (record.serviceWorkers || 0) +
              (record.agriculturalWorkers || 0) +
              (record.productionTransportLaborers || 0) +
              (record.armedForces || 0) +
              (record.housewives || 0) +
              (record.retirees || 0) +
              (record.students || 0) +
              (record.minors || 0) +
              (record.outOfSchoolYouth || 0) +
              (record.refugees || 0) // Excludes noOccupationReported
          }))
          .filter((row: DataRow) => row.year > 0 && row.year > 1980 && row.year < 2030)

        transformedData.sort((a, b) => a.year - b.year)

        if (transformedData.length === 0) {
          console.warn('No valid data found in Firebase. Please ensure occupation data is uploaded.')
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

  const occupationKeys = [
    { key: 'professionalTechnical', name: 'Professional / Technical' },
    { key: 'managerialExecutive', name: 'Managerial / Executive' },
    { key: 'clericalWorkers', name: 'Clerical Workers' },
    { key: 'salesWorkers', name: 'Sales Workers' },
    { key: 'serviceWorkers', name: 'Service Workers' },
    { key: 'agriculturalWorkers', name: 'Agriculture / Fishery' },
    { key: 'productionTransportLaborers', name: 'Production / Transport' },
    { key: 'armedForces', name: 'Armed Forces' },
    { key: 'housewives', name: 'Housewives' },
    { key: 'retirees', name: 'Retirees' },
    { key: 'students', name: 'Students' },
    { key: 'minors', name: 'Minors' },
    { key: 'outOfSchoolYouth', name: 'Out-of-school Youth' },
    { key: 'refugees', name: 'Refugees' }
  ] as const

  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4',
    '#6366f1', '#f97316', '#14b8a6', '#64748b', '#22c55e', '#eab308', '#0ea5e9'
  ]

  return (
    <div className="app py-4 px-8">
      <h1 className="text-2xl font-bold text-indigo-600 mb-4">Emigrant Occupation Analysis & Forecasting</h1>

      {/* Original Historical Data Graph */}
      <section className="original-section">
        <h2>Historical Data: Emigration by Occupation</h2>
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
                {occupationKeys.map((occ, index) => (
                  <Line
                    key={occ.key}
                    type="monotone"
                    dataKey={occ.key}
                    stroke={colors[index % colors.length]}
                    strokeWidth={2}
                    name={occ.name}
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
              <p>Data shows emigrant occupation distribution from {data[0]?.year} to {data[data.length - 1]?.year}</p>
              <p>Total data points: {data.length}</p>
              <p className="text-sm text-gray-600 mt-2">Note: No Occupation Reported category is excluded from analysis</p>
            </>
          ) : (
            <div className="text-red-600">
              <p>⚠️ No data loaded. Please check:</p>
              <ul className="list-disc list-inside mt-2">
                <li>Firebase connection is working</li>
                <li>Occupation data is uploaded to Firebase</li>
                <li>Data contains valid year and occupation fields</li>
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

export default OccupationForecast


