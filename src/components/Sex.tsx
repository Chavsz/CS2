import { useEffect, useState } from 'react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { getSexes, addSex, type SexRecord } from '../services/sex'

const Sex = () => {
  const [data, setData] = useState<SexRecord[]>([])
  const [yearInput, setYearInput] = useState('')
  const [maleInput, setMaleInput] = useState('')
  const [femaleInput, setFemaleInput] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    (async () => {
      const rows = await getSexes()
      rows.sort((a, b) => a.year - b.year)
      setData(rows)
    })()
  }, [])

  const reload = async () => {
    const rows = await getSexes()
    rows.sort((a, b) => a.year - b.year)
    setData(rows)
  }

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const year = parseInt(yearInput, 10)
    const male = parseInt(maleInput, 10)
    const female = parseInt(femaleInput, 10)
    if ([year, male, female].some(Number.isNaN)) return
    setSaving(true)
    try {
      await addSex({ year, male, female })
      setYearInput('')
      setMaleInput('')
      setFemaleInput('')
      await reload()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold text-gray-600 mb-3">Sex: Male vs Female by Year</h2>

      <form onSubmit={onAdd} className="flex items-end gap-3 mb-4">
        <div className="flex flex-col">
          <label className="text-sm text-gray-600">Year</label>
          <input type="number" className="border border-gray-300 rounded-md px-2 py-1 w-32" value={yearInput} onChange={(e) => setYearInput(e.target.value)} required />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-gray-600">Male</label>
          <input type="number" className="border border-gray-300 rounded-md px-2 py-1 w-40" value={maleInput} onChange={(e) => setMaleInput(e.target.value)} required />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-gray-600">Female</label>
          <input type="number" className="border border-gray-300 rounded-md px-2 py-1 w-40" value={femaleInput} onChange={(e) => setFemaleInput(e.target.value)} required />
        </div>
        <button type="submit" disabled={saving} className="bg-blue-600 text-white rounded-md px-4 py-2 disabled:opacity-60">{saving ? 'Saving...' : 'Add'}</button>
      </form>

      <div className="w-full h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            <defs>
              <linearGradient id="maleColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="femaleColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f472b6" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#f472b6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} interval={0} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v: number) => v.toLocaleString()} labelFormatter={(l) => `Year: ${l}`} />
            <Legend />
            <Area type="monotone" dataKey="male" name="Male" stroke="#3b82f6" fillOpacity={1} fill="url(#maleColor)" />
            <Area type="monotone" dataKey="female" name="Female" stroke="#ec4899" fillOpacity={1} fill="url(#femaleColor)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default Sex



