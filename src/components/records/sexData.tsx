import { useState, useEffect } from 'react'
import Pagination from './Pagination'
import { getSexes, addSex, updateSex, deleteSex, deleteAllSex } from '../../services/sex';
import type { SexRecord } from '../../services/sex';
import * as MdIcons from "react-icons/md";

const SexTable = () => {
  const [data, setData] = useState<SexRecord[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ year: '', male: '', female: '' })
  const [deletingAll, setDeletingAll] = useState(false)
  const [page, setPage] = useState(1)
  const pageSize = 15

  const load = async () => {
    const rows = await getSexes()
    rows.sort((a, b) => a.year - b.year)
    setData(rows)
  }
  useEffect(() => { void load() }, [])

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(data.length / pageSize))
    if (page > totalPages) setPage(totalPages)
  }, [data, page, pageSize])

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value })
  const onAddOrUpdate = async () => {
    const year = parseInt(form.year, 10)
    const male = parseInt(form.male, 10)
    const female = parseInt(form.female, 10)
    if ([year, male, female].some(Number.isNaN)) return
    if (editingId) {
      await updateSex(editingId, { year, male, female })
    } else {
      await addSex({ year, male, female })
    }
    setForm({ year: '', male: '', female: '' })
    setEditingId(null)
    setShowModal(false)
    await load()
  }
  const onEdit = (id: string) => {
    const r = data.find(d => d.id === id)
    if (!r) return
    setForm({ year: String(r.year), male: String(r.male), female: String(r.female) })
    setEditingId(id)
    setShowModal(true)
  }
  const onDelete = async (id: string) => { await deleteSex(id); await load() }
  const onDeleteAll = async () => { setDeletingAll(true); await deleteAllSex(); await load(); setDeletingAll(false) }

  return (
    <div>
      <div className="mb-3 flex gap-2">
        <button onClick={onDeleteAll} disabled={deletingAll} className="px-2.5 py-2 bg-red-500 text-white rounded disabled:opacity-60 flex items-center gap-1.5"> <MdIcons.MdDelete />{deletingAll ? 'Deleting…' : 'Delete All'}</button>
      </div>
      <div className="px-9">
        <div className="rounded-lg border border-gray-300 overflow-hidden">
          <table className="w-full border-collapse text-gray-600">
            <thead>
              <tr className="bg-slate-50">
                <th className="p-3 text-left">Year</th>
                <th className="p-3 text-left">Male</th>
                <th className="p-3 text-left">Female</th>
                <th className="p-3 text-left">Total</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const total = data.length
                const start = (page - 1) * pageSize
                const end = Math.min(start + pageSize, total)
                return data.slice(start, end).map(r => (
                <tr key={r.id}>
                  <td className="p-1.5">{r.year}</td>
                  <td className="p-1.5">{r.male.toLocaleString()}</td>
                  <td className="p-1.5">{r.female.toLocaleString()}</td>
                  <td className="p-1.5">{(r.male + r.female).toLocaleString()}</td>
                  <td className="p-1.5">
                    <button onClick={() => onEdit(r.id!)} className="mr-1 px-2 py-1 text-stone-900 hover:text-black cursor-pointer"><MdIcons.MdOutlineModeEdit /></button>
                    <button onClick={() => onDelete(r.id!)} className="mr-1 px-2 py-1 text-red-500 hover:text-red-600 cursor-pointer"><MdIcons.MdDelete /></button>
                  </td>
                </tr>
                ))
              })()}
            </tbody>
          </table>
        </div>
        <Pagination total={data.length} page={page} pageSize={pageSize} onPageChange={setPage} />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/15 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg w-[500px]">
            <h2 className="mb-4 text-center">{editingId ? 'Edit Record' : 'Add New Record'}</h2>
            <div className="grid grid-cols-3 gap-2">
              {(['year','male','female'] as const).map(key => (
                <div key={key}>
                  <label className="block mb-1 font-bold">{key[0].toUpperCase()+key.slice(1)}</label>
                  <input name={key} value={form[key]} onChange={onChange} className="w-full p-2 border border-gray-300 rounded" />
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-2 mt-5">
              <button onClick={onAddOrUpdate} className="px-5 py-2 bg-green-500 text-white rounded">{editingId ? 'Update' : 'Add'}</button>
              <button onClick={() => { setShowModal(false); setEditingId(null) }} className="px-5 py-2 bg-gray-500 text-white rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SexTable;
