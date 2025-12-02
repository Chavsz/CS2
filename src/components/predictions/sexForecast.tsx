import { useState, useEffect } from 'react'
import LSTMForecast from '../../forecast_components/LSTMForecast'
import { getSexes, type SexRecord } from '../../services/sex'

interface DataRow {
  year: number;
  male: number;
  female: number;
  emigrants: number;
}

function SexForecast() {
  const [data, setData] = useState<DataRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch data from Firebase
        const sexRecords = await getSexes()
        
        // Transform Firebase data to match DataRow format
        const transformedData: DataRow[] = sexRecords
          .map((record: SexRecord) => ({
            year: record.year,
            male: record.male || 0,
            female: record.female || 0,
            emigrants: (record.male || 0) + (record.female || 0) // Total for backward compatibility
          }))
          .filter((row: DataRow) => row.year > 0 && row.year > 1980 && row.year < 2030)
        
        // Sort by year
        transformedData.sort((a, b) => a.year - b.year)
        
        if (transformedData.length === 0) {
          console.warn('No valid data found in Firebase. Please ensure sex data is uploaded.')
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

export default SexForecast

