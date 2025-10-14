import { useEffect, useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { getCivilStatuses, addCivilStatus, type CivilStatusRecord } from '../services/civilStatus'

const CivilStatus = () => {
  const [data, setData] = useState<CivilStatusRecord[]>([])
  const [yearInput, setYearInput] = useState('')
  const [single, setSingle] = useState('')
  const [married, setMarried] = useState('')
  const [widower, setWidower] = useState('')
  const [separated, setSeparated] = useState('')
  const [divorced, setDivorced] = useState('')
  const [notReported, setNotReported] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    (async () => {
      const rows = await getCivilStatuses()
      rows.sort((a, b) => a.year - b.year)
      setData(rows)
    })()
  }, [])

  const reload = async () => {
    const rows = await getCivilStatuses()
    rows.sort((a, b) => a.year - b.year)
    setData(rows)
  }

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const year = parseInt(yearInput, 10)
    const record = {
      year,
      single: parseInt(single, 10),
      married: parseInt(married, 10),
      widower: parseInt(widower, 10),
      separated: parseInt(separated, 10),
      divorced: parseInt(divorced, 10),
      notReported: parseInt(notReported, 10),
    }
    if (Object.values(record).some(v => Number.isNaN(v))) return
    setSaving(true)
    try {
      await addCivilStatus(record)
      setYearInput('')
      setSingle('')
      setMarried('')
      setWidower('')
      setSeparated('')
      setDivorced('')
      setNotReported('')
      await reload()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold text-gray-600 mb-3">Civil Status: Distribution by Year</h2>

      <form onSubmit={onAdd} className="flex flex-wrap items-end gap-3 mb-4">
        <div className="flex flex-col">
          <label className="text-sm text-gray-600">Year</label>
          <input type="number" className="border border-gray-300 rounded-md px-2 py-1 w-24" value={yearInput} onChange={(e) => setYearInput(e.target.value)} required />
        </div>
        <div className="flex flex-col"><label className="text-sm text-gray-600">Single</label><input type="number" className="border border-gray-300 rounded-md px-2 py-1 w-24" value={single} onChange={(e) => setSingle(e.target.value)} required /></div>
        <div className="flex flex-col"><label className="text-sm text-gray-600">Married</label><input type="number" className="border border-gray-300 rounded-md px-2 py-1 w-24" value={married} onChange={(e) => setMarried(e.target.value)} required /></div>
        <div className="flex flex-col"><label className="text-sm text-gray-600">Widower</label><input type="number" className="border border-gray-300 rounded-md px-2 py-1 w-24" value={widower} onChange={(e) => setWidower(e.target.value)} required /></div>
        <div className="flex flex-col"><label className="text-sm text-gray-600">Separated</label><input type="number" className="border border-gray-300 rounded-md px-2 py-1 w-24" value={separated} onChange={(e) => setSeparated(e.target.value)} required /></div>
        <div className="flex flex-col"><label className="text-sm text-gray-600">Divorced</label><input type="number" className="border border-gray-300 rounded-md px-2 py-1 w-24" value={divorced} onChange={(e) => setDivorced(e.target.value)} required /></div>
        <div className="flex flex-col"><label className="text-sm text-gray-600">Not Reported</label><input type="number" className="border border-gray-300 rounded-md px-2 py-1 w-28" value={notReported} onChange={(e) => setNotReported(e.target.value)} required /></div>
        <button type="submit" disabled={saving} className="bg-blue-600 text-white rounded-md px-4 py-2 disabled:opacity-60">{saving ? 'Saving...' : 'Add'}</button>
      </form>

      <div className="w-full h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} interval={0} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v: number) => v.toLocaleString()} labelFormatter={(l) => `Year: ${l}`} />
            <Legend />
            <Bar dataKey="single" name="Single" stackId="a" fill="#60a5fa" />
            <Bar dataKey="married" name="Married" stackId="a" fill="#34d399" />
            <Bar dataKey="widower" name="Widower" stackId="a" fill="#f59e0b" />
            <Bar dataKey="separated" name="Separated" stackId="a" fill="#ef4444" />
            <Bar dataKey="divorced" name="Divorced" stackId="a" fill="#a78bfa" />
            <Bar dataKey="notReported" name="Not Reported" stackId="a" fill="#94a3b8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default CivilStatus



