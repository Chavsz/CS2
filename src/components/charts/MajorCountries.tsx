import { useEffect, useState } from "react";
import { addMajorCountries, getMajorCountries, updateMajorCountries, deleteMajorCountries, deleteAllMajorCountries } from '../../services/majorCountries';
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
  
  const [deleting, setDeleting] = useState(false);

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

  const onDeleteAll = async () => {
    setDeleting(true);
    await deleteAllMajorCountries();
    await fetchData();
    setDeleting(false);
  };

  return (
    <div className="p-5">
      {/* Header */}

      {/* Filter Controls */}
      <div className="flex justify-between items-center mb-5">

        <div className="flex items-center gap-5">
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
            
            {/* Delete All Records */}
            <button
              onClick={onDeleteAll}
              disabled={deleting}
              className="px-4 py-2 bg-red-500 text-white border-none rounded cursor-pointer disabled:opacity-60"
            >
              {deleting ? 'Deleting...' : 'Delete All Records'}
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
            <Bar dataKey="count" fill="#16a34a" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      

      
    </div>
  );
}

export default MajorCountries;