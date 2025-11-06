import { useState, useEffect } from 'react';
import { getCountryYears, updateCountryYear, deleteCountryYear, deleteAllCountryYears } from '../../services/allCountries';
import type { CountryYearRecord } from '../../services/allCountries';
import * as MdIcons from "react-icons/md";
import Pagination from "./Pagination";

const AllCountriesTable = () => {
  const [rows, setRows] = useState<CountryYearRecord[]>([])
  const [page, setPage] = useState(1)
  const pageSize = 15
  const [deletingAll, setDeletingAll] = useState(false)

  const load = async () => { const r = await getCountryYears(); setRows(r) }
  useEffect(() => { void load() }, [])

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
    if (page > totalPages) setPage(totalPages)
  }, [rows, page, pageSize])

  const onUpdate = async (id: string) => {
    const rec = rows.find(r=>r.id===id)
    const iso = prompt('Enter ISO3 code:', rec?.iso3 ?? '')
    const c = prompt('Enter count:', (rec?.count ?? '').toString())
    if (!iso || !c) return
    const count = Number(c)
    if (Number.isNaN(count)) return
    await updateCountryYear(id, { iso3: iso.toUpperCase(), count })
    await load()
  }
  const onDelete = async (id: string) => { await deleteCountryYear(id); await load() }
  const onDeleteAll = async () => { setDeletingAll(true); await deleteAllCountryYears(); await load(); setDeletingAll(false) }

  return (
    <div>
      <div className="mb-3">
        <button onClick={onDeleteAll} disabled={deletingAll} className="px-2.5 py-2 bg-red-500 text-white rounded disabled:opacity-60 flex items-center gap-1.5"> <MdIcons.MdDelete />{deletingAll?'Deleting…':'Delete All'}</button>
      </div>
      <div className="px-9">
        <div className="rounded-lg border border-gray-300 overflow-hidden">
          <table className="w-full border-collapse text-gray-600">
            <thead>
              <tr className="bg-slate-50">
                <th className="p-3 text-left">ISO3</th>
                <th className="p-3 text-left">Count</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const total = rows.length
                const start = (page - 1) * pageSize
                const end = Math.min(start + pageSize, total)
                return rows.slice(start, end).map(r => (
                <tr key={r.id}>
                  <td className="p-1.5">{r.iso3}</td>
                  <td className="p-1.5">{r.count.toLocaleString()}</td>
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
        <Pagination total={rows.length} page={page} pageSize={pageSize} onPageChange={setPage} />
      </div>
    </div>
  )
}

export default AllCountriesTable;
