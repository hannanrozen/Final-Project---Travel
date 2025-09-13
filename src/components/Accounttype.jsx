import { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  ArrowUpDown,
  Clock,
  Star,
  TrendingUp,
  DollarSign,
  User,
  Admin,
} from "lucide-react";

const sortOptions = [
  {
    value: "user",
    label: "user",
    icon: User,
    description: "User role",
  },
  {
    value: "admin",
    label: "admin",
    icon: Admin,
    description: "Admin role",
  },
];

export default function SortDropdown({ value, onChange, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption =
    sortOptions.find((option) => option.value === value) || sortOptions[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center justify-between gap-3 px-4 py-2.5 
          bg-white border-2 border-gray-200 rounded-xl
          hover:border-blue-300 hover:bg-blue-50
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          transition-all duration-200 shadow-sm hover:shadow-md
          min-w-[200px] text-left
          ${isOpen ? "border-blue-500 bg-blue-50 shadow-md" : ""}
        `}
      >
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-blue-600" />
          <span className="font-medium text-gray-700">
            {selectedOption.label}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-blue-600 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 dropdown-animation">
          <div className="bg-white border-2 border-gray-200 rounded-xl shadow-xl overflow-hidden dropdown-scroll">
            {sortOptions.map((option) => {
              const IconComponent = option.icon;
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3
                    text-left transition-all duration-150
                    ${
                      isSelected
                        ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500"
                        : "hover:bg-gray-50 text-gray-700"
                    }
                  `}
                >
                  <IconComponent
                    className={`w-4 h-4 ${
                      isSelected ? "text-blue-600" : "text-gray-400"
                    }`}
                  />
                  <div className="flex-1">
                    <div
                      className={`font-medium ${
                        isSelected ? "text-blue-700" : "text-gray-900"
                      }`}
                    >
                      {option.label}
                    </div>
                    <div
                      className={`text-sm ${
                        isSelected ? "text-blue-600" : "text-gray-500"
                      }`}
                    >
                      {option.description}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
