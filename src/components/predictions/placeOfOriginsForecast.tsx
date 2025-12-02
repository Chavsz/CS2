import { useState, useEffect } from 'react'
import LSTMForecast from '../../forecast_components/LSTMForecast'
import { getPlaceOfOrigin, type PlaceOfOriginData } from '../../services/placeOfOrigin'

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
    <div>
      {/* LSTM Forecasting Section */}
      <section className="forecast-section">
        <LSTMForecast data={data} />
      </section>
    </div>
  )
}

export default PlaceOfOriginsForecast


