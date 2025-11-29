import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import * as XLSX from 'xlsx'
import LSTMForecast from './forecast_components/LSTMForecast'
import './App.css'

interface DataRow {
  year: number;
  male: number;
  female: number;
  emigrants: number;
}

function TimeSeries() {
  const [data, setData] = useState<DataRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/Emigrant-1981-2020-Sex.xlsx')
        const arrayBuffer = await response.arrayBuffer()
        const workbook = XLSX.read(arrayBuffer, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        
        // Try object format with header
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: null })
        
        // Transform data to handle various column name formats
        const transformedData: DataRow[] = jsonData.map((row: any) => {
          // Get all keys to find the right columns
          const keys = Object.keys(row)
          
          // Find year column (case-insensitive, handle spaces)
          const yearKey = keys.find(k => 
            k.toLowerCase().replace(/\s+/g, '').includes('year')
          ) || keys.find(k => /year/i.test(k))
          
          // Find male column
          const maleKey = keys.find(k => 
            k.toLowerCase().replace(/\s+/g, '').includes('male') && 
            !k.toLowerCase().replace(/\s+/g, '').includes('female')
          ) || keys.find(k => /^male$/i.test(k.replace(/\s+/g, '')))
          
          // Find female column
          const femaleKey = keys.find(k => 
            k.toLowerCase().replace(/\s+/g, '').includes('female')
          ) || keys.find(k => /female/i.test(k))
          
          // Try multiple possible column name formats
          const year = yearKey ? row[yearKey] : (row.Year || row.year || row.YEAR || row['Year'] || row['YEAR'])
          const male = maleKey ? row[maleKey] : (row.Male || row.male || row.MALE || row['Male'] || row['MALE'] || 0)
          const female = femaleKey ? row[femaleKey] : (row.Female || row.female || row.FEMALE || row['Female'] || row['FEMALE'] || 0)
          
          // Convert to numbers
          const yearNum = year != null ? (typeof year === 'number' ? year : parseInt(String(year), 10)) : null
          const maleNum = male != null ? (typeof male === 'number' ? male : parseFloat(String(male))) : null
          const femaleNum = female != null ? (typeof female === 'number' ? female : parseFloat(String(female))) : null
          
          // Only include valid rows
          if (yearNum && !isNaN(yearNum) && yearNum > 1980 && yearNum < 2030) {
            return {
              year: yearNum,
              male: (maleNum != null && !isNaN(maleNum)) ? maleNum : 0,
              female: (femaleNum != null && !isNaN(femaleNum)) ? femaleNum : 0,
              emigrants: ((maleNum != null && !isNaN(maleNum)) ? maleNum : 0) + 
                        ((femaleNum != null && !isNaN(femaleNum)) ? femaleNum : 0)
            }
          }
          return null
        }).filter((row): row is DataRow => row !== null && row.year > 0)
        
        // Sort by year
        transformedData.sort((a, b) => a.year - b.year)
        
        console.log('Transformed data count:', transformedData.length)
        console.log('Sample transformed data:', transformedData.slice(0, 5))
        
        if (transformedData.length === 0) {
          console.warn('No valid data found. Available columns:', jsonData.length > 0 ? Object.keys(jsonData[0] as any) : 'No data')
        }
        
        setData(transformedData)
        setLoading(false)
      } catch (error) {
        console.error('Error loading data:', error)
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
    <div className="app py-4 px-8">
      <h1 className="text-2xl font-bold text-indigo-600 mb-4">Emigrant Civil Status Analysis & Forecasting</h1>

      {/* Original Historical Data Graph */}
      <section className="original-section">
        <h2 >Historical Data: Emigration Trends by Sex</h2>
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
                <Line
                  type="monotone"
                  dataKey="male"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Male Emigrants"
                  dot={{ r: 3.5 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="female"
                  stroke="#ec4899"
                  strokeWidth={2}
                  name="Female Emigrants"
                  dot={{ r: 3.5 }}
                  activeDot={{ r: 5 }}
                />
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
              <p>Data shows emigrant trends from {data[0]?.year} to {data[data.length - 1]?.year}</p>
              <p>Total data points: {data.length}</p>
            </>
          ) : (
            <div className="text-red-600">
              <p>⚠️ No data loaded. Please check:</p>
              <ul className="list-disc list-inside mt-2">
                <li>Excel file exists at: /Emigrant-1981-2020-Sex.xlsx</li>
                <li>File contains columns: Year, Male, Female</li>
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

export default TimeSeries
