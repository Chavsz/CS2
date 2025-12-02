import { useState, useEffect } from 'react'
import LSTMForecast from '../../forecast_components/LSTMForecast'
import { getCivilStatuses, type CivilStatusRecord } from '../../services/civilStatus'

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
    <div>

      {/* LSTM Forecasting Section */}
      <section className="forecast-section">
        <LSTMForecast data={data} />
      </section>
    </div>
  )
}

export default CivilStatusForecast

