import { useEffect, useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { getCivilStatuses, type CivilStatusRecord } from '../services/civilStatus'

const CivilStatus = () => {
  const [data, setData] = useState<CivilStatusRecord[]>([])

  useEffect(() => {
    (async () => {
      const rows = await getCivilStatuses()
      rows.sort((a, b) => a.year - b.year)
      setData(rows)
    })()
  }, [])


  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold text-gray-600 mb-3">Civil Status: Distribution by Year</h2>

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



