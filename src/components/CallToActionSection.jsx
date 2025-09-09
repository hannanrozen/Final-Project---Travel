import { ArrowRight, Sparkles, Globe, Heart, Star, MapPin } from "lucide-react";

export default function CallToActionSection({
  onGetStarted,
  onExplore,
  className = "",
}) {
  return (
    <section
      className={`py-24 bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900 relative overflow-hidden ${className}`}
    >
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 animate-pulse blur-xl" />
        <div
          className="absolute bottom-20 right-20 w-40 h-40 rounded-full bg-gradient-to-r from-cyan-400 to-blue-400 animate-pulse blur-xl"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/3 w-24 h-24 rounded-full bg-gradient-to-r from-blue-300 to-cyan-300 animate-pulse blur-xl"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/4 right-1/3 w-28 h-28 rounded-full bg-gradient-to-r from-cyan-300 to-blue-300 animate-pulse blur-xl"
          style={{ animationDelay: "3s" }}
        />
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <Star
          className="absolute top-32 left-1/4 w-6 h-6 text-yellow-300 animate-bounce opacity-60"
          style={{ animationDelay: "0.5s" }}
        />
        <MapPin
          className="absolute bottom-32 right-1/4 w-5 h-5 text-cyan-300 animate-bounce opacity-60"
          style={{ animationDelay: "1.5s" }}
        />
        <Globe
          className="absolute top-1/2 right-12 w-7 h-7 text-blue-300 animate-bounce opacity-60"
          style={{ animationDelay: "2.5s" }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="p-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-yellow-300 font-bold uppercase tracking-wider text-lg">
              ✨ Ready for Adventure?
            </span>
          </div>

          <h2 className="text-5xl lg:text-7xl font-extrabold text-white mb-8 leading-tight">
            Start Your Epic{" "}
            <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
              Adventure
            </span>{" "}
            <br className="hidden lg:block" />
            Journey Today
          </h2>

          <p className="text-xl lg:text-2xl text-cyan-100 mb-16 max-w-4xl mx-auto leading-relaxed font-light">
            🌟 Discover breathtaking destinations, create unforgettable
            memories, and embark on
            <span className="font-semibold text-white">
              {" "}
              extraordinary adventures{" "}
            </span>
            that will change your life forever.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
            <button
              onClick={onGetStarted}
              className="group bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-10 py-5 rounded-full text-xl font-bold shadow-2xl hover:shadow-cyan-500/25 transform hover:scale-110 transition-all duration-300 flex items-center gap-4 border-2 border-white/20 hover:border-white/40"
            >
              <Globe className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
              🚀 Start Planning Now
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
            </button>

            <button
              onClick={onExplore}
              className="group px-10 py-5 border-3 border-cyan-400 text-cyan-100 hover:text-white rounded-full hover:bg-cyan-400/20 hover:border-cyan-300 transition-all duration-300 text-xl font-bold flex items-center gap-4 backdrop-blur-sm bg-white/10"
            >
              <Heart className="w-6 h-6 group-hover:scale-125 text-pink-400 transition-transform duration-300" />
              💖 Explore Destinations
            </button>
          </div>

          {/* Enhanced Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16 border-t border-cyan-400/30">
            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="text-4xl lg:text-6xl font-extrabold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-3">
                1000+
              </div>
              <div className="text-cyan-200 text-lg font-medium">
                🌍 Destinations Worldwide
              </div>
            </div>

            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="text-4xl lg:text-6xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-3">
                50M+
              </div>
              <div className="text-cyan-200 text-lg font-medium">
                😊 Happy Travelers
              </div>
            </div>

            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="text-4xl lg:text-6xl font-extrabold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-3">
                98%
              </div>
              <div className="text-cyan-200 text-lg font-medium">
                ⭐ Satisfaction Rate
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
