import { Grid3X3, List, LayoutGrid } from "lucide-react";

const viewModeOptions = [
  {
    value: "grid",
    icon: Grid3X3,
    label: "Grid View",
    description: "Cards in grid",
  },
  {
    value: "list",
    icon: List,
    label: "List View",
    description: "Detailed list",
  },
];

export default function ViewModeToggle({ value, onChange, className = "" }) {
  return (
    <div className={`relative ${className}`}>
      {/* Toggle Container */}
      <div className="flex items-center bg-gray-100 rounded-xl p-1 border-2 border-gray-200">
        {viewModeOptions.map((option) => {
          const IconComponent = option.icon;
          const isActive = option.value === value;

          return (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg
                transition-all duration-200 font-medium text-sm
                ${
                  isActive
                    ? "bg-white shadow-md text-blue-700 border-2 border-blue-200"
                    : "text-gray-600 hover:text-blue-600 hover:bg-white/50"
                }
              `}
              title={option.description}
            >
              <IconComponent
                className={`w-4 h-4 ${
                  isActive ? "text-blue-600" : "text-gray-500"
                }`}
              />
              <span className="hidden sm:inline">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
