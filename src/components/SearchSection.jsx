import { Search, MapPin, Calendar, Users, ChevronDown } from "lucide-react";
import { useState } from "react";

export default function SearchSection({ onSearch, className = "" }) {
  const [searchData, setSearchData] = useState({
    destination: "",
    checkIn: "",
    guests: 1,
  });

  const [dropdowns, setDropdowns] = useState({
    people: false,
    calendar: false,
  });

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch?.(searchData);
  };

  const handleInputChange = (field, value) => {
    setSearchData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleDropdown = (type) => {
    setDropdowns((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const closeDropdowns = () => {
    setDropdowns({
      people: false,
      calendar: false,
    });
  };

  return (
    <div
      className={`bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-6 lg:p-8 max-w-6xl mx-auto mb-16 lg:mb-20 ${className}`}
    >
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
          Find Your Perfect Activity
        </h2>
        <p className="text-gray-600">
          🌟 Discover amazing experiences worldwide
        </p>
      </div>

      {/* Horizontal Search Form */}
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-2 items-end">
          {/* Activities Search */}
          <div className="lg:col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Activities
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchData.destination}
                onChange={(e) =>
                  handleInputChange("destination", e.target.value)
                }
                placeholder="Search activities..."
                className="w-full pl-10 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 bg-white text-gray-800 placeholder-gray-400 font-medium shadow-md hover:shadow-lg"
              />
            </div>
          </div>

          {/* Calendar */}
          <div className="lg:col-span-1 relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Calendar
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="date"
                value={searchData.checkIn}
                onChange={(e) => handleInputChange("checkIn", e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 bg-white text-gray-800 font-medium shadow-md hover:shadow-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Number of People */}
          <div className="lg:col-span-1 relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              People
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <button
                type="button"
                onClick={() => toggleDropdown("people")}
                className="w-full pl-10 pr-10 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 bg-white text-gray-800 font-medium shadow-md hover:shadow-lg text-left cursor-pointer"
              >
                {searchData.guests}{" "}
                {searchData.guests === 1 ? "Person" : "People"}
              </button>
              <ChevronDown
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 transition-transform duration-200 ${
                  dropdowns.people ? "rotate-180" : ""
                }`}
              />

              {/* Custom Dropdown */}
              {dropdowns.people && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={closeDropdowns}
                  ></div>
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => {
                          handleInputChange("guests", num);
                          closeDropdowns();
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors font-medium ${
                          searchData.guests === num
                            ? "bg-blue-50 text-blue-600 border-l-4 border-blue-500"
                            : "text-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Users className="w-4 h-4 text-gray-400" />
                          {num} {num === 1 ? "Person" : "People"}
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Search Button */}
          <div className="lg:col-span-1">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white py-3.5 px-6 rounded-xl font-bold shadow-xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              Search
            </button>
          </div>
        </div>

        {/* Quick Search Pills */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-600 mb-3">
            Popular activities:
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              "Bali Beach Tours",
              "Jakarta Food Tours",
              "Yogyakarta Culture",
              "Lombok Adventures",
              "Bandung Nature",
            ].map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleInputChange("destination", suggestion)}
                className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 text-blue-700 rounded-full text-sm font-medium border border-blue-200 hover:border-blue-300 transition-all duration-200 hover:scale-105"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
