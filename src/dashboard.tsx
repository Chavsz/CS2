import { useSearchParams } from 'react-router-dom'
import { type DatasetKey } from './components/selectData'
import Age from './components/charts/Age'
import AllCountries from './components/charts/AllCountries'
import MajorCountries from './components/charts/MajorCountries'
import Occupation from './components/charts/Occupation'
import Sex from './components/charts/Sex'
import CivilStatus from './components/charts/CivilStatus'
import Education from './components/charts/Education'
import PlaceOfOrigin from './components/charts/PlaceOfOrigin'

const Dashboard = () => {
  const [searchParams] = useSearchParams()
  const selected = (searchParams.get('dataset') || 'Age') as DatasetKey

  return (
    <div className="py-4 px-8">
      <h1 className="text-2xl font-bold text-indigo-600 mb-4">Dashboard</h1>

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