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

  const reload = async () => {
    const rows = await getSexes();
    rows.sort((a, b) => a.year - b.year);
    setData(rows);
  };

  

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold text-gray-600 mb-3">
        Sex: Male vs Female by Year
      </h2>

      

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

      

      
    </div>
  );
};

export default Sex;
