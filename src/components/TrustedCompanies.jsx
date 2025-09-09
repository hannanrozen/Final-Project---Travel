import { Building2, Shield, Star, TrendingUp } from "lucide-react";

export default function TrustedCompanies({ className = "" }) {
  const companies = [
    {
      name: "Garuda Indonesia",
      description: "National carrier with premium service",
      rating: 4.8,
      established: "1949",
    },
    {
      name: "Lion Air",
      description: "Leading low-cost airline in Indonesia",
      rating: 4.2,
      established: "1999",
    },
    {
      name: "Traveloka",
      description: "Southeast Asia's leading travel platform",
      rating: 4.6,
      established: "2012",
    },
    {
      name: "Agoda",
      description: "Trusted hotel booking platform",
      rating: 4.4,
      established: "2005",
    },
    {
      name: "Booking.com",
      description: "World's largest accommodation provider",
      rating: 4.7,
      established: "1996",
    },
    {
      name: "Expedia",
      description: "Complete travel booking solution",
      rating: 4.3,
      established: "1996",
    },
  ];

  return (
    <section className={`py-16 bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto my-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-6 h-6 text-blue-600" />
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
              Trusted by Millions
            </span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Trusted by 200+ Companies
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join millions of travelers who trust our platform for their perfect
            vacation experience
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {companies.map((company, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 border border-gray-100 group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600  rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6 text-white" />
              </div>

              <h3 className="font-bold text-gray-900 mb-2 text-sm lg:text-base">
                {company.name}
              </h3>

              <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                {company.description}
              </p>

              <div className="flex items-center justify-center gap-1 mb-2">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-xs font-semibold text-gray-700">
                  {company.rating}
                </span>
              </div>

              <div className="text-xs text-gray-500">
                Since {company.established}
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="w-6 h-6 text-green-500" />
              <span className="text-3xl font-bold text-gray-900">50M+</span>
            </div>
            <p className="text-gray-600">Happy Travelers</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Building2 className="w-6 h-6 text-blue-500" />
              <span className="text-3xl font-bold text-gray-900">200+</span>
            </div>
            <p className="text-gray-600">Partner Companies</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="w-6 h-6 text-blue-500" />
              <span className="text-3xl font-bold text-gray-900">99.9%</span>
            </div>
            <p className="text-gray-600">Trust Score</p>
          </div>
        </div>
      </div>
    </section>
  );
}
