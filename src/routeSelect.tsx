import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { datasetOptions, type DatasetKey } from "./components/selectData";
import { IoCheckmarkDone } from "react-icons/io5";
import * as mdIcons from "react-icons/md";
import * as bsIcons from "react-icons/bs";
import { GoGraph } from "react-icons/go";

const RouteSelect = () => {
  const [selected, setSelected] = useState(window.location.pathname);
  const [isDashboardExpanded, setIsDashboardExpanded] = useState(false);
  const [isRecordsExpanded, setIsRecordsExpanded] = useState(false);
  const [isTimeseriesExpanded, setIsTimeseriesExpanded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setSelected(location.pathname);
    // Auto-expand dashboard if we're on dashboard route
    if (location.pathname === "/") {
      setIsDashboardExpanded(true);
      setIsRecordsExpanded(false);
    }
    // Auto-expand records if we're on records route
    else if (location.pathname === "/records") {
      setIsRecordsExpanded(true);
      setIsDashboardExpanded(false);
      setIsTimeseriesExpanded(false);
    }
    // Auto-expand timeseries if we're on timeseries route
    else if (location.pathname === "/timeseries") {
      setIsTimeseriesExpanded(true);
      setIsDashboardExpanded(false);
      setIsRecordsExpanded(false);
    }
    // Close all dropdowns when navigating to other routes
    else {
      setIsDashboardExpanded(false);
      setIsRecordsExpanded(false);
      setIsTimeseriesExpanded(false);
    }
  }, [location.pathname]);

  const handleSelect = (to: string) => {
    setSelected(to);
    // Close all dropdowns when selecting other routes
    setIsDashboardExpanded(false);
    setIsRecordsExpanded(false);
    setIsTimeseriesExpanded(false);
  };

  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDashboardExpanded(!isDashboardExpanded);
    setIsRecordsExpanded(false);
    setIsTimeseriesExpanded(false);
    if (!isDashboardExpanded) {
      navigate("/?dataset=Age");
    }
  };

  const handleRecordsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsRecordsExpanded(!isRecordsExpanded);
    setIsDashboardExpanded(false);
    setIsTimeseriesExpanded(false);
    if (!isRecordsExpanded) {
      navigate("/records?dataset=Age");
    }
  };

  const handleTimeseriesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsTimeseriesExpanded(!isTimeseriesExpanded);
    setIsDashboardExpanded(false);
    setIsRecordsExpanded(false);
    if (!isTimeseriesExpanded) {
      navigate("/timeseries?dataset=Age");
    }
  };

  const handleDatasetSelect = (dataset: DatasetKey, route: string) => {
    navigate(`${route}?dataset=${dataset}`);
    setSelected(route);
  };

  // Get current dataset from URL
  const searchParams = new URLSearchParams(location.search);
  const currentDataset = (searchParams.get("dataset") || "Age") as DatasetKey;

  return (
    <div className="space-y-1">
      <p className="text-[13px] font-extralight text-[#696969] hidden md:block">
        MENU
      </p>
      <div>
        <button
          onClick={handleDashboardClick}
          className={`flex items-center md:justify-start justify-center gap-2 w-full rounded px-2 py-2 md:py-1.5 md:text-sm text-1xl transition-all duration-300 ${
            selected === "/"
              ? "bg-stone-100 text-[#696969] shadow"
              : "hover:bg-stone-100 text-[#696969] shadow-none"
          }`}
        >
          <mdIcons.MdOutlineDashboard
            className={`${selected === "/" ? "text-[#696969] " : ""}`}
          />
          <p className="text-md font-semibold hidden md:block flex-1 text-left">
            Dashboard
          </p>
          <svg
            className={`w-4 h-4 transition-transform duration-300 hidden md:block ${
              isDashboardExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        <div
          className={`overflow-hidden transition-all duration-700 ${
            isDashboardExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="ml-4 mt-1 space-y-1 hidden md:block">
            {datasetOptions.map((option) => {
              const isSelected =
                option.value === currentDataset && location.pathname === "/";
              return (
                <button
                  key={option.value}
                  onClick={() => handleDatasetSelect(option.value, "/")}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-sm transition-colors duration-300 ${
                    isSelected
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-[#696969] hover:bg-stone-50"
                  }`}
                >
                  <span className="text-left">{option.label}</span>
                  {isSelected && (
                    <IoCheckmarkDone className="w-4 h-4 text-indigo-600" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <Route
        to="/addRecords"
        selected={selected}
        Icon={mdIcons.MdAddChart}
        title="Add Records"
        handleSelect={handleSelect}
      />
      
      <div>
        <button
          onClick={handleRecordsClick}
          className={`flex items-center md:justify-start justify-center gap-2 w-full rounded px-2 py-2 md:py-1.5 md:text-sm text-1xl transition-all duration-300 ${
            selected === "/records"
              ? "bg-stone-100 text-[#696969] shadow"
              : "hover:bg-stone-100 text-[#696969] shadow-none"
          }`}
        >
          <bsIcons.BsClipboard2Data
            className={`${selected === "/records" ? "text-[#696969] " : ""}`}
          />
          <p className="text-md font-semibold hidden md:block flex-1 text-left">
            Records
          </p>
          <svg
            className={`w-4 h-4 transition-transform duration-300 hidden md:block ${
              isRecordsExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        <div
          className={`overflow-hidden transition-all duration-700 ${
            isRecordsExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="ml-4 mt-1 space-y-1 hidden md:block">
            {datasetOptions.map((option) => {
              const isSelected =
                option.value === currentDataset &&
                location.pathname === "/records";
              return (
                <button
                  key={option.value}
                  onClick={() =>
                    handleDatasetSelect(option.value, "/records")
                  }
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-sm transition-colors duration-300 ${
                    isSelected
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-[#696969] hover:bg-stone-50"
                  }`}
                >
                  <span className="text-left">{option.label}</span>
                  {isSelected && (
                    <IoCheckmarkDone className="w-4 h-4 text-indigo-600" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div>
        <button
          onClick={handleTimeseriesClick}
          className={`flex items-center md:justify-start justify-center gap-2 w-full rounded px-2 py-2 md:py-1.5 md:text-sm text-1xl transition-all duration-300 ${
            selected === "/timeseries"
              ? "bg-stone-100 text-[#696969] shadow"
              : "hover:bg-stone-100 text-[#696969] shadow-none"
          }`}
        >
          <GoGraph
            className={`${selected === "/timeseries" ? "text-[#696969] " : ""}`}
          />
          <p className="text-md font-semibold hidden md:block flex-1 text-left">
            Time Series
          </p>
          <svg
            className={`w-4 h-4 transition-transform duration-300 hidden md:block ${
              isTimeseriesExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        <div
          className={`overflow-hidden transition-all duration-700 ${
            isTimeseriesExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="ml-4 mt-1 space-y-1 hidden md:block">
            {datasetOptions.map((option) => {
              const isSelected =
                option.value === currentDataset &&
                location.pathname === "/timeseries";
              return (
                <button
                  key={option.value}
                  onClick={() =>
                    handleDatasetSelect(option.value, "/timeseries")
                  }
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-sm transition-colors duration-300 ${
                    isSelected
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-[#696969] hover:bg-stone-50"
                  }`}
                >
                  <span className="text-left">{option.label}</span>
                  {isSelected && (
                    <IoCheckmarkDone className="w-4 h-4 text-indigo-600" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

type RouteProps = {
  to: string;
  selected: string;
  Icon: React.ElementType;
  title: string;
  handleSelect: (to: string) => void;
};

const Route = ({ to, selected, Icon, title, handleSelect }: RouteProps) => {
  const isSelected = selected === to;
  return (
    <Link
      to={to}
      className={`flex items-center md:justify-start justify-center gap-2 w-full rounded px-2 py-2 md:py-1.5 md:text-sm text-1xl transition-all duration-300 ${
        isSelected
          ? "bg-stone-100 text-[#696969]  shadow"
          : "hover:bg-stone-100 text-[#696969] shadow-none"
      }`}
      onClick={() => handleSelect(to)}
    >
      <Icon className={`${isSelected ? "text-[#696969] " : ""}`} />
      <p className="text-md font-semibold hidden md:block">{title}</p>
    </Link>
  );
};

export default RouteSelect;
