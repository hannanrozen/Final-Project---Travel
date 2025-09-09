import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const UserLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default UserLayout;
