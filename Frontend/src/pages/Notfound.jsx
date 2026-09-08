import { Link } from "react-router-dom";
import { ArrowLeft, Home, PawPrint } from "lucide-react";

function Notfound() {
  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden bg-white px-4 py-16 transition-colors duration-300 dark:bg-[#0B0F14]">
      {/* Background Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/10 blur-3xl dark:bg-orange-500/15" />

      <div className="relative w-full max-w-lg text-center">
        {/* Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-orange-200 bg-orange-50 text-orange-500 shadow-sm dark:border-orange-500/20 dark:bg-orange-500/10">
          <PawPrint size={38} strokeWidth={1.8} />
        </div>

        {/* 404 */}
        <p className="mt-7 text-sm font-bold uppercase tracking-[0.25em] text-orange-500">
          404 Error
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-white">
          Page not found
        </h1>

        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-gray-600 sm:text-base dark:text-gray-400">
          Looks like this page wandered off. The page you're looking for
          doesn't exist or may have been moved.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 hover:shadow-orange-500/30 sm:w-auto"
          >
            <Home size={17} />
            Back to Home
          </Link>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:border-orange-200 hover:text-orange-500 dark:border-gray-700 dark:bg-[#111820] dark:text-gray-300 dark:hover:border-orange-500/30 dark:hover:text-orange-400 sm:w-auto"
          >
            <ArrowLeft size={17} />
            Go Back
          </button>
        </div>

        {/* Footer Hint */}
        <p className="mt-8 text-xs text-gray-400 dark:text-gray-500">
          Smart Paw AI • Caring for pets, powered by AI
        </p>
      </div>
    </section>
  );
}

export default Notfound;