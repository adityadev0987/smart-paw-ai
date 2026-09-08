import { Link } from "react-router-dom";
import {
  HeartPulse,
  CalendarCheck,
  PawPrint,
  Stethoscope,
  BookOpen,
  FileHeart,
  Sparkles,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    label: "Daily Care",
    title: "Health Tracking",
    description:
      "Keep track of your pet's daily health and important records.",
    icon: HeartPulse,
    path: "/dashboard",
  },
  {
    label: "AI Powered",
    title: "AI Health Check",
    description:
      "Get health insights based on your pet's symptoms and behavior.",
    icon: Sparkles,
    path: "/health-check",
  },
  {
    label: "Smart Planning",
    title: "Care Planner",
    description:
      "Stay on top of vaccinations, medicines and important care tasks.",
    icon: CalendarCheck,
    path: "/planner",
  },
  {
    label: "Pet Profile",
    title: "Pet Profile",
    description:
      "View and manage your pet's basic information in one place.",
    icon: PawPrint,
    path: "/pet-profile",
  },
  {
    label: "Expert Care",
    title: "Find a Vet",
    description:
      "Find veterinary clinics when your pet needs professional attention.",
    icon: Stethoscope,
    path: "/vet-locator",
  },
  {
    label: "Pet Knowledge",
    title: "Breed Insights",
    description:
      "Explore useful information about breeds, care and behavior.",
    icon: BookOpen,
    path: "/breed-insights",
  },
  {
    label: "Health Records",
    title: "Health History",
    description:
      "Keep vaccinations, checkups and important health history organized.",
    icon: FileHeart,
    path: "/health-records",
  },
  {
    label: "Smart Care",
    title: "Recommendations",
    description:
      "Explore simple recommendations for everyday pet care.",
    icon: HeartPulse,
    path: "/recommendation",
  },
];

function Home() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-orange-50/60 via-white to-white transition-colors duration-300 dark:from-[#111820] dark:via-[#0B0F14] dark:to-[#0B0F14]">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-14 pt-14 sm:px-6 sm:pb-20 sm:pt-20 lg:px-8">
        {/* Decorative glow */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-orange-200/30 blur-3xl dark:bg-orange-500/10" />

        <div className="relative mx-auto max-w-5xl text-center">
          <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-orange-100 bg-white px-4 py-2 text-xs font-semibold text-orange-600 shadow-sm dark:border-orange-500/20 dark:bg-[#111820] dark:text-orange-400">
            <PawPrint className="h-4 w-4" />
            Smart Pet Care
          </div>

          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl dark:text-white">
            Know More.
            <span className="block text-orange-500 dark:text-orange-400">
              Care Better.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg dark:text-gray-400">
            Keep your pet's health, daily activities and care information
            organized in one simple place.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 hover:shadow-md active:scale-[0.99]"
            >
              Open Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/health-check"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 active:scale-[0.99] dark:border-gray-700 dark:bg-[#111820] dark:text-gray-300 dark:hover:border-orange-500/40 dark:hover:bg-[#18212B] dark:hover:text-orange-400"
            >
              <Sparkles className="h-4 w-4" />
              Start Health Check
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 pb-14 sm:px-6 sm:pb-20 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-500 dark:text-orange-400">
              Everything in one place
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl dark:text-white">
              Simple tools for better pet care
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-600 sm:text-base dark:text-gray-400">
              Manage your pet's health, planning, records and everyday care
              from one simple dashboard.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <Link
                  key={feature.path}
                  to={feature.path}
                  className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg dark:border-gray-800 dark:bg-[#111820] dark:hover:border-orange-500/30 dark:hover:bg-[#151E27] dark:hover:shadow-orange-500/5"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500 transition group-hover:bg-orange-500 group-hover:text-white dark:bg-orange-500/10 dark:text-orange-400 dark:group-hover:bg-orange-500 dark:group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>

                  <p className="mt-5 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    {feature.label}
                  </p>

                  <h3 className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>

                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-orange-500 transition group-hover:gap-2 dark:text-orange-400">
                    Explore
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-4 pb-14 sm:px-6 sm:pb-20 lg:px-8">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gray-900 px-6 py-10 text-center sm:px-10 sm:py-12 dark:bg-[#18212B] dark:ring-1 dark:ring-orange-500/10">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/20">
            <PawPrint className="h-6 w-6" />
          </div>

          <h2 className="mt-5 text-2xl font-bold text-white sm:text-3xl">
            Keep your pet's care organized.
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-300 sm:text-base">
            Access your pet's health information, planner and care tools
            whenever you need them.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/dashboard"
              className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              Explore Dashboard
            </Link>

            <Link
              to="/login"
              className="rounded-xl border border-gray-700 px-6 py-3 text-sm font-semibold text-gray-200 transition hover:border-gray-500 hover:bg-gray-800"
            >
              Login to Smart Paw AI
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;