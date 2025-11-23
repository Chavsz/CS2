import { useState, useRef, useEffect } from "react";

import { IoCheckmarkDone } from "react-icons/io5";

export type DatasetKey =
  | "Age"
  | "AllCountries"
  | "MajorCountries"
  | "Occupation"
  | "Sex"
  | "CivilStatus"
  | "Education"
  | "PlaceOfOrigin";

export const datasetOptions: { value: DatasetKey; label: string }[] = [
  { value: "Age", label: "Age" },
  { value: "AllCountries", label: "All Countries" },
  { value: "MajorCountries", label: "Major Countries" },
  { value: "Occupation", label: "Occupation" },
  { value: "Sex", label: "Sex" },
  { value: "CivilStatus", label: "Civil Status" },
  { value: "Education", label: "Education" },
  { value: "PlaceOfOrigin", label: "Place of Origin" },
];

type SelectDataProps = {
  value: DatasetKey;
  onChange: (value: DatasetKey) => void;
};

const SelectData = ({ value, onChange }: SelectDataProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = datasetOptions.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: DatasetKey) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <h1>Select Dataset</h1>
      <div className="relative w-[210px] text-sm" ref={dropdownRef}>
        {/* Input field */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 rounded-md border-2 border-gray-300 bg-white text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
        >
          <span className="text-black">
            {selectedOption?.label || "Select..."}
          </span>
          <svg
            className={`w-5 h-5 text-gray-300 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
        </button>

        {/* Dropdown panel */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 rounded-lg text-sm bg-white shadow-md border border-gray-200 max-h-64 z-50">
            {datasetOptions.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full px-4 py-1 flex items-center justify-between text-left transition-colors`}
                >
                  <span>{option.label}</span>
                  {isSelected && (
                    <IoCheckmarkDone className="w-5 h-5 text-indigo-600" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectData;
