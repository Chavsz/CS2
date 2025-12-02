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
import { getSexes, type SexRecord } from "../../services/sex";

//icons
import { GoPersonAdd } from "react-icons/go";

const Sex = () => {
  const [data, setData] = useState<SexRecord[]>([]);

  useEffect(() => {
    (async () => {
      const rows = await getSexes();
      rows.sort((a, b) => a.year - b.year);
      setData(rows);
    })();
  }, []);

  return (
    <div>
      <div className="mb-5 flex gap-2">
        <div className="rounded-md border border-gray-300 p-4 w-[200px] bg-white">
          <div className="flex items-center gap-3 mb-2.5">
            <div className="w-6.5 h-6.5 bg-white rounded-md border border-indigo-600 flex items-center justify-center">
            <GoPersonAdd className="text-indigo-600 text-md" />
            </div>
            <p className="text-gray-600 text-md">Total Males</p>
          </div>
          <p className="text-black font-medium text-2xl">
            {data.reduce((sum, record) => sum + (record.male ?? 0), 0).toLocaleString()}
          </p>
        </div>

        <div className="rounded-md border border-gray-300 p-4 w-[200px] bg-white">
          <div className="flex items-center gap-3 mb-2.5">
            <div className="w-6.5 h-6.5 bg-white rounded-md border border-indigo-600 flex items-center justify-center">
            <GoPersonAdd className="text-indigo-600 text-md" />
            </div>
            <p className="text-gray-600 text-md">Total Females</p>
          </div>
          <p className="text-black font-medium text-2xl">
            {data.reduce((sum, record) => sum + (record.female ?? 0), 0).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mb-8 bg-white border border-gray-300 rounded py-4 px-3">
        <h2 className="text-xl font-semibold text-gray-600 mb-3">
          Sex: Male vs Female by Year
        </h2>
        <div className="w-full h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} interval={0} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(v: number) => v.toLocaleString()}
                labelFormatter={(l) => `Year: ${l}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="male"
                name="Male"
                stroke="#3b82f6"
                strokeWidth={1}
              />
              <Line
                type="monotone"
                dataKey="female"
                name="Female"
                stroke="#ec4899"
                strokeWidth={1}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Sex;
