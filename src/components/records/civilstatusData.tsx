import { useState, useEffect } from "react";
import {
  getCivilStatuses,
  updateCivilStatus,
  deleteCivilStatus,
  deleteAllCivilStatus,
} from "../../services/civilStatus";
import type { CivilStatusRecord } from "../../services/civilStatus";
import * as MdIcons from "react-icons/md";
import Pagination from "./Pagination";

const CivilStatusTable = () => {
  const [rows, setRows] = useState<CivilStatusRecord[]>([]);
  const [deletingAll, setDeletingAll] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const load = async () => {
    const r = await getCivilStatuses();
    r.sort((a, b) => a.year - b.year);
    setRows(r);
  };
  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
    if (page > totalPages) setPage(totalPages);
  }, [rows, page, pageSize]);

  const onUpdate = async (id: string) => {
    const rec = rows.find((r) => r.id === id);
    const y = prompt("Enter new year:", rec?.year?.toString() ?? "");
    if (!y) return;
    const year = Number(y);
    if (Number.isNaN(year)) return;
    await updateCivilStatus(id, { year });
    await load();
  };
  const onDelete = async (id: string) => {
    await deleteCivilStatus(id);
    await load();
  };
  const onDeleteAll = async () => {
    setDeletingAll(true);
    await deleteAllCivilStatus();
    await load();
    setDeletingAll(false);
  };

  const totalOf = (r: CivilStatusRecord) =>
    r.single + r.married + r.widower + r.separated + r.divorced + r.notReported;

  return (
    <div>
      <div className="mb-3">
        <button
          onClick={onDeleteAll}
          disabled={deletingAll}
          className="px-2.5 py-2 bg-red-500 text-white rounded disabled:opacity-60 flex items-center gap-1.5"
        >
          {" "}
          <MdIcons.MdDelete /> {deletingAll ? "Deleting…" : "Delete All"}
        </button>
      </div>
      <div className="px-9">
        <div className="rounded-lg border border-gray-300 overflow-hidden">
          <table className="w-full border-collapse text-gray-600">
            <thead>
              <tr className="bg-slate-50">
                <th className="p-3 text-left">Year</th>
                <th className="p-3 text-left">Single</th>
                <th className="p-3 text-left">Married</th>
                <th className="p-3 text-left">Widower</th>
                <th className="p-3 text-left">Separated</th>
                <th className="p-3 text-left">Divorced</th>
                <th className="p-3 text-left">Not Reported</th>
                <th className="p-3 text-left">Total</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const total = rows.length;
                const start = (page - 1) * pageSize;
                const end = Math.min(start + pageSize, total);
                return rows.slice(start, end).map((r) => (
                <tr key={r.id}>
                  <td className="p-1.5">{r.year}</td>
                  <td className="p-1.5">{r.single.toLocaleString()}</td>
                  <td className="p-1.5">{r.married.toLocaleString()}</td>
                  <td className="p-1.5">{r.widower.toLocaleString()}</td>
                  <td className="p-1.5">{r.separated.toLocaleString()}</td>
                  <td className="p-1.5">{r.divorced.toLocaleString()}</td>
                  <td className="p-1.5">{r.notReported.toLocaleString()}</td>
                  <td className="p-1.5">{totalOf(r).toLocaleString()}</td>
                  <td className="p-1.5">
                    <button
                      onClick={() => onUpdate(r.id!)}
                      className="mr-1 px-2 py-1 text-stone-900 hover:text-black cursor-pointer"><MdIcons.MdOutlineModeEdit />
                    </button>
                    <button
                      onClick={() => onDelete(r.id!)}
                      className="px-2 py-1 text-red-500 hover:text-red-600 cursor-pointer"><MdIcons.MdDelete />
                    </button>
                  </td>
                </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
        <Pagination total={rows.length} page={page} pageSize={pageSize} onPageChange={setPage} />
      </div>
    </div>
  );
};

export default CivilStatusTable;
