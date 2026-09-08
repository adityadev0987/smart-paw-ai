import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Activity,
  CalendarCheck,
  CheckCircle2,
  FileHeart,
  PawPrint,
  Sparkles,
} from "lucide-react";
import { useAppContext } from "../hooks/useAppContext";
import { getTasks, getHealthRecords } from "../services/api";

function Dashboard() {
  const {
    pets = [],
    currentPet,
    setCurrentPet,
    isPetLoading,
  } = useAppContext();

  const [tasks, setTasks] = useState([]);
  const [healthRecords, setHealthRecords] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isPetLoading) {
      return;
    }

    if (!currentPet?._id) {
      setTasks([]);
      setHealthRecords([]);
      setIsLoading(false);
      setError("Pet information is not available.");
      return;
    }

    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        setError("");

        const [taskData, healthRecordData] = await Promise.all([
          getTasks(currentPet._id),
          getHealthRecords(currentPet._id),
        ]);

        setTasks(Array.isArray(taskData) ? taskData : []);
        setHealthRecords(
          Array.isArray(healthRecordData) ? healthRecordData : [],
        );
      } catch (error) {
        console.error("Failed to load dashboard data:", error);

        setTasks([]);
        setHealthRecords([]);
        setError("Failed to load dashboard information.");
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [currentPet?._id, isPetLoading]);

  const handlePetChange = (event) => {
    const selectedPet = pets.find(
      (pet) => pet._id === event.target.value,
    );

    if (!selectedPet) {
      return;
    }

    setCurrentPet(selectedPet);
  };

  const pendingTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);
  const recentRecords = healthRecords.slice(0, 3);

  if (isPetLoading) {
    return (
      <section className="min-h-[calc(100vh-4rem)] bg-gray-50 px-4 py-8 transition-colors duration-300 dark:bg-[#0B0F14] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="animate-pulse">
            <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-800" />
            <div className="mt-3 h-9 w-72 rounded bg-gray-200 dark:bg-gray-800" />
            <div className="mt-3 h-5 w-96 max-w-full rounded bg-gray-200 dark:bg-gray-800" />
          </div>
        </div>
      </section>
    );
  }

  if (!currentPet) {
    return (
      <section className="min-h-[calc(100vh-4rem)] bg-gray-50 px-4 py-8 transition-colors duration-300 dark:bg-[#0B0F14] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-800 dark:bg-[#111820] sm:p-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400">
              <PawPrint className="h-7 w-7" />
            </div>

            <h1 className="mt-5 text-2xl font-bold text-gray-900 dark:text-white">
              Add a pet to get started
            </h1>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">
              Your dashboard will show health information, tasks
              and records once a pet profile is available.
            </p>

            <Link
              to="/pet-profile"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
            >
              Add Pet
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-gray-50 px-4 py-8 transition-colors duration-300 dark:bg-[#0B0F14] sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-orange-500 dark:text-orange-400">
              <Activity className="h-5 w-5" />

              <p className="text-sm font-bold uppercase tracking-[0.16em]">
                Smart Paw AI
              </p>
            </div>

            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Pet Care Dashboard
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400 sm:text-base">
              Keep track of {currentPet.name}'s health and daily care.
            </p>
          </div>

          {pets.length > 1 && (
            <div className="w-full lg:w-72">
              <label
                htmlFor="dashboardPet"
                className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400"
              >
                Current pet
              </label>

              <select
                id="dashboardPet"
                value={currentPet._id}
                onChange={handlePetChange}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 shadow-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-gray-700 dark:bg-[#111820] dark:text-white dark:focus:border-orange-500 dark:focus:ring-orange-500/10"
              >
                {pets.map((pet) => (
                  <option key={pet._id} value={pet._id}>
                    {pet.name} • {pet.breed}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Pet Banner */}
        <div className="relative mt-7 overflow-hidden rounded-3xl bg-gray-900 p-6 shadow-sm dark:bg-[#18212B] dark:ring-1 dark:ring-orange-500/10 sm:p-7">
          <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-orange-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/20">
                <PawPrint className="h-7 w-7" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-orange-300">
                  Current Pet
                </p>

                <h2 className="mt-1 text-2xl font-bold text-white">
                  {currentPet.name}
                </h2>

                <p className="mt-1 text-sm text-gray-300">
                  {currentPet.breed} • {currentPet.age} years old •{" "}
                  {currentPet.gender}
                </p>
              </div>
            </div>

            <Link
              to="/pet-profile"
              className="inline-flex items-center justify-center rounded-xl border border-gray-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-orange-400 hover:bg-gray-800 dark:hover:bg-[#202B36]"
            >
              View Profile
            </Link>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-500/10">
            <p className="text-sm font-medium text-red-600 dark:text-red-400">
              {error}
            </p>
          </div>
        )}

        {/* Statistics */}
        <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">

          {/* Upcoming Tasks */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-[#111820]">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Upcoming Tasks
              </p>

              <div className="rounded-xl bg-orange-50 p-2 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400">
                <CalendarCheck className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
              {isLoading ? "..." : pendingTasks.length}
            </p>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              Tasks waiting for you
            </p>
          </div>

          {/* Completed */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-[#111820]">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Completed
              </p>

              <div className="rounded-xl bg-green-50 p-2 text-green-600 dark:bg-green-500/10 dark:text-green-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
              {isLoading ? "..." : completedTasks.length}
            </p>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              Care tasks completed
            </p>
          </div>

          {/* Health Records */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-[#111820]">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Health Records
              </p>

              <div className="rounded-xl bg-blue-50 p-2 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <FileHeart className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
              {isLoading ? "..." : healthRecords.length}
            </p>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              Saved health records
            </p>
          </div>

          {/* AI Health Check */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-[#111820]">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Health Check
              </p>

              <div className="rounded-xl bg-purple-50 p-2 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-4 text-lg font-bold text-orange-500 dark:text-orange-400">
              AI Available
            </p>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              Get a health assessment
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="mt-7 grid gap-6 lg:grid-cols-2">

          {/* Upcoming Tasks */}
          <div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Upcoming Tasks
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Keep {currentPet.name}'s care on track.
                </p>
              </div>

              <Link
                to="/planner"
                className="shrink-0 text-sm font-semibold text-orange-500 transition hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300"
              >
                View planner →
              </Link>
            </div>

            <div className="mt-4">
              {isLoading ? (
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#111820]">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Loading tasks...
                  </p>
                </div>
              ) : pendingTasks.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 dark:border-gray-700 dark:bg-[#111820]">
                  <CalendarCheck className="h-6 w-6 text-gray-400" />

                  <p className="mt-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
                    No upcoming tasks
                  </p>

                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Add a care task for {currentPet.name}.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingTasks.slice(0, 3).map((task) => (
                    <div
                      key={task._id}
                      className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-orange-200 hover:shadow-md dark:border-gray-800 dark:bg-[#111820] dark:hover:border-orange-500/30"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-semibold text-gray-900 dark:text-white">
                            {task.title}
                          </h3>

                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {task.date}
                          </p>
                        </div>

                        <span className="shrink-0 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
                          {task.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Health Records */}
          <div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Recent Health Records
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  A quick view of recent health information.
                </p>
              </div>

              <Link
                to="/health-records"
                className="shrink-0 text-sm font-semibold text-orange-500 transition hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300"
              >
                View records →
              </Link>
            </div>

            <div className="mt-4">
              {isLoading ? (
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#111820]">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Loading health records...
                  </p>
                </div>
              ) : recentRecords.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 dark:border-gray-700 dark:bg-[#111820]">
                  <FileHeart className="h-6 w-6 text-gray-400" />

                  <p className="mt-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
                    No health records yet
                  </p>

                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Add health information for {currentPet.name}.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentRecords.map((record) => (
                    <div
                      key={record._id}
                      className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-orange-200 hover:shadow-md dark:border-gray-800 dark:bg-[#111820] dark:hover:border-orange-500/30"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-semibold text-gray-900 dark:text-white">
                            {record.title}
                          </h3>

                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {record.date}
                          </p>
                        </div>

                        <span className="shrink-0 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
                          {record.type}
                        </span>
                      </div>

                      {record.notes && (
                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                          {record.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Jump directly to the tools you use most.
            </p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">

            {/* AI Health Check */}
            <Link
              to="/health-check"
              className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-md dark:border-gray-800 dark:bg-[#111820] dark:hover:border-orange-500/30"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500 transition group-hover:bg-orange-500 group-hover:text-white dark:bg-orange-500/10 dark:text-orange-400 dark:group-hover:bg-orange-500 dark:group-hover:text-white">
                <Sparkles className="h-5 w-5" />
              </div>

              <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">
                AI Health Check
              </h3>

              <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
                Check symptoms and get a cautious AI health assessment.
              </p>
            </Link>

            {/* Care Planner */}
            <Link
              to="/planner"
              className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-md dark:border-gray-800 dark:bg-[#111820] dark:hover:border-orange-500/30"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500 transition group-hover:bg-orange-500 group-hover:text-white dark:bg-orange-500/10 dark:text-orange-400 dark:group-hover:bg-orange-500 dark:group-hover:text-white">
                <CalendarCheck className="h-5 w-5" />
              </div>

              <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">
                Care Planner
              </h3>

              <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
                Manage vaccinations, medicines and important care tasks.
              </p>
            </Link>

            {/* Health Records */}
            <Link
              to="/health-records"
              className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-md dark:border-gray-800 dark:bg-[#111820] dark:hover:border-orange-500/30"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500 transition group-hover:bg-orange-500 group-hover:text-white dark:bg-orange-500/10 dark:text-orange-400 dark:group-hover:bg-orange-500 dark:group-hover:text-white">
                <FileHeart className="h-5 w-5" />
              </div>

              <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">
                Health Records
              </h3>

              <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
                View and manage {currentPet.name}'s health history.
              </p>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;