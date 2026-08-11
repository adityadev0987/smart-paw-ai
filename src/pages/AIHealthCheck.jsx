function AIHealthCheck() {
  return (
    <section className="px-4 py-8">
      <div className="mx-auto max-w-md">
        <p className="text-sm font-semibold uppercase tracking-wider text-orange-500">
          AI Powered
        </p>

        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          AI Health Check
        </h1>

        <p className="mt-3 text-base leading-7 text-gray-600">
          Get helpful health insights by telling us about your pet.
        </p>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Start a health check
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            Answer a few questions about your pet's symptoms and recent
            behavior.
          </p>

          <button
            type="button"
            className="mt-5 w-full rounded-xl bg-orange-500 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            Start Health Check
          </button>
        </div>
      </div>
    </section>
  )
}

export default AIHealthCheck