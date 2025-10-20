import { useState } from 'react'
import { addAge, deleteAllAges, type AgeRecord } from './services/age'
import { addMajorCountries, deleteAllMajorCountries } from './services/majorCountries'
import { addSex, deleteAllSex, type SexRecord } from './services/sex'
import { addPlaceOfOrigin, deleteAllPlaceOfOrigin, type PlaceOfOriginData } from './services/placeOfOrigin'

const AddRecordsCSV = () => {
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('')
  const [majorCountriesUploading, setMajorCountriesUploading] = useState(false)
  const [majorCountriesStatus, setMajorCountriesStatus] = useState('')
  const [sexUploading, setSexUploading] = useState(false)
  const [sexStatus, setSexStatus] = useState('')
  const [placeOfOriginUploading, setPlaceOfOriginUploading] = useState(false)
  const [placeOfOriginStatus, setPlaceOfOriginStatus] = useState('')

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
    
    return data
  }

  const parsePlaceOfOriginCSV = (csvText: string): PlaceOfOriginData[] => {
    const lines = csvText.split('\n')
    const data: PlaceOfOriginData[] = []
    
    // Skip header row (first line)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      
      if (line === '' || line.includes('TOTAL')) {
        continue // Skip empty lines and summary rows
      }
      
      const columns = line.split(',')
      
      if (columns.length >= 35) { // REGION + 33 years + TOTAL + %
        const region = columns[0].trim()
        
        // Map region names to the service field names
        const regionMapping: { [key: string]: string } = {
          'RegionI-IlocosRegion': 'regionI',
          'RegionII-CagayanValley': 'regionII',
          'RegionIII-CentralLuzon': 'regionIII',
          'RegionIVA-CALABARZON': 'regionIVA',
          'RegionIVB-MIMAROPA': 'regionIVB',
          'RegionV-BicolRegion': 'regionV',
          'RegionVI-WesternVisayas': 'regionVI',
          'RegionVII-CentralVisayas': 'regionVII',
          'RegionVIII-EasternVisayas': 'regionVIII',
          'RegionIX-ZamboangaPeninsula': 'regionIX',
          'RegionX-NorthernMindanao': 'regionX',
          'RegionXI-DavaoRegion': 'regionXI',
          'RegionXII-SOCCSKSARGEN': 'regionXII',
          'RegionXIII-Caraga': 'regionXIII',
          'AutonomousRegioninMuslimMindanao(ARMM)': 'armm',
          'CordilleraAdministrativeRegion(CAR)': 'car',
          'NationalCapitalRegion(NCR)': 'ncr',
          'NotReported/NoResponse': 'notReported'
        }
        
        const fieldName = regionMapping[region]
        if (fieldName) {
          // Extract data for each year from 1988 to 2020
          for (let year = 1988; year <= 2020; year++) {
            const columnIndex = year - 1988 + 1 // +1 because first column is REGION
            if (columnIndex < columns.length) {
              const value = parseInt(columns[columnIndex].trim() || '0', 10)
              
              if (!isNaN(value) && value > 0) {
                // Find existing record for this year or create new one
                let existingRecord = data.find(d => d.year === year)
                if (!existingRecord) {
                  existingRecord = {
                    year,
                    regionI: 0,
                    regionII: 0,
                    regionIII: 0,
                    regionIVA: 0,
                    regionIVB: 0,
                    regionV: 0,
                    regionVI: 0,
                    regionVII: 0,
                    regionVIII: 0,
                    regionIX: 0,
                    regionX: 0,
                    regionXI: 0,
                    regionXII: 0,
                    regionXIII: 0,
                    armm: 0,
                    car: 0,
                    ncr: 0,
                    notReported: 0
                  }
                  data.push(existingRecord)
                }
                
                // Set the value for the specific region
                ;(existingRecord as any)[fieldName] = value
              }
            }
          }
        }
      }
    }
    
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

  const handlePlaceOfOriginCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setPlaceOfOriginUploading(true)
    setPlaceOfOriginStatus('Processing CSV file...')

    try {
      const text = await file.text()
      const placeOfOriginData = parsePlaceOfOriginCSV(text)
      
      if (placeOfOriginData.length === 0) {
        setPlaceOfOriginStatus('No valid data found in CSV file')
        return
      }

      setPlaceOfOriginStatus(`Found ${placeOfOriginData.length} records. Uploading to database...`)
      
      // Clear existing data first
      await deleteAllPlaceOfOrigin()
      
      // Add new data
      for (const record of placeOfOriginData) {
        await addPlaceOfOrigin(record)
      }
      
      setPlaceOfOriginStatus(`Successfully uploaded ${placeOfOriginData.length} place of origin records!`)
      
    } catch (error) {
      console.error('Error uploading CSV:', error)
      setPlaceOfOriginStatus('Error uploading CSV file')
    } finally {
      setPlaceOfOriginUploading(false)
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
          <input 
            type="file" 
            accept=".csv"
            onChange={handlePlaceOfOriginCSVUpload}
            disabled={placeOfOriginUploading}
            className="mb-2"
          />
          <button 
            className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
            disabled={placeOfOriginUploading}
          >
            {placeOfOriginUploading ? 'Processing...' : 'Add CSV'}
          </button>
          {placeOfOriginStatus && (
            <p className="text-sm mt-2 text-gray-600">{placeOfOriginStatus}</p>
          )}
        </div>

      </div>
    </div>
  )
}

export default AddRecordsCSV