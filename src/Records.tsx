import { useEffect, useMemo, useState } from 'react'
import SelectData, { type DatasetKey } from './components/selectData'
import { getSexes, addSex, updateSex, deleteSex, deleteAllSex, type SexRecord } from './services/sex'
import { getMajorCountries, addMajorCountries, updateMajorCountries, deleteMajorCountries, deleteAllMajorCountries } from './services/majorCountries'
import { getOccupation, addOccupation, updateOccupation, deleteOccupation, deleteAllOccupation, type OccupationData } from './services/occupation'
import { getPlaceOfOrigin, addPlaceOfOrigin, updatePlaceOfOrigin, deletePlaceOfOrigin, deleteAllPlaceOfOrigin, type PlaceOfOriginData } from './services/placeOfOrigin'
import { getEducations, addEducation, type EducationRecord } from './services/education'
import { getAges, updateAge, deleteAge, deleteAllAges, type AgeRecord } from './services/age'
import { getCountryYears, updateCountryYear, deleteCountryYear, deleteAllCountryYears, type CountryYearRecord } from './services/allCountries'
import { getCivilStatuses, updateCivilStatus, deleteCivilStatus, deleteAllCivilStatus, type CivilStatusRecord } from './services/civilStatus'

import * as ioICons from "react-icons/io";
// <IoMdAdd />
import * as MdIcons from "react-icons/md";
// <MdDelete />


const Records = () => {
  const [selected, setSelected] = useState<DatasetKey>('Sex')

  return (
    <div>
      <h1 className="text-2xl font-bold text-green-600 mb-4">Records</h1>
      <SelectData value={selected} onChange={setSelected} />

      <div className="mt-4">
        {selected === 'Sex' && <SexTable />}
        {selected === 'MajorCountries' && <MajorCountriesTable />}
        {selected === 'Occupation' && <OccupationTable />}
        {selected === 'PlaceOfOrigin' && <PlaceOfOriginTable />}
        {selected === 'Education' && <EducationTable />}
        {selected === 'Age' && <AgeTable />}
        {selected === 'AllCountries' && <AllCountriesTable />}
        {selected === 'CivilStatus' && <CivilStatusTable />}
      </div>
    </div>
  )
}

function SexTable() {
  const [data, setData] = useState<SexRecord[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ year: '', male: '', female: '' })
  const [deletingAll, setDeletingAll] = useState(false)

  const load = async () => {
    const rows = await getSexes()
    rows.sort((a, b) => a.year - b.year)
    setData(rows)
  }
  useEffect(() => { void load() }, [])

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
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-3 border border-gray-300 text-left">Year</th>
            <th className="p-3 border border-gray-300 text-left">Male</th>
            <th className="p-3 border border-gray-300 text-left">Female</th>
            <th className="p-3 border border-gray-300 text-left">Total</th>
            <th className="p-3 border border-gray-300 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map(r => (
            <tr key={r.id}>
              <td className="p-3 border border-gray-300">{r.year}</td>
              <td className="p-3 border border-gray-300">{r.male.toLocaleString()}</td>
              <td className="p-3 border border-gray-300">{r.female.toLocaleString()}</td>
              <td className="p-3 border border-gray-300">{(r.male + r.female).toLocaleString()}</td>
              <td className="p-3 border border-gray-300">
                <button onClick={() => onEdit(r.id!)} className="mr-1 px-2 py-1 bg-yellow-400 text-black rounded">Update</button>
                <button onClick={() => onDelete(r.id!)} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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

function MajorCountriesTable() {
  type Row = Awaited<ReturnType<typeof getMajorCountries>> extends (infer U)[] ? U & { id?: string } : never
  const [data, setData] = useState<Row[]>([])
  const [filterType, setFilterType] = useState<'year' | 'total'>('total')
  const [selectedYear, setSelectedYear] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<any>({ year: '', Usa: '', Canada: '', Japan: '', Australia: '', Italy: '', NewZealand: '', UnitedKingdom: '', Germany: '', SouthKorea: '', Spain: '', Others: '' })
  const [deletingAll, setDeletingAll] = useState(false)

  const load = async () => { const rows = await getMajorCountries(); setData(rows as any) }
  useEffect(() => { void load() }, [])

  const uniqueYears = useMemo(() => [...new Set((data as any[]).map(d => (d as any).year))].sort((a: number,b: number)=>b-a), [data])
  const filtered = useMemo(() => filterType==='year' && selectedYear ? (data as any[]).filter(d=> (d as any).year===Number(selectedYear)) : data, [data, filterType, selectedYear])
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value })
  const onAdd = async () => { await addMajorCountries({
    year: Number(form.year)||0, Usa:Number(form.Usa)||0, Canada:Number(form.Canada)||0, Japan:Number(form.Japan)||0, Australia:Number(form.Australia)||0, Italy:Number(form.Italy)||0, NewZealand:Number(form.NewZealand)||0, UnitedKingdom:Number(form.UnitedKingdom)||0, Germany:Number(form.Germany)||0, SouthKorea:Number(form.SouthKorea)||0, Spain:Number(form.Spain)||0, Others:Number(form.Others)||0
  }); setForm({ year: '', Usa: '', Canada: '', Japan: '', Australia: '', Italy: '', NewZealand: '', UnitedKingdom: '', Germany: '', SouthKorea: '', Spain: '', Others: '' }); setShowModal(false); await load() }
  const onUpdate = async (id: string) => { const ny = prompt('Enter new year:'); if (ny) { await updateMajorCountries(id, { year: Number(ny) } as any); await load() } }
  const onDelete = async (id: string) => { await deleteMajorCountries(id); await load() }
  const onDeleteAll = async () => { setDeletingAll(true); await deleteAllMajorCountries(); await load(); setDeletingAll(false) }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <button onClick={() => setFilterType('year')} className={`px-4 py-2 border rounded ${filterType==='year'?'bg-blue-500 text-white':'bg-white'}`}>Year</button>
        {filterType==='year' && (
          <select value={selectedYear} onChange={(e)=>setSelectedYear(e.target.value)} className="px-2 py-1 border rounded">
            <option value="">Select Year</option>
            {uniqueYears.map(y=> <option key={y} value={y}>{y}</option>)}
          </select>
        )}
        <button onClick={() => setFilterType('total')} className={`px-4 py-2 border rounded ${filterType==='total'?'bg-blue-500 text-white':'bg-white'}`}>Total</button>
        <button onClick={onDeleteAll} disabled={deletingAll} className="px-2.5 py-2 bg-red-500 text-white rounded disabled:opacity-60 flex items-center gap-1.5"> <MdIcons.MdDelete /> {deletingAll?'Deleting…':'Delete All'}</button>
      </div>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-3 border border-gray-300 text-left">Year</th>
            <th className="p-3 border border-gray-300 text-left">USA</th>
            <th className="p-3 border border-gray-300 text-left">Canada</th>
            <th className="p-3 border border-gray-300 text-left">Japan</th>
            <th className="p-3 border border-gray-300 text-left">Australia</th>
            <th className="p-3 border border-gray-300 text-left">Italy</th>
            <th className="p-3 border border-gray-300 text-left">New Zealand</th>
            <th className="p-3 border border-gray-300 text-left">United Kingdom</th>
            <th className="p-3 border border-gray-300 text-left">Germany</th>
            <th className="p-3 border border-gray-300 text-left">South Korea</th>
            <th className="p-3 border border-gray-300 text-left">Spain</th>
            <th className="p-3 border border-gray-300 text-left">Others</th>
            <th className="p-3 border border-gray-300 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((e:any)=> (
            <tr key={e.id}>
              <td className="p-3 border border-gray-300">{e.year||0}</td>
              <td className="p-3 border border-gray-300">{e.Usa||0}</td>
              <td className="p-3 border border-gray-300">{e.Canada||0}</td>
              <td className="p-3 border border-gray-300">{e.Japan||0}</td>
              <td className="p-3 border border-gray-300">{e.Australia||0}</td>
              <td className="p-3 border border-gray-300">{e.Italy||0}</td>
              <td className="p-3 border border-gray-300">{e.NewZealand||0}</td>
              <td className="p-3 border border-gray-300">{e.UnitedKingdom||0}</td>
              <td className="p-3 border border-gray-300">{e.Germany||0}</td>
              <td className="p-3 border border-gray-300">{e.SouthKorea||0}</td>
              <td className="p-3 border border-gray-300">{e.Spain||0}</td>
              <td className="p-3 border border-gray-300">{e.Others||0}</td>
              <td className="p-3 border border-gray-300">
                <button onClick={()=>onUpdate(e.id)} className="mr-1 px-2 py-1 bg-yellow-400 text-black rounded">Update</button>
                <button onClick={()=>onDelete(e.id)} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  )
}

function OccupationTable() {
  const [data, setData] = useState<OccupationData[]>([])
  const [filterType, setFilterType] = useState<'year' | 'total'>('total')
  const [selectedYear, setSelectedYear] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<any>({
    year: '', professionalTechnical: '', managerialExecutive: '', clericalWorkers: '', salesWorkers: '', serviceWorkers: '', agriculturalWorkers: '', productionTransportLaborers: '', armedForces: '', housewives: '', retirees: '', students: '', minors: '', outOfSchoolYouth: '', refugees: '', noOccupationReported: ''
  })
  const [deletingAll, setDeletingAll] = useState(false)

  const load = async () => { const rows = await getOccupation(); setData(rows) }
  useEffect(() => { void load() }, [])
  const uniqueYears = useMemo(()=>[...new Set(data.map(d=>d.year))].sort((a,b)=>b-a),[data])
  const filtered = useMemo(()=> filterType==='year'&&selectedYear? data.filter(d=>d.year===Number(selectedYear)) : data,[data,filterType,selectedYear])
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value })
  const onAdd = async () => { await addOccupation({
    year:Number(form.year)||0, professionalTechnical:Number(form.professionalTechnical)||0, managerialExecutive:Number(form.managerialExecutive)||0, clericalWorkers:Number(form.clericalWorkers)||0, salesWorkers:Number(form.salesWorkers)||0, serviceWorkers:Number(form.serviceWorkers)||0, agriculturalWorkers:Number(form.agriculturalWorkers)||0, productionTransportLaborers:Number(form.productionTransportLaborers)||0, armedForces:Number(form.armedForces)||0, housewives:Number(form.housewives)||0, retirees:Number(form.retirees)||0, students:Number(form.students)||0, minors:Number(form.minors)||0, outOfSchoolYouth:Number(form.outOfSchoolYouth)||0, refugees:Number(form.refugees)||0, noOccupationReported:Number(form.noOccupationReported)||0
  }); setForm({ year: '', professionalTechnical: '', managerialExecutive: '', clericalWorkers: '', salesWorkers: '', serviceWorkers: '', agriculturalWorkers: '', productionTransportLaborers: '', armedForces: '', housewives: '', retirees: '', students: '', minors: '', outOfSchoolYouth: '', refugees: '', noOccupationReported: '' }); setShowModal(false); await load() }
  const onUpdate = async (id: string) => { const ny = prompt('Enter new year:'); if (ny) { await updateOccupation(id, { year: Number(ny) }); await load() } }
  const onDelete = async (id: string) => { await deleteOccupation(id); await load() }
  const onDeleteAll = async () => { setDeletingAll(true); await deleteAllOccupation(); await load(); setDeletingAll(false) }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <button onClick={()=>setFilterType('year')} className={`px-4 py-2 border rounded ${filterType==='year'?'bg-blue-500 text-white':'bg-white'}`}>Year</button>
        {filterType==='year' && (
          <select value={selectedYear} onChange={(e)=>setSelectedYear(e.target.value)} className="px-2 py-1 border rounded">
            <option value="">Select Year</option>
            {uniqueYears.map(y=> <option key={y} value={y}>{y}</option>)}
          </select>
        )}
        <button onClick={()=>setFilterType('total')} className={`px-4 py-2 border rounded ${filterType==='total'?'bg-blue-500 text-white':'bg-white'}`}>Total</button>
        <button onClick={onDeleteAll} disabled={deletingAll} className="px-2.5 py-2 bg-red-500 text-white rounded disabled:opacity-60 flex items-center gap-1.5"> <MdIcons.MdDelete /> {deletingAll?'Deleting…':'Delete All'}</button>
      </div>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-3 border border-gray-300 text-left">Year</th>
            <th className="p-3 border border-gray-300 text-left">Professional & Technical</th>
            <th className="p-3 border border-gray-300 text-left">Managerial & Executive</th>
            <th className="p-3 border border-gray-300 text-left">Clerical Workers</th>
            <th className="p-3 border border-gray-300 text-left">Sales Workers</th>
            <th className="p-3 border border-gray-300 text-left">Service Workers</th>
            <th className="p-3 border border-gray-300 text-left">Agricultural Workers</th>
            <th className="p-3 border border-gray-300 text-left">Production & Transport</th>
            <th className="p-3 border border-gray-300 text-left">Armed Forces</th>
            <th className="p-3 border border-gray-300 text-left">Housewives</th>
            <th className="p-3 border border-gray-300 text-left">Retirees</th>
            <th className="p-3 border border-gray-300 text-left">Students</th>
            <th className="p-3 border border-gray-300 text-left">Minors</th>
            <th className="p-3 border border-gray-300 text-left">Out of School Youth</th>
            <th className="p-3 border border-gray-300 text-left">Refugees</th>
            <th className="p-3 border border-gray-300 text-left">No Occupation Reported</th>
            <th className="p-3 border border-gray-300 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(e=> (
            <tr key={e.id}>
              <td className="p-3 border border-gray-300">{e.year||0}</td>
              <td className="p-3 border border-gray-300">{e.professionalTechnical||0}</td>
              <td className="p-3 border border-gray-300">{e.managerialExecutive||0}</td>
              <td className="p-3 border border-gray-300">{e.clericalWorkers||0}</td>
              <td className="p-3 border border-gray-300">{e.salesWorkers||0}</td>
              <td className="p-3 border border-gray-300">{e.serviceWorkers||0}</td>
              <td className="p-3 border border-gray-300">{e.agriculturalWorkers||0}</td>
              <td className="p-3 border border-gray-300">{e.productionTransportLaborers||0}</td>
              <td className="p-3 border border-gray-300">{e.armedForces||0}</td>
              <td className="p-3 border border-gray-300">{e.housewives||0}</td>
              <td className="p-3 border border-gray-300">{e.retirees||0}</td>
              <td className="p-3 border border-gray-300">{e.students||0}</td>
              <td className="p-3 border border-gray-300">{e.minors||0}</td>
              <td className="p-3 border border-gray-300">{e.outOfSchoolYouth||0}</td>
              <td className="p-3 border border-gray-300">{e.refugees||0}</td>
              <td className="p-3 border border-gray-300">{e.noOccupationReported||0}</td>
              <td className="p-3 border border-gray-300">
                <button onClick={()=>onUpdate(e.id!)} className="mr-1 px-2 py-1 bg-yellow-400 text-black rounded">Update</button>
                <button onClick={()=>onDelete(e.id!)} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="fixed inset-0 bg-black/15 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg w-96 max-h-screen overflow-y-auto">
            <h2 className="mb-5 text-center">Add New Occupation Record</h2>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(form).map(key => (
                <div key={key}>
                  <label className="block mb-1 font-bold">{key.charAt(0).toUpperCase()+key.slice(1).replace(/([A-Z])/g,' $1').trim()}</label>
                  <input name={key} value={form[key]} onChange={onChange} className="w-full p-2 border border-gray-300 rounded" />
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-2 mt-5">
              <button onClick={onAdd} className="px-5 py-2 bg-green-500 text-white rounded">Add Record</button>
              <button onClick={()=>setShowModal(false)} className="px-5 py-2 bg-gray-500 text-white rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PlaceOfOriginTable() {
  const [data, setData] = useState<PlaceOfOriginData[]>([])
  const [filterType, setFilterType] = useState<'year' | 'total'>('total')
  const [selectedYear, setSelectedYear] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<any>({ year:'', regionI:'', regionII:'', regionIII:'', regionIVA:'', regionIVB:'', regionV:'', regionVI:'', regionVII:'', regionVIII:'', regionIX:'', regionX:'', regionXI:'', regionXII:'', regionXIII:'', armm:'', car:'', ncr:'', notReported:'' })
  const [deletingAll, setDeletingAll] = useState(false)

  const load = async () => { const rows = await getPlaceOfOrigin(); setData(rows) }
  useEffect(() => { void load() }, [])
  const uniqueYears = useMemo(()=>[...new Set(data.map(d=>d.year))].sort((a,b)=>b-a),[data])
  const filtered = useMemo(()=> filterType==='year'&&selectedYear? data.filter(d=>d.year===Number(selectedYear)) : data,[data,filterType,selectedYear])
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value })
  const onAdd = async () => { await addPlaceOfOrigin({
    year:Number(form.year)||0, regionI:Number(form.regionI)||0, regionII:Number(form.regionII)||0, regionIII:Number(form.regionIII)||0, regionIVA:Number(form.regionIVA)||0, regionIVB:Number(form.regionIVB)||0, regionV:Number(form.regionV)||0, regionVI:Number(form.regionVI)||0, regionVII:Number(form.regionVII)||0, regionVIII:Number(form.regionVIII)||0, regionIX:Number(form.regionIX)||0, regionX:Number(form.regionX)||0, regionXI:Number(form.regionXI)||0, regionXII:Number(form.regionXII)||0, regionXIII:Number(form.regionXIII)||0, armm:Number(form.armm)||0, car:Number(form.car)||0, ncr:Number(form.ncr)||0, notReported:Number(form.notReported)||0
  }); setForm({ year:'', regionI:'', regionII:'', regionIII:'', regionIVA:'', regionIVB:'', regionV:'', regionVI:'', regionVII:'', regionVIII:'', regionIX:'', regionX:'', regionXI:'', regionXII:'', regionXIII:'', armm:'', car:'', ncr:'', notReported:'' }); setShowModal(false); await load() }
  const onUpdate = async (id: string) => { const ny = prompt('Enter new year:'); if (ny) { await updatePlaceOfOrigin(id, { year: Number(ny) }); await load() } }
  const onDelete = async (id: string) => { await deletePlaceOfOrigin(id); await load() }
  const onDeleteAll = async () => { setDeletingAll(true); await deleteAllPlaceOfOrigin(); await load(); setDeletingAll(false) }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <button onClick={()=>setFilterType('year')} className={`px-4 py-2 border rounded ${filterType==='year'?'bg-blue-500 text-white':'bg-white'}`}>Year</button>
        {filterType==='year' && (
          <select value={selectedYear} onChange={(e)=>setSelectedYear(e.target.value)} className="px-2 py-1 border rounded">
            <option value="">Select Year</option>
            {uniqueYears.map(y=> <option key={y} value={y}>{y}</option>)}
          </select>
        )}
        <button onClick={()=>setFilterType('total')} className={`px-4 py-2 border rounded ${filterType==='total'?'bg-blue-500 text-white':'bg-white'}`}>Total</button>
        <button onClick={onDeleteAll} disabled={deletingAll} className="px-2.5 py-2 bg-red-500 text-white rounded disabled:opacity-60 flex items-center gap-1.5"> <MdIcons.MdDelete /> {deletingAll?'Deleting…':'Delete All'}</button>
      </div>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-3 border border-gray-300 text-left">Year</th>
            <th className="p-3 border border-gray-300 text-left">Region I</th>
            <th className="p-3 border border-gray-300 text-left">Region II</th>
            <th className="p-3 border border-gray-300 text-left">Region III</th>
            <th className="p-3 border border-gray-300 text-left">Region IV-A</th>
            <th className="p-3 border border-gray-300 text-left">Region IV-B</th>
            <th className="p-3 border border-gray-300 text-left">Region V</th>
            <th className="p-3 border border-gray-300 text-left">Region VI</th>
            <th className="p-3 border border-gray-300 text-left">Region VII</th>
            <th className="p-3 border border-gray-300 text-left">Region VIII</th>
            <th className="p-3 border border-gray-300 text-left">Region IX</th>
            <th className="p-3 border border-gray-300 text-left">Region X</th>
            <th className="p-3 border border-gray-300 text-left">Region XI</th>
            <th className="p-3 border border-gray-300 text-left">Region XII</th>
            <th className="p-3 border border-gray-300 text-left">Region XIII</th>
            <th className="p-3 border border-gray-300 text-left">ARMM</th>
            <th className="p-3 border border-gray-300 text-left">CAR</th>
            <th className="p-3 border border-gray-300 text-left">NCR</th>
            <th className="p-3 border border-gray-300 text-left">Not Reported</th>
            <th className="p-3 border border-gray-300 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(e=> (
            <tr key={e.id}>
              <td className="p-3 border border-gray-300">{e.year||0}</td>
              <td className="p-3 border border-gray-300">{e.regionI||0}</td>
              <td className="p-3 border border-gray-300">{e.regionII||0}</td>
              <td className="p-3 border border-gray-300">{e.regionIII||0}</td>
              <td className="p-3 border border-gray-300">{e.regionIVA||0}</td>
              <td className="p-3 border border-gray-300">{e.regionIVB||0}</td>
              <td className="p-3 border border-gray-300">{e.regionV||0}</td>
              <td className="p-3 border border-gray-300">{e.regionVI||0}</td>
              <td className="p-3 border border-gray-300">{e.regionVII||0}</td>
              <td className="p-3 border border-gray-300">{e.regionVIII||0}</td>
              <td className="p-3 border border-gray-300">{e.regionIX||0}</td>
              <td className="p-3 border border-gray-300">{e.regionX||0}</td>
              <td className="p-3 border border-gray-300">{e.regionXI||0}</td>
              <td className="p-3 border border-gray-300">{e.regionXII||0}</td>
              <td className="p-3 border border-gray-300">{e.regionXIII||0}</td>
              <td className="p-3 border border-gray-300">{e.armm||0}</td>
              <td className="p-3 border border-gray-300">{e.car||0}</td>
              <td className="p-3 border border-gray-300">{e.ncr||0}</td>
              <td className="p-3 border border-gray-300">{e.notReported||0}</td>
              <td className="p-3 border border-gray-300">
                <button onClick={()=>onUpdate(e.id!)} className="mr-1 px-2 py-1 bg-yellow-400 text-black rounded">Update</button>
                <button onClick={()=>onDelete(e.id!)} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function EducationTable() {
  const [rows, setRows] = useState<EducationRecord[]>([])

  const load = async () => { const e = await getEducations(); e.sort((a,b)=>a.year-b.year); setRows(e) }
  useEffect(() => { void load() }, [])

  return (
    <div>
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-600 mb-3">Education Records</h3>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-3 border border-gray-300 text-left">Year</th>
              <th className="p-3 border border-gray-300 text-left">College Graduates</th>
              <th className="p-3 border border-gray-300 text-left">Total Education</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(er => (
              <tr key={er.year}>
                <td className="p-3 border border-gray-300">{er.year}</td>
                <td className="p-3 border border-gray-300">{(er.graduates ?? 0).toLocaleString()}</td>
                <td className="p-3 border border-gray-300">{er.total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Records

function AgeTable() {
  const [rows, setRows] = useState<AgeRecord[]>([])
  const [deletingAll, setDeletingAll] = useState(false)

  const load = async () => {
    const r = await getAges()
    r.sort((a,b)=>a.year-b.year)
    setRows(r)
  }
  useEffect(() => { void load() }, [])

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
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-3 border border-gray-300 text-left">Year</th>
            <th className="p-3 border border-gray-300 text-left">Total</th>
            <th className="p-3 border border-gray-300 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td className="p-3 border border-gray-300">{r.year}</td>
              <td className="p-3 border border-gray-300">{r.total.toLocaleString()}</td>
              <td className="p-3 border border-gray-300">
                <button onClick={()=>onUpdate(r.id!)} className="mr-1 px-2 py-1 bg-yellow-400 text-black rounded">Update</button>
                <button onClick={()=>onDelete(r.id!)} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AllCountriesTable() {
  const [rows, setRows] = useState<CountryYearRecord[]>([])
  const [deletingAll, setDeletingAll] = useState(false)

  const load = async () => { const r = await getCountryYears(); setRows(r) }
  useEffect(() => { void load() }, [])

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
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-3 border border-gray-300 text-left">ISO3</th>
            <th className="p-3 border border-gray-300 text-left">Count</th>
            <th className="p-3 border border-gray-300 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td className="p-3 border border-gray-300">{r.iso3}</td>
              <td className="p-3 border border-gray-300">{r.count.toLocaleString()}</td>
              <td className="p-3 border border-gray-300">
                <button onClick={()=>onUpdate(r.id!)} className="mr-1 px-2 py-1 bg-yellow-400 text-black rounded">Update</button>
                <button onClick={()=>onDelete(r.id!)} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CivilStatusTable() {
  const [rows, setRows] = useState<CivilStatusRecord[]>([])
  const [deletingAll, setDeletingAll] = useState(false)

  const load = async () => {
    const r = await getCivilStatuses()
    r.sort((a,b)=>a.year-b.year)
    setRows(r)
  }
  useEffect(() => { void load() }, [])

  const onUpdate = async (id: string) => {
    const rec = rows.find(r=>r.id===id)
    const y = prompt('Enter new year:', rec?.year?.toString() ?? '')
    if (!y) return
    const year = Number(y)
    if (Number.isNaN(year)) return
    await updateCivilStatus(id, { year })
    await load()
  }
  const onDelete = async (id: string) => { await deleteCivilStatus(id); await load() }
  const onDeleteAll = async () => { setDeletingAll(true); await deleteAllCivilStatus(); await load(); setDeletingAll(false) }

  const totalOf = (r: CivilStatusRecord) => (r.single + r.married + r.widower + r.separated + r.divorced + r.notReported)

  return (
    <div>
      <div className="mb-3">
        <button onClick={onDeleteAll} disabled={deletingAll} className="px-2.5 py-2 bg-red-500 text-white rounded disabled:opacity-60 flex items-center gap-1.5"> <MdIcons.MdDelete /> {deletingAll?'Deleting…':'Delete All'}</button>
      </div>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-3 border border-gray-300 text-left">Year</th>
            <th className="p-3 border border-gray-300 text-left">Single</th>
            <th className="p-3 border border-gray-300 text-left">Married</th>
            <th className="p-3 border border-gray-300 text-left">Widower</th>
            <th className="p-3 border border-gray-300 text-left">Separated</th>
            <th className="p-3 border border-gray-300 text-left">Divorced</th>
            <th className="p-3 border border-gray-300 text-left">Not Reported</th>
            <th className="p-3 border border-gray-300 text-left">Total</th>
            <th className="p-3 border border-gray-300 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td className="p-3 border border-gray-300">{r.year}</td>
              <td className="p-3 border border-gray-300">{r.single.toLocaleString()}</td>
              <td className="p-3 border border-gray-300">{r.married.toLocaleString()}</td>
              <td className="p-3 border border-gray-300">{r.widower.toLocaleString()}</td>
              <td className="p-3 border border-gray-300">{r.separated.toLocaleString()}</td>
              <td className="p-3 border border-gray-300">{r.divorced.toLocaleString()}</td>
              <td className="p-3 border border-gray-300">{r.notReported.toLocaleString()}</td>
              <td className="p-3 border border-gray-300">{totalOf(r).toLocaleString()}</td>
              <td className="p-3 border border-gray-300">
                <button onClick={()=>onUpdate(r.id!)} className="mr-1 px-2 py-1 bg-yellow-400 text-black rounded">Update</button>
                <button onClick={()=>onDelete(r.id!)} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}