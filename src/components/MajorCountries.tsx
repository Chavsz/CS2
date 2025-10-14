import { useEffect, useState } from "react";
import { addMajorCountries, getMajorCountries, updateMajorCountries, deleteMajorCountries } from '../services/majorCountries';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';

type MajorCountries = {
  id: string;
  year: number;
  Usa: number;
  Canada: number;
  Japan: number;
  Australia: number;
  Italy: number;
  NewZealand: number;
  UnitedKingdom: number;
  Germany: number;
  SouthKorea: number;
  Spain: number;
  Others: number;
}

function MajorCountries() {
  const [majorCountries, setMajorCountries] = useState<MajorCountries[]>([]);
  const [filteredData, setFilteredData] = useState<MajorCountries[]>([]);
  const [filterType, setFilterType] = useState<'year' | 'total'>('total');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
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

  // Fetch data
  const fetchData = async () => {
    const data = await getMajorCountries();
    setMajorCountries(data as MajorCountries[]);
    setFilteredData(data as MajorCountries[]);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Get unique years for dropdown
  const uniqueYears = [...new Set(majorCountries.map(item => item.year))].sort((a, b) => b - a);

  // Filter data based on selected filter type
  useEffect(() => {
    if (filterType === 'year' && selectedYear) {
      const filtered = majorCountries.filter(item => item.year === Number(selectedYear));
      setFilteredData(filtered);
    } else if (filterType === 'total') {
      setFilteredData(majorCountries);
    }
  }, [filterType, selectedYear, majorCountries]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    await addMajorCountries({
      year: Number(form.year) || 0,
      Usa: Number(form.Usa) || 0,
      Canada: Number(form.Canada) || 0,
      Japan: Number(form.Japan) || 0,
      Australia: Number(form.Australia) || 0,
      Italy: Number(form.Italy) || 0,
      NewZealand: Number(form.NewZealand) || 0,
      UnitedKingdom: Number(form.UnitedKingdom) || 0,
      Germany: Number(form.Germany) || 0,
      SouthKorea: Number(form.SouthKorea) || 0,
      Spain: Number(form.Spain) || 0,
      Others: Number(form.Others) || 0,
    });
    setForm({ year: "", Usa: "", Canada: "", Japan: "", Australia: "", Italy: "", NewZealand: "", UnitedKingdom: "", Germany: "", SouthKorea: "", Spain: "", Others: "" });
    setShowModal(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    await deleteMajorCountries(id);
    fetchData();
  };

  const handleUpdate = async (id: string) => {
    const newYear = prompt("Enter new year:");
    if (newYear) {
      await updateMajorCountries(id, { year: Number(newYear) } as MajorCountries);
      fetchData();
    }
  };

  // Compute totals for bar chart based on filtered data
  const totals = filteredData.reduce((acc, cur) => {
    acc.Usa += cur.Usa || 0;
    acc.Canada += cur.Canada || 0;
    acc.Japan += cur.Japan || 0;
    acc.Australia += cur.Australia || 0;
    acc.Italy += cur.Italy || 0;
    acc.NewZealand += cur.NewZealand || 0;
    acc.UnitedKingdom += cur.UnitedKingdom || 0;
    acc.Germany += cur.Germany || 0;
    acc.SouthKorea += cur.SouthKorea || 0;
    acc.Spain += cur.Spain || 0;
    acc.Others += cur.Others || 0;
    return acc;
  }, { Usa: 0, Canada: 0, Japan: 0, Australia: 0, Italy: 0, NewZealand: 0, UnitedKingdom: 0, Germany: 0, SouthKorea: 0, Spain: 0, Others: 0 });

  const chartData = [
    { category: "Usa", count: totals.Usa },
    { category: "Canada", count: totals.Canada },
    { category: "Japan", count: totals.Japan },
    { category: "Australia", count: totals.Australia },
    { category: "Italy", count: totals.Italy },
    { category: "New Zealand", count: totals.NewZealand },
    { category: "United Kingdom", count: totals.UnitedKingdom },
    { category: "Germany", count: totals.Germany },
    { category: "South Korea", count: totals.SouthKorea },
    { category: "Spain", count: totals.Spain },
    { category: "Others", count: totals.Others },
  ];

  return (
    <div className="p-5">
      {/* Header */}

      {/* Filter Controls */}
      <div className="flex justify-between items-center mb-5">

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <span className="font-bold">Year</span>
            <span className="text-gray-400">|</span>
            <span className="font-bold">Total</span>
          </div>
          <div className="flex items-center gap-2">
            <div>
              <button 
                onClick={() => setFilterType('year')}
                className={`px-4 py-2 border border-gray-300 rounded cursor-pointer ${
                  filterType === 'year' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-black'
                }`}
              >
                Year
              </button>
              {filterType === 'year' && (
                <select 
                  value={selectedYear} 
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="mt-1 px-2 py-1 border border-gray-300 rounded block"
                >
                  <option value="">Select Year</option>
                  {uniqueYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              )}
            </div>
            <button 
              onClick={() => setFilterType('total')}
              className={`px-4 py-2 border border-gray-300 rounded cursor-pointer ${
                filterType === 'total' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-black'
              }`}
            >
              Total
            </button>
            <button 
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-green-500 text-white border-none rounded cursor-pointer"
            >
              Add Record
            </button>
          </div>
        </div>
      </div>

      {/* Chart Title */}
      <h2 className="mb-5 text-lg font-bold">
        Number of Registered Filipino Emigrants by Major Country of Destination: 1981 - 2020
      </h2>

      {/* Bar Chart */}
      <div className="mb-8 bg-white border border-gray-300 rounded p-5">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
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
          {filteredData.map(e => (
            <tr key={e.id}>
              <td className="p-3 border border-gray-300">{e.year || 0}</td>
              <td className="p-3 border border-gray-300">{e.Usa || 0}</td>
              <td className="p-3 border border-gray-300">{e.Canada || 0}</td>
              <td className="p-3 border border-gray-300">{e.Japan || 0}</td>
              <td className="p-3 border border-gray-300">{e.Australia || 0}</td>
              <td className="p-3 border border-gray-300">{e.Italy || 0}</td>
              <td className="p-3 border border-gray-300">{e.NewZealand || 0}</td>
              <td className="p-3 border border-gray-300">{e.UnitedKingdom || 0}</td>
              <td className="p-3 border border-gray-300">{e.Germany || 0}</td>
              <td className="p-3 border border-gray-300">{e.SouthKorea || 0}</td>
              <td className="p-3 border border-gray-300">{e.Spain || 0}</td>
              <td className="p-3 border border-gray-300">{e.Others || 0}</td>
              <td className="p-3 border border-gray-300">
                <button 
                  onClick={() => handleUpdate(e.id)}
                  className="mr-1 px-2 py-1 bg-yellow-400 text-black border-none rounded cursor-pointer"
                >
                  Update
                </button>
                <button 
                  onClick={() => handleDelete(e.id)}
                  className="px-2 py-1 bg-red-500 text-white border-none rounded cursor-pointer"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for Add Record */}
      {showModal && (
        <div className="fixed inset-0 bg-black/15 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg w-[600px] max-h-screen overflow-y-auto">
            <h2 className="mb-5 text-center">Add New Record</h2>
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
                onClick={handleAdd}
                className="px-5 py-2 bg-green-500 text-white border-none rounded cursor-pointer"
              >
                Add Record
              </button>
              <button 
                onClick={() => setShowModal(false)}
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
}

export default MajorCountries;