import { useEffect, useRef, useState } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, Menu, X, Sun, Moon, Stethoscope } from "lucide-react";
import { useAppContext } from "../../hooks/useAppContext";
import { getNotifications, markNotificationRead } from "../../services/api";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Dashboard", path: "/dashboard" },
  { label: "Health Check", path: "/health-check" },
  { label: "Doctor Consultation", path: "/consultations", icon: Stethoscope },
  { label: "Planner", path: "/planner" },
  { label: "Pet Profile", path: "/pet-profile" },
  { label: "Recommendations", path: "/recommendation" },
  { label: "Breed Insights", path: "/breed-insights" },
  { label: "Vet Locator", path: "/vet-locator" },
  { label: "Community", path: "/community" },
];

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const [healthNotification, setHealthNotification] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const {
    isAuthenticated,
    currentUser,
    logout,
    theme,
    toggleTheme,
  } = useAppContext();
  const visibleNavItems = currentUser?.role === "doctor"
    ? [{ label: "Doctor Dashboard", path: "/doctor/dashboard", icon: Stethoscope }, { label: "Planner", path: "/planner" }]
    : navItems;

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    let active = true;
    const load = async () => { try { const result = await getNotifications(); if (active) setNotifications(result.notifications || []); } catch { /* Navigation remains usable if notifications are offline. */ } };
    load(); const timer = window.setInterval(load, 20000);
    return () => { active = false; window.clearInterval(timer); };
  }, [isAuthenticated]);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    closeMenu();
    logout();
    navigate("/");
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

  useEffect(() => {
    const handleHealthCheckReady = (event) => {
      if (location.pathname === "/health-check") {
        return;
      }

      setHealthNotification(event.detail || {});
    };

    window.addEventListener(
      "smartPawHealthCheckReady",
      handleHealthCheckReady,
    );

    return () => {
      window.removeEventListener(
        "smartPawHealthCheckReady",
        handleHealthCheckReady,
      );
    };
  }, [location.pathname]);

  useEffect(() => {
    if (!healthNotification) {
      return undefined;
    }

    const timeoutId = window.setTimeout(
      () => setHealthNotification(null),
      10000,
    );

    return () => window.clearTimeout(timeoutId);
  }, [healthNotification]);

  const openHealthNotification = () => {
    setHealthNotification(null);
    navigate("/health-check");
  };
  const openNotification = async (item) => {
    if (!item.readAt) {
      await markNotificationRead(item._id).catch(() => {});
      setNotifications((current) => current.map((value) => value._id === item._id ? { ...value, readAt: new Date().toISOString() } : value));
    }
    setShowNotifications(false);
    navigate(currentUser?.role === "doctor" && item.consultationId
      ? `/doctor/consultations/${item.consultationId}`
      : item.type === "consultation_report" && item.consultationId
        ? `/consultations/${item.consultationId}/report`
        : item.consultationId
          ? `/consultations?consultationId=${item.consultationId}`
        : currentUser?.role === "doctor" ? "/doctor/dashboard" : "/consultations");
  };

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
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={desktopLinkClass}
            >
              {({ isActive }) => (
                <>
                  <span className="inline-flex items-center gap-1.5">{item.icon && <item.icon size={15} />}{item.label}</span>

                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-orange-500" />
                  )}
                </>
              )}
            </NavLink>
          ))}

          {/* Theme Toggle */}
          {isAuthenticated && <button type="button" onClick={() => setShowNotifications((open) => !open)} aria-label="Notifications" className="relative ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:text-orange-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"><Bell size={16} />{notifications.some((item) => !item.readAt) && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500 dark:border-gray-800" />}</button>}
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
        {isAuthenticated && <button type="button" onClick={() => setShowNotifications((open) => !open)} aria-label="Notifications" className="relative ml-auto mr-1 flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300 lg:hidden"><Bell size={17} />{notifications.some((item) => !item.readAt) && <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-red-500" />}</button>}
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

      {showNotifications && <div className="absolute right-3 top-16 z-[60] w-[calc(100vw-1.5rem)] max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-[#111820]"><div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-700"><p className="text-sm font-black">Notifications</p><button onClick={() => setShowNotifications(false)} className="text-xs font-bold text-orange-600">Close</button></div><div className="max-h-80 overflow-y-auto">{notifications.length ? notifications.map((item) => <button key={item._id} onClick={() => openNotification(item)} className={`block w-full border-b border-slate-50 px-4 py-3 text-left dark:border-slate-800 ${item.readAt ? "opacity-60" : "bg-orange-50/70 dark:bg-orange-500/5"}`}><p className="text-xs font-bold text-slate-800 dark:text-slate-100">{item.message}</p><p className="mt-1 text-[10px] text-slate-400">{new Date(item.createdAt).toLocaleString()}</p></button>) : <p className="p-5 text-center text-sm text-slate-500">You’re all caught up.</p>}</div></div>}

      {healthNotification && (
        <div className="fixed right-4 top-20 z-[70] w-[calc(100vw-2rem)] max-w-[360px] sm:right-6">
          <button
            type="button"
            onClick={openHealthNotification}
            className="flex w-full items-start gap-3 rounded-2xl border border-orange-200 bg-white p-4 text-left shadow-2xl shadow-orange-500/10 transition hover:border-orange-400 dark:border-orange-500/30 dark:bg-[#111820]"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white">
              <Bell size={17} />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold text-slate-900 dark:text-white">
                AI health check ready
              </span>
              <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">
                {healthNotification.status === "FOLLOW_UP"
                  ? `${healthNotification.petName || "Your pet"} has a follow-up question waiting.`
                  : `${healthNotification.petName || "Your pet"}'s health response is ready.`}
              </span>
              <span className="mt-2 block text-xs font-bold text-orange-600 dark:text-orange-400">
                Open Health Check
              </span>
            </span>
          </button>
        </div>
      )}

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 top-16 z-40 bg-black/20 backdrop-blur-[2px] dark:bg-black/50 lg:hidden"
            onClick={closeMenu}
          />

          <div className="absolute right-3 top-[4.25rem] z-50 w-[calc(100%-1.5rem)] max-w-sm overflow-hidden rounded-2xl border border-gray-200 bg-white p-3 shadow-2xl dark:border-gray-700 dark:bg-[#111820] lg:hidden">
            <div className="max-h-[calc(100vh-6rem)] space-y-1 overflow-y-auto">
              {visibleNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  onClick={closeMenu}
                  className={mobileLinkClass}
                >
                  <span className="inline-flex items-center gap-2">{item.icon && <item.icon size={17} />}{item.label}</span>
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
