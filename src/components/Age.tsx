import { useEffect, useState } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { getAges, addAge, type AgeRecord } from '../services/age'

const Age = () => {
  const [data, setData] = useState<AgeRecord[]>([])
  const [yearInput, setYearInput] = useState('')
  const [totalInput, setTotalInput] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    (async () => {
      const rows = await getAges()
      // Ensure sorted by year for the line chart
      rows.sort((a, b) => a.year - b.year)
      setData(rows)
    })()
  }, [])

  const reload = async () => {
    const rows = await getAges()
    rows.sort((a, b) => a.year - b.year)
    setData(rows)
  }

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const year = parseInt(yearInput, 10)
    const total = parseInt(totalInput, 10)
    if (Number.isNaN(year) || Number.isNaN(total)) return
    setSaving(true)
    try {
      await addAge({ year, total })
      setYearInput('')
      setTotalInput('')
      await reload()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold text-gray-600 mb-3">Age: Total Emigrants by Year</h2>

      <form onSubmit={onAdd} className="flex items-end gap-3 mb-4">
        <div className="flex flex-col">
          <label className="text-sm text-gray-600">Year</label>
          <input
            type="number"
            className="border border-gray-300 rounded-md px-2 py-1 w-32"
            value={yearInput}
            onChange={(e) => setYearInput(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-gray-600">Total</label>
          <input
            type="number"
            className="border border-gray-300 rounded-md px-2 py-1 w-40"
            value={totalInput}
            onChange={(e) => setTotalInput(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white rounded-md px-4 py-2 disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Add'}
        </button>
      </form>

      <div className="w-full h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} interval={0} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip formatter={(v: number) => v.toLocaleString()} labelFormatter={(l) => `Year: ${l}`} />
          <Legend />
          <Line type="monotone" dataKey="total" name="Total" stroke="#8884d8" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default Age



