import { useState } from "react";

const initialVets = [
  {
    id: 1,
    name: "Happy Paws Veterinary Clinic",
    location: "City Center",
    phone: "+91 98765 43210",
    open: true,
  },
  {
    id: 2,
    name: "Pet Care Animal Hospital",
    location: "Green Park",
    phone: "+91 98765 12345",
    open: true,
  },
  {
    id: 3,
    name: "Healthy Tails Vet Clinic",
    location: "Main Road",
    phone: "+91 98765 67890",
    open: false,
  },
];

function VetLocator() {
  const [search, setSearch] = useState("");

  const filteredVets = initialVets.filter((vet) => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return true;
    }

    return (
      vet.name.toLowerCase().includes(searchValue) ||
      vet.location.toLowerCase().includes(searchValue)
    );
  });

  const clearSearch = () => {
    setSearch("");
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
          Find veterinary clinics and animal hospitals near you.
        </p>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <label
            htmlFor="vetSearch"
            className="text-sm font-medium text-gray-700"
          >
            Search by clinic or location
          </label>

          <div className="relative mt-2">
            <input
              id="vetSearch"
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="e.g. City Center"
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

          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {filteredVets.length}{" "}
              {filteredVets.length === 1 ? "clinic" : "clinics"} found
            </p>

            {search && (
              <p className="text-xs text-gray-500">
                Searching for "{search}"
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {filteredVets.length > 0 ? (
            filteredVets.map((vet) => (
              <div
                key={vet.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {vet.name}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      {vet.location}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                      vet.open
                        ? "bg-green-50 text-green-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {vet.open ? "Open" : "Closed"}
                  </span>
                </div>

                <div className="mt-4 rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Phone
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {vet.phone}
                  </p>
                </div>

                <a
                  href={`tel:${vet.phone.replace(/\s/g, "")}`}
                  className="mt-4 block w-full rounded-xl border border-orange-200 px-4 py-3 text-center text-sm font-semibold text-orange-500 transition hover:bg-orange-50"
                >
                  Contact Clinic
                </a>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
              <p className="text-sm font-semibold text-gray-700">
                No veterinary clinics found
              </p>

              <p className="mt-1 text-sm leading-6 text-gray-500">
                Try searching with a different clinic name or location.
              </p>

              <button
                type="button"
                onClick={clearSearch}
                className="mt-4 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                Show All Clinics
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default VetLocator;