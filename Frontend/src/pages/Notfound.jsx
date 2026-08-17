import { Link } from "react-router-dom";

function Notfound() {
  return (
    <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-orange-500">
          404 Error
        </p>

        <h1 className="mt-3 text-4xl font-bold text-gray-900">
          Page not found
        </h1>

        <p className="mt-3 text-sm leading-6 text-gray-600">
          Sorry, the page you're looking for doesn't exist.
        </p>

        <Link
          to="/"
          className="mt-6 inline-flex rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600"
        >
          Back to Home
        </Link>
      </div>
    </section>
  );
}

export default Notfound;
