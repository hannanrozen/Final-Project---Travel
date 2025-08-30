import LogoNavbar from "../assets/icons/Logonavbar.svg";
import LogoFooter from "../assets/icons/Footernavbar.svg";

export default function Logo({ isScrolled = false }) {
  return (
    <img
      src={isScrolled ? LogoFooter : LogoNavbar}
      alt="App Logo"
      className="h-10 w-auto transition-all duration-300"
    />
  );
}
