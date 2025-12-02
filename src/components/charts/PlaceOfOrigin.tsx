import { useEffect, useState } from "react";
import {
  getPlaceOfOrigin,
  type PlaceOfOriginData,
} from "../../services/placeOfOrigin";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function PlaceOfOrigin() {
  const [placeOfOriginData, setPlaceOfOriginData] = useState<
    PlaceOfOriginData[]
  >([]);
  const [filteredData, setFilteredData] = useState<PlaceOfOriginData[]>([]);
  const [filterType, setFilterType] = useState<"year" | "total">("total");
  const [selectedYear, setSelectedYear] = useState<string>("");

  // Fetch data
  const fetchData = async () => {
    const data = await getPlaceOfOrigin();
    setPlaceOfOriginData(data);
    setFilteredData(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Get unique years for dropdown
  const uniqueYears = [
    ...new Set(placeOfOriginData.map((item) => item.year)),
  ].sort((a, b) => b - a);

  // Filter data based on selected filter type
  useEffect(() => {
    if (filterType === "year" && selectedYear) {
      const filtered = placeOfOriginData.filter(
        (item) => item.year === Number(selectedYear)
      );
      setFilteredData(filtered);
    } else if (filterType === "total") {
      setFilteredData(placeOfOriginData);
    }
  }, [filterType, selectedYear, placeOfOriginData]);

  // Compute totals for bar chart based on filtered data
  const totals = filteredData.reduce(
    (acc, cur) => {
      acc.regionI += cur.regionI || 0;
      acc.regionII += cur.regionII || 0;
      acc.regionIII += cur.regionIII || 0;
      acc.regionIVA += cur.regionIVA || 0;
      acc.regionIVB += cur.regionIVB || 0;
      acc.regionV += cur.regionV || 0;
      acc.regionVI += cur.regionVI || 0;
      acc.regionVII += cur.regionVII || 0;
      acc.regionVIII += cur.regionVIII || 0;
      acc.regionIX += cur.regionIX || 0;
      acc.regionX += cur.regionX || 0;
      acc.regionXI += cur.regionXI || 0;
      acc.regionXII += cur.regionXII || 0;
      acc.regionXIII += cur.regionXIII || 0;
      acc.armm += cur.armm || 0;
      acc.car += cur.car || 0;
      acc.ncr += cur.ncr || 0;
      acc.notReported += cur.notReported || 0;
      return acc;
    },
    {
      regionI: 0,
      regionII: 0,
      regionIII: 0,
      regionIVA: 0,
      regionIVB: 0,
      regionV: 0,
      regionVI: 0,
      regionVII: 0,
      regionVIII: 0,
      regionIX: 0,
      regionX: 0,
      regionXI: 0,
      regionXII: 0,
      regionXIII: 0,
      armm: 0,
      car: 0,
      ncr: 0,
      notReported: 0,
    }
  );

  const chartData = [
    { region: "Region I - Ilocos", count: totals.regionI },
    { region: "Region II - Cagayan Valley", count: totals.regionII },
    { region: "Region III - Central Luzon", count: totals.regionIII },
    { region: "Region IV-A - CALABARZON", count: totals.regionIVA },
    { region: "Region IV-B - MIMAROPA", count: totals.regionIVB },
    { region: "Region V - Bicol", count: totals.regionV },
    { region: "Region VI - Western Visayas", count: totals.regionVI },
    { region: "Region VII - Central Visayas", count: totals.regionVII },
    { region: "Region VIII - Eastern Visayas", count: totals.regionVIII },
    { region: "Region IX - Zamboanga Peninsula", count: totals.regionIX },
    { region: "Region X - Northern Mindanao", count: totals.regionX },
    { region: "Region XI - Davao", count: totals.regionXI },
    { region: "Region XII - SOCCSKSARGEN", count: totals.regionXII },
    { region: "Region XIII - Caraga", count: totals.regionXIII },
    { region: "ARMM", count: totals.armm },
    { region: "CAR", count: totals.car },
    { region: "NCR", count: totals.ncr },
    { region: "Not Reported", count: totals.notReported },
  ];

  return (
    <div>
      {/* Filter Controls */}
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-600">Year</span>
            <span className="text-gray-400">|</span>
            <span className="font-bold text-gray-600">Total</span>
          </div>
          <div className="flex items-center gap-2">
            <div>
              <button
                onClick={() => setFilterType("year")}
                className={`px-4 py-2 border border-gray-300 rounded cursor-pointer ${
                  filterType === "year"
                    ? "bg-blue-500 text-white"
                    : "bg-white text-black"
                }`}
              >
                Year
              </button>
              {filterType === "year" && (
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="mt-1 px-2 py-1 border border-gray-300 rounded block"
                >
                  <option value="">Select Year</option>
                  {uniqueYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <button
              onClick={() => setFilterType("total")}
              className={`px-4 py-2 border border-gray-300 rounded cursor-pointer ${
                filterType === "total"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-black"
              }`}
            >
              Total
            </button>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="mb-8 bg-white border border-gray-300 rounded p-5">
        {/* Chart Title */}
        <h2 className="mb-2 text-lg text-gray-600 font-semibold">
          Filipino Emigrants by Place of Origin: 1988 - 2020
        </h2>

        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="region"
              angle={-45}
              textAnchor="end"
              height={120}
              tick={{ fontSize: 14 }}
            />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#3949AB" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default PlaceOfOrigin;
