import { useState, useEffect } from 'react'
import Pagination from './Pagination'
import { getEducations } from '../../services/education';
import type { EducationRecord } from '../../services/education';

const EducationTable = () => {
  const [rows, setRows] = useState<EducationRecord[]>([])
  const [page, setPage] = useState(1)
  const pageSize = 15

  const load = async () => { const e = await getEducations(); e.sort((a,b)=>a.year-b.year); setRows(e) }
  useEffect(() => { void load() }, [])

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
    if (page > totalPages) setPage(totalPages)
  }, [rows, page, pageSize])

  return (
    <div>
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-600 mb-3">Education Records</h3>
        <div className="px-10">
          <div className="rounded-lg border border-gray-300 overflow-hidden">
            <table className="w-full border-collapse text-gray-600">
              <thead>
                <tr className="bg-slate-50">
                  <th className="p-3 text-left">Year</th>
                  <th className="p-3 text-left">College Graduates</th>
                  <th className="p-3 text-left">Total Education</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const total = rows.length
                  const start = (page - 1) * pageSize
                  const end = Math.min(start + pageSize, total)
                  return rows.slice(start, end).map(er => (
                  <tr key={er.year}>
                    <td className="p-1.5">{er.year}</td>
                    <td className="p-1.5">{(er.graduates ?? 0).toLocaleString()}</td>
                    <td className="p-1.5">{er.total.toLocaleString()}</td>
                  </tr>
                  ))
                })()}
              </tbody>
            </table>
          </div>
          <Pagination total={rows.length} page={page} pageSize={pageSize} onPageChange={setPage} />
        </div>
      </div>
    </div>
  )
}

export default EducationTable;
