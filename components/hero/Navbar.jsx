import { useState } from "react";
import { FaUserCircle, FaBars, FaTimes } from "react-icons/fa";

const Navbar = ({ viewMode, setViewMode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="left-0 w-full bg-white shadow-lg p-4 flex justify-between items-center mb-2 exclude-print">
      {/* Logo */}
      <img src="assets/CVLogo.png" alt="Logo" className="h-10 w-10" />

      {/* Mobile Menu Button */}
      <button
        className="md:hidden text-2xl text-gray-700"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Desktop Navigation */}
      <div className="hidden md:flex space-x-4">
        <button
          className={`px-6 py-3 rounded-lg transition-all ${
            viewMode === "builder"
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "text-gray-600 hover:bg-blue-50"
          }`}
          onClick={() => setViewMode("builder")}
        >
          📝 Resume Builder
        </button>
        <button
          className={`px-6 py-3 rounded-lg transition-all ${
            viewMode === "latex"
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "text-gray-600 hover:bg-blue-50"
          }`}
          onClick={() => setViewMode("latex")}
        >
          ✨ LaTeX Code
        </button>
        <button
          className={`px-6 py-3 rounded-lg transition-all ${
            viewMode === "smart"
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "text-gray-600 hover:bg-blue-50"
          }`}
          onClick={() => setViewMode("smart")}
        >
          🤖 AI Assistant
        </button>
      </div>

      {/* Profile Menu */}
      <div className="relative">
        <button
          className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <FaUserCircle className="text-2xl" />
          <span>Profile</span>
        </button>
        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg overflow-hidden">
            <a
              href="/profile"
              className="block px-4 py-2 text-gray-700 hover:bg-blue-50"
            >
              Profile
            </a>
            <a
              href="/logout"
              className="block px-4 py-2 text-gray-700 hover:bg-blue-50"
            >
              Logout
            </a>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-white shadow-lg md:hidden">
          <button
            className="block w-full text-left px-6 py-3 text-gray-600 hover:bg-blue-50"
            onClick={() => setViewMode("builder")}
          >
            📝 Resume Builder
          </button>
          <button
            className="block w-full text-left px-6 py-3 text-gray-600 hover:bg-blue-50"
            onClick={() => setViewMode("latex")}
          >
            ✨ LaTeX Code
          </button>
          <button
            className="block w-full text-left px-6 py-3 text-gray-600 hover:bg-blue-50"
            onClick={() => setViewMode("smart")}
          >
            🤖 AI Assistant
          </button>
        </div>
      )}
    </div>
  );
};

export default Navbar;
