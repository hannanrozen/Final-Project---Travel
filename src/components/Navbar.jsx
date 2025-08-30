import { useState, useEffect } from "react";
import Logo from "./Logo";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`container-px fixed top-0 left-0 right-0 z-50 p-4 flex justify-center items-center transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md" : "bg-transparent"
      }`}
    >
      <div className="container flex w-full items-center">
        <div className="flex-1">
          <Logo isScrolled={isScrolled} />
        </div>

        <ul
          className={`flex flex-1 items-center justify-center gap-3 ${
            isScrolled ? "text-slate-800" : "text-white"
          }`}
        >
          <li className="hover:cursor-pointer hover:bg-blue-500 hover:text-white px-3 py-2 rounded-full">
            Home
          </li>
          <li className="hover:cursor-pointer hover:bg-blue-500 hover:text-white px-3 py-2 rounded-full">
            About
          </li>
          <li className="hover:cursor-pointer hover:bg-blue-500 hover:text-white px-3 py-2 rounded-full">
            Contact
          </li>
        </ul>

        {user ? (
          <div className="flex flex-1 justify-end">{user.name}</div>
        ) : (
          <div className="flex flex-1 justify-end gap-4">
            <a
              href="/auth/login"
              className={`btn-ghost px-4 py-2 hover:bg-white hover:text-slate-800 hover:cursor-pointer rounded-full ${
                isScrolled ? "text-slate-800" : "text-white"
              }`}
            >
              Login
            </a>
            <a
              href="/auth/register"
              className={`btn-primary px-4 py-2 rounded-full hover:bg-blue-700 hover:text-white hover:cursor-pointer ${
                isScrolled
                  ? "bg-blue-500 text-white"
                  : "bg-white text-slate-800 "
              }`}
            >
              Sign Up
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
