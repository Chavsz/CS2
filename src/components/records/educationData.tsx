import { useState, useEffect } from 'react'
import { getEducations, updateEducation, deleteEducation, deleteAllEducation } from '../../services/education';
import type { EducationRecord } from '../../services/education';
//Icons
import * as MdIcons from "react-icons/md";

const EducationTable = () => {
  const [rows, setRows] = useState<EducationRecord[]>([])
  const [deletingAll, setDeletingAll] = useState(false)
  const [page, setPage] = useState(1)
  const pageSize = 15

  const load = async () => { const e = await getEducations(); e.sort((a,b)=>a.year-b.year); setRows(e) }
  useEffect(() => { void load() }, [])

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
    if (page > totalPages) setPage(totalPages)
  }, [rows, page, pageSize])

  const onUpdate = async (id: string) => {
    const rec = rows.find(r=>r.id===id)
    const y = prompt('Enter new year:', rec?.year?.toString() ?? '')
    const g = prompt('Enter new college graduates:', (rec?.graduates ?? 0).toString())
    const t = prompt('Enter new total:', rec?.total?.toString() ?? '')
    if (y === null || g === null || t === null) return
    const year = Number(y); const graduates = Number(g); const total = Number(t)
    if (Number.isNaN(year) || Number.isNaN(total) || Number.isNaN(graduates)) return
    await updateEducation(id, { year, graduates, total })
    await load()
  }
  const onDelete = async (id: string) => { await deleteEducation(id); await load() }
  const onDeleteAll = async () => { setDeletingAll(true); await deleteAllEducation(); await load(); setDeletingAll(false) }

  return (
    <div>
      <div className="mt-6">
        <div className="mb-3">
          <button onClick={onDeleteAll} disabled={deletingAll} className="px-2.5 py-2 bg-red-500 text-white rounded disabled:opacity-60 flex items-center gap-1.5"> <MdIcons.MdDelete />{deletingAll?'Deleting…':'Delete All'}</button>
        </div>
        <div className="px-9">
          <div className="rounded-lg border border-gray-300 overflow-hidden">
            <table className="w-full border-collapse text-gray-600">
              <thead>
                <tr className="bg-slate-50">
                  <th className="p-3 text-left">Year</th>
                  <th className="p-3 text-left">College Graduates</th>
                  <th className="p-3 text-left">Total Education</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const total = rows.length
                  const start = (page - 1) * pageSize
                  const end = Math.min(start + pageSize, total)
                  const visibleRows = rows.slice(start, end)
                  return visibleRows.map(er => (
                    <tr key={er.id ?? er.year.toString()}>
                      <td className="p-1.5">{er.year}</td>
                      <td className="p-1.5">{(er.graduates ?? 0).toLocaleString()}</td>
                      <td className="p-1.5">{er.total.toLocaleString()}</td>
                      <td className="p-1.5">
                        <button onClick={()=>er.id && onUpdate(er.id)} className="mr-1 px-2 py-1 text-stone-900 hover:text-black cursor-pointer"><MdIcons.MdOutlineModeEdit /></button>
                        <button onClick={()=>er.id && onDelete(er.id)} className="px-2 py-1 text-red-500 hover:text-red-600 cursor-pointer"><MdIcons.MdDelete /></button>
                      </td>
                    </tr>
                  ))
                })()}
              </tbody>
            </table>
          </div>
          {(() => {
            const total = rows.length
            const start = total === 0 ? 0 : (page - 1) * pageSize + 1
            const end = Math.min(page * pageSize, total)
            const totalPages = Math.max(1, Math.ceil(total / pageSize))
            const canPrev = page > 1
            const canNext = page < totalPages
            return (
              <div className="flex items-center justify-between mt-3 text-sm text-gray-700">
                <div>
                  {`Showing ${start}-${end} of ${total} entries`}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => canPrev && setPage(p => Math.max(1, p - 1))}
                    disabled={!canPrev}
                    className="px-3 py-1.5 border border-gray-300 rounded text-gray-700 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => canNext && setPage(p => p + 1)}
                    disabled={!canNext}
                    className="px-3 py-1.5 border border-gray-300 rounded text-gray-700 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next 
                  </button>
                </div>
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}

export default EducationTable;
