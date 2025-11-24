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
import {
  getSexes,
  type SexRecord,
} from "../../services/sex";

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
    <div className="w-full">
      <h2 className="text-xl font-semibold text-gray-600 mb-3">
        Sex: Male vs Female by Year
      </h2>

      <div className="mb-8 bg-white border border-gray-300 rounded py-4 px-3">
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
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="female"
                name="Female"
                stroke="#ec4899"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Sex;
