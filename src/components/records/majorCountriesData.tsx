import { useState, useEffect, useMemo } from "react";
import {
  getMajorCountries,
  addMajorCountries,
  updateMajorCountries,
  deleteMajorCountries,
  deleteAllMajorCountries,
} from "../../services/majorCountries";
import * as MdIcons from "react-icons/md";
import Pagination from "./Pagination";

const MajorCountriesTable = () => {
  type Row = Awaited<ReturnType<typeof getMajorCountries>> extends (infer U)[]
    ? U & { id?: string }
    : never;
  const [data, setData] = useState<Row[]>([]);
  const [filterType, setFilterType] = useState<"year" | "total">("total");
  const [selectedYear, setSelectedYear] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<any>({
    year: "",
    Usa: "",
    Canada: "",
    Japan: "",
    Australia: "",
    Italy: "",
    NewZealand: "",
    UnitedKingdom: "",
    Germany: "",
    SouthKorea: "",
    Spain: "",
    Others: "",
  });
  const [deletingAll, setDeletingAll] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const load = async () => {
    const rows = await getMajorCountries();
    setData(rows as any);
  };
  useEffect(() => {
    void load();
  }, []);

  const uniqueYears = useMemo(
    () =>
      [...new Set((data as any[]).map((d) => (d as any).year))].sort(
        (a: number, b: number) => b - a
      ),
    [data]
  );
  const filtered = useMemo(
    () =>
      filterType === "year" && selectedYear
        ? (data as any[]).filter(
            (d) => (d as any).year === Number(selectedYear)
          )
        : data,
    [data, filterType, selectedYear]
  );
  
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil((filtered as any[]).length / pageSize));
    if (page > totalPages) setPage(totalPages);
  }, [filtered, page, pageSize]);
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const onUpdate = async (id: string) => {
    const ny = prompt("Enter new year:");
    if (ny) {
      await updateMajorCountries(id, { year: Number(ny) } as any);
      await load();
    }
  };
  const onDelete = async (id: string) => {
    await deleteMajorCountries(id);
    await load();
  };
  const onDeleteAll = async () => {
    setDeletingAll(true);
    await deleteAllMajorCountries();
    await load();
    setDeletingAll(false);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => setFilterType("year")}
          className={`px-4 py-2 border rounded ${
            filterType === "year" ? "bg-blue-500 text-white" : "bg-white"
          }`}
        >
          Year
        </button>
        {filterType === "year" && (
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-2 py-1 border rounded"
          >
            <option value="">Select Year</option>
            {uniqueYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        )}
        <button
          onClick={() => setFilterType("total")}
          className={`px-4 py-2 border rounded ${
            filterType === "total" ? "bg-blue-500 text-white" : "bg-white"
          }`}
        >
          Total
        </button>
        <button
          onClick={onDeleteAll}
          disabled={deletingAll}
          className="px-2.5 py-2 bg-red-500 text-white rounded disabled:opacity-60 flex items-center gap-1.5"
        >
          {" "}
          <MdIcons.MdDelete /> {deletingAll ? "Deleting…" : "Delete All"}
        </button>
      </div>
      <div className="px-10">
        <div className="rounded-lg border border-gray-300 overflow-hidden">
          <table className="w-full border-collapse text-gray-600">
            <thead>
              <tr className="bg-slate-50">
                <th className="p-3 text-left">Year</th>
                <th className="p-3 text-left">USA</th>
                <th className="p-3 text-left">Canada</th>
                <th className="p-3 text-left">Japan</th>
                <th className="p-3 text-left">Australia</th>
                <th className="p-3 text-left">Italy</th>
                <th className="p-3 text-left">New Zealand</th>
                <th className="p-3 text-left">United Kingdom</th>
                <th className="p-3 text-left">Germany</th>
                <th className="p-3 text-left">South Korea</th>
                <th className="p-3 text-left">Spain</th>
                <th className="p-3 text-left">Others</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const total = (filtered as any[]).length;
                const start = (page - 1) * pageSize;
                const end = Math.min(start + pageSize, total);
                return (filtered as any[]).slice(start, end).map((e: any) => (
                <tr key={e.id}>
                  <td className="p-1.5">{e.year || 0}</td>
                  <td className="p-1.5">{e.Usa || 0}</td>
                  <td className="p-1.5">{e.Canada || 0}</td>
                  <td className="p-1.5">{e.Japan || 0}</td>
                  <td className="p-1.5">{e.Australia || 0}</td>
                  <td className="p-1.5">{e.Italy || 0}</td>
                  <td className="p-1.5">{e.NewZealand || 0}</td>
                  <td className="p-1.5">{e.UnitedKingdom || 0}</td>
                  <td className="p-1.5">{e.Germany || 0}</td>
                  <td className="p-1.5">{e.SouthKorea || 0}</td>
                  <td className="p-1.5">{e.Spain || 0}</td>
                  <td className="p-1.5">{e.Others || 0}</td>
                  <td className="p-1.5">
                    <button
                      onClick={() => onUpdate(e.id)}
                      className="mr-1 px-2 py-1 text-stone-900 hover:text-black cursor-pointer"><MdIcons.MdOutlineModeEdit />
                    </button>
                    <button
                      onClick={() => onDelete(e.id)}
                      className="mr-1 px-2 py-1 text-red-500 hover:text-red-600  cursor-pointer"><MdIcons.MdDelete/>
                    </button>
                  </td>
                </tr>
                ))
              })()}
            </tbody>
          </table>
        </div>
        <Pagination total={(filtered as any[]).length} page={page} pageSize={pageSize} onPageChange={setPage} />
      </div>
    </div>
  );
};

export default MajorCountriesTable;
