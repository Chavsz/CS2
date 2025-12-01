import { useSearchParams } from 'react-router-dom'
import { type DatasetKey } from './components/selectData'
import SexForecast from './components/predictions/sexForecast'
import CivilStatusForecast from './components/predictions/civistatusForecast'
import MajorCountriesForecast from './components/predictions/majorcountriesForecast'
import PlaceOfOriginsForecast from './components/predictions/placeOfOriginsForecast'
import AgeForecast from './components/predictions/ageForecast'
import EducationForecast from './components/predictions/educationForecast'
import OccupationForecast from './components/predictions/occupationForecast'

const TimeSeries = () => {
  const [searchParams] = useSearchParams()
  const selected = (searchParams.get('dataset') || 'Sex') as DatasetKey

  return (
    <div className="py-4 px-8">
      <h1 className="text-2xl font-bold text-indigo-600 mb-4">Time Series Forecasting</h1>

      <div className="mt-4">
        {selected === 'Age' && <AgeForecast />}
        {selected === 'Sex' && <SexForecast />}
        {selected === 'CivilStatus' && <CivilStatusForecast />}
        {selected === 'MajorCountries' && <MajorCountriesForecast />}
        {selected === 'PlaceOfOrigin' && <PlaceOfOriginsForecast />}
        {selected === 'Education' && <EducationForecast />}
        {selected === 'Occupation' && <OccupationForecast />}
      </div>
    </div>
  )
}

export default TimeSeries
