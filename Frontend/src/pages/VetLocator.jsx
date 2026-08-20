import { useState } from "react";

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

  const searchValue = search.trim().toLowerCase();

  const filteredVets = vets.filter((vet) => {
    if (!searchValue) {
      return true;
    }

    return (
      vet.name.toLowerCase().includes(searchValue) ||
      vet.location.toLowerCase().includes(searchValue)
    );
  });

  const getCurrentLocation = () => {
    setError("");
    setLocationStatus("");

    if (!navigator.geolocation) {
      setError(
        "Location services are not supported by this browser.",
      );
      return;
    }

    setIsLoading(true);
    setLocationStatus("Getting your location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          setLocationStatus(
            "Finding veterinary clinics near you...",
          );

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
              result.message ||
                "Failed to find nearby veterinary clinics.",
            );
          }

          setVets(result.data || []);

          if ((result.data || []).length === 0) {
            setLocationStatus(
              "No veterinary clinics were found nearby.",
            );
          } else {
            setLocationStatus(
              `${result.data.length} veterinary ${
                result.data.length === 1
                  ? "clinic"
                  : "clinics"
              } found near you.`,
            );
          }
        } catch (error) {
          console.error(
            "Failed to load nearby vets:",
            error,
          );

          setError(
            error.message ||
              "Failed to find nearby veterinary clinics.",
          );

          setLocationStatus("");
        } finally {
          setIsLoading(false);
        }
      },
      (locationError) => {
        console.error(
          "Location permission error:",
          locationError,
        );

        setIsLoading(false);
        setLocationStatus("");

        if (
          locationError.code ===
          locationError.PERMISSION_DENIED
        ) {
          setError(
            "Location permission was denied. Please allow location access and try again.",
          );
        } else if (
          locationError.code ===
          locationError.POSITION_UNAVAILABLE
        ) {
          setError(
            "Your current location could not be determined.",
          );
        } else if (
          locationError.code ===
          locationError.TIMEOUT
        ) {
          setError(
            "Getting your location took too long. Please try again.",
          );
        } else {
          setError(
            "Unable to get your current location.",
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000,
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
      `${vet.name}, ${vet.location}`,
    );

    window.open(
      `https://www.google.com/maps/search/?api=1&query=${query}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const openDirections = (vet) => {
    if (
      vet.latitude === undefined ||
      vet.longitude === undefined
    ) {
      openMaps(vet);
      return;
    }

    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${vet.latitude},${vet.longitude}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <section className="px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-orange-500">
          Find Veterinary Care
        </p>

        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          Vet Locator
        </h1>

        <p className="mt-3 text-base leading-7 text-gray-600">
          Find veterinary clinics near your current
          location.
        </p>

        {/* Location Card */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-xl">
              📍
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-base font-semibold text-gray-900">
                Find vets near you
              </h2>

              <p className="mt-1 text-sm leading-6 text-gray-500">
                Allow location access to find veterinary
                clinics around your current position.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={isLoading}
            className="mt-4 w-full rounded-xl bg-orange-500 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading
              ? "Finding Nearby Vets..."
              : "Use My Location"}
          </button>

          {locationStatus && (
            <p className="mt-3 text-center text-xs font-medium text-gray-500">
              {locationStatus}
            </p>
          )}

          {error && (
            <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3">
              <p className="text-sm leading-5 text-red-600">
                {error}
              </p>
            </div>
          )}
        </div>

        {/* Search */}
        {vets.length > 0 && (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <label
                htmlFor="vetSearch"
                className="text-sm font-medium text-gray-700"
              >
                Search results
              </label>

              <button
                type="button"
                onClick={clearResults}
                className="text-xs font-semibold text-gray-500 transition hover:text-orange-500"
              >
                Clear Results
              </button>
            </div>

            <div className="relative mt-2">
              <input
                id="vetSearch"
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search clinic or location"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-20 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />

              {search && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                >
                  Clear
                </button>
              )}
            </div>

            <p className="mt-3 text-xs text-gray-500">
              {filteredVets.length}{" "}
              {filteredVets.length === 1
                ? "clinic"
                : "clinics"}{" "}
              shown
            </p>
          </div>
        )}

        {/* Results */}
        {vets.length > 0 && (
          <div className="mt-6 space-y-4">
            {filteredVets.length > 0 ? (
              filteredVets.map((vet) => (
                <div
                  key={vet.id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-orange-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-lg font-semibold text-gray-900">
                        {vet.name}
                      </h2>

                      <p className="mt-1 text-sm leading-6 text-gray-500">
                        {vet.location}
                      </p>
                    </div>

                    <div className="shrink-0 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-500">
                      {vet.distanceKm} km
                    </div>
                  </div>

                  {vet.phone && (
                    <div className="mt-4 rounded-xl bg-gray-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Phone
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        {vet.phone}
                      </p>
                    </div>
                  )}

                  {vet.openingHours && (
                    <div className="mt-3 rounded-xl bg-gray-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Opening Hours
                      </p>

                      <p className="mt-1 text-sm text-gray-700">
                        {vet.openingHours}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() =>
                        openDirections(vet)
                      }
                      className="rounded-xl bg-orange-500 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-orange-600"
                    >
                      Get Directions
                    </button>

                    {vet.phone ? (
                      <a
                        href={`tel:${vet.phone.replace(
                          /\s/g,
                          "",
                        )}`}
                        className="rounded-xl border border-orange-200 px-4 py-3 text-center text-sm font-semibold text-orange-500 transition hover:bg-orange-50"
                      >
                        Call Clinic
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openMaps(vet)}
                        className="rounded-xl border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-600 transition hover:border-orange-200 hover:text-orange-500"
                      >
                        Open in Maps
                      </button>
                    )}
                  </div>

                  {vet.website && (
                    <a
                      href={vet.website}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 block text-center text-xs font-semibold text-gray-500 hover:text-orange-500"
                    >
                      Visit clinic website
                    </a>
                  )}
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
                <p className="text-sm font-semibold text-gray-700">
                  No matching clinics found
                </p>

                <p className="mt-1 text-sm leading-6 text-gray-500">
                  Try a different clinic name or location.
                </p>

                <button
                  type="button"
                  onClick={clearSearch}
                  className="mt-4 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
                >
                  Show All Results
                </button>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && vets.length === 0 && !error && (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-xl">
              📍
            </div>

            <h2 className="mt-3 text-base font-semibold text-gray-900">
              Find veterinary clinics near you
            </h2>

            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-gray-500">
              Click "Use My Location" and Smart Paw AI will
              search for veterinary clinics around your current
              position.
            </p>
          </div>
        )}

        {/* Information */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs leading-5 text-gray-500">
            Location-based clinic information comes from
            OpenStreetMap data. Availability, phone numbers,
            opening hours, and other details may be incomplete
            or outdated. Confirm important information directly
            with the clinic before visiting.
          </p>
        </div>
      </div>
    </section>
  );
}

export default VetLocator;