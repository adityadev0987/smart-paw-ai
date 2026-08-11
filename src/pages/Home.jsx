import { Link } from "react-router-dom";
function Home() {
  return (
    <>
      <section className="px-4 py-10">
        <div className="mx-auto max-w-md text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-orange-500">
            Smart Pet Care
          </p>

          <h1 className="text-3xl font-bold leading-tight text-gray-900">
            Know More.
            <br />
            Care Better.
          </h1>

          <p className="mt-4 text-base leading-7 text-gray-600">
            Keep your pet's health, daily activities and care information
            organized in one place.
          </p>

          <Link
            to="/health-check"
            className="mt-6 block w-full rounded-xl bg-orange-500 px-5 py-3.5 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
          >
            Get Started
          </Link>
        </div>
      </section>

      <section className="px-4 py-10">
        <div className="mx-auto max-w-md">
          <h2 className="text-2xl font-bold text-gray-900">
            Everything your pet needs
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            Manage your pet's health and care from one simple place.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Daily Care
              </span>
              <h3 className="text-lg font-semibold text-gray-900">
                Health Tracking
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Keep track of your pet's daily health and important records.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-orange-500">
                AI Powered
              </span>

              <h3 className="text-lg font-semibold text-gray-900">
                AI Health Check
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Get context-aware health insights based on your pet's
                information.
              </p>
              <Link
                to="/health-check"
                className="mt-4 block text-sm font-semibold text-orange-500 hover:text-orange-600"
              >
                Check your pet's health →
              </Link>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Smart Planning
              </span>

              <h3 className="text-lg font-semibold text-gray-900">
                Care Planner
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Stay on top of vaccinations, medicines and important care tasks.
              </p>

              <Link
                to="/planner"
                className="mt-4 block text-sm font-semibold text-orange-500 hover:text-orange-600"
              >
                Plan your pet's care →
              </Link>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Expert Care
              </span>

              <h3 className="text-lg font-semibold text-gray-900">
                Find a Vet
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Find nearby veterinary care when your pet needs professional
                attention.
              </p>
              <Link
                to="/vet-locator"
                className="mt-4 block text-sm font-semibold text-orange-500 hover:text-orange-600"
              >
                Find a vet →
              </Link>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Pet Knowledge
              </span>

              <h3 className="text-lg font-semibold text-gray-900">
                Breed Insights
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Explore useful information about your pet's breed, care and
                behavior.
              </p>
              <Link
                to="/breed-insights"
                className="mt-4 block text-sm font-semibold text-orange-500 hover:text-orange-600"
              >
                Explore breed insights →
              </Link>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Health Records
              </span>

              <h3 className="text-lg font-semibold text-gray-900">
                Health History
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Keep your pet's health records, vaccinations and important
                history organized.
              </p>
              <Link
                to="/health-records"
                className="mt-4 block text-sm font-semibold text-orange-500 hover:text-orange-600"
              >
                View health records →
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8">
          <button
            type="button"
            className="w-full rounded-xl border border-orange-500 px-5 py-3 text-sm font-semibold text-orange-500 transition hover:bg-orange-50"
          >
            Explore all features
          </button>
        </div>
      </section>
    </>
  );
}

export default Home;
