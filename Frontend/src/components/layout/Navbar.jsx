import { useEffect, useRef, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useAppContext } from "../../hooks/useAppContext";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Dashboard", path: "/dashboard" },
  { label: "Health Check", path: "/health-check" },
  { label: "Planner", path: "/planner" },
  { label: "Pet Profile", path: "/pet-profile" },
  { label: "Health Records", path: "/health-records" },
  { label: "Recommendations", path: "/recommendation" },
  { label: "Breed Insights", path: "/breed-insights" },
  { label: "Vet Locator", path: "/vet-locator" },
];

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const navigate = useNavigate();

  const {
    isAuthenticated,
    currentUser,
    logout,
    theme,
    toggleTheme,
  } = useAppContext();

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    closeMenu();
    logout();
    navigate("/login");
  };

  const handleThemeToggle = () => {
    console.log("Theme clicked");
    toggleTheme();
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

  const desktopLinkClass = ({ isActive }) =>
    `relative whitespace-nowrap px-2 py-2 text-[13px] font-medium transition-colors ${
      isActive
        ? "text-orange-600 dark:text-orange-400"
        : "text-gray-600 hover:text-orange-600 dark:text-gray-300 dark:hover:text-orange-400"
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `block rounded-xl px-4 py-3 text-sm font-medium transition ${
      isActive
        ? "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400"
        : "text-gray-700 hover:bg-gray-50 hover:text-orange-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-orange-400"
    }`;

  return (
    <nav
      ref={menuRef}
      className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/95 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-[#0B0F14]/95"
    >
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          to="/"
          onClick={closeMenu}
          className="shrink-0 text-lg font-extrabold tracking-tight text-orange-500 transition hover:text-orange-600"
        >
          Smart Paw AI
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden min-w-0 items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={desktopLinkClass}
            >
              {({ isActive }) => (
                <>
                  {item.label}

                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-orange-500" />
                  )}
                </>
              )}
            </NavLink>
          ))}

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={handleThemeToggle}
            className="ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-orange-500 dark:hover:bg-gray-700 dark:hover:text-orange-400"
            aria-label="Toggle dark mode"
            title={
              theme === "dark"
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          {/* Authentication */}
          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              className="ml-2 shrink-0 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 hover:shadow-md active:scale-[0.98]"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="ml-2 shrink-0 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 hover:shadow-md active:scale-[0.98]"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          className="rounded-xl p-2.5 text-gray-700 transition hover:bg-orange-50 hover:text-orange-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-orange-400 lg:hidden"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 top-16 z-40 bg-black/20 backdrop-blur-[2px] dark:bg-black/50 lg:hidden"
            onClick={closeMenu}
          />

          <div className="absolute right-3 top-[4.25rem] z-50 w-[calc(100%-1.5rem)] max-w-sm overflow-hidden rounded-2xl border border-gray-200 bg-white p-3 shadow-2xl dark:border-gray-700 dark:bg-[#111820] lg:hidden">
            <div className="max-h-[calc(100vh-6rem)] space-y-1 overflow-y-auto">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  onClick={closeMenu}
                  className={mobileLinkClass}
                >
                  {item.label}
                </NavLink>
              ))}

              {/* Mobile Theme Toggle */}
              <button
                type="button"
                onClick={handleThemeToggle}
                className="mb-3 mt-3 flex w-full items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-orange-50 hover:text-orange-600 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-orange-400"
              >
                <span>
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </span>

                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>

              {/* Authentication */}
              <div className="border-t border-gray-100 pt-3 dark:border-gray-700">
                {isAuthenticated ? (
                  <>
                    {currentUser?.name && (
                      <p className="mb-3 px-4 text-xs text-gray-500 dark:text-gray-400">
                        Signed in as{" "}
                        <span className="font-semibold text-gray-700 dark:text-gray-200">
                          {currentUser.name}
                        </span>
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 active:scale-[0.99]"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="block w-full rounded-xl bg-orange-500 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 active:scale-[0.99]"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}

export default Navbar;