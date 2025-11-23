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
  getEducations,
  type EducationRecord,
} from "../../services/education";

// Color palette for education categories
const getEducationColors = (): { [key: string]: string } => {
  const colors = [
    "#ef4444", "#ec4899", "#a855f7", "#2563eb", "#f97316", "#22c55e",
    "#16a34a", "#84cc16", "#9333ea", "#3b82f6", "#eab308", "#14b8a6",
    "#3949AB", "#f59e0b"
  ];
  
  const educationKeys = [
    "notOfSchoolingAge",
    "noFormalEducation",
    "elementaryLevel",
    "elementaryGraduate",
    "highSchoolLevel",
    "highSchoolGraduate",
    "vocationalLevel",
    "vocationalGraduate",
    "collegeLevel",
    "collegeGraduate",
    "postGraduateLevel",
    "postGraduate",
    "nonFormalEducation",
    "notReported",
  ];
  
  const colorMap: { [key: string]: string } = {};
  educationKeys.forEach((key, index) => {
    colorMap[key] = colors[index % colors.length];
  });
  
  return colorMap;
};

const Education = () => {
  const [data, setData] = useState<EducationRecord[]>([]);

  useEffect(() => {
    (async () => {
      const rows = await getEducations();
      // Ensure sorted by year for the line chart
      rows.sort((a, b) => a.year - b.year);
      setData(rows);
    })();
  }, []);

  // Education category labels
  const educationLabels: { [key: string]: string } = {
    notOfSchoolingAge: "Not of Schooling Age",
    noFormalEducation: "No Formal Education",
    elementaryLevel: "Elementary Level",
    elementaryGraduate: "Elementary Graduate",
    highSchoolLevel: "High School Level",
    highSchoolGraduate: "High School Graduate",
    vocationalLevel: "Vocational Level",
    vocationalGraduate: "Vocational Graduate",
    collegeLevel: "College Level",
    collegeGraduate: "College Graduate",
    postGraduateLevel: "Post Graduate Level",
    postGraduate: "Post Graduate",
    nonFormalEducation: "Non-Formal Education",
    notReported: "Not Reported / No Response",
  };

  const educationKeys = [
    "notOfSchoolingAge",
    "noFormalEducation",
    "elementaryLevel",
    "elementaryGraduate",
    "highSchoolLevel",
    "highSchoolGraduate",
    "vocationalLevel",
    "vocationalGraduate",
    "collegeLevel",
    "collegeGraduate",
    "postGraduateLevel",
    "postGraduate",
    "nonFormalEducation",
    "notReported",
  ];

  // Get colors for each education category
  const educationColors = getEducationColors();

  return (
    <div className="w-full">
      <div className="bg-white border border-gray-300 rounded pt-3 px-3">
        <div className="mb-3">
          <h2 className="text-xl font-semibold text-gray-600">
            Education: Emigrants by Educational Attainment
          </h2>
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
              {educationKeys.map((key) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={educationLabels[key]}
                  stroke={educationColors[key]}
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Education;
