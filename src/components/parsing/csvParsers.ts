import type { AgeRecord } from "../../services/age";
import type { SexRecord } from "../../services/sex";
import type { PlaceOfOriginData } from "../../services/placeOfOrigin";
import type { OccupationData } from "../../services/occupation";
import type { EducationRecord } from "../../services/education";
import type { CivilStatusRecord } from "../../services/civilStatus";

export const parseAgeCSV = (csvText: string): AgeRecord[] => {
  const lines = csvText.split("\n");
  if (lines.length === 0) return [];
  
  // Parse header to get year columns
  const header = lines[0].trim().split(",");
  const yearColumns: { year: number; index: number }[] = [];
  for (let i = 1; i < header.length; i++) {
    const year = parseInt(header[i].trim(), 10);
    if (!isNaN(year) && year >= 1981 && year <= 2020) {
      yearColumns.push({ year, index: i });
    }
  }
  
  // Age group mapping
  const ageGroupMapping: { [key: string]: keyof AgeRecord } = {
    "14 - Below": "age14Below",
    "15 - 19": "age15to19",
    "20 - 24": "age20to24",
    "25 - 29": "age25to29",
    "30 - 34": "age30to34",
    "35 - 39": "age35to39",
    "40 - 44": "age40to44",
    "45 - 49": "age45to49",
    "50 - 54": "age50to54",
    "55 - 59": "age55to59",
    "60 - 64": "age60to64",
    "65 - 69": "age65to69",
    "70 - Above": "age70Above",
    "Not Reported / No Response": "notReported",
  };
  
  // Initialize data structure: one record per year
  const dataMap: Map<number, AgeRecord> = new Map();
  yearColumns.forEach(({ year }) => {
    dataMap.set(year, {
      year,
      age14Below: 0,
      age15to19: 0,
      age20to24: 0,
      age25to29: 0,
      age30to34: 0,
      age35to39: 0,
      age40to44: 0,
      age45to49: 0,
      age50to54: 0,
      age55to59: 0,
      age60to64: 0,
      age65to69: 0,
      age70Above: 0,
      notReported: 0,
    });
  });
  
  // Parse each age group row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === "") continue;
    
    const columns = line.split(",");
    if (columns.length < 2) continue;
    
    const ageGroup = columns[0].trim();
    const fieldName = ageGroupMapping[ageGroup];
    
    if (fieldName) {
      // For each year, set the value for this age group
      yearColumns.forEach(({ year, index }) => {
        const record = dataMap.get(year);
        if (record && index < columns.length) {
          const value = parseInt(columns[index].trim() || "0", 10);
          if (!isNaN(value)) {
            (record as any)[fieldName] = value;
          }
        }
      });
    }
  }
  
  // Convert map to array and calculate totals
  const data = Array.from(dataMap.values());
  data.forEach((record) => {
    record.total = 
      record.age14Below +
      record.age15to19 +
      record.age20to24 +
      record.age25to29 +
      record.age30to34 +
      record.age35to39 +
      record.age40to44 +
      record.age45to49 +
      record.age50to54 +
      record.age55to59 +
      record.age60to64 +
      record.age65to69 +
      record.age70Above +
      record.notReported;
  });
  
  return data.sort((a, b) => a.year - b.year);
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
  
  // Parse header to get year columns
  const header = lines[0].trim().split(",");
  const yearColumns: { year: number; index: number }[] = [];
  for (let i = 1; i < header.length; i++) {
    const year = parseInt(header[i].trim(), 10);
    if (!isNaN(year) && year >= 1988 && year <= 2020) {
      yearColumns.push({ year, index: i });
    }
  }
  
  // Education category mapping
  const educationMapping: { [key: string]: keyof EducationRecord } = {
    "NotofSchoolingAge": "notOfSchoolingAge",
    "NoFormalEducation": "noFormalEducation",
    "ElementaryLevel": "elementaryLevel",
    "ElementaryGraduate": "elementaryGraduate",
    "HighSchoolLevel": "highSchoolLevel",
    "HighSchoolGraduate": "highSchoolGraduate",
    "VocationalLevel": "vocationalLevel",
    "VocationalGraduate": "vocationalGraduate",
    "CollegeLevel": "collegeLevel",
    "CollegeGraduate": "collegeGraduate",
    "PostGraduateLevel": "postGraduateLevel",
    "PostGraduate": "postGraduate",
    "Non-FormalEducation": "nonFormalEducation",
    "NotReported/NoResponse": "notReported",
  };
  
  // Initialize data structure: one record per year
  const dataMap: Map<number, EducationRecord> = new Map();
  yearColumns.forEach(({ year }) => {
    dataMap.set(year, {
      year,
      notOfSchoolingAge: 0,
      noFormalEducation: 0,
      elementaryLevel: 0,
      elementaryGraduate: 0,
      highSchoolLevel: 0,
      highSchoolGraduate: 0,
      vocationalLevel: 0,
      vocationalGraduate: 0,
      collegeLevel: 0,
      collegeGraduate: 0,
      postGraduateLevel: 0,
      postGraduate: 0,
      nonFormalEducation: 0,
      notReported: 0,
      total: 0,
    });
  });
  
  // Parse each education category row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === "" || line.startsWith("TOTAL")) continue;
    
    const columns = line.split(",");
    if (columns.length < 2) continue;
    
    const educationCategory = columns[0].trim();
    const fieldName = educationMapping[educationCategory];
    
    if (fieldName) {
      // For each year, set the value for this education category
      yearColumns.forEach(({ year, index }) => {
        const record = dataMap.get(year);
        if (record && index < columns.length) {
          // Remove commas and parse the value
          const valueStr = (columns[index] || "").trim().replace(/,/g, "");
          const value = parseInt(valueStr || "0", 10);
          if (!isNaN(value)) {
            (record as any)[fieldName] = value;
          }
        }
      });
    }
  }
  
  // Get total line for validation/calculation
  let totalLine: string | null = null;
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].trim();
    if (row.startsWith("TOTAL")) {
      totalLine = row;
      break;
    }
  }
  
  // Convert map to array and calculate totals
  const data = Array.from(dataMap.values());
  if (totalLine) {
    const totalCols = totalLine.split(",");
    data.forEach((record) => {
      const yearCol = yearColumns.find((yc) => yc.year === record.year);
      if (yearCol && yearCol.index < totalCols.length) {
        const totalStr = (totalCols[yearCol.index] || "").trim().replace(/,/g, "");
        const total = parseInt(totalStr || "0", 10);
        if (!isNaN(total)) {
          record.total = total;
        } else {
          // Calculate total from all categories if parsing fails
          record.total = 
            record.notOfSchoolingAge +
            record.noFormalEducation +
            record.elementaryLevel +
            record.elementaryGraduate +
            record.highSchoolLevel +
            record.highSchoolGraduate +
            record.vocationalLevel +
            record.vocationalGraduate +
            record.collegeLevel +
            record.collegeGraduate +
            record.postGraduateLevel +
            record.postGraduate +
            record.nonFormalEducation +
            record.notReported;
        }
      } else {
        // Calculate total from all categories
        record.total = 
          record.notOfSchoolingAge +
          record.noFormalEducation +
          record.elementaryLevel +
          record.elementaryGraduate +
          record.highSchoolLevel +
          record.highSchoolGraduate +
          record.vocationalLevel +
          record.vocationalGraduate +
          record.collegeLevel +
          record.collegeGraduate +
          record.postGraduateLevel +
          record.postGraduate +
          record.nonFormalEducation +
          record.notReported;
      }
    });
  } else {
    // Calculate total from all categories if no total line found
    data.forEach((record) => {
      record.total = 
        record.notOfSchoolingAge +
        record.noFormalEducation +
        record.elementaryLevel +
        record.elementaryGraduate +
        record.highSchoolLevel +
        record.highSchoolGraduate +
        record.vocationalLevel +
        record.vocationalGraduate +
        record.collegeLevel +
        record.collegeGraduate +
        record.postGraduateLevel +
        record.postGraduate +
        record.nonFormalEducation +
        record.notReported;
    });
  }
  
  return data.sort((a, b) => a.year - b.year);
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

