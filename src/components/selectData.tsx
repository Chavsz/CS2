export type DatasetKey =
  | 'Total'
  | 'Age'
  | 'AllCountries'
  | 'MajorCountries'
  | 'Occupation'
  | 'Sex'
  | 'CivilStatus'
  | 'Education'
  | 'PlaceOfOrigin'

export const datasetOptions: { value: DatasetKey; label: string }[] = [
  { value: 'Total', label: 'Total' },
  { value: 'Age', label: 'Age' },
  { value: 'AllCountries', label: 'All Countries' },
  { value: 'MajorCountries', label: 'Major Countries' },
  { value: 'Occupation', label: 'Occupation' },
  { value: 'Sex', label: 'Sex' },
  { value: 'CivilStatus', label: 'Civil Status' },
  { value: 'Education', label: 'Education' },
  { value: 'PlaceOfOrigin', label: 'Place of Origin' },
]

type SelectDataProps = {
  value: DatasetKey
  onChange: (value: DatasetKey) => void
}

const SelectData = ({ value, onChange }: SelectDataProps) => {
  return (
    <div className="flex flex-col gap-2">
      <h1>Select Dataset</h1>
      <select
        className="w-[300px] p-2 rounded-md border border-gray-300"
        value={value}
        onChange={(e) => onChange(e.target.value as DatasetKey)}
      >  
        {datasetOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}

export default SelectData