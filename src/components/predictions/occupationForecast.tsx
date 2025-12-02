import { useState, useEffect } from 'react'
import LSTMForecast from '../../forecast_components/LSTMForecast'
import { getOccupation, type OccupationData } from '../../services/occupation'

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

  return (
    <div>

      {/* LSTM Forecasting Section */}
      <section className="forecast-section">
        <LSTMForecast data={data} />
      </section>
    </div>
  )
}

export default OccupationForecast


