import { useState, useEffect } from 'react'
import LSTMForecast from '../../forecast_components/LSTMForecast'
import { getEducations, type EducationRecord } from '../../services/education'

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

  return (
    <div>

      {/* LSTM Forecasting Section */}
      <section className="forecast-section">
        <LSTMForecast data={data} />
      </section>
    </div>
  )
}

export default EducationForecast


