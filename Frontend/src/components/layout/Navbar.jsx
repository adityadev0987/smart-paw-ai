import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAppContext } from "../../hooks/useAppContext";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const navigate = useNavigate();
  const { isAuthenticated, currentUser, logout } = useAppContext();

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    closeMenu();
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isMenuOpen]);

  return (
    <nav
      ref={menuRef}
      className="relative z-50 border-b border-gray-200 bg-white"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link
          to="/"
          onClick={closeMenu}
          className="text-lg font-bold text-orange-500"
        >
          Smart Paw AI
        </Link>

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

        <div className="hidden items-center gap-5 md:flex">
          <Link
            to="/"
            className="text-sm font-medium text-gray-700 hover:text-orange-500"
          >
            Home
          </Link>

          <Link
            to="/dashboard"
            className="text-sm font-medium text-gray-700 hover:text-orange-500"
          >
            Dashboard
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
            to="/pet-profile"
            className="text-sm font-medium text-gray-700 hover:text-orange-500"
          >
            Pet Profile
          </Link>

          <Link
            to="/health-records"
            className="text-sm font-medium text-gray-700 hover:text-orange-500"
          >
            Health Records
          </Link>

          <Link
            to="/recommendation"
            className="text-sm font-medium text-gray-700 hover:text-orange-500"
          >
            Recommendations
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

          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
            >
              Login
            </Link>
          )}
        </div>
      </div>

      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 top-16 z-40 bg-black/10 md:hidden"
            onClick={closeMenu}
          />

          <div className="absolute right-0 top-16 z-50 w-[75%] max-w-sm rounded-2xl border border-gray-200 bg-white p-4 shadow-xl md:hidden">
            <div className="flex max-h-[calc(100vh-5rem)] flex-col gap-2 overflow-y-auto">
              <Link
                to="/"
                onClick={closeMenu}
                className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-500"
              >
                Home
              </Link>

              <Link
                to="/dashboard"
                onClick={closeMenu}
                className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-500"
              >
                Dashboard
              </Link>

              <Link
                to="/health-check"
                onClick={closeMenu}
                className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-500"
              >
                Health Check
              </Link>

              <Link
                to="/planner"
                onClick={closeMenu}
                className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-500"
              >
                Planner
              </Link>

              <Link
                to="/pet-profile"
                onClick={closeMenu}
                className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-500"
              >
                Pet Profile
              </Link>

              <Link
                to="/health-records"
                onClick={closeMenu}
                className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-500"
              >
                Health Records
              </Link>

              <Link
                to="/recommendation"
                onClick={closeMenu}
                className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-500"
              >
                Recommendations
              </Link>

              <Link
                to="/breed-insights"
                onClick={closeMenu}
                className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-500"
              >
                Breed Insights
              </Link>

              <Link
                to="/vet-locator"
                onClick={closeMenu}
                className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-500"
              >
                Vet Locator
              </Link>

              {isAuthenticated ? (
                <div className="mt-2">
                  {currentUser?.name && (
                    <p className="mb-2 px-3 text-xs text-gray-500">
                      Signed in as {currentUser.name}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full rounded-lg bg-orange-500 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-orange-600"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="mt-2 w-full rounded-lg bg-orange-500 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-orange-600"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
}

export default Navbar;