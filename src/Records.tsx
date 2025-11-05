import { useState } from 'react'
import SelectData, { type DatasetKey } from './components/selectData'
import SexTable from './components/records/sexData'
import MajorCountriesTable from './components/records/majorCountriesData'
import OccupationTable from './components/records/occupationData'
import PlaceOfOriginTable from './components/records/placeOfOriginData'
import EducationTable from './components/records/educationData'
import AgeTable from './components/records/ageData'
import AllCountriesTable from './components/records/allCountriesData'
import CivilStatusTable from './components/records/civilstatusData'

const Records = () => {
  const [selected, setSelected] = useState<DatasetKey>('Sex')

  return (
    <div>
      <h1 className="text-2xl font-bold text-green-600 mb-4">Records</h1>
      <SelectData value={selected} onChange={setSelected} />

      <div className="mt-4">
      {selected === 'Age' && <AgeTable />}
        {selected === 'Sex' && <SexTable />}
        {selected === 'MajorCountries' && <MajorCountriesTable />}
        {selected === 'Occupation' && <OccupationTable />}
        {selected === 'PlaceOfOrigin' && <PlaceOfOriginTable />}
        {selected === 'Education' && <EducationTable />}
        {selected === 'AllCountries' && <AllCountriesTable />}
        {selected === 'CivilStatus' && <CivilStatusTable />}
      </div>
    </div>
  )
}

export default Records