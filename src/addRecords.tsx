import { useState } from "react";
import { addAge, deleteAllAges, type AgeRecord } from "./services/age";
import {
  addMajorCountries,
  deleteAllMajorCountries,
} from "./services/majorCountries";
import { addSex, deleteAllSex, type SexRecord } from "./services/sex";
import {
  addPlaceOfOrigin,
  deleteAllPlaceOfOrigin,
  type PlaceOfOriginData,
} from "./services/placeOfOrigin";
import {
  addOccupation,
  deleteAllOccupation,
  type OccupationData,
} from "./services/occupation";
import {
  addEducation,
  deleteAllEducation,
  type EducationRecord,
} from "./services/education";
import { addCountryYear, deleteAllCountryYears } from "./services/allCountries";
import {
  addCivilStatus,
  deleteAllCivilStatus,
  type CivilStatusRecord,
} from "./services/civilStatus";

// Reusable modal and forms
const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/15 flex justify-center items-center z-50">
    <div className="bg-white p-8 rounded-lg w-[680px] max-h-screen overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button onClick={onClose} className="px-2 py-1 text-gray-600 hover:text-black">✕</button>
      </div>
      {children}
    </div>
  </div>
);

const SimpleForm: React.FC<{ fields: { name: string; label: string }[]; values: Record<string,string>; setValues: (v: any)=>void; onSubmit: ()=>Promise<void> }> = ({ fields, values, setValues, onSubmit }) => (
  <form onSubmit={(e)=>{ e.preventDefault(); onSubmit(); }} className="grid grid-cols-3 gap-3">
    {fields.map(f => (
      <div key={f.name} className="flex flex-col">
        <label className="text-sm text-gray-600 mb-1">{f.label}</label>
        <input name={f.name} value={values[f.name] ?? ''} onChange={(e)=> setValues({ ...values, [f.name]: e.target.value })} className="border border-gray-300 rounded px-2 py-1" />
      </div>
    ))}
    <div className="col-span-3 mt-2">
      <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Save</button>
    </div>
  </form>
);

const GridForm: React.FC<{ values: Record<string,string>; setValues: (v:any)=>void; onSubmit: ()=>Promise<void> }> = ({ values, setValues, onSubmit }) => (
  <form onSubmit={(e)=>{ e.preventDefault(); onSubmit(); }}>
    <div className="grid grid-cols-3 gap-2">
      {Object.keys(values).map(key => (
        <div key={key}>
          <label className="block mb-1 font-bold">{key.charAt(0).toUpperCase()+key.slice(1).replace(/([A-Z])/g,' $1').trim()}</label>
          <input name={key} value={values[key]} onChange={(e)=> setValues({ ...values, [key]: e.target.value })} className="w-full p-2 border border-gray-300 rounded" />
        </div>
      ))}
    </div>
    <div className="flex justify-center gap-2 mt-5">
      <button type="submit" className="px-5 py-2 bg-green-500 text-white rounded">Save</button>
    </div>
  </form>
);

const AddRecords = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [ageFileName, setAgeFileName] = useState("");
  const [majorCountriesUploading, setMajorCountriesUploading] = useState(false);
  const [majorCountriesStatus, setMajorCountriesStatus] = useState("");
  const [majorCountriesFileName, setMajorCountriesFileName] = useState("");
  const [sexUploading, setSexUploading] = useState(false);
  const [sexStatus, setSexStatus] = useState("");
  const [sexFileName, setSexFileName] = useState("");
  const [placeOfOriginUploading, setPlaceOfOriginUploading] = useState(false);
  const [placeOfOriginStatus, setPlaceOfOriginStatus] = useState("");
  const [placeOfOriginFileName, setPlaceOfOriginFileName] = useState("");
  const [occupationUploading, setOccupationUploading] = useState(false);
  const [occupationStatus, setOccupationStatus] = useState("");
  const [occupationFileName, setOccupationFileName] = useState("");
  const [civilStatusUploading, setCivilStatusUploading] = useState(false);
  const [civilStatusStatus, setCivilStatusStatus] = useState("");
  const [civilStatusFileName, setCivilStatusFileName] = useState("");
  const [educationUploading, setEducationUploading] = useState(false);
  const [educationStatus, setEducationStatus] = useState("");
  const [educationFileName, setEducationFileName] = useState("");
  const [allCountriesUploading, setAllCountriesUploading] = useState(false);
  const [allCountriesStatus, setAllCountriesStatus] = useState("");
  const [allCountriesFileName, setAllCountriesFileName] = useState("");

  // Modal states
  const [showAgeModal, setShowAgeModal] = useState(false);
  const [showAllCountriesModal, setShowAllCountriesModal] = useState(false);
  const [showMajorModal, setShowMajorModal] = useState(false);
  const [showOccupationModal, setShowOccupationModal] = useState(false);
  const [showSexModal, setShowSexModal] = useState(false);
  const [showCivilModal, setShowCivilModal] = useState(false);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [showPlaceModal, setShowPlaceModal] = useState(false);

  // Forms
  const [ageForm, setAgeForm] = useState({ year: "", total: "" });
  const [allCountriesForm, setAllCountriesForm] = useState({ iso3: "", count: "" });
  const [majorForm, setMajorForm] = useState({ year: "", Usa: "", Canada: "", Japan: "", Australia: "", Italy: "", NewZealand: "", UnitedKingdom: "", Germany: "", SouthKorea: "", Spain: "", Others: "" });
  const [occupationForm, setOccupationForm] = useState({ year: "", professionalTechnical: "", managerialExecutive: "", clericalWorkers: "", salesWorkers: "", serviceWorkers: "", agriculturalWorkers: "", productionTransportLaborers: "", armedForces: "", housewives: "", retirees: "", students: "", minors: "", outOfSchoolYouth: "", refugees: "", noOccupationReported: "" });
  const [sexForm, setSexForm] = useState({ year: "", male: "", female: "" });
  const [civilForm, setCivilForm] = useState({ year: "", single: "", married: "", widower: "", separated: "", divorced: "", notReported: "" });
  const [educationForm, setEducationForm] = useState({ year: "", total: "", graduates: "" });
  const [placeForm, setPlaceForm] = useState({ year: "", regionI: "", regionII: "", regionIII: "", regionIVA: "", regionIVB: "", regionV: "", regionVI: "", regionVII: "", regionVIII: "", regionIX: "", regionX: "", regionXI: "", regionXII: "", regionXIII: "", armm: "", car: "", ncr: "", notReported: "" });

  const parseAgeCSV = (csvText: string): AgeRecord[] => {
    const lines = csvText.split("\n");
    const data: AgeRecord[] = [];

    // Skip header row (first line)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === "") continue; // Skip empty lines

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

  const parseMajorCountriesCSV = (csvText: string) => {
    const lines = csvText.split("\n");
    const data: any[] = [];

    // Skip header row (first line)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === "" || line.includes("TOTAL") || line.includes("% to TOTAL"))
        continue; // Skip empty lines and summary rows

      const columns = line.split(",");
      if (columns.length >= 13) {
        // Ensure we have enough columns (including TOTAL column)
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

  const parseSexCSV = (csvText: string): SexRecord[] => {
    const lines = csvText.split("\n");
    const data: SexRecord[] = [];

    // Skip header row (first line)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === "") continue; // Skip empty lines

      const columns = line.split(",");
      if (columns.length >= 4) {
        // YEAR, MALE, FEMALE, TOTAL
        const year = parseInt(columns[0].trim(), 10);
        const male = parseInt(columns[1].trim().replace(/,/g, ""), 10);
        const female = parseInt(columns[2].trim().replace(/,/g, ""), 10);

        if (
          !isNaN(year) &&
          !isNaN(male) &&
          !isNaN(female) &&
          year >= 1981 &&
          year <= 2020
        ) {
          data.push({ year, male, female });
        }
      }
    }

    return data;
  };

  const parsePlaceOfOriginCSV = (csvText: string): PlaceOfOriginData[] => {
    const lines = csvText.split("\n");
    const data: PlaceOfOriginData[] = [];

    // Skip header row (first line)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line === "" || line.includes("TOTAL")) {
        continue; // Skip empty lines and summary rows
      }

      const columns = line.split(",");

      if (columns.length >= 35) {
        // REGION + 33 years + TOTAL + %
        const region = columns[0].trim();

        // Map region names to the service field names
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
          // Extract data for each year from 1988 to 2020
          for (let year = 1988; year <= 2020; year++) {
            const columnIndex = year - 1988 + 1; // +1 because first column is REGION
            if (columnIndex < columns.length) {
              const value = parseInt(columns[columnIndex].trim() || "0", 10);

              if (!isNaN(value) && value > 0) {
                // Find existing record for this year or create new one
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

                // Set the value for the specific region
                (existingRecord as any)[fieldName] = value;
              }
            }
          }
        }
      }
    }

    return data;
  };

  const parseOccupationCSV = (csvText: string): OccupationData[] => {
    const lines = csvText.split("\n");
    const data: OccupationData[] = [];

    // Skip header row (first line)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line === "" || line.includes("TOTAL")) {
        continue; // Skip empty lines and summary rows
      }

      const columns = line.split(",");

      if (columns.length >= 42) {
        // MAJOR OCCUPATION GROUP + 40 years + TOTAL + %
        const occupation = columns[0].trim();

        // Map occupation names to the service field names
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
          // Extract data for each year from 1981 to 2020
          for (let year = 1981; year <= 2020; year++) {
            const columnIndex = year - 1981 + 1; // +1 because first column is MAJOR OCCUPATION GROUP
            if (columnIndex < columns.length) {
              const value = parseInt(columns[columnIndex].trim() || "0", 10);

              if (!isNaN(value) && value > 0) {
                // Find existing record for this year or create new one
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

                // Set the value for the specific occupation
                (existingRecord as any)[fieldName] = value;
              }
            }
          }
        }
      }
    }

    return data;
  };

  // Education: extract Year, Total (TOTAL row), and CollegeGraduate per year
  // CSV header includes many attainment categories; we only need TOTAL and CollegeGraduate columns
  const parseEducationCSV = (csvText: string): EducationRecord[] => {
    const lines = csvText.split("\n");
    if (lines.length === 0) return [];
    // header holds attainment names and ends with TOTAL, %
    const header = lines[0].trim().split(",");
    // Find indices for years (1988..2020) and the two rows we care about
    const yearStart = 1988;
    const yearEnd = 2020;
    // Build a map of year -> column index in header
    const yearToCol: Record<number, number> = {};
    for (let y = yearStart; y <= yearEnd; y++) {
      const idx = header.findIndex((h) => h.trim() === String(y));
      if (idx !== -1) yearToCol[y] = idx;
    }
    if (Object.keys(yearToCol).length === 0) return [];

    // Identify row lines for CollegeGraduate and TOTAL
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

  // Utilities for All Countries mapping
  const normalizeCountryName = (name: string): string =>
    name
      .toUpperCase()
      .replace(/\s+/g, " ")
      .replace(/\s*&\s*/g, " & ")
      .replace(/[().,'*]/g, "")
      .replace(/-/g, " ")
      .replace(/\s*\*+\s*$/, "")
      .trim();

  const CSV_NAME_ALIASES: Record<string, string> = {
    "CHINA PROC": "CHINA",
    HONGKONG: "HONG KONG",
    "TAIWAN ROC": "TAIWAN",
    "RUSSIAN FEDERATION / USSR": "RUSSIA",
    "DEMOCRATIC REPUBLIC OF THE CONGO ZAIRE":
      "DEMOCRATIC REPUBLIC OF THE CONGO",
    "DEMOCRATIC KAMPUCHEA": "CAMBODIA",
    "MYANMAR BURMA": "MYANMAR",
    MACEDONIA: "NORTH MACEDONIA",
    "SLOVAK REPUBLIC": "SLOVAKIA",
    "CZECH REPUBLIC": "CZECH REPUBLIC",
    // Common long-form names
    "UNITED STATES OF AMERICA": "UNITED STATES OF AMERICA",
    "UNITED KINGDOM OF GREAT BRITAIN AND NORTHERN IRELAND": "UNITED KINGDOM",
  };

  // All Countries CSV: two columns COUNTRY, TOTAL; ignore GRAND TOTAL
  const parseAllCountriesCSV = (
    csvText: string,
    nameToIso3: Map<string, string>
  ): { iso3: string; count: number; raw: string }[] => {
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
      // If already ISO3, accept directly
      if (/^[A-Z]{3}$/.test(upper)) {
        data.push({ iso3: upper, count, raw: country });
        continue;
      }
      // Map country names to ISO3 using world geojson mapping
      const normalized = normalizeCountryName(country);
      const alias = CSV_NAME_ALIASES[normalized] ?? normalized;
      const iso3 = nameToIso3.get(alias);
      if (iso3) {
        data.push({ iso3, count, raw: country });
      }
    }
    return data;
  };

  const parseCivilStatusCSV = (csvText: string): CivilStatusRecord[] => {
    const lines = csvText.split("\n");
    const data: CivilStatusRecord[] = [];
    // Skip header row
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
        if (
          [
            year,
            single,
            married,
            widower,
            separated,
            divorced,
            notReported,
          ].every((v) => !Number.isNaN(v))
        ) {
          data.push({
            year,
            single,
            married,
            widower,
            separated,
            divorced,
            notReported,
          });
        }
      }
    }
    return data;
  };

  const handleAgeCSVUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAgeFileName(file.name);

    setUploading(true);
    setUploadStatus("Processing CSV file...");

    try {
      const text = await file.text();
      const ageData = parseAgeCSV(text);

      if (ageData.length === 0) {
        setUploadStatus("No valid data found in CSV file");
        return;
      }

      setUploadStatus(
        `Found ${ageData.length} records. Uploading to database...`
      );

      // Clear existing data first
      await deleteAllAges();

      // Add new data
      for (const record of ageData) {
        await addAge(record);
      }

      setUploadStatus(`Successfully uploaded ${ageData.length} age records!`);
    } catch (error) {
      console.error("Error uploading CSV:", error);
      setUploadStatus("Error uploading CSV file");
    } finally {
      setUploading(false);
    }
  };

  const handleMajorCountriesCSVUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setMajorCountriesFileName(file.name);

    setMajorCountriesUploading(true);
    setMajorCountriesStatus("Processing CSV file...");

    try {
      const text = await file.text();
      const majorCountriesData = parseMajorCountriesCSV(text);

      if (majorCountriesData.length === 0) {
        setMajorCountriesStatus("No valid data found in CSV file");
        return;
      }

      setMajorCountriesStatus(
        `Found ${majorCountriesData.length} records. Uploading to database...`
      );

      // Clear existing data first
      await deleteAllMajorCountries();

      // Add new data
      for (const record of majorCountriesData) {
        await addMajorCountries(record);
      }

      setMajorCountriesStatus(
        `Successfully uploaded ${majorCountriesData.length} major countries records!`
      );
    } catch (error) {
      console.error("Error uploading CSV:", error);
      setMajorCountriesStatus("Error uploading CSV file");
    } finally {
      setMajorCountriesUploading(false);
    }
  };

  const handleSexCSVUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSexFileName(file.name);

    setSexUploading(true);
    setSexStatus("Processing CSV file...");

    try {
      const text = await file.text();
      const sexData = parseSexCSV(text);

      if (sexData.length === 0) {
        setSexStatus("No valid data found in CSV file");
        return;
      }

      setSexStatus(`Found ${sexData.length} records. Uploading to database...`);

      // Clear existing data first
      await deleteAllSex();

      // Add new data
      for (const record of sexData) {
        await addSex(record);
      }

      setSexStatus(`Successfully uploaded ${sexData.length} sex records!`);
    } catch (error) {
      console.error("Error uploading CSV:", error);
      setSexStatus("Error uploading CSV file");
    } finally {
      setSexUploading(false);
    }
  };

  const handlePlaceOfOriginCSVUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPlaceOfOriginFileName(file.name);

    setPlaceOfOriginUploading(true);
    setPlaceOfOriginStatus("Processing CSV file...");

    try {
      const text = await file.text();
      const placeOfOriginData = parsePlaceOfOriginCSV(text);

      if (placeOfOriginData.length === 0) {
        setPlaceOfOriginStatus("No valid data found in CSV file");
        return;
      }

      setPlaceOfOriginStatus(
        `Found ${placeOfOriginData.length} records. Uploading to database...`
      );

      // Clear existing data first
      await deleteAllPlaceOfOrigin();

      // Add new data
      for (const record of placeOfOriginData) {
        await addPlaceOfOrigin(record);
      }

      setPlaceOfOriginStatus(
        `Successfully uploaded ${placeOfOriginData.length} place of origin records!`
      );
    } catch (error) {
      console.error("Error uploading CSV:", error);
      setPlaceOfOriginStatus("Error uploading CSV file");
    } finally {
      setPlaceOfOriginUploading(false);
    }
  };

  const handleOccupationCSVUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setOccupationFileName(file.name);

    setOccupationUploading(true);
    setOccupationStatus("Processing CSV file...");

    try {
      const text = await file.text();
      const occupationData = parseOccupationCSV(text);

      if (occupationData.length === 0) {
        setOccupationStatus("No valid data found in CSV file");
        return;
      }

      setOccupationStatus(
        `Found ${occupationData.length} records. Uploading to database...`
      );

      // Clear existing data first
      await deleteAllOccupation();

      // Add new data
      for (const record of occupationData) {
        await addOccupation(record);
      }

      setOccupationStatus(
        `Successfully uploaded ${occupationData.length} occupation records!`
      );
    } catch (error) {
      console.error("Error uploading CSV:", error);
      setOccupationStatus("Error uploading CSV file");
    } finally {
      setOccupationUploading(false);
    }
  };

  const handleEducationCSVUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setEducationFileName(file.name);

    setEducationUploading(true);
    setEducationStatus("Processing CSV file...");

    try {
      const text = await file.text();
      const eduData = parseEducationCSV(text);
      if (eduData.length === 0) {
        setEducationStatus("No valid data found in CSV file");
        return;
      }

      setEducationStatus(
        `Found ${eduData.length} records. Uploading to database...`
      );
      await deleteAllEducation();
      for (const rec of eduData) {
        await addEducation(rec);
      }
      setEducationStatus(
        `Successfully uploaded ${eduData.length} education records!`
      );
    } catch (e) {
      console.error("Error uploading CSV:", e);
      setEducationStatus("Error uploading CSV file");
    } finally {
      setEducationUploading(false);
    }
  };

  const handleAllCountriesCSVUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAllCountriesFileName(file.name);

    setAllCountriesUploading(true);
    setAllCountriesStatus("Processing CSV file...");

    try {
      // Build mapping from country name -> ISO3 via world geojson
      const WORLD_GEOJSON_URL =
        "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";
      const res = await fetch(WORLD_GEOJSON_URL);
      const json = await res.json();
      const nameToIso3 = new Map<string, string>();
      for (const f of json?.features ?? []) {
        const label = (
          f?.properties?.name ??
          f?.properties?.NAME ??
          ""
        ).toString();
        const id = (f?.id ?? f?.properties?.iso_a3 ?? "").toString();
        if (!label || !id) continue;
        nameToIso3.set(normalizeCountryName(label), id);
      }

      const text = await file.text();
      const rows = parseAllCountriesCSV(text, nameToIso3);
      if (rows.length === 0) {
        setAllCountriesStatus(
          "No valid country rows found in CSV (COUNTRY, TOTAL)."
        );
        return;
      }
      setAllCountriesStatus(`Found ${rows.length} rows. Uploading...`);
      await deleteAllCountryYears();
      for (const r of rows) {
        await addCountryYear({ iso3: r.iso3, count: r.count });
      }
      setAllCountriesStatus(
        `Successfully uploaded ${rows.length} country totals!`
      );
    } catch (e) {
      console.error("Error uploading CSV:", e);
      setAllCountriesStatus("Error uploading CSV file");
    } finally {
      setAllCountriesUploading(false);
    }
  };

  const handleCivilStatusCSVUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setCivilStatusFileName(file.name);

    setCivilStatusUploading(true);
    setCivilStatusStatus("Processing CSV file...");

    try {
      const text = await file.text();
      const civilData = parseCivilStatusCSV(text);

      if (civilData.length === 0) {
        setCivilStatusStatus("No valid data found in CSV file");
        return;
      }

      setCivilStatusStatus(
        `Found ${civilData.length} records. Uploading to database...`
      );

      await deleteAllCivilStatus();
      for (const record of civilData) {
        await addCivilStatus(record);
      }
      setCivilStatusStatus(
        `Successfully uploaded ${civilData.length} civil status records!`
      );
    } catch (error) {
      console.error("Error uploading CSV:", error);
      setCivilStatusStatus("Error uploading CSV file");
    } finally {
      setCivilStatusUploading(false);
    }
  };

  // Reusable simple upload section
  const UploadSection: React.FC<{
    title: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled: boolean;
    status: string;
    fileName?: string;
    onAddClick?: () => void;
  }> = ({ title, onChange, disabled, status, fileName, onAddClick }) => {
    const inputId = `${title.replace(/\s+/g, "-").toLowerCase()}-csv-input`;
    return (
      <div className="p-4 border border-gray-200 rounded-lg bg-white/50 hover:translate-y-[-5px] transition-all duration-300">
        <h2 className="text-base font-semibold text-gray-700 mb-3">{title}</h2>
        <div className="flex flex-col gap-2">
          <input
            id={inputId}
            type="file"
            accept=".csv"
            onChange={onChange}
            disabled={disabled}
            className="hidden"
          />
          <label
            htmlFor={inputId}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-white ${
              disabled
                ? "bg-blue-400 cursor-not-allowed opacity-70"
                : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
            } transition-colors`}
          >
            {disabled ? "Processing…" : "Choose CSV"}
          </label>
          {fileName && <p className="text-sm text-gray-700">{fileName}</p>}
          {status && <p className="text-sm mt-1 text-gray-600">{status}</p>}

          <div className="my-4 flex items-center gap-3">
            <div className="h-px bg-gray-200 flex-1" />
            <span className="text-xs text-gray-500">OR</span>
            <div className="h-px bg-gray-200 flex-1" />
          </div>

          <div className="flex justify-center">
            <button onClick={onAddClick} className="px-5 py-2 bg-green-500 text-white rounded">
              Add Record
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-green-600 mb-15">Add Records</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
        <UploadSection
          title="Age"
          onChange={handleAgeCSVUpload}
          disabled={uploading}
          status={uploadStatus}
          fileName={ageFileName}
          onAddClick={() => setShowAgeModal(true)}
        />
        <UploadSection
          title="All Countries"
          onChange={handleAllCountriesCSVUpload}
          disabled={allCountriesUploading}
          status={allCountriesStatus}
          fileName={allCountriesFileName}
          onAddClick={() => setShowAllCountriesModal(true)}
        />
        <UploadSection
          title="Major Countries"
          onChange={handleMajorCountriesCSVUpload}
          disabled={majorCountriesUploading}
          status={majorCountriesStatus}
          fileName={majorCountriesFileName}
          onAddClick={() => setShowMajorModal(true)}
        />
        <UploadSection
          title="Occupation"
          onChange={handleOccupationCSVUpload}
          disabled={occupationUploading}
          status={occupationStatus}
          fileName={occupationFileName}
          onAddClick={() => setShowOccupationModal(true)}
        />
        <UploadSection
          title="Sex"
          onChange={handleSexCSVUpload}
          disabled={sexUploading}
          status={sexStatus}
          fileName={sexFileName}
          onAddClick={() => setShowSexModal(true)}
        />
        <UploadSection
          title="Civil Status"
          onChange={handleCivilStatusCSVUpload}
          disabled={civilStatusUploading}
          status={civilStatusStatus}
          fileName={civilStatusFileName}
          onAddClick={() => setShowCivilModal(true)}
        />
        <UploadSection
          title="Education"
          onChange={handleEducationCSVUpload}
          disabled={educationUploading}
          status={educationStatus}
          fileName={educationFileName}
          onAddClick={() => setShowEducationModal(true)}
        />
        <UploadSection
          title="Place of Origin"
          onChange={handlePlaceOfOriginCSVUpload}
          disabled={placeOfOriginUploading}
          status={placeOfOriginStatus}
          fileName={placeOfOriginFileName}
          onAddClick={() => setShowPlaceModal(true)}
        />
      </div>

      {/* Modals */}
      {showAgeModal && (
        <Modal title="Add Age Record" onClose={() => setShowAgeModal(false)}>
          <SimpleForm fields={[{name:'year',label:'Year'},{name:'total',label:'Total'}]} values={ageForm} setValues={setAgeForm} onSubmit={async () => { await addAge({ year: Number(ageForm.year)||0, total: Number(ageForm.total)||0 }); setAgeForm({ year:'', total:'' }); setShowAgeModal(false); }} />
        </Modal>
      )}
      {showAllCountriesModal && (
        <Modal title="Add Country Total" onClose={() => setShowAllCountriesModal(false)}>
          <SimpleForm fields={[{name:'iso3',label:'ISO3'},{name:'count',label:'Count'}]} values={allCountriesForm} setValues={setAllCountriesForm} onSubmit={async () => { await addCountryYear({ iso3: allCountriesForm.iso3.toUpperCase(), count: Number(allCountriesForm.count)||0 }); setAllCountriesForm({ iso3:'', count:'' }); setShowAllCountriesModal(false); }} />
        </Modal>
      )}
      {showMajorModal && (
        <Modal title="Add Major Countries Record" onClose={() => setShowMajorModal(false)}>
          <GridForm values={majorForm} setValues={setMajorForm} onSubmit={async () => { await addMajorCountries({ year:Number(majorForm.year)||0, Usa:Number(majorForm.Usa)||0, Canada:Number(majorForm.Canada)||0, Japan:Number(majorForm.Japan)||0, Australia:Number(majorForm.Australia)||0, Italy:Number(majorForm.Italy)||0, NewZealand:Number(majorForm.NewZealand)||0, UnitedKingdom:Number(majorForm.UnitedKingdom)||0, Germany:Number(majorForm.Germany)||0, SouthKorea:Number(majorForm.SouthKorea)||0, Spain:Number(majorForm.Spain)||0, Others:Number(majorForm.Others)||0 }); setMajorForm({ year: "", Usa: "", Canada: "", Japan: "", Australia: "", Italy: "", NewZealand: "", UnitedKingdom: "", Germany: "", SouthKorea: "", Spain: "", Others: "" }); setShowMajorModal(false); }} />
        </Modal>
      )}
      {showOccupationModal && (
        <Modal title="Add Occupation Record" onClose={() => setShowOccupationModal(false)}>
          <GridForm values={occupationForm} setValues={setOccupationForm} onSubmit={async () => { await addOccupation({ year:Number(occupationForm.year)||0, professionalTechnical:Number(occupationForm.professionalTechnical)||0, managerialExecutive:Number(occupationForm.managerialExecutive)||0, clericalWorkers:Number(occupationForm.clericalWorkers)||0, salesWorkers:Number(occupationForm.salesWorkers)||0, serviceWorkers:Number(occupationForm.serviceWorkers)||0, agriculturalWorkers:Number(occupationForm.agriculturalWorkers)||0, productionTransportLaborers:Number(occupationForm.productionTransportLaborers)||0, armedForces:Number(occupationForm.armedForces)||0, housewives:Number(occupationForm.housewives)||0, retirees:Number(occupationForm.retirees)||0, students:Number(occupationForm.students)||0, minors:Number(occupationForm.minors)||0, outOfSchoolYouth:Number(occupationForm.outOfSchoolYouth)||0, refugees:Number(occupationForm.refugees)||0, noOccupationReported:Number(occupationForm.noOccupationReported)||0 }); setOccupationForm({ year: "", professionalTechnical: "", managerialExecutive: "", clericalWorkers: "", salesWorkers: "", serviceWorkers: "", agriculturalWorkers: "", productionTransportLaborers: "", armedForces: "", housewives: "", retirees: "", students: "", minors: "", outOfSchoolYouth: "", refugees: "", noOccupationReported: "" }); setShowOccupationModal(false); }} />
        </Modal>
      )}
      {showSexModal && (
        <Modal title="Add Sex Record" onClose={() => setShowSexModal(false)}>
          <SimpleForm fields={[{name:'year',label:'Year'},{name:'male',label:'Male'},{name:'female',label:'Female'}]} values={sexForm} setValues={setSexForm} onSubmit={async () => { await addSex({ year:Number(sexForm.year)||0, male:Number(sexForm.male)||0, female:Number(sexForm.female)||0 }); setSexForm({ year:'', male:'', female:'' }); setShowSexModal(false); }} />
        </Modal>
      )}
      {showCivilModal && (
        <Modal title="Add Civil Status Record" onClose={() => setShowCivilModal(false)}>
          <GridForm values={civilForm} setValues={setCivilForm} onSubmit={async () => { await addCivilStatus({ year:Number(civilForm.year)||0, single:Number(civilForm.single)||0, married:Number(civilForm.married)||0, widower:Number(civilForm.widower)||0, separated:Number(civilForm.separated)||0, divorced:Number(civilForm.divorced)||0, notReported:Number(civilForm.notReported)||0 }); setCivilForm({ year: "", single: "", married: "", widower: "", separated: "", divorced: "", notReported: "" }); setShowCivilModal(false); }} />
        </Modal>
      )}
      {showEducationModal && (
        <Modal title="Add Education Record" onClose={() => setShowEducationModal(false)}>
          <SimpleForm fields={[{name:'year',label:'Year'},{name:'total',label:'Education Total'},{name:'graduates',label:'Graduates (optional)'}]} values={educationForm} setValues={setEducationForm} onSubmit={async () => { await addEducation({ year:Number(educationForm.year)||0, total:Number(educationForm.total)||0, graduates: educationForm.graduates? Number(educationForm.graduates): undefined }); setEducationForm({ year:'', total:'', graduates:'' }); setShowEducationModal(false); }} />
        </Modal>
      )}
      {showPlaceModal && (
        <Modal title="Add Place of Origin Record" onClose={() => setShowPlaceModal(false)}>
          <GridForm values={placeForm} setValues={setPlaceForm} onSubmit={async () => { await addPlaceOfOrigin({ year:Number(placeForm.year)||0, regionI:Number(placeForm.regionI)||0, regionII:Number(placeForm.regionII)||0, regionIII:Number(placeForm.regionIII)||0, regionIVA:Number(placeForm.regionIVA)||0, regionIVB:Number(placeForm.regionIVB)||0, regionV:Number(placeForm.regionV)||0, regionVI:Number(placeForm.regionVI)||0, regionVII:Number(placeForm.regionVII)||0, regionVIII:Number(placeForm.regionVIII)||0, regionIX:Number(placeForm.regionIX)||0, regionX:Number(placeForm.regionX)||0, regionXI:Number(placeForm.regionXI)||0, regionXII:Number(placeForm.regionXII)||0, regionXIII:Number(placeForm.regionXIII)||0, armm:Number(placeForm.armm)||0, car:Number(placeForm.car)||0, ncr:Number(placeForm.ncr)||0, notReported:Number(placeForm.notReported)||0 }); setPlaceForm({ year: "", regionI: "", regionII: "", regionIII: "", regionIVA: "", regionIVB: "", regionV: "", regionVI: "", regionVII: "", regionVIII: "", regionIX: "", regionX: "", regionXI: "", regionXII: "", regionXIII: "", armm: "", car: "", ncr: "", notReported: "" }); setShowPlaceModal(false); }} />
        </Modal>
      )}
    </div>
  );
};

export default AddRecords;
