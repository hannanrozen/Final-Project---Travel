import Navbar from "../../components/Navbar";
import HeroImage from "./../../assets/images/hero_image.jpg";

function Hero() {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col gap-6 items-center justify-center text-white text-center"
      style={{ backgroundImage: `url(${HeroImage})` }}
    >
      <div className="space-y-1.5">
        <h1 className="text-6xl font-medium text-shadow-xs">
          Discover Your Next Amazing <br />
          Journey Excitement and Wonder
        </h1>
      </div>
      <div className="bg-white max-w-5xl w-full p-4 rounded-lg shadow-md">
        <div className="w-full">aasdasdasd</div>
      </div>
    </div>
  );
}

export default function HomeIndex() {

  return (
    <>
      <Navbar />
      <Hero />
      <div>asdasdasd</div>
    </>
  );
}
