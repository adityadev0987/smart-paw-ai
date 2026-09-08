import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  Globe,
  LocateFixed,
  MapPin,
  Navigation,
  Phone,
  Search,
  ShieldCheck,
  Stethoscope,
  X,
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000/api";

function getAuthHeaders() {
  const token = localStorage.getItem("smartPawToken");

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

function VetLocator() {
  const [search, setSearch] = useState("");
  const [vets, setVets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [locationStatus, setLocationStatus] = useState("");

  const filteredVets = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return vets;

    return vets.filter((vet) => {
      const name = vet.name?.toLowerCase() || "";
      const location = vet.location?.toLowerCase() || "";
      const address = vet.address?.toLowerCase() || "";

      return (
        name.includes(query) ||
        location.includes(query) ||
        address.includes(query)
      );
    });
  }, [search, vets]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setIsLoading(true);
    setError("");
    setLocationStatus("Getting your current location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          setLocationStatus("Finding nearby veterinary clinics...");

          const response = await fetch(
            `${API_BASE_URL}/vets/nearby?lat=${latitude}&lng=${longitude}`,
            {
              headers: {
                ...getAuthHeaders(),
              },
            },
          );

          const result = await response.json();

          if (!response.ok) {
            throw new Error(
              result.message || "Unable to find nearby veterinarians.",
            );
          }

          setVets(result.data || []);
          setLocationStatus(
            `${result.data?.length || 0} veterinary clinic${
              result.data?.length === 1 ? "" : "s"
            } found near you.`,
          );
        } catch (err) {
          setError(
            err.message || "Something went wrong while finding veterinarians.",
          );
          setLocationStatus("");
        } finally {
          setIsLoading(false);
        }
      },
      (geoError) => {
        setIsLoading(false);
        setLocationStatus("");

        if (geoError.code === geoError.PERMISSION_DENIED) {
          setError(
            "Location permission was denied. Please allow location access and try again.",
          );
        } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
          setError("Your current location could not be determined.");
        } else if (geoError.code === geoError.TIMEOUT) {
          setError("Location request timed out. Please try again.");
        } else {
          setError("Unable to access your current location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  const clearSearch = () => {
    setSearch("");
  };

  const clearResults = () => {
    setVets([]);
    setSearch("");
    setError("");
    setLocationStatus("");
  };

  const openMaps = (vet) => {
    const query = encodeURIComponent(
      `${vet.name || "Veterinary clinic"} ${vet.location || vet.address || ""}`,
    );

    window.open(
      `https://www.google.com/maps/search/?api=1&query=${query}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const openDirections = (vet) => {
    if (vet.latitude && vet.longitude) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${vet.latitude},${vet.longitude}`,
        "_blank",
        "noopener,noreferrer",
      );
      return;
    }

    openMaps(vet);
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-white px-4 py-8 text-slate-900 transition-colors duration-300 dark:bg-[#0b0f14] dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Background glow */}
        <div className="pointer-events-none fixed left-1/2 top-20 -z-0 h-72 w-72 -translate-x-1/2 rounded-full bg-orange-500/10 blur-3xl dark:bg-orange-500/10" />

        {/* Header */}
        <section className="relative z-10 mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-600 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-400">
            <Stethoscope size={14} />
            Veterinary Care
          </div>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="max-w-3xl text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                Find a trusted{" "}
                <span className="text-orange-500">vet nearby.</span>
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
                Quickly discover nearby veterinary clinics and get directions
                when your pet needs professional care.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <ShieldCheck size={16} className="text-orange-500" />
              Location-based results
            </div>
          </div>
        </section>

        {/* Location card */}
        <section className="relative z-10 mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm dark:border-white/10 dark:bg-[#111820] sm:p-6">
          <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-orange-500/10 blur-2xl" />

          <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500">
                <LocateFixed size={24} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900 dark:text-white">
                  Search near your location
                </h2>

                <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">
                  Allow location access to find veterinary clinics around you.
                </p>

                {locationStatus && (
                  <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-orange-500">
                    <CheckCircle2 size={14} />
                    {locationStatus}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LocateFixed
                size={17}
                className={isLoading ? "animate-pulse" : ""}
              />
              {isLoading ? "Finding vets..." : "Find Vets Near Me"}
            </button>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="relative z-10 mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
            <AlertCircle className="mt-0.5 shrink-0" size={18} />
            <div>
              <p className="font-bold">Something went wrong</p>
              <p className="mt-1 opacity-90">{error}</p>
            </div>
          </div>
        )}

        {/* Search */}
        <section className="relative z-10 mb-6">
          <div className="relative">
            <Search
              size={19}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by clinic name or location..."
              className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-12 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 dark:border-white/10 dark:bg-[#111820] dark:text-white dark:placeholder:text-slate-500"
            />

            {search && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
                aria-label="Clear search"
              >
                <X size={17} />
              </button>
            )}
          </div>
        </section>

        {/* Results header */}
        {vets.length > 0 && (
          <div className="relative z-10 mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {filteredVets.length}{" "}
                {filteredVets.length === 1 ? "clinic" : "clinics"} found
              </p>

              {search && (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Showing results matching "{search}"
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={clearResults}
              className="self-start text-xs font-bold text-slate-500 transition hover:text-orange-500 dark:text-slate-400"
            >
              Clear results
            </button>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="relative z-10 grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-56 animate-pulse rounded-3xl border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-[#111820]"
              />
            ))}
          </div>
        )}

        {/* Vet cards */}
        {!isLoading && filteredVets.length > 0 && (
          <section className="relative z-10 grid gap-5 md:grid-cols-2">
            {filteredVets.map((vet, index) => (
              <article
                key={vet.id || vet._id || `${vet.name}-${index}`}
                className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5 dark:border-white/10 dark:bg-[#111820] dark:hover:border-orange-500/30 sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500">
                      <Building2 size={22} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-extrabold text-slate-900 dark:text-white">
                        {vet.name || "Veterinary Clinic"}
                      </h3>

                      <div className="mt-1 flex items-start gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                        <MapPin size={15} className="mt-0.5 shrink-0 text-orange-500" />
                        <span>
                          {vet.location || vet.address || "Location unavailable"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {vet.distance != null && (
                    <span className="shrink-0 rounded-full bg-orange-500/10 px-2.5 py-1 text-xs font-bold text-orange-500">
                      {typeof vet.distance === "number"
                        ? `${vet.distance.toFixed(1)} km`
                        : vet.distance}
                    </span>
                  )}
                </div>

                <div className="my-5 h-px bg-slate-100 dark:bg-white/10" />

                <div className="grid gap-2 sm:grid-cols-2">
                  {vet.phone && (
                    <a
                      href={`tel:${vet.phone}`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 dark:border-white/10 dark:text-slate-200 dark:hover:border-orange-500/30 dark:hover:bg-orange-500/10 dark:hover:text-orange-400"
                    >
                      <Phone size={16} />
                      Call
                    </a>
                  )}

                  {vet.website && (
                    <a
                      href={vet.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 dark:border-white/10 dark:text-slate-200 dark:hover:border-orange-500/30 dark:hover:bg-orange-500/10 dark:hover:text-orange-400"
                    >
                      <Globe size={16} />
                      Website
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => openMaps(vet)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 dark:border-white/10 dark:text-slate-200 dark:hover:border-orange-500/30 dark:hover:bg-orange-500/10 dark:hover:text-orange-400"
                  >
                    <MapPin size={16} />
                    View Map
                  </button>

                  <button
                    type="button"
                    onClick={() => openDirections(vet)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white shadow-md shadow-orange-500/15 transition hover:bg-orange-600"
                  >
                    <Navigation size={16} />
                    Directions
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}

        {/* No search results */}
        {!isLoading && vets.length > 0 && filteredVets.length === 0 && (
          <section className="relative z-10 rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center dark:border-white/10 dark:bg-[#111820]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500">
              <Search size={24} />
            </div>

            <h3 className="mt-4 text-lg font-extrabold">
              No matching clinics
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
              Try searching with another clinic name or location.
            </p>
          </section>
        )}

        {/* Initial empty state */}
        {!isLoading && vets.length === 0 && !error && (
          <section className="relative z-10 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 px-6 py-14 text-center dark:border-white/10 dark:bg-[#111820]">
            <div className="absolute left-1/2 top-0 h-32 w-64 -translate-x-1/2 rounded-full bg-orange-500/10 blur-3xl" />

            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500">
              <Stethoscope size={28} />
            </div>

            <h2 className="relative mt-5 text-xl font-extrabold sm:text-2xl">
              Your nearby vets are one click away
            </h2>

            <p className="relative mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500 dark:text-slate-400">
              Use your current location to discover veterinary clinics near
              you, then view their location or get directions.
            </p>

            <div className="relative mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={getCurrentLocation}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600"
              >
                <LocateFixed size={17} />
                Find Vets Near Me
              </button>

              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <CalendarDays size={14} />
                Available whenever you need care
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default VetLocator;