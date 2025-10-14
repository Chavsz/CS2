import { useState } from 'react'
import SelectData, { type DatasetKey } from './components/selectData'
import Age from './components/Age'
import AllCountries from './components/AllCountries'
import MajorCountries from './components/MajorCountries'
import Occupation from './components/Occupation'
import Sex from './components/Sex'
import CivilStatus from './components/CivilStatus'
import Education from './components/Education'
import PlaceOfOrigin from './components/PlaceOfOrigin'

const Dashboard = () => {
  const [selected, setSelected] = useState<DatasetKey>('Age')

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-500 mb-4">Dashboard</h1>
      <SelectData value={selected} onChange={setSelected} />

      {/* Render selected dataset component */}
      <div className="mt-4">
        {selected === 'Age' && <Age />}
        {selected === 'AllCountries' && <AllCountries />}
        {selected === 'MajorCountries' && <MajorCountries />}
        {selected === 'Occupation' && <Occupation />}
        {selected === 'Sex' && <Sex />}
        {selected === 'CivilStatus' && <CivilStatus />}
        {selected === 'Education' && <Education />}
        {selected === 'PlaceOfOrigin' && <PlaceOfOrigin />}
      </div>
    </div>
  )
}

export default Dashboard;