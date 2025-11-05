import { useState, useEffect, useMemo } from "react";
import Pagination from "./Pagination";
import {
  getOccupation,
  updateOccupation,
  deleteOccupation,
  deleteAllOccupation,
} from "../../services/occupation";
import type { OccupationData } from "../../services/occupation";
import * as MdIcons from "react-icons/md";

const OccupationTable = () => {
  const [data, setData] = useState<OccupationData[]>([]);
  const [filterType, setFilterType] = useState<"year" | "total">("total");
  const [selectedYear, setSelectedYear] = useState("");
  const [deletingAll, setDeletingAll] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const load = async () => {
    const rows = await getOccupation();
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
      await updateOccupation(id, { year: Number(ny) });
      await load();
    }
  };
  const onDelete = async (id: string) => {
    await deleteOccupation(id);
    await load();
  };
  const onDeleteAll = async () => {
    setDeletingAll(true);
    await deleteAllOccupation();
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
      <div className="">
        <div className="rounded-lg border border-gray-300 overflow-hidden">
          <table className="w-full border-collapse text-gray-600">
            <thead>
              <tr className="bg-slate-50">
                <th className="p-3 text-left">Year</th>
                <th className="p-3 text-left">
              Professional & Technical
                </th>
                <th className="p-3 text-left">
              Managerial & Executive
                </th>
                <th className="p-3 text-left">
              Clerical Workers
                </th>
                <th className="p-3 text-left">
              Sales Workers
                </th>
                <th className="p-3 text-left">
              Service Workers
                </th>
                <th className="p-3 text-left">
              Agricultural Workers
                </th>
                <th className="p-3 text-left">
              Production & Transport
                </th>
                <th className="p-3 text-left">
              Armed Forces
                </th>
                <th className="p-3 text-left">Housewives</th>
                <th className="p-3 text-left">Retirees</th>
                <th className="p-3 text-left">Students</th>
                <th className="p-3 text-left">Minors</th>
                <th className="p-3 text-left">
              Out of School Youth
                </th>
                <th className="p-3 text-left">Refugees</th>
                <th className="p-3 text-left">
              No Occupation Reported
                </th>
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
                  <td className="p-1.5">{e.professionalTechnical || 0}</td>
                  <td className="p-1.5">{e.managerialExecutive || 0}</td>
                  <td className="p-1.5">{e.clericalWorkers || 0}</td>
                  <td className="p-1.5">{e.salesWorkers || 0}</td>
                  <td className="p-1.5">{e.serviceWorkers || 0}</td>
                  <td className="p-1.5">{e.agriculturalWorkers || 0}</td>
                  <td className="p-1.5">{e.productionTransportLaborers || 0}</td>
                  <td className="p-1.5">{e.armedForces || 0}</td>
                  <td className="p-1.5">{e.housewives || 0}</td>
                  <td className="p-1.5">{e.retirees || 0}</td>
                  <td className="p-1.5">{e.students || 0}</td>
                  <td className="p-1.5">{e.minors || 0}</td>
                  <td className="p-1.5">{e.outOfSchoolYouth || 0}</td>
                  <td className="p-1.5">{e.refugees || 0}</td>
                  <td className="p-1.5">{e.noOccupationReported || 0}</td>
                  <td className="p-1.5">
                    <button
                      onClick={() => onUpdate(e.id!)}
                      className="mr-1 px-1.5 py-1 text-stone-900 hover:text-black cursor-pointer"><MdIcons.MdOutlineModeEdit />
                    </button>
                    <button
                      onClick={() => onDelete(e.id!)}
                      className="px-1.5 py-1 text-red-500 hover:text-red-600  cursor-pointer"><MdIcons.MdDelete/>
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
    </div>
  );
};

export default OccupationTable;
