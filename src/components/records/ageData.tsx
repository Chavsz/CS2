import { useState, useEffect } from 'react';
import { getAges, updateAge, deleteAge, deleteAllAges } from '../../services/age';
import type { AgeRecord } from '../../services/age';

//Icons
import * as MdIcons from "react-icons/md";

const AgeTable = () => {
  const [rows, setRows] = useState<AgeRecord[]>([])
  const [deletingAll, setDeletingAll] = useState(false)
  const [page, setPage] = useState(1)
  const pageSize = 15

  const load = async () => {
    const r = await getAges()
    r.sort((a,b)=>a.year-b.year)
    setRows(r)
  }
  useEffect(() => { void load() }, [])

  // Ensure current page stays valid when data size changes
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
    if (page > totalPages) setPage(totalPages)
  }, [rows, page, pageSize])

  const onUpdate = async (id: string) => {
    const rec = rows.find(r=>r.id===id)
    const y = prompt('Enter new year:', rec?.year?.toString() ?? '')
    const t = prompt('Enter new total:', rec?.total?.toString() ?? '')
    if (!y || !t) return
    const year = Number(y); const total = Number(t)
    if (Number.isNaN(year) || Number.isNaN(total)) return
    await updateAge(id, { year, total })
    await load()
  }
  const onDelete = async (id: string) => { await deleteAge(id); await load() }
  const onDeleteAll = async () => { setDeletingAll(true); await deleteAllAges(); await load(); setDeletingAll(false) }

  return (
    <div>
      <div className="mb-3">
        <button onClick={onDeleteAll} disabled={deletingAll} className="px-2.5 py-2 bg-red-500 text-white rounded disabled:opacity-60 flex items-center gap-1.5"> <MdIcons.MdDelete />{deletingAll?'Deleting…':'Delete All'}</button>
      </div>
      <div className="px-10">
      <div className="rounded-lg border border-gray-300 overflow-hidden">
      <table className="w-full border-collapse text-gray-600">
        <thead>
          <tr className="bg-slate-50">
            <th className="p-3 text-left">Year</th>
            <th className="p-3 text-left">Total</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {(() => {
            const total = rows.length
            const start = (page - 1) * pageSize
            const end = Math.min(start + pageSize, total)
            const visibleRows = rows.slice(start, end)
            return visibleRows.map(r => (
            <tr key={r.id}>
              <td className="p-1.5">{r.year}</td>
              <td className="p-1.5">{(r.total ?? 0).toLocaleString()}</td>
              <td className="p-1.5">
                <button onClick={()=>onUpdate(r.id!)} className="mr-1 px-2 py-1 text-stone-900 hover:text-black cursor-pointer"><MdIcons.MdOutlineModeEdit /></button>
                <button onClick={()=>onDelete(r.id!)} className="px-2 py-1 text-red-500 hover:text-red-600 cursor-pointer"><MdIcons.MdDelete /></button>
              </td>
            </tr>
            ))
          })()}
        </tbody>
      </table>
      </div>
      {/* Pagination */}
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
  )
}

export default AgeTable;
