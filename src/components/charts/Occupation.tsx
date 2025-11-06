import { useEffect, useState } from "react";
import {
  getOccupation,
  type OccupationData,
} from "../../services/occupation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function Occupation() {
  const [occupationData, setOccupationData] = useState<OccupationData[]>([]);
  const [filteredData, setFilteredData] = useState<OccupationData[]>([]);
  const [filterType, setFilterType] = useState<"year" | "total">("total");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<
    "all" | "employed" | "unemployed"
  >("all");

  // Fetch data
  const fetchData = async () => {
    const data = await getOccupation();
    setOccupationData(data);
    setFilteredData(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Get unique years for dropdown
  const uniqueYears = [
    ...new Set(occupationData.map((item) => item.year)),
  ].sort((a, b) => b - a);

  // Filter data based on selected filter type
  useEffect(() => {
    if (filterType === "year" && selectedYear) {
      const filtered = occupationData.filter(
        (item) => item.year === Number(selectedYear)
      );
      setFilteredData(filtered);
    } else if (filterType === "total") {
      setFilteredData(occupationData);
    }
  }, [filterType, selectedYear, occupationData]);

  // Compute totals for histogram based on filtered data
  const totals = filteredData.reduce(
    (acc, cur) => {
      acc.professionalTechnical += cur.professionalTechnical || 0;
      acc.managerialExecutive += cur.managerialExecutive || 0;
      acc.clericalWorkers += cur.clericalWorkers || 0;
      acc.salesWorkers += cur.salesWorkers || 0;
      acc.serviceWorkers += cur.serviceWorkers || 0;
      acc.agriculturalWorkers += cur.agriculturalWorkers || 0;
      acc.productionTransportLaborers += cur.productionTransportLaborers || 0;
      acc.armedForces += cur.armedForces || 0;
      acc.housewives += cur.housewives || 0;
      acc.retirees += cur.retirees || 0;
      acc.students += cur.students || 0;
      acc.minors += cur.minors || 0;
      acc.outOfSchoolYouth += cur.outOfSchoolYouth || 0;
      acc.refugees += cur.refugees || 0;
      acc.noOccupationReported += cur.noOccupationReported || 0;
      return acc;
    },
    {
      professionalTechnical: 0,
      managerialExecutive: 0,
      clericalWorkers: 0,
      salesWorkers: 0,
      serviceWorkers: 0,
      agriculturalWorkers: 0,
      productionTransportLaborers: 0,
      armedForces: 0,
      housewives: 0,
      retirees: 0,
      students: 0,
      minors: 0,
      outOfSchoolYouth: 0,
      refugees: 0,
      noOccupationReported: 0,
    }
  );

  // Create histogram data based on category filter
  const getHistogramData = () => {
    const allCategories = [
      { category: "Students", count: totals.students, type: "unemployed" },
      { category: "Housewives", count: totals.housewives, type: "unemployed" },
      {
        category: "No Occupation",
        count: totals.noOccupationReported,
        type: "unemployed",
      },
      {
        category: "Professional/Technical",
        count: totals.professionalTechnical,
        type: "employed",
      },
      { category: "Minors", count: totals.minors, type: "unemployed" },
      {
        category: "Sales Workers",
        count: totals.salesWorkers,
        type: "employed",
      },
      { category: "Retirees", count: totals.retirees, type: "unemployed" },
      {
        category: "Production/Transport",
        count: totals.productionTransportLaborers,
        type: "employed",
      },
      {
        category: "Clerical Workers",
        count: totals.clericalWorkers,
        type: "employed",
      },
      {
        category: "Service Workers",
        count: totals.serviceWorkers,
        type: "employed",
      },
      {
        category: "Agriculture/Fishery",
        count: totals.agriculturalWorkers,
        type: "employed",
      },
      {
        category: "Managerial/Executive",
        count: totals.managerialExecutive,
        type: "employed",
      },
      {
        category: "Out of School Youth",
        count: totals.outOfSchoolYouth,
        type: "unemployed",
      },
      { category: "Armed Forces", count: totals.armedForces, type: "employed" },
    ];

    // Sort by count in descending order
    const sortedCategories = allCategories.sort((a, b) => b.count - a.count);

    // Filter based on category filter
    if (categoryFilter === "employed") {
      return sortedCategories.filter((cat) => cat.type === "employed");
    } else if (categoryFilter === "unemployed") {
      return sortedCategories.filter((cat) => cat.type === "unemployed");
    }

    return sortedCategories;
  };

  const chartData = getHistogramData();

  return (
    <div className="">
      {/* Filter Controls */}
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-5">
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

      {/* Chart Title and Category Filters */}
      <div className="mb-5">
        <h2 className="mb-3 text-lg font-bold">
          Filipino Emigrants by Occupation
        </h2>
        <p className="mb-4 text-sm text-gray-600">
          Registered Filipino emigrants by major occupational group (1981-2020)
        </p>

        {/* Category Filter Buttons */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setCategoryFilter("all")}
            className={`px-4 py-2 rounded text-sm font-medium ${
              categoryFilter === "all"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            All Categories
          </button>
          <button
            onClick={() => setCategoryFilter("employed")}
            className={`px-4 py-2 rounded text-sm font-medium ${
              categoryFilter === "employed"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Employed Only
          </button>
          <button
            onClick={() => setCategoryFilter("unemployed")}
            className={`px-4 py-2 rounded text-sm font-medium ${
              categoryFilter === "unemployed"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Unemployed Only
          </button>
        </div>
      </div>

      {/* Histogram Chart */}
      <div className="mb-8 bg-white border border-gray-300 rounded p-5">
        <ResponsiveContainer width="100%" height={500}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="category"
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 12 }}
              interval={0}
            />
            <YAxis
              label={{
                value: "Number of Emigrants",
                angle: -90,
                position: "insideLeft",
              }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value: number) => [
                value.toLocaleString(),
                "Total Emigrants",
              ]}
              labelStyle={{ color: "#374151" }}
              contentStyle={{
                backgroundColor: "#f9fafb",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
              }}
            />
            <Bar dataKey="count" fill="#16a34a" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}

export default Occupation;
