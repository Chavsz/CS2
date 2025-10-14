import { useEffect, useMemo, useState } from 'react'
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { getEducations, addEducation, updateEducation, type EducationRecord } from '../services/education'
import { getOccupation, type OccupationData } from '../services/occupation'

type Point = { year: number; xPctGraduates: number; yPctProfessionals: number }

const Education = () => {
  const [eduRows, setEduRows] = useState<EducationRecord[]>([])
  const [occRows, setOccRows] = useState<OccupationData[]>([])

  const [yearEdu, setYearEdu] = useState('')
  const [totalEdu, setTotalEdu] = useState('')
  const [gradsEdu, setGradsEdu] = useState('')
  const [savingEdu, setSavingEdu] = useState(false)

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

    const overallEducationTotal = eduRows.reduce((sum, e) => sum + e.total, 0)
    if (overallEducationTotal === 0) return []

    return eduRows.map(er => {
      const occ = occTotalsByYear.get(er.year)
      if (!occ || occ.total === 0) return { year: er.year, xPctGraduates: 0, yPctProfessionals: 0 }
      const xPctGraduates = ((er.graduates ?? 0) / overallEducationTotal) * 100
      const yPctProfessionals = (occ.professionals / occ.total) * 100
      return { year: er.year, xPctGraduates, yPctProfessionals }
    })
  }, [eduRows, occRows])

  const addEdu = async (e: React.FormEvent) => {
    e.preventDefault()
    const year = parseInt(yearEdu, 10)
    const total = parseInt(totalEdu, 10)
    const graduates = gradsEdu ? parseInt(gradsEdu, 10) : undefined
    if (Number.isNaN(year) || Number.isNaN(total)) return
    setSavingEdu(true)
    try {
      const id = await addEducation({ year, total, graduates })
      setYearEdu('')
      setTotalEdu('')
      setGradsEdu('')
      const e = await getEducations()
      e.sort((a, b) => a.year - b.year)
      setEduRows(e)
    } finally {
      setSavingEdu(false)
    }
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold text-gray-600 mb-3">Education vs Occupation: Scatter Plot</h2>

      <form onSubmit={addEdu} className="flex items-end gap-3 mb-4">
        <div className="flex flex-col">
          <label className="text-sm text-gray-600">Year (Education)</label>
          <input type="number" className="border border-gray-300 rounded-md px-2 py-1 w-32" value={yearEdu} onChange={(e) => setYearEdu(e.target.value)} required />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-gray-600">Education Total</label>
          <input type="number" className="border border-gray-300 rounded-md px-2 py-1 w-40" value={totalEdu} onChange={(e) => setTotalEdu(e.target.value)} required />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-gray-600">Graduates (count)</label>
          <input type="number" className="border border-gray-300 rounded-md px-2 py-1 w-40" value={gradsEdu} onChange={(e) => setGradsEdu(e.target.value)} />
        </div>
        <button type="submit" disabled={savingEdu} className="bg-blue-600 text-white rounded-md px-4 py-2 disabled:opacity-60">{savingEdu ? 'Saving...' : 'Add Education'}</button>
      </form>

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
            <Scatter name="Year" data={points} fill="#10b981" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p className="text-sm text-gray-500 mt-2">Each dot is a year; X = % of graduates out of all education totals, Y = % of professionals out of total occupation for that year.</p>
    </div>
  )
}

export default Education



