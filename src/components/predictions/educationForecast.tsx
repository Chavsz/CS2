import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import LSTMForecast from '../../forecast_components/LSTMForecast'
import { getEducations, type EducationRecord } from '../../services/education'
import '../../App.css'

interface DataRow {
  year: number
  notOfSchoolingAge: number
  noFormalEducation: number
  elementaryLevel: number
  elementaryGraduate: number
  highSchoolLevel: number
  highSchoolGraduate: number
  vocationalLevel: number
  vocationalGraduate: number
  collegeLevel: number
  collegeGraduate: number
  postGraduateLevel: number
  postGraduate: number
  nonFormalEducation: number
  emigrants: number // Total excluding notReported
}

function EducationForecast() {
  const [data, setData] = useState<DataRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const educationRecords = await getEducations()

        const transformedData: DataRow[] = educationRecords
          .map((record: EducationRecord) => ({
            year: record.year,
            notOfSchoolingAge: record.notOfSchoolingAge || 0,
            noFormalEducation: record.noFormalEducation || 0,
            elementaryLevel: record.elementaryLevel || 0,
            elementaryGraduate: record.elementaryGraduate || 0,
            highSchoolLevel: record.highSchoolLevel || 0,
            highSchoolGraduate: record.highSchoolGraduate || 0,
            vocationalLevel: record.vocationalLevel || 0,
            vocationalGraduate: record.vocationalGraduate || 0,
            collegeLevel: record.collegeLevel || 0,
            collegeGraduate: record.collegeGraduate || 0,
            postGraduateLevel: record.postGraduateLevel || 0,
            postGraduate: record.postGraduate || 0,
            nonFormalEducation: record.nonFormalEducation || 0,
            emigrants:
              (record.notOfSchoolingAge || 0) +
              (record.noFormalEducation || 0) +
              (record.elementaryLevel || 0) +
              (record.elementaryGraduate || 0) +
              (record.highSchoolLevel || 0) +
              (record.highSchoolGraduate || 0) +
              (record.vocationalLevel || 0) +
              (record.vocationalGraduate || 0) +
              (record.collegeLevel || 0) +
              (record.collegeGraduate || 0) +
              (record.postGraduateLevel || 0) +
              (record.postGraduate || 0) +
              (record.nonFormalEducation || 0) // Excludes notReported
          }))
          .filter((row: DataRow) => row.year > 0 && row.year > 1980 && row.year < 2030)

        transformedData.sort((a, b) => a.year - b.year)

        if (transformedData.length === 0) {
          console.warn('No valid data found in Firebase. Please ensure education data is uploaded.')
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

  const educationKeys = [
    { key: 'notOfSchoolingAge', name: 'Not of Schooling Age' },
    { key: 'noFormalEducation', name: 'No Formal Education' },
    { key: 'elementaryLevel', name: 'Elementary Level' },
    { key: 'elementaryGraduate', name: 'Elementary Graduate' },
    { key: 'highSchoolLevel', name: 'High School Level' },
    { key: 'highSchoolGraduate', name: 'High School Graduate' },
    { key: 'vocationalLevel', name: 'Vocational Level' },
    { key: 'vocationalGraduate', name: 'Vocational Graduate' },
    { key: 'collegeLevel', name: 'College Level' },
    { key: 'collegeGraduate', name: 'College Graduate' },
    { key: 'postGraduateLevel', name: 'Postgraduate Level' },
    { key: 'postGraduate', name: 'Postgraduate' },
    { key: 'nonFormalEducation', name: 'Non-formal Education' }
  ] as const

  const colors = [
    '#ef4444', '#ec4899', '#a855f7', '#2563eb', '#f97316', '#22c55e',
    '#16a34a', '#84cc16', '#9333ea', '#3b82f6', '#eab308', '#14b8a6',
    '#3949AB'
  ]

  return (
    <div className="app py-4 px-8">
      <h1 className="text-2xl font-bold text-indigo-600 mb-4">Emigrant Education Attainment Analysis & Forecasting</h1>

      {/* Original Historical Data Graph */}
      <section className="original-section">
        <h2>Historical Data: Emigration by Education Level</h2>
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
                {educationKeys.map((edu, index) => (
                  <Line
                    key={edu.key}
                    type="monotone"
                    dataKey={edu.key}
                    stroke={colors[index % colors.length]}
                    strokeWidth={2}
                    name={edu.name}
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
              <p>Data shows emigrant education distribution from {data[0]?.year} to {data[data.length - 1]?.year}</p>
              <p>Total data points: {data.length}</p>
              <p className="text-sm text-gray-600 mt-2">Note: Not Reported category is excluded from analysis</p>
            </>
          ) : (
            <div className="text-red-600">
              <p>⚠️ No data loaded. Please check:</p>
              <ul className="list-disc list-inside mt-2">
                <li>Firebase connection is working</li>
                <li>Education data is uploaded to Firebase</li>
                <li>Data contains valid year and education fields</li>
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

export default EducationForecast


