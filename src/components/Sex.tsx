import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  getSexes,
  addSex,
  updateSex,
  deleteSex,
  type SexRecord,
  deleteAllSex,
} from "../services/sex";

const Sex = () => {
  const [data, setData] = useState<SexRecord[]>([]);
  const [yearInput, setYearInput] = useState("");
  const [maleInput, setMaleInput] = useState("");
  const [femaleInput, setFemaleInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletedStatus, setDeletedStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    year: "",
    male: "",
    female: "",
  });
  useEffect(() => {
    (async () => {
      const rows = await getSexes();
      rows.sort((a, b) => a.year - b.year);
      setData(rows);
    })();
  }, []);

  const reload = async () => {
    const rows = await getSexes();
    rows.sort((a, b) => a.year - b.year);
    setData(rows);
  };

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const year = parseInt(yearInput, 10);
    const male = parseInt(maleInput, 10);
    const female = parseInt(femaleInput, 10);
    if ([year, male, female].some(Number.isNaN)) return;
    setSaving(true);
    try {
      await addSex({ year, male, female });
      setYearInput("");
      setMaleInput("");
      setFemaleInput("");
      await reload();
    } finally {
      setSaving(false);
    }
  };

  const onDeleteAll = async () => {
    setDeleting(true);
    try {
      await deleteAllSex();
      await reload();
      setDeletedStatus("All sex records deleted successfully");
    } catch (error) {
      console.error("Error deleting sex records:", error);
      setDeletedStatus("Error deleting sex records");
    } finally {
      setDeleting(false);
      setDeletedStatus("");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleAdd = async () => {
    const year = parseInt(form.year, 10);
    const male = parseInt(form.male, 10);
    const female = parseInt(form.female, 10);
    
    if ([year, male, female].some(Number.isNaN)) return;
    
    try {
      await addSex({ year, male, female });
      setForm({ year: "", male: "", female: "" });
      setShowModal(false);
      await reload();
    } catch (error) {
      console.error("Error adding sex record:", error);
    }
  };

  const handleUpdate = (id: string) => {
    const record = data.find(d => d.id === id);
    if (record) {
      setForm({
        year: record.year.toString(),
        male: record.male.toString(),
        female: record.female.toString(),
      });
      setEditingId(id);
      setShowModal(true);
    }
  };

  const handleEdit = async () => {
    if (!editingId) return;
    
    const year = parseInt(form.year, 10);
    const male = parseInt(form.male, 10);
    const female = parseInt(form.female, 10);
    
    if ([year, male, female].some(Number.isNaN)) return;
    
    try {
      await updateSex(editingId, { year, male, female });
      setForm({ year: "", male: "", female: "" });
      setEditingId(null);
      setShowModal(false);
      await reload();
    } catch (error) {
      console.error("Error updating sex record:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await deleteSex(id);
        await reload();
      } catch (error) {
        console.error("Error deleting sex record:", error);
      }
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold text-gray-600 mb-3">
        Sex: Male vs Female by Year
      </h2>

      <form onSubmit={onAdd} className="flex items-end gap-3 mb-4">
        <div className="flex flex-col">
          <label className="text-sm text-gray-600">Year</label>
          <input
            type="number"
            className="border border-gray-300 rounded-md px-2 py-1 w-32"
            value={yearInput}
            onChange={(e) => setYearInput(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-gray-600">Male</label>
          <input
            type="number"
            className="border border-gray-300 rounded-md px-2 py-1 w-40"
            value={maleInput}
            onChange={(e) => setMaleInput(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-gray-600">Female</label>
          <input
            type="number"
            className="border border-gray-300 rounded-md px-2 py-1 w-40"
            value={femaleInput}
            onChange={(e) => setFemaleInput(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white rounded-md px-4 py-2 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Add"}
        </button>
        <button
          type="button"
          disabled={deleting}
          onClick={onDeleteAll}
          className="bg-red-600 text-white rounded-md px-4 py-2 disabled:opacity-60"
        >
          {deleting ? "Deleting..." : "Delete All"}
        </button>
        {deletedStatus && (
          <p className="text-sm text-gray-600">{deletedStatus}</p>
        )}
      </form>

      <div className="w-full h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
          >
            <defs>
              <linearGradient id="maleColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="femaleColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f472b6" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#f472b6" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} interval={0} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(v: number) => v.toLocaleString()}
              labelFormatter={(l) => `Year: ${l}`}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="male"
              name="Male"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#maleColor)"
            />
            <Area
              type="monotone"
              dataKey="female"
              name="Female"
              stroke="#ec4899"
              fillOpacity={1}
              fill="url(#femaleColor)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-600 mb-4">Records</h3>
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
            {data.map(record => (
              <tr key={record.id}>
                <td className="p-3 border border-gray-300">{record.year}</td>
                <td className="p-3 border border-gray-300">{record.male.toLocaleString()}</td>
                <td className="p-3 border border-gray-300">{record.female.toLocaleString()}</td>
                <td className="p-3 border border-gray-300">{(record.male + record.female).toLocaleString()}</td>
                <td className="p-3 border border-gray-300">
                  <button 
                    onClick={() => handleUpdate(record.id!)}
                    className="mr-1 px-2 py-1 bg-yellow-400 text-black border-none rounded cursor-pointer"
                  >
                    Update
                  </button>
                  <button 
                    onClick={() => handleDelete(record.id!)}
                    className="px-2 py-1 bg-red-500 text-white border-none rounded cursor-pointer"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Add/Edit Record */}
      {showModal && (
        <div className="fixed inset-0 bg-black/15 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg w-[600px] max-h-screen overflow-y-auto">
            <h2 className="mb-5 text-center">
              {editingId ? "Edit Record" : "Add New Record"}
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {Object.keys(form).map(key => (
                <div key={key}>
                  <label className="block mb-1 font-bold">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </label>
                  <input
                    name={key}
                    placeholder={key}
                    value={form[key as keyof typeof form]}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded box-border"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-2 mt-5">
              <button 
                onClick={editingId ? handleEdit : handleAdd}
                className="px-5 py-2 bg-green-500 text-white border-none rounded cursor-pointer"
              >
                {editingId ? "Update" : "Add"}
              </button>
              <button 
                onClick={() => {
                  setShowModal(false);
                  setEditingId(null);
                  setForm({ year: "", male: "", female: "" });
                }}
                className="px-5 py-2 bg-gray-500 text-white border-none rounded cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sex;
