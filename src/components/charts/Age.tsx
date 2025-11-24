import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { getAges, type AgeRecord } from "../../services/age";

import { GoPersonAdd } from "react-icons/go";

const Age = () => {
  const [data, setData] = useState<AgeRecord[]>([]);
  const [showTotal, setShowTotal] = useState(false);

  useEffect(() => {
    (async () => {
      const rows = await getAges();
      // Ensure sorted by year for the line chart
      rows.sort((a, b) => a.year - b.year);
      setData(rows);
    })();
  }, []);

  // Color palette for age groups
  const ageGroupColors: { [key: string]: string } = {
    age14Below: "#ef4444", // red
    age15to19: "#ec4899", // pink
    age20to24: "#a855f7", // purple
    age25to29: "#2563eb", // darker blue
    age30to34: "#f97316", // orange
    age35to39: "#22c55e", // green
    age40to44: "#16a34a", // dark green
    age45to49: "#84cc16", // light green
    age50to54: "#9333ea", // light purple
    age55to59: "#3b82f6", // blue
    age60to64: "#eab308", // yellow
    age65to69: "#14b8a6", // teal
    age70Above: "#3949AB", // indigo
    notReported: "#000000", // grey
    total: "#3949AB", // indigo
  };

  const ageGroupLabels: { [key: string]: string } = {
    age14Below: "14 - Below",
    age15to19: "15 - 19",
    age20to24: "20 - 24",
    age25to29: "25 - 29",
    age30to34: "30 - 34",
    age35to39: "35 - 39",
    age40to44: "40 - 44",
    age45to49: "45 - 49",
    age50to54: "50 - 54",
    age55to59: "55 - 59",
    age60to64: "60 - 64",
    age65to69: "65 - 69",
    age70Above: "70 - Above",
    notReported: "Not Reported / No Response",
    total: "Total",
  };

  const ageGroupKeys = [
    "age14Below",
    "age15to19",
    "age20to24",
    "age25to29",
    "age30to34",
    "age35to39",
    "age40to44",
    "age45to49",
    "age50to54",
    "age55to59",
    "age60to64",
    "age65to69",
    "age70Above",
    "notReported",
  ];

  return (
    <div className="">
      <div className="inline-block mb-5">
        <div className="rounded-md border border-gray-300 p-4 w-[200px] bg-white">
          <div className="flex items-center gap-3 mb-2.5">
            <div className="w-6.5 h-6.5 bg-white rounded-md border border-indigo-600 flex items-center justify-center">
            <GoPersonAdd className="text-indigo-600 text-md" />
            </div>
            <p className="text-gray-600 text-md">Total</p>
          </div>
          <p className="text-black font-medium text-2xl">
            {data.reduce((sum, record) => sum + (record.total ?? 0), 0).toLocaleString()}
          </p>
        </div>
      </div>

      <div className=" bg-white border border-gray-300 rounded pt-3 px-3">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold text-gray-600">
            Age: Emigrants by Age Group
          </h2>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showTotal}
              onChange={(e) => setShowTotal(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Show Total</span>
          </label>
        </div>
        <div className="w-full h-[520px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="4 4" />
              <XAxis 
                dataKey="year" 
                tick={{ fontSize: 11 }} 
                angle={-45}
                textAnchor="end"
                height={30}
                interval={1}
              />
              <YAxis 
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip
                formatter={(value: number) => value.toLocaleString()}
                labelFormatter={(label) => `Year: ${label}`}
                contentStyle={{ 
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  fontSize: "12px"
                }}
                itemStyle={{ fontSize: "12.5px" }}
                labelStyle={{ fontSize: "12.5px" }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: "20px" }}
                iconType="line"
              />
              {!showTotal && ageGroupKeys.map((key) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={ageGroupLabels[key]}
                  stroke={ageGroupColors[key]}
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
              ))}
              {showTotal && (
                <Line
                  type="monotone"
                  dataKey="total"
                  name={ageGroupLabels.total}
                  stroke={ageGroupColors.total}
                  strokeWidth={3}
                  dot={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Age;
