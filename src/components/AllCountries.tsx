import { useEffect, useMemo, useState } from 'react'
import { ResponsiveChoropleth } from '@nivo/geo'
import { addCountryYear, getCountryYears, type CountryYearRecord } from '../services/allCountries'

type NivoDatum = { id: string; value: number }

const AllCountries = () => {
  const [rows, setRows] = useState<CountryYearRecord[]>([])
  const [iso3, setIso3] = useState('')
  const [count, setCount] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    (async () => {
      const r = await getCountryYears()
      setRows(r)
    })()
  }, [])

  const [features, setFeatures] = useState<any[] | null>(null)
  useEffect(() => {
    (async () => {
      try {
        const WORLD_GEOJSON_URL = 'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson'
        const res = await fetch(WORLD_GEOJSON_URL)
        const json = await res.json()
        setFeatures(json.features)
      } catch (e) {
        console.error('Failed to load world features', e)
      }
    })()
  }, [])

  const data: NivoDatum[] = useMemo(() => {
    // Sum counts by ISO3 across all years to show total over dataset
    const map = new Map<string, number>()
    for (const r of rows) {
      map.set(r.iso3, (map.get(r.iso3) ?? 0) + r.count)
    }
    return Array.from(map.entries()).map(([id, value]) => ({ id, value }))
  }, [rows])

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const c = parseInt(count, 10)
    if (!iso3 || Number.isNaN(c)) return
    setSaving(true)
    try {
      await addCountryYear({ iso3: iso3.toUpperCase(), count: c })
      setIso3('')
      setCount('')
      const r = await getCountryYears()
      setRows(r)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold text-gray-600 mb-3">World Choropleth: Total Counts by Country</h2>

      <form onSubmit={onAdd} className="flex flex-wrap items-end gap-3 mb-4">
        <div className="flex flex-col">
          <label className="text-sm text-gray-600">ISO3 (e.g., USA, PHL)</label>
          <input className="border border-gray-300 rounded-md px-2 py-1 w-32 uppercase" value={iso3} onChange={(e) => setIso3(e.target.value)} placeholder="PHL" required />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-gray-600">Count</label>
          <input type="number" className="border border-gray-300 rounded-md px-2 py-1 w-32" value={count} onChange={(e) => setCount(e.target.value)} required />
        </div>
        <button type="submit" disabled={saving} className="bg-blue-600 text-white rounded-md px-4 py-2 disabled:opacity-60">{saving ? 'Saving...' : 'Add'}</button>
      </form>

      <div className="w-full h-[520px]">
        {features && (
        <ResponsiveChoropleth
          data={data}
          features={features}
          margin={{ top: 10, right: 20, bottom: 10, left: 20 }}
          colors="nivo"
          domain={[0, Math.max(1, ...data.map(d => d.value))]}
          unknownColor="#eeeeee"
          label="properties.name"
          valueFormat={(v) => v.toLocaleString()}
          projectionScale={120}
          projectionTranslation={[0.5, 0.6]}
          borderWidth={0.5}
          borderColor="#999"
          legends={[
            {
              anchor: 'bottom-left',
              direction: 'column',
              translateX: 20,
              translateY: -20,
              itemWidth: 80,
              itemHeight: 18,
              itemsSpacing: 4,
              symbolSize: 14,
            },
          ]}
          tooltip={({ feature }) => {
            const f: any = feature as any
            const id = f.id as string
            const value = data.find(d => d.id === id)?.value
            return (
              <div className="bg-white border border-gray-200 rounded-md px-3 py-2 text-sm">
                <div className="font-medium">{f.properties?.name}</div>
                <div>Total: {value?.toLocaleString?.() ?? '0'}</div>
              </div>
            )
          }}
        />)}
      </div>
      <p className="text-sm text-gray-500 mt-2">Enter ISO3 codes per year; the map aggregates totals across all years in your dataset.</p>
    </div>
  )
}

export default AllCountries



