import type { AgeRecord } from "../../services/age";
import type { SexRecord } from "../../services/sex";
import type { PlaceOfOriginData } from "../../services/placeOfOrigin";
import type { OccupationData } from "../../services/occupation";
import type { EducationRecord } from "../../services/education";
import type { CivilStatusRecord } from "../../services/civilStatus";

export const parseAgeCSV = (csvText: string): AgeRecord[] => {
  const lines = csvText.split("\n");
  const data: AgeRecord[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === "") continue;
    const columns = line.split(",");
    if (columns.length >= 2) {
      const year = parseInt(columns[0].trim(), 10);
      const total = parseInt(columns[1].trim(), 10);
      if (!isNaN(year) && !isNaN(total) && total > 0) {
        data.push({ year, total });
      }
    }
  }
  return data;
};

export const parseMajorCountriesCSV = (csvText: string) => {
  const lines = csvText.split("\n");
  const data: any[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === "" || line.includes("TOTAL") || line.includes("% to TOTAL"))
      continue;
    const columns = line.split(",");
    if (columns.length >= 13) {
      const year = parseInt(columns[0].trim(), 10);
      if (!isNaN(year) && year >= 1981 && year <= 2020) {
        const record = {
          year,
          Usa: parseInt(columns[1].trim() || "0", 10),
          Canada: parseInt(columns[2].trim() || "0", 10),
          Japan: parseInt(columns[3].trim() || "0", 10),
          Australia: parseInt(columns[4].trim() || "0", 10),
          Italy: parseInt(columns[5].trim() || "0", 10),
          NewZealand: parseInt(columns[6].trim() || "0", 10),
          UnitedKingdom: parseInt(columns[7].trim() || "0", 10),
          Germany: parseInt(columns[8].trim() || "0", 10),
          SouthKorea: parseInt(columns[9].trim() || "0", 10),
          Spain: parseInt(columns[10].trim() || "0", 10),
          Others: parseInt(columns[11].trim() || "0", 10),
        };
        data.push(record);
      }
    }
  }
  return data;
};

export const parseSexCSV = (csvText: string): SexRecord[] => {
  const lines = csvText.split("\n");
  const data: SexRecord[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === "") continue;
    const columns = line.split(",");
    if (columns.length >= 4) {
      const year = parseInt(columns[0].trim(), 10);
      const male = parseInt(columns[1].trim().replace(/,/g, ""), 10);
      const female = parseInt(columns[2].trim().replace(/,/g, ""), 10);
      if (!isNaN(year) && !isNaN(male) && !isNaN(female) && year >= 1981 && year <= 2020) {
        data.push({ year, male, female });
      }
    }
  }
  return data;
};

export const parsePlaceOfOriginCSV = (csvText: string): PlaceOfOriginData[] => {
  const lines = csvText.split("\n");
  const data: PlaceOfOriginData[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === "" || line.includes("TOTAL")) continue;
    const columns = line.split(",");
    if (columns.length >= 35) {
      const region = columns[0].trim();
      const regionMapping: { [key: string]: string } = {
        "RegionI-IlocosRegion": "regionI",
        "RegionII-CagayanValley": "regionII",
        "RegionIII-CentralLuzon": "regionIII",
        "RegionIVA-CALABARZON": "regionIVA",
        "RegionIVB-MIMAROPA": "regionIVB",
        "RegionV-BicolRegion": "regionV",
        "RegionVI-WesternVisayas": "regionVI",
        "RegionVII-CentralVisayas": "regionVII",
        "RegionVIII-EasternVisayas": "regionVIII",
        "RegionIX-ZamboangaPeninsula": "regionIX",
        "RegionX-NorthernMindanao": "regionX",
        "RegionXI-DavaoRegion": "regionXI",
        "RegionXII-SOCCSKSARGEN": "regionXII",
        "RegionXIII-Caraga": "regionXIII",
        "AutonomousRegioninMuslimMindanao(ARMM)": "armm",
        "CordilleraAdministrativeRegion(CAR)": "car",
        "NationalCapitalRegion(NCR)": "ncr",
        "NotReported/NoResponse": "notReported",
      };
      const fieldName = regionMapping[region];
      if (fieldName) {
        for (let year = 1988; year <= 2020; year++) {
          const columnIndex = year - 1988 + 1;
          if (columnIndex < columns.length) {
            const value = parseInt(columns[columnIndex].trim() || "0", 10);
            if (!isNaN(value) && value > 0) {
              let existingRecord = data.find((d) => d.year === year);
              if (!existingRecord) {
                existingRecord = {
                  year,
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
                };
                data.push(existingRecord);
              }
              (existingRecord as any)[fieldName] = value;
            }
          }
        }
      }
    }
  }
  return data;
};

export const parseOccupationCSV = (csvText: string): OccupationData[] => {
  const lines = csvText.split("\n");
  const data: OccupationData[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === "" || line.includes("TOTAL")) continue;
    const columns = line.split(",");
    if (columns.length >= 42) {
      const occupation = columns[0].trim();
      const occupationMapping: { [key: string]: string } = {
        "Prof'lTech'l&RelatedWorkers": "professionalTechnical",
        ManagerialExecutiveandAdministrativeWorkers: "managerialExecutive",
        ClericalWorkers: "clericalWorkers",
        SalesWorkers: "salesWorkers",
        ServiceWorkers: "serviceWorkers",
        "AgriAnimalHusbandryForestryWorkers&Fishermen": "agriculturalWorkers",
        "ProductionProcessTransportEquipmentOperators&Laborers":
          "productionTransportLaborers",
        MembersoftheArmedForces: "armedForces",
        Housewives: "housewives",
        Retirees: "retirees",
        Students: "students",
        "Minors(Below7yearsold)": "minors",
        OutofSchoolYouth: "outOfSchoolYouth",
        Refugees: "refugees",
        NoOccupationReported: "noOccupationReported",
      };
      const fieldName = occupationMapping[occupation];
      if (fieldName) {
        for (let year = 1981; year <= 2020; year++) {
          const columnIndex = year - 1981 + 1;
          if (columnIndex < columns.length) {
            const value = parseInt(columns[columnIndex].trim() || "0", 10);
            if (!isNaN(value) && value > 0) {
              let existingRecord = data.find((d) => d.year === year);
              if (!existingRecord) {
                existingRecord = {
                  year,
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
                };
                data.push(existingRecord);
              }
              (existingRecord as any)[fieldName] = value;
            }
          }
        }
      }
    }
  }
  return data;
};

export const parseEducationCSV = (csvText: string): EducationRecord[] => {
  const lines = csvText.split("\n");
  if (lines.length === 0) return [];
  const header = lines[0].trim().split(",");
  const yearStart = 1988;
  const yearEnd = 2020;
  const yearToCol: Record<number, number> = {};
  for (let y = yearStart; y <= yearEnd; y++) {
    const idx = header.findIndex((h) => h.trim() === String(y));
    if (idx !== -1) yearToCol[y] = idx;
  }
  if (Object.keys(yearToCol).length === 0) return [];
  let collegeLine: string | null = null;
  let totalLine: string | null = null;
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].trim();
    if (!row) continue;
    if (row.startsWith("CollegeGraduate")) collegeLine = row;
    if (row.startsWith("TOTAL")) totalLine = row;
  }
  if (!collegeLine || !totalLine) return [];
  const collegeCols = collegeLine.split(",");
  const totalCols = totalLine.split(",");
  const result: EducationRecord[] = [];
  for (let y = yearStart; y <= yearEnd; y++) {
    const col = yearToCol[y];
    if (col == null) continue;
    const total = parseInt((totalCols[col] || "").trim() || "0", 10);
    const grad = parseInt((collegeCols[col] || "").trim() || "0", 10);
    if (!Number.isNaN(y) && !Number.isNaN(total)) {
      const rec: EducationRecord = { year: y, total };
      if (!Number.isNaN(grad)) rec.graduates = grad;
      result.push(rec);
    }
  }
  return result;
};

export const normalizeCountryName = (name: string): string =>
  name.toUpperCase().replace(/\s+/g, " ").replace(/\s*&\s*/g, " & ").replace(/[().,'*]/g, "").replace(/-/g, " ").replace(/\s*\*+\s*$/, "").trim();

const CSV_NAME_ALIASES: Record<string, string> = {
  "CHINA PROC": "CHINA",
  HONGKONG: "HONG KONG",
  "TAIWAN ROC": "TAIWAN",
  "RUSSIAN FEDERATION / USSR": "RUSSIA",
  "DEMOCRATIC REPUBLIC OF THE CONGO ZAIRE": "DEMOCRATIC REPUBLIC OF THE CONGO",
  "DEMOCRATIC KAMPUCHEA": "CAMBODIA",
  "MYANMAR BURMA": "MYANMAR",
  MACEDONIA: "NORTH MACEDONIA",
  "SLOVAK REPUBLIC": "SLOVAKIA",
  "CZECH REPUBLIC": "CZECH REPUBLIC",
  "UNITED KINGDOM OF GREAT BRITAIN AND NORTHERN IRELAND": "UNITED KINGDOM",
};

export const parseAllCountriesCSV = (csvText: string, nameToIso3: Map<string, string>): { iso3: string; count: number; raw: string }[] => {
  const lines = csvText.split("\n");
  const data: { iso3: string; count: number; raw: string }[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const [rawCountryPart, rawCountPart] = line.split(",");
    if (!rawCountryPart || !rawCountPart) continue;
    const country = rawCountryPart.replace(/"/g, "").trim();
    const upper = country.toUpperCase();
    if (upper === "GRAND TOTAL") continue;
    const countStr = rawCountPart.replace(/"/g, "").replace(/,/g, "").trim();
    const count = parseInt(countStr, 10);
    if (Number.isNaN(count) || count <= 0) continue;
    if (/^[A-Z]{3}$/.test(upper)) {
      data.push({ iso3: upper, count, raw: country });
      continue;
    }
    const normalized = normalizeCountryName(country);
    const alias = CSV_NAME_ALIASES[normalized] ?? normalized;
    const iso3 = nameToIso3.get(alias);
    if (iso3) {
      data.push({ iso3, count, raw: country });
    }
  }
  return data;
};

export const parseCivilStatusCSV = (csvText: string): CivilStatusRecord[] => {
  const lines = csvText.split("\n");
  const data: CivilStatusRecord[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === "" || line.startsWith("TOTAL")) continue;
    const columns = line.split(",");
    if (columns.length >= 7) {
      const year = parseInt(columns[0].trim(), 10);
      const single = parseInt(columns[1].trim(), 10);
      const married = parseInt(columns[2].trim(), 10);
      const widower = parseInt(columns[3].trim(), 10);
      const separated = parseInt(columns[4].trim(), 10);
      const divorced = parseInt(columns[5].trim(), 10);
      const notReported = parseInt(columns[6].trim(), 10);
      if ([year, single, married, widower, separated, divorced, notReported].every((v) => !Number.isNaN(v))) {
        data.push({ year, single, married, widower, separated, divorced, notReported });
      }
    }
  }
  return data;
};

