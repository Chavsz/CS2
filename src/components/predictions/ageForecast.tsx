import { useState, useEffect } from 'react'
import LSTMForecast from '../../forecast_components/LSTMForecast'
import { getAges, type AgeRecord } from '../../services/age'

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


  return (
    <div>

      {/* LSTM Forecasting Section */}
      <section className="forecast-section">
        <LSTMForecast data={data} />
      </section>
    </div>
  )
}

export default AgeForecast


