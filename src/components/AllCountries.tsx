import { useEffect, useMemo, useState } from 'react'
import { ResponsiveChoropleth } from '@nivo/geo'
import { addCountryYear, getCountryYears, type CountryYearRecord } from '../services/allCountries'

type NivoDatum = { id: string; value: number }

// Countries sourced from the provided CSV (grand total removed)
const CSV_COUNTRIES: string[] = [
  'ALBANIA','ANDORRA','ANGOLA','ANGUILLA','ANTIGUA AND BARBUDA','ARGENTINA','ARUBA','AUSTRALIA','AUSTRIA','BAHAMAS','BAHRAIN','BANGLADESH','BELGIUM','BERMUDA','BOLIVIA','BOSNIA AND HERZEGOVINA','BRAZIL','BRITISH VIRGIN ISLANDS','BRUNEI DARUSSALAM','BULGARIA','CANADA','CAYMAN ISLANDS','CHANNEL ISLAND','CHILE','CHINA (P.R.O.C.)','COCOS (KEELING) ISLAND','COLOMBIA','COSTA RICA','CROATIA','CYPRUS','CZECH REPUBLIC','DEMOCRATIC KAMPUCHEA','DEMOCRATIC REPUBLIC OF THE CONGO (ZAIRE)','DENMARK','DOMINICAN REPUBLIC','ECUADOR','EGYPT','ESTONIA','ETHIOPIA','FAROE ISLANDS','FALKLAND ISLANDS (MALVINAS)','FIJI','FINLAND','FRANCE','FRENCH POLYNESIA','GABON','GERMANY','GHANA','GIBRALTAR','REECE','GREENLAND','HONGKONG','HUNGARY','ICELAND','INDIA','INDONESIA','IRAN','IRAQ','IRELAND','ISLE OF MAN','ISRAEL','ITALY','JAPAN','JORDAN','KAZAKHSTAN','KIRIBATI','KUWAIT','LATVIA','LEBANON','LEICHTENSTEIN','LESOTHO','LIBERIA','LIBYA','LITHUANIA','LUXEMBOURG','MACAU','MACEDONIA','MALAYSIA','MALDIVES','MALTA','MARSHALL ISLANDS','MAURITIUS','MEXICO','MIDWAY ISLAND','MONACO','MOROCCO','MYANMAR (BURMA)','NAMIBIA','NEPAL','NETHERLANDS','NETHERLANDS ANTILLES','NEW CALEDONIA','NEW ZEALAND','NIGERIA','NORWAY','OMAN','PACIFIC ISLANDS','PAKISTAN','PALAU','PANAMA','PAPUA NEW GUINEA','PERU','POLAND','PORTUGAL','PUERTO RICO','QATAR','ROMANIA','RUSSIAN FEDERATION / USSR','SAN MARINO','SAUDI ARABIA','SEYCHELLES','SINGAPORE','SLOVAK REPUBLIC','SLOVENIA','SOLOMON ISLANDS','SOUTH AFRICA','SOUTH KOREA','SPAIN','SRI LANKA','SUDAN','SWEDEN','SWITZERLAND','SYRIA','TAIWAN (ROC)','THAILAND','TRINIDAD AND TOBAGO','TUNISIA','TURKEY','TURKS AND CAICOS ISLANDS','UGANDA','UKRAINE','UNITED ARAB EMIRATES','UNITED KINGDOM','UNITED STATES OF AMERICA','URUGUAY','VANUATU','VENEZUELA','VIETNAM','WAKE ISLAND','YEMEN','YUGOSLAVIA (Serbia & Montenegro)'
]

function normalizeCountryName(name: string): string {
  return name
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .replace(/\s*&\s*/g, ' & ')
    .replace(/[().,']/g, '')
    .replace(/-/g, ' ')
    .trim()
}

// Alias map from CSV country labels to modern/common names present in the GeoJSON
const CSV_NAME_ALIASES: Record<string, string> = {
  'CHINA PROC': 'CHINA',
  'HONGKONG': 'HONG KONG',
  'TAIWAN ROC': 'TAIWAN',
  'SOUTH KOREA': 'SOUTH KOREA',
  'RUSSIAN FEDERATION / USSR': 'RUSSIA',
  'CZECH REPUBLIC': 'CZECH REPUBLIC',
  'SLOVAK REPUBLIC': 'SLOVAKIA',
  'DEMOCRATIC REPUBLIC OF THE CONGO ZAIRE': 'DEMOCRATIC REPUBLIC OF THE CONGO',
  'DEMOCRATIC KAMPUCHEA': 'CAMBODIA',
  'MYANMAR BURMA': 'MYANMAR',
  'MACEDONIA': 'NORTH MACEDONIA',
  'UNITED STATES OF AMERICA': 'UNITED STATES OF AMERICA',
  'UNITED KINGDOM': 'UNITED KINGDOM',
  'BRUNEI DARUSSALAM': 'BRUNEI',
}

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

  // Build dropdown options from CSV countries filtered by available GeoJSON features
  const countryOptions = useMemo(() => {
    if (!features) return [] as { label: string; value: string }[]

    // Map normalized GeoJSON country name -> ISO3 id
    const nameToIso3 = new Map<string, string>()
    for (const f of features) {
      const label = (f?.properties?.name ?? f?.properties?.NAME ?? '').toString()
      const id = (f?.id ?? f?.properties?.iso_a3 ?? '').toString()
      if (!label || !id) continue
      nameToIso3.set(normalizeCountryName(label), id)
    }

    const opts: { label: string; value: string }[] = []
    for (const raw of CSV_COUNTRIES) {
      if (raw === 'GRAND TOTAL') continue
      const normalized = normalizeCountryName(raw)
      const alias = CSV_NAME_ALIASES[normalized] ?? normalized
      const iso = nameToIso3.get(alias)
      if (iso) {
        // Use title case label for nice display
        const niceLabel = raw
          .toLowerCase()
          .split(' ')
          .map(s => (s.length ? s[0].toUpperCase() + s.slice(1) : s))
          .join(' ')
          .replace(' And ', ' and ')
        opts.push({ label: niceLabel, value: iso })
      } else {
        // Not found in GeoJSON, skip silently
      }
    }
    return opts.sort((a, b) => a.label.localeCompare(b.label))
  }, [features])

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
          <label className="text-sm text-gray-600">Country</label>
          <select
            className="border border-gray-300 rounded-md px-2 py-1 min-w-64"
            value={iso3 ? iso3 : ''}
            onChange={(e) => setIso3(e.target.value)}
          >
            <option value="">Select a country…</option>
            {countryOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-gray-600">ISO3 (e.g., USA, PHL)</label>
          <input className="border border-gray-300 rounded-md px-2 py-1 w-32 uppercase" value={iso3} onChange={(e) => setIso3(e.target.value)} placeholder="PHL" required />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-gray-600">Count</label>
          <input type="number" className="border border-gray-300 rounded-md px-2 py-1 w-32" value={count} onChange={(e) => setCount(e.target.value)} required />
        </div>
        <button type="submit" disabled={saving} className="bg-blue-600 text-white rounded-md px-4 py-2 disabled:opacity-60">{saving ? 'Saving...' : 'Add'}</button>
        {/* Delete All Records */}
        <button></button>
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
    </div>
  )
}

export default AllCountries



