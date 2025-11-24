import { useEffect, useMemo, useState } from "react";
import { ResponsiveChoropleth } from "@nivo/geo";
import {
  getCountryYears,
  type CountryYearRecord,
} from "../../services/allCountries";

type NivoDatum = { id: string; value: number };

const AllCountries = () => {
  const [rows, setRows] = useState<CountryYearRecord[]>([]);

  useEffect(() => {
    (async () => {
      const r = await getCountryYears();
      setRows(r);
    })();
  }, []);

  const [features, setFeatures] = useState<any[] | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const WORLD_GEOJSON_URL =
          "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";
        const res = await fetch(WORLD_GEOJSON_URL);
        const json = await res.json();
        setFeatures(json.features);
      } catch (e) {
        console.error("Failed to load world features", e);
      }
    })();
  }, []);

  const data: NivoDatum[] = useMemo(() => {
    // Sum counts by ISO3 across all years to show total over dataset
    const map = new Map<string, number>();
    for (const r of rows) {
      map.set(r.iso3, (map.get(r.iso3) ?? 0) + r.count);
    }
    return Array.from(map.entries()).map(([id, value]) => ({ id, value }));
  }, [rows]);

  return (
    <div className="w-full">
      <div className="mb-8 bg-white border border-gray-300 rounded py-4 px-3">
        <h2 className="text-xl font-semibold text-gray-600 mb-3">
          World Choropleth: Total Counts by Country
        </h2>

        <div className="w-full h-[500px]">
          {features && (
            <ResponsiveChoropleth
              data={data}
              features={features}
              margin={{ top: 10, right: 20, bottom: 10, left: 20 }}
              colors={[
                "#eef2ff",
                "#e0e7ff",
                "#c7d2fe",
                "#a5b4fc",
                "#818cf8",
                "#6366f1",
                "#4f46e5",
                "#4338ca",
                "#3730a3",
                "#312e81",
              ]}
              domain={[0, Math.max(1, ...data.map((d) => d.value))]}
              unknownColor="#eeeeee"
              label="properties.name"
              valueFormat={(v) => v.toLocaleString()}
              projectionScale={120}
              projectionTranslation={[0.5, 0.6]}
              borderWidth={0.5}
              borderColor="#999"
              legends={[
                {
                  anchor: "bottom-left",
                  direction: "column",
                  translateX: 20,
                  translateY: -20,
                  itemWidth: 80,
                  itemHeight: 18,
                  itemsSpacing: 4,
                  symbolSize: 14,
                },
              ]}
              tooltip={({ feature }) => {
                const f: any = feature as any;
                const id = f.id as string;
                const value = data.find((d) => d.id === id)?.value;
                return (
                  <div className="bg-white border border-gray-200 rounded-md px-3 py-2 text-sm">
                    <div className="font-medium">{f.properties?.name}</div>
                    <div>Total: {value?.toLocaleString?.() ?? "0"}</div>
                  </div>
                );
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AllCountries;
