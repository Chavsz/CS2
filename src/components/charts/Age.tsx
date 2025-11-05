import { useEffect, useState } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { getAges, type AgeRecord } from '../../services/age'

const Age = () => {
  const [data, setData] = useState<AgeRecord[]>([])
  

  useEffect(() => {
    (async () => {
      const rows = await getAges()
      // Ensure sorted by year for the line chart
      rows.sort((a, b) => a.year - b.year)
      setData(rows)
    })()
  }, [])

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold text-gray-600 mb-3">Age: Total Emigrants by Year</h2>

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



