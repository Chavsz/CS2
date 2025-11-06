import { useEffect, useMemo, useState } from 'react'
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { getEducations, addEducation, type EducationRecord } from '../../services/education'
import { getOccupation, type OccupationData } from '../../services/occupation'

type Point = { year: number; xPctGraduates: number; yPctProfessionals: number }

const Education = () => {
  const [eduRows, setEduRows] = useState<EducationRecord[]>([])
  const [occRows, setOccRows] = useState<OccupationData[]>([])
  

  useEffect(() => {
    (async () => {
      const [e, o] = await Promise.all([getEducations(), getOccupation()])
      e.sort((a, b) => a.year - b.year)
      o.sort((a, b) => a.year - b.year)
      setEduRows(e)
      setOccRows(o)
    })()
  }, [])

  const points = useMemo<Point[]>(() => {
    const occTotalsByYear = new Map<number, { professionals: number; total: number }>()
    for (const r of occRows) {
      const professionals =
        r.armedForces +
        r.productionTransportLaborers +
        r.agriculturalWorkers +
        r.serviceWorkers +
        r.salesWorkers +
        r.managerialExecutive +
        r.clericalWorkers +
        r.professionalTechnical
      const unemployed = r.housewives + r.retirees + r.students + r.minors + r.outOfSchoolYouth + r.refugees + r.noOccupationReported
      const employedOther =
        (r.professionalTechnical + r.managerialExecutive + r.clericalWorkers + r.salesWorkers + r.serviceWorkers + r.agriculturalWorkers + r.productionTransportLaborers + r.armedForces) - professionals
      const employedTotal = professionals + employedOther
      const total = employedTotal + unemployed
      occTotalsByYear.set(r.year, { professionals, total })
    }

    return eduRows.map(er => {
      const occ = occTotalsByYear.get(er.year)
      if (!occ || occ.total === 0) return { year: er.year, xPctGraduates: 0, yPctProfessionals: 0 }
      const denom = er.total || 0
      const xPctGraduates = denom > 0 ? ((er.graduates ?? 0) / denom) * 100 : 0
      const yPctProfessionals = (occ.professionals / occ.total) * 100
      return { year: er.year, xPctGraduates, yPctProfessionals }
    })
  }, [eduRows, occRows])

  

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold text-gray-600 mb-3">Education vs Occupation: Scatter Plot</h2>

      

      <div className="w-full h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" dataKey="xPctGraduates" name="Graduates %" unit="%" tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12 }} domain={[0, 100]} />
            <YAxis type="number" dataKey="yPctProfessionals" name="Professionals %" unit="%" tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12 }} domain={[0, 100]} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
              if (!active || !payload || payload.length === 0) return null
              const p = payload[0].payload as Point
              return (
                <div className="bg-white border border-gray-200 rounded-md px-3 py-2 text-sm">
                  <div className="font-medium">Year: {p.year}</div>
                  <div>Graduates: {p.xPctGraduates.toFixed(2)}%</div>
                  <div>Professionals: {p.yPctProfessionals.toFixed(2)}%</div>
                </div>
              )
            }} />
            <Legend />
            <Scatter name="Year" data={points} fill="#16a34a" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      
      <p className="text-sm text-gray-500 mt-2">Each dot is a year; X = % of graduates out of all education totals, Y = % of professionals out of total occupation for that year.</p>
    </div>
  )
}

export default Education



