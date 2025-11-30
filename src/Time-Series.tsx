import { useSearchParams } from 'react-router-dom'
import { type DatasetKey } from './components/selectData'
import SexForecast from './components/predictions/sexForecast'

const TimeSeries = () => {
  const [searchParams] = useSearchParams()
  const selected = (searchParams.get('dataset') || 'Sex') as DatasetKey

  return (
    <div className="py-4 px-8">
      <h1 className="text-2xl font-bold text-indigo-600 mb-4">Time Series Forecasting</h1>

      <div className="mt-4">
        {selected === 'Sex' && <SexForecast />}
      </div>
    </div>
  )
}

export default TimeSeries
