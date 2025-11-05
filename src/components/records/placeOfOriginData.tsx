import { useState, useEffect, useMemo } from "react";
import Pagination from "./Pagination";
import {
  getPlaceOfOrigin,
  updatePlaceOfOrigin,
  deletePlaceOfOrigin,
  deleteAllPlaceOfOrigin,
} from "../../services/placeOfOrigin";
import type { PlaceOfOriginData } from "../../services/placeOfOrigin";
import * as MdIcons from "react-icons/md";

const PlaceOfOriginTable = () => {
  const [data, setData] = useState<PlaceOfOriginData[]>([]);
  const [filterType, setFilterType] = useState<"year" | "total">("total");
  const [selectedYear, setSelectedYear] = useState("");
  const [deletingAll, setDeletingAll] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const load = async () => {
    const rows = await getPlaceOfOrigin();
    setData(rows);
  };
  useEffect(() => {
    void load();
  }, []);
  const uniqueYears = useMemo(
    () => [...new Set(data.map((d) => d.year))].sort((a, b) => b - a),
    [data]
  );
  const filtered = useMemo(
    () =>
      filterType === "year" && selectedYear
        ? data.filter((d) => d.year === Number(selectedYear))
        : data,
    [data, filterType, selectedYear]
  );

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (page > totalPages) setPage(totalPages);
  }, [filtered, page, pageSize]);
  const onUpdate = async (id: string) => {
    const ny = prompt("Enter new year:");
    if (ny) {
      await updatePlaceOfOrigin(id, { year: Number(ny) });
      await load();
    }
  };
  const onDelete = async (id: string) => {
    await deletePlaceOfOrigin(id);
    await load();
  };
  const onDeleteAll = async () => {
    setDeletingAll(true);
    await deleteAllPlaceOfOrigin();
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
      <div className="overflow-x-auto max-w-full">
        <div className="rounded-lg border border-gray-300">
          <table className="min-w-max border-collapse text-gray-600">
            <thead>
              <tr className="bg-slate-50">
                <th className="p-3 text-left">Year</th>
                <th className="p-3 text-left">Region I</th>
                <th className="p-3 text-left">Region II</th>
                <th className="p-3 text-left">Region III</th>
                <th className="p-3 text-left">Region IV-A</th>
                <th className="p-3 text-left">Region IV-B</th>
                <th className="p-3 text-left">Region V</th>
                <th className="p-3 text-left">Region VI</th>
                <th className="p-3 text-left">Region VII</th>
                <th className="p-3 text-left">Region VIII</th>
                <th className="p-3 text-left">Region IX</th>
                <th className="p-3 text-left">Region X</th>
                <th className="p-3 text-left">Region XI</th>
                <th className="p-3 text-left">Region XII</th>
                <th className="p-3 text-left">Region XIII</th>
                <th className="p-3 text-left">ARMM</th>
                <th className="p-3 text-left">CAR</th>
                <th className="p-3 text-left">NCR</th>
                <th className="p-3 text-left">Not Reported</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const total = filtered.length;
                const start = (page - 1) * pageSize;
                const end = Math.min(start + pageSize, total);
                return filtered.slice(start, end).map((e) => (
                  <tr key={e.id}>
                    <td className="p-1.5">{e.year || 0}</td>
                    <td className="p-1.5">{e.regionI || 0}</td>
                    <td className="p-1.5">{e.regionII || 0}</td>
                    <td className="p-1.5">{e.regionIII || 0}</td>
                    <td className="p-1.5">{e.regionIVA || 0}</td>
                    <td className="p-1.5">{e.regionIVB || 0}</td>
                    <td className="p-1.5">{e.regionV || 0}</td>
                    <td className="p-1.5">{e.regionVI || 0}</td>
                    <td className="p-1.5">{e.regionVII || 0}</td>
                    <td className="p-1.5">{e.regionVIII || 0}</td>
                    <td className="p-1.5">{e.regionIX || 0}</td>
                    <td className="p-1.5">{e.regionX || 0}</td>
                    <td className="p-1.5">{e.regionXI || 0}</td>
                    <td className="p-1.5">{e.regionXII || 0}</td>
                    <td className="p-1.5">{e.regionXIII || 0}</td>
                    <td className="p-1.5">{e.armm || 0}</td>
                    <td className="p-1.5">{e.car || 0}</td>
                    <td className="p-1.5">{e.ncr || 0}</td>
                    <td className="p-1.5">{e.notReported || 0}</td>
                    <td className="p-1.5">
                      <button
                        onClick={() => onUpdate(e.id!)}
                        className="mr-1 px-2 py-1 text-stone-900 hover:text-black cursor-pointer"><MdIcons.MdOutlineModeEdit />
                      </button>
                      <button
                        onClick={() => onDelete(e.id!)}
                        className="mr-1 px-2 py-1 text-red-500 hover:text-red-600 cursor-pointer"><MdIcons.MdDelete />
                      </button>
                    </td>
                  </tr>
                ))
              })()}
            </tbody>
          </table>
        </div>
        <Pagination total={filtered.length} page={page} pageSize={pageSize} onPageChange={setPage} />
      </div>
      {/* *** END OF CHANGES *** */}
    </div>
  );
};

export default PlaceOfOriginTable;