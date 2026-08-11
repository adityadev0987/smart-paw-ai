import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="text-lg font-bold text-orange-500">
          Smart Paw AI
        </Link>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="rounded-lg p-2 text-gray-700 hover:bg-orange-50 hover:text-orange-500 md:hidden"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 md:flex">
          <Link
            to="/"
            className="text-sm font-medium text-gray-700 hover:text-orange-500"
          >
            Home
          </Link>

          <Link
            to="/health-check"
            className="text-sm font-medium text-gray-700 hover:text-orange-500"
          >
            Health Check
          </Link>

          <Link
            to="/planner"
            className="text-sm font-medium text-gray-700 hover:text-orange-500"
          >
            Planner
          </Link>

          <Link
            to="/breed-insights"
            className="text-sm font-medium text-gray-700 hover:text-orange-500"
          >
            Breed Insights
          </Link>

          <Link
            to="/vet-locator"
            className="text-sm font-medium text-gray-700 hover:text-orange-500"
          >
            Vet Locator
          </Link>

          <Link
            to="/login"
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
          >
            Login
          </Link>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="absolute right-0 top-16 z-50 w-[60%] max-w-sm rounded-2xl border border-gray-200 bg-white p-4 shadow-xl md:hidden">
          {" "}
          <div className="flex flex-col gap-2">
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-500"
            >
              Home
            </Link>

            <Link
              to="/health-check"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-500"
            >
              Health Check
            </Link>

            <Link
              to="/planner"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-500"
            >
              Planner
            </Link>

            <Link
              to="/breed-insights"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-500"
            >
              Breed Insights
            </Link>

            <Link
              to="/vet-locator"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-500"
            >
              Vet Locator
            </Link>

            <Link
              to="/login"
              onClick={() => setIsMenuOpen(false)}
              className="mt-2 w-full rounded-lg bg-orange-500 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-orange-600"
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
