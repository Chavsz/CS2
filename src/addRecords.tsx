import { useState } from "react";
import { addAge, deleteAllAges, } from "./services/age";
import {
  addMajorCountries,
  deleteAllMajorCountries,
} from "./services/majorCountries";
import { addSex, deleteAllSex, } from "./services/sex";
import {
  addPlaceOfOrigin,
  deleteAllPlaceOfOrigin,
} from "./services/placeOfOrigin";
import {
  addOccupation,
  deleteAllOccupation,
} from "./services/occupation";
import {
  addEducation,
  deleteAllEducation,
} from "./services/education";
import { addCountryYear, deleteAllCountryYears } from "./services/allCountries";
import {
  parseAgeCSV,
  parseMajorCountriesCSV,
  parseSexCSV,
  parsePlaceOfOriginCSV,
  parseOccupationCSV,
  parseEducationCSV,
  parseAllCountriesCSV,
  parseCivilStatusCSV,
  normalizeCountryName,
} from "./components/parsing/csvParsers";
import {
  addCivilStatus,
  deleteAllCivilStatus,
} from "./services/civilStatus";

import { FiUpload } from "react-icons/fi";

// Icon components
const CalendarIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
  </svg>
);

const GlobeIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
  </svg>
);

const MapIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
  </svg>
);

const BriefcaseIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
  </svg>
);

const UsersIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
  </svg>
);

const HeartIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
  </svg>
);

const BookIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
  </svg>
);

const LocationIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
  </svg>
);

// Reusable modal and forms
const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
    <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

const SimpleForm: React.FC<{ fields: { name: string; label: string }[]; values: Record<string,string>; setValues: (v: any)=>void; onSubmit: ()=>Promise<void> }> = ({ fields, values, setValues, onSubmit }) => (
  <form onSubmit={(e)=>{ e.preventDefault(); onSubmit(); }} className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {fields.map(f => (
        <div key={f.name}>
          <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
          <input 
            name={f.name} 
            value={values[f.name] ?? ''} 
            onChange={(e)=> setValues({ ...values, [f.name]: e.target.value })} 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
          />
        </div>
      ))}
    </div>
    <div className="flex justify-end pt-4">
      <button type="submit" className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors">
        Save Record
      </button>
    </div>
  </form>
);

const GridForm: React.FC<{ values: Record<string,string>; setValues: (v:any)=>void; onSubmit: ()=>Promise<void> }> = ({ values, setValues, onSubmit }) => (
  <form onSubmit={(e)=>{ e.preventDefault(); onSubmit(); }} className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Object.keys(values).map(key => (
        <div key={key}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {key.charAt(0).toUpperCase()+key.slice(1).replace(/([A-Z])/g,' $1').trim()}
          </label>
          <input 
            name={key} 
            value={values[key]} 
            onChange={(e)=> setValues({ ...values, [key]: e.target.value })} 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
          />
        </div>
      ))}
    </div>
    <div className="flex justify-end pt-4">
      <button type="submit" className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors">
        Save Record
      </button>
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
  const [educationForm, setEducationForm] = useState({ year: "", total: "" });
  const [placeForm, setPlaceForm] = useState({ year: "", regionI: "", regionII: "", regionIII: "", regionIVA: "", regionIVB: "", regionV: "", regionVI: "", regionVII: "", regionVIII: "", regionIX: "", regionX: "", regionXI: "", regionXII: "", regionXIII: "", armm: "", car: "", ncr: "", notReported: "" });


  const handleAgeCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
      setUploadStatus(`Found ${ageData.length} records. Uploading to database...`);
      await deleteAllAges();
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

  const handleMajorCountriesCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
      setMajorCountriesStatus(`Found ${majorCountriesData.length} records. Uploading to database...`);
      await deleteAllMajorCountries();
      for (const record of majorCountriesData) {
        await addMajorCountries(record);
      }
      setMajorCountriesStatus(`Successfully uploaded ${majorCountriesData.length} major countries records!`);
    } catch (error) {
      console.error("Error uploading CSV:", error);
      setMajorCountriesStatus("Error uploading CSV file");
    } finally {
      setMajorCountriesUploading(false);
    }
  };

  const handleSexCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
      await deleteAllSex();
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

  const handlePlaceOfOriginCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
      setPlaceOfOriginStatus(`Found ${placeOfOriginData.length} records. Uploading to database...`);
      await deleteAllPlaceOfOrigin();
      for (const record of placeOfOriginData) {
        await addPlaceOfOrigin(record);
      }
      setPlaceOfOriginStatus(`Successfully uploaded ${placeOfOriginData.length} place of origin records!`);
    } catch (error) {
      console.error("Error uploading CSV:", error);
      setPlaceOfOriginStatus("Error uploading CSV file");
    } finally {
      setPlaceOfOriginUploading(false);
    }
  };

  const handleOccupationCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
      setOccupationStatus(`Found ${occupationData.length} records. Uploading to database...`);
      await deleteAllOccupation();
      for (const record of occupationData) {
        await addOccupation(record);
      }
      setOccupationStatus(`Successfully uploaded ${occupationData.length} occupation records!`);
    } catch (error) {
      console.error("Error uploading CSV:", error);
      setOccupationStatus("Error uploading CSV file");
    } finally {
      setOccupationUploading(false);
    }
  };

  const handleEducationCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
      setEducationStatus(`Found ${eduData.length} records. Uploading to database...`);
      await deleteAllEducation();
      for (const rec of eduData) {
        await addEducation(rec);
      }
      setEducationStatus(`Successfully uploaded ${eduData.length} education records!`);
    } catch (e) {
      console.error("Error uploading CSV:", e);
      setEducationStatus("Error uploading CSV file");
    } finally {
      setEducationUploading(false);
    }
  };

  const handleAllCountriesCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAllCountriesFileName(file.name);
    setAllCountriesUploading(true);
    setAllCountriesStatus("Processing CSV file...");
    try {
      const WORLD_GEOJSON_URL = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";
      const res = await fetch(WORLD_GEOJSON_URL);
      const json = await res.json();
      const nameToIso3 = new Map<string, string>();
      for (const f of json?.features ?? []) {
        const label = (f?.properties?.name ?? f?.properties?.NAME ?? "").toString();
        const id = (f?.id ?? f?.properties?.iso_a3 ?? "").toString();
        if (!label || !id) continue;
        nameToIso3.set(normalizeCountryName(label), id);
      }
      const text = await file.text();
      const rows = parseAllCountriesCSV(text, nameToIso3);
      if (rows.length === 0) {
        setAllCountriesStatus("No valid country rows found in CSV (COUNTRY, TOTAL).");
        return;
      }
      setAllCountriesStatus(`Found ${rows.length} rows. Uploading...`);
      await deleteAllCountryYears();
      for (const r of rows) {
        await addCountryYear({ iso3: r.iso3, count: r.count });
      }
      setAllCountriesStatus(`Successfully uploaded ${rows.length} country totals!`);
    } catch (e) {
      console.error("Error uploading CSV:", e);
      setAllCountriesStatus("Error uploading CSV file");
    } finally {
      setAllCountriesUploading(false);
    }
  };

  const handleCivilStatusCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
      setCivilStatusStatus(`Found ${civilData.length} records. Uploading to database...`);
      await deleteAllCivilStatus();
      for (const record of civilData) {
        await addCivilStatus(record);
      }
      setCivilStatusStatus(`Successfully uploaded ${civilData.length} civil status records!`);
    } catch (error) {
      console.error("Error uploading CSV:", error);
      setCivilStatusStatus("Error uploading CSV file");
    } finally {
      setCivilStatusUploading(false);
    }
  };

  // Upload Card Component
  const UploadCard: React.FC<{
    title: string;
    icon: React.ReactNode;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled: boolean;
    status: string;
    fileName?: string;
    onAddClick: () => void;
  }> = ({ title, icon, onChange, disabled, status, fileName, onAddClick }) => {
    const inputId = `${title.replace(/\s+/g, "-").toLowerCase()}-csv-input`;
    return (
      <div className="bg-white rounded-xl p-8 border border-gray-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <div className="p-1.5 bg-white rounded-md border text-indigo-600 border-indigo-600 flex items-center justify-center">
            {icon}
          </div>
          <p className="text-gray-600 text-md">{title}</p>
        </h3>
        
        <input
          id={inputId}
          type="file"
          accept=".csv"
          onChange={onChange}
          disabled={disabled}
          className="hidden"
        />
        
        <label htmlFor={inputId}>
          <button
            type="button"
            onClick={() => document.getElementById(inputId)?.click()}
            disabled={disabled}
            className={`w-full py-3.5 px-6 rounded-lg text-white font-medium text-[15px] flex items-center justify-center gap-2 transition-all ${
              disabled
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"
            }`}
          >
            <FiUpload />
            {disabled ? "Processing..." : "Choose CSV"}
          </button>
        </label>

        {fileName && (
          <p className="mt-3 text-sm text-gray-600 truncate" title={fileName}>
            📄 {fileName}
          </p>
        )}
        
        {status && (
          <p className="mt-2 text-sm text-gray-600">{status}</p>
        )}

        <div className="flex items-center my-5">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="px-3 text-xs text-gray-500 font-medium">OR</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        <button
          onClick={onAddClick}
          className="w-full py-3.5 px-6 bg-white text-green-600 border-2 border-green-600 rounded-lg font-medium text-[15px] hover:bg-green-600 hover:text-white transition-all active:scale-[0.98]"
        >
          Add Record
        </button>
      </div>
    );
  };

  return (
    <div className="py-4 px-8" >
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-indigo-600 mb-2">Add Records</h1>
        <p className="text-[15px] text-gray-600">Upload CSV files or add records manually for different categories</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <UploadCard
          title="Age"
          icon={<CalendarIcon />}
          onChange={handleAgeCSVUpload}
          disabled={uploading}
          status={uploadStatus}
          fileName={ageFileName}
          onAddClick={() => setShowAgeModal(true)}
        />
        
        <UploadCard
          title="All Countries"
          icon={<GlobeIcon />}
          onChange={handleAllCountriesCSVUpload}
          disabled={allCountriesUploading}
          status={allCountriesStatus}
          fileName={allCountriesFileName}
          onAddClick={() => setShowAllCountriesModal(true)}
        />
        
        <UploadCard
          title="Major Countries"
          icon={<MapIcon />}
          onChange={handleMajorCountriesCSVUpload}
          disabled={majorCountriesUploading}
          status={majorCountriesStatus}
          fileName={majorCountriesFileName}
          onAddClick={() => setShowMajorModal(true)}
        />
        
        <UploadCard
          title="Occupation"
          icon={<BriefcaseIcon />}
          onChange={handleOccupationCSVUpload}
          disabled={occupationUploading}
          status={occupationStatus}
          fileName={occupationFileName}
          onAddClick={() => setShowOccupationModal(true)}
        />
        
        <UploadCard
          title="Sex"
          icon={<UsersIcon />}
          onChange={handleSexCSVUpload}
          disabled={sexUploading}
          status={sexStatus}
          fileName={sexFileName}
          onAddClick={() => setShowSexModal(true)}
        />
        
        <UploadCard
          title="Civil Status"
          icon={<HeartIcon />}
          onChange={handleCivilStatusCSVUpload}
          disabled={civilStatusUploading}
          status={civilStatusStatus}
          fileName={civilStatusFileName}
          onAddClick={() => setShowCivilModal(true)}
        />
        
        <UploadCard
          title="Education"
          icon={<BookIcon />}
          onChange={handleEducationCSVUpload}
          disabled={educationUploading}
          status={educationStatus}
          fileName={educationFileName}
          onAddClick={() => setShowEducationModal(true)}
        />
        
        <UploadCard
          title="Place of Origin"
          icon={<LocationIcon />}
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
          <SimpleForm 
            fields={[{name:'year',label:'Year'},{name:'total',label:'Total'}]} 
            values={ageForm} 
            setValues={setAgeForm} 
            onSubmit={async () => { 
              await addAge({ 
                year: Number(ageForm.year)||0, 
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
                total: Number(ageForm.total)||0 
              }); 
              setAgeForm({ year:'', total:'' }); 
              setShowAgeModal(false); 
            }} 
          />
        </Modal>
      )}
      
      {showAllCountriesModal && (
        <Modal title="Add Country Total" onClose={() => setShowAllCountriesModal(false)}>
          <SimpleForm 
            fields={[{name:'iso3',label:'ISO3 Code'},{name:'count',label:'Count'}]} 
            values={allCountriesForm} 
            setValues={setAllCountriesForm} 
            onSubmit={async () => { 
              await addCountryYear({ iso3: allCountriesForm.iso3.toUpperCase(), count: Number(allCountriesForm.count)||0 }); 
              setAllCountriesForm({ iso3:'', count:'' }); 
              setShowAllCountriesModal(false); 
            }} 
          />
        </Modal>
      )}
      
      {showMajorModal && (
        <Modal title="Add Major Countries Record" onClose={() => setShowMajorModal(false)}>
          <GridForm 
            values={majorForm} 
            setValues={setMajorForm} 
            onSubmit={async () => { 
              await addMajorCountries({ 
                year:Number(majorForm.year)||0, 
                Usa:Number(majorForm.Usa)||0, 
                Canada:Number(majorForm.Canada)||0, 
                Japan:Number(majorForm.Japan)||0, 
                Australia:Number(majorForm.Australia)||0, 
                Italy:Number(majorForm.Italy)||0, 
                NewZealand:Number(majorForm.NewZealand)||0, 
                UnitedKingdom:Number(majorForm.UnitedKingdom)||0, 
                Germany:Number(majorForm.Germany)||0, 
                SouthKorea:Number(majorForm.SouthKorea)||0, 
                Spain:Number(majorForm.Spain)||0, 
                Others:Number(majorForm.Others)||0 
              }); 
              setMajorForm({ year: "", Usa: "", Canada: "", Japan: "", Australia: "", Italy: "", NewZealand: "", UnitedKingdom: "", Germany: "", SouthKorea: "", Spain: "", Others: "" }); 
              setShowMajorModal(false); 
            }} 
          />
        </Modal>
      )}
      
      {showOccupationModal && (
        <Modal title="Add Occupation Record" onClose={() => setShowOccupationModal(false)}>
          <GridForm 
            values={occupationForm} 
            setValues={setOccupationForm} 
            onSubmit={async () => { 
              await addOccupation({ 
                year:Number(occupationForm.year)||0, 
                professionalTechnical:Number(occupationForm.professionalTechnical)||0, 
                managerialExecutive:Number(occupationForm.managerialExecutive)||0, 
                clericalWorkers:Number(occupationForm.clericalWorkers)||0, 
                salesWorkers:Number(occupationForm.salesWorkers)||0, 
                serviceWorkers:Number(occupationForm.serviceWorkers)||0, 
                agriculturalWorkers:Number(occupationForm.agriculturalWorkers)||0, 
                productionTransportLaborers:Number(occupationForm.productionTransportLaborers)||0, 
                armedForces:Number(occupationForm.armedForces)||0, 
                housewives:Number(occupationForm.housewives)||0, 
                retirees:Number(occupationForm.retirees)||0, 
                students:Number(occupationForm.students)||0, 
                minors:Number(occupationForm.minors)||0, 
                outOfSchoolYouth:Number(occupationForm.outOfSchoolYouth)||0, 
                refugees:Number(occupationForm.refugees)||0, 
                noOccupationReported:Number(occupationForm.noOccupationReported)||0 
              }); 
              setOccupationForm({ year: "", professionalTechnical: "", managerialExecutive: "", clericalWorkers: "", salesWorkers: "", serviceWorkers: "", agriculturalWorkers: "", productionTransportLaborers: "", armedForces: "", housewives: "", retirees: "", students: "", minors: "", outOfSchoolYouth: "", refugees: "", noOccupationReported: "" }); 
              setShowOccupationModal(false); 
            }} 
          />
        </Modal>
      )}
      
      {showSexModal && (
        <Modal title="Add Sex Record" onClose={() => setShowSexModal(false)}>
          <SimpleForm 
            fields={[{name:'year',label:'Year'},{name:'male',label:'Male'},{name:'female',label:'Female'}]} 
            values={sexForm} 
            setValues={setSexForm} 
            onSubmit={async () => { 
              await addSex({ year:Number(sexForm.year)||0, male:Number(sexForm.male)||0, female:Number(sexForm.female)||0 }); 
              setSexForm({ year:'', male:'', female:'' }); 
              setShowSexModal(false); 
            }} 
          />
        </Modal>
      )}
      
      {showCivilModal && (
        <Modal title="Add Civil Status Record" onClose={() => setShowCivilModal(false)}>
          <GridForm 
            values={civilForm} 
            setValues={setCivilForm} 
            onSubmit={async () => { 
              await addCivilStatus({ 
                year:Number(civilForm.year)||0, 
                single:Number(civilForm.single)||0, 
                married:Number(civilForm.married)||0, 
                widower:Number(civilForm.widower)||0, 
                separated:Number(civilForm.separated)||0, 
                divorced:Number(civilForm.divorced)||0, 
                notReported:Number(civilForm.notReported)||0 
              }); 
              setCivilForm({ year: "", single: "", married: "", widower: "", separated: "", divorced: "", notReported: "" }); 
              setShowCivilModal(false); 
            }} 
          />
        </Modal>
      )}
      
      {showEducationModal && (
        <Modal title="Add Education Record" onClose={() => setShowEducationModal(false)}>
          <SimpleForm 
            fields={[{name:'year',label:'Year'},{name:'total',label:'Total'}]} 
            values={educationForm} 
            setValues={setEducationForm} 
            onSubmit={async () => { 
              await addEducation({ 
                year:Number(educationForm.year)||0, 
                total:Number(educationForm.total)||0,
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
                notReported: 0
              }); 
              setEducationForm({ year:'', total:'' }); 
              setShowEducationModal(false); 
            }} 
          />
        </Modal>
      )}
      
      {showPlaceModal && (
        <Modal title="Add Place of Origin Record" onClose={() => setShowPlaceModal(false)}>
          <GridForm 
            values={placeForm} 
            setValues={setPlaceForm} 
            onSubmit={async () => { 
              await addPlaceOfOrigin({ 
                year:Number(placeForm.year)||0, 
                regionI:Number(placeForm.regionI)||0, 
                regionII:Number(placeForm.regionII)||0, 
                regionIII:Number(placeForm.regionIII)||0, 
                regionIVA:Number(placeForm.regionIVA)||0, 
                regionIVB:Number(placeForm.regionIVB)||0, 
                regionV:Number(placeForm.regionV)||0, 
                regionVI:Number(placeForm.regionVI)||0, 
                regionVII:Number(placeForm.regionVII)||0, 
                regionVIII:Number(placeForm.regionVIII)||0, 
                regionIX:Number(placeForm.regionIX)||0, 
                regionX:Number(placeForm.regionX)||0, 
                regionXI:Number(placeForm.regionXI)||0, 
                regionXII:Number(placeForm.regionXII)||0, 
                regionXIII:Number(placeForm.regionXIII)||0, 
                armm:Number(placeForm.armm)||0, 
                car:Number(placeForm.car)||0, 
                ncr:Number(placeForm.ncr)||0, 
                notReported:Number(placeForm.notReported)||0 
              }); 
              setPlaceForm({ year: "", regionI: "", regionII: "", regionIII: "", regionIVA: "", regionIVB: "", regionV: "", regionVI: "", regionVII: "", regionVIII: "", regionIX: "", regionX: "", regionXI: "", regionXII: "", regionXIII: "", armm: "", car: "", ncr: "", notReported: "" }); 
              setShowPlaceModal(false); 
            }} 
          />
        </Modal>
      )}
    </div>
  );
};

export default AddRecords;