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

  const filteredVets = initialVets.filter(
    (vet) =>
      vet.name.toLowerCase().includes(search.toLowerCase()) ||
      vet.location.toLowerCase().includes(search.toLowerCase()),
  );

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

          <input
            id="vetSearch"
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="e.g. City Center"
            className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          />
        </div>

        <div className="mt-6 space-y-4">
          {filteredVets.length > 0 ? (
            filteredVets.map((vet) => (
              <div
                key={vet.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {vet.name}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      {vet.location}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      vet.open
                        ? "bg-green-50 text-green-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {vet.open ? "Open" : "Closed"}
                  </span>
                </div>

                <p className="mt-4 text-sm text-gray-600">
                  {vet.phone}
                </p>

                <button
                  type="button"
                  className="mt-4 w-full rounded-xl border border-orange-200 px-4 py-3 text-sm font-semibold text-orange-500 transition hover:bg-orange-50"
                >
                  Contact Clinic
                </button>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
              <p className="text-sm text-gray-500">
                No veterinary clinics found.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default VetLocator;