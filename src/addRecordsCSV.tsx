import { useState } from 'react'
import { addAge, deleteAllAges, type AgeRecord } from './services/age'
import { addMajorCountries, deleteAllMajorCountries } from './services/majorCountries'
import { addSex, deleteAllSex, type SexRecord } from './services/sex'

const AddRecordsCSV = () => {
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('')
  const [majorCountriesUploading, setMajorCountriesUploading] = useState(false)
  const [majorCountriesStatus, setMajorCountriesStatus] = useState('')
  const [sexUploading, setSexUploading] = useState(false)
  const [sexStatus, setSexStatus] = useState('')

  const parseAgeCSV = (csvText: string): AgeRecord[] => {
    const lines = csvText.split('\n')
    const data: AgeRecord[] = []
    
    // Skip header row (first line)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line === '') continue // Skip empty lines
      
      const columns = line.split(',')
      if (columns.length >= 2) {
        const year = parseInt(columns[0].trim(), 10)
        const total = parseInt(columns[1].trim(), 10)
        
        if (!isNaN(year) && !isNaN(total) && total > 0) {
          data.push({ year, total })
        }
      }
    }
    
    console.log('Parsed data:', data.slice(0, 5)) // Show first 5 records
    return data
  }

  const parseMajorCountriesCSV = (csvText: string) => {
    const lines = csvText.split('\n')
    const data: any[] = []
    
    // Skip header row (first line)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line === '' || line.includes('TOTAL') || line.includes('% to TOTAL')) continue // Skip empty lines and summary rows
      
      const columns = line.split(',')
      if (columns.length >= 13) { // Ensure we have enough columns (including TOTAL column)
        const year = parseInt(columns[0].trim(), 10)
        
        if (!isNaN(year) && year >= 1981 && year <= 2020) {
          const record = {
            year,
            Usa: parseInt(columns[1].trim() || '0', 10),
            Canada: parseInt(columns[2].trim() || '0', 10),
            Japan: parseInt(columns[3].trim() || '0', 10),
            Australia: parseInt(columns[4].trim() || '0', 10),
            Italy: parseInt(columns[5].trim() || '0', 10),
            NewZealand: parseInt(columns[6].trim() || '0', 10),
            UnitedKingdom: parseInt(columns[7].trim() || '0', 10),
            Germany: parseInt(columns[8].trim() || '0', 10),
            SouthKorea: parseInt(columns[9].trim() || '0', 10),
            Spain: parseInt(columns[10].trim() || '0', 10),
            Others: parseInt(columns[11].trim() || '0', 10)
          }
          
          data.push(record)
        }
      }
    }
    
    console.log('Parsed major countries data:', data.slice(0, 3)) // Show first 3 records
    return data
  }

  const parseSexCSV = (csvText: string): SexRecord[] => {
    const lines = csvText.split('\n')
    const data: SexRecord[] = []
    
    // Skip header row (first line)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line === '') continue // Skip empty lines
      
      const columns = line.split(',')
      if (columns.length >= 4) { // YEAR, MALE, FEMALE, TOTAL
        const year = parseInt(columns[0].trim(), 10)
        const male = parseInt(columns[1].trim().replace(/,/g, ''), 10)
        const female = parseInt(columns[2].trim().replace(/,/g, ''), 10)
        
        if (!isNaN(year) && !isNaN(male) && !isNaN(female) && year >= 1981 && year <= 2020) {
          data.push({ year, male, female })
        }
      }
    }
    
    console.log('Parsed sex data:', data.slice(0, 5)) // Show first 5 records
    return data
  }

  const handleAgeCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadStatus('Processing CSV file...')

    try {
      const text = await file.text()
      const ageData = parseAgeCSV(text)
      
      if (ageData.length === 0) {
        setUploadStatus('No valid data found in CSV file')
        return
      }

      setUploadStatus(`Found ${ageData.length} records. Uploading to database...`)
      
      // Clear existing data first
      await deleteAllAges()
      
      // Add new data
      for (const record of ageData) {
        await addAge(record)
      }
      
      setUploadStatus(`Successfully uploaded ${ageData.length} age records!`)
      
    } catch (error) {
      console.error('Error uploading CSV:', error)
      setUploadStatus('Error uploading CSV file')
    } finally {
      setUploading(false)
    }
  }

  const handleMajorCountriesCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setMajorCountriesUploading(true)
    setMajorCountriesStatus('Processing CSV file...')

    try {
      const text = await file.text()
      const majorCountriesData = parseMajorCountriesCSV(text)
      
      if (majorCountriesData.length === 0) {
        setMajorCountriesStatus('No valid data found in CSV file')
        return
      }

      setMajorCountriesStatus(`Found ${majorCountriesData.length} records. Uploading to database...`)
      
      // Clear existing data first
      await deleteAllMajorCountries()
      
      // Add new data
      for (const record of majorCountriesData) {
        await addMajorCountries(record)
      }
      
      setMajorCountriesStatus(`Successfully uploaded ${majorCountriesData.length} major countries records!`)
      
    } catch (error) {
      console.error('Error uploading CSV:', error)
      setMajorCountriesStatus('Error uploading CSV file')
    } finally {
      setMajorCountriesUploading(false)
    }
  }

  const handleSexCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setSexUploading(true)
    setSexStatus('Processing CSV file...')

    try {
      const text = await file.text()
      const sexData = parseSexCSV(text)
      
      if (sexData.length === 0) {
        setSexStatus('No valid data found in CSV file')
        return
      }

      setSexStatus(`Found ${sexData.length} records. Uploading to database...`)
      
      // Clear existing data first
      await deleteAllSex()
      
      // Add new data
      for (const record of sexData) {
        await addSex(record)
      }
      
      setSexStatus(`Successfully uploaded ${sexData.length} sex records!`)
      
    } catch (error) {
      console.error('Error uploading CSV:', error)
      setSexStatus('Error uploading CSV file')
    } finally {
      setSexUploading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-500 mb-4">Add Records</h1>

      <div className="grid grid-cols-3 gap-4">

        {/* Age */}
        <div className="p-4 border border-gray-300 rounded-md"> 
          <h2 className="text-lg font-bold text-gray-500 mb-2">Age</h2>
          <input 
            type="file" 
            accept=".csv"
            onChange={handleAgeCSVUpload}
            disabled={uploading}
            className="mb-2"
          />
          <button 
            className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
            disabled={uploading}
          >
            {uploading ? 'Processing...' : 'Add CSV'}
          </button>
          {uploadStatus && (
            <p className="text-sm mt-2 text-gray-600">{uploadStatus}</p>
          )}
        </div>

        {/* All Countries */}
        <div className="p-4 border border-gray-300 rounded-md">
          <h2 className="text-lg font-bold text-gray-500 mb-2">All Countries</h2>
          <input type="file" />
          <button className="bg-blue-500 text-white px-4 py-2 rounded-md">Add CSV</button>
        </div>

        {/* Major Countries */}
        <div className="p-4 border border-gray-300 rounded-md">
          <h2 className="text-lg font-bold text-gray-500 mb-2">Major Countries</h2>
          <input 
            type="file" 
            accept=".csv"
            onChange={handleMajorCountriesCSVUpload}
            disabled={majorCountriesUploading}
            className="mb-2"
          />
          <button 
            className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
            disabled={majorCountriesUploading}
          >
            {majorCountriesUploading ? 'Processing...' : 'Add CSV'}
          </button>
          {majorCountriesStatus && (
            <p className="text-sm mt-2 text-gray-600">{majorCountriesStatus}</p>
          )}
        </div>

        {/* Occupation */}
        <div className="p-4 border border-gray-300 rounded-md">
          <h2 className="text-lg font-bold text-gray-500 mb-2">Occupation</h2>
          <input type="file" />
          <button className="bg-blue-500 text-white px-4 py-2 rounded-md">Add CSV</button>
        </div>

        {/* Sex */}
        <div className="p-4 border border-gray-300 rounded-md">
          <h2 className="text-lg font-bold text-gray-500 mb-2">Sex</h2>
          <input 
            type="file" 
            accept=".csv"
            onChange={handleSexCSVUpload}
            disabled={sexUploading}
            className="mb-2"
          />
          <button 
            className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
            disabled={sexUploading}
          >
            {sexUploading ? 'Processing...' : 'Add CSV'}
          </button>
          {sexStatus && (
            <p className="text-sm mt-2 text-gray-600">{sexStatus}</p>
          )}
        </div>

        {/* Civil Status */}
        <div className="p-4 border border-gray-300 rounded-md">
          <h2 className="text-lg font-bold text-gray-500 mb-2">Civil Status</h2>
          <input type="file" />
          <button className="bg-blue-500 text-white px-4 py-2 rounded-md">Add CSV</button>
        </div>

        {/* Education */}
        <div className="p-4 border border-gray-300 rounded-md">
          <h2 className="text-lg font-bold text-gray-500 mb-2">Education</h2>
          <input type="file" />
          <button className="bg-blue-500 text-white px-4 py-2 rounded-md">Add CSV</button>
        </div>

        {/* Place of Origin */}
        <div className="p-4 border border-gray-300 rounded-md">
          <h2 className="text-lg font-bold text-gray-500 mb-2">Place of Origin</h2>
          <input type="file" />
          <button className="bg-blue-500 text-white px-4 py-2 rounded-md">Add CSV</button>
        </div>

      </div>
    </div>
  )
}

export default AddRecordsCSV