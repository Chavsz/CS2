import { useState, useEffect } from 'react'
import LSTMForecast from '../../forecast_components/LSTMForecast'
import { getMajorCountries } from '../../services/majorCountries'

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

  return (
    <div>

      {/* LSTM Forecasting Section */}
      <section className="forecast-section">
        <LSTMForecast data={data} />
      </section>
    </div>
  )
}

export default MajorCountriesForecast

