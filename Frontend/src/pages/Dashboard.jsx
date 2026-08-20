import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAppContext } from "../hooks/useAppContext";
import {
  getTasks,
  getHealthRecords,
} from "../services/api";

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

        const [taskData, healthRecordData] =
          await Promise.all([
            getTasks(currentPet._id),
            getHealthRecords(currentPet._id),
          ]);

        setTasks(
          Array.isArray(taskData)
            ? taskData
            : [],
        );

        setHealthRecords(
          Array.isArray(healthRecordData)
            ? healthRecordData
            : [],
        );
      } catch (error) {
        console.error(
          "Failed to load dashboard data:",
          error,
        );

        setTasks([]);
        setHealthRecords([]);
        setError(
          "Failed to load dashboard information.",
        );
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

  const pendingTasks = tasks.filter(
    (task) => !task.completed,
  );

  const completedTasks = tasks.filter(
    (task) => task.completed,
  );

  const recentRecords = healthRecords.slice(0, 3);

  if (isPetLoading) {
    return (
      <section className="px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold text-gray-900">
            Pet Care Dashboard
          </h1>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Loading pet information...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (!currentPet) {
    return (
      <section className="px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold text-gray-900">
            Pet Care Dashboard
          </h1>

          <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-5">
            <p className="text-sm text-red-600">
              Pet information is not available. Please add a
              pet before using the dashboard.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-orange-500">
            Smart Paw AI
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Pet Care Dashboard
          </h1>

          <p className="mt-2 text-gray-600">
            Keep track of {currentPet.name}'s health and
            daily care.
          </p>
        </div>

        {/* Pet Selector */}
        {pets.length > 1 && (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <label
              htmlFor="dashboardPet"
              className="text-sm font-semibold text-gray-700"
            >
              Select pet
            </label>

            <select
              id="dashboardPet"
              value={currentPet._id}
              onChange={handlePetChange}
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            >
              {pets.map((pet) => (
                <option
                  key={pet._id}
                  value={pet._id}
                >
                  {pet.name} • {pet.breed}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Pet Profile */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-orange-500">
                Current Pet
              </p>

              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                {currentPet.name}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {currentPet.breed} • {currentPet.age} years old
                {" • "}
                {currentPet.gender}
              </p>
            </div>

            <Link
              to="/pet-profile"
              className="rounded-xl border border-orange-200 px-4 py-2.5 text-center text-sm font-semibold text-orange-500 transition hover:bg-orange-50"
            >
              View Profile
            </Link>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4">
            <p className="text-sm text-red-600">
              {error}
            </p>
          </div>
        )}

        {/* Statistics */}
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">
              Upcoming Tasks
            </p>

            <p className="mt-1 text-2xl font-bold text-gray-900">
              {isLoading ? "..." : pendingTasks.length}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">
              Completed
            </p>

            <p className="mt-1 text-2xl font-bold text-gray-900">
              {isLoading ? "..." : completedTasks.length}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">
              Health Records
            </p>

            <p className="mt-1 text-2xl font-bold text-gray-900">
              {isLoading ? "..." : healthRecords.length}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">
              Health Check
            </p>

            <p className="mt-1 text-lg font-bold text-orange-500">
              AI Available
            </p>
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Upcoming Tasks
            </h2>

            <Link
              to="/planner"
              className="text-sm font-semibold text-orange-500 hover:text-orange-600"
            >
              View planner →
            </Link>
          </div>

          <div className="mt-3">
            {isLoading ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  Loading tasks...
                </p>
              </div>
            ) : pendingTasks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-5">
                <p className="text-sm font-medium text-gray-700">
                  No upcoming tasks
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Add a care task for {currentPet.name}.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingTasks
                  .slice(0, 3)
                  .map((task) => (
                    <div
                      key={task._id}
                      className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-base font-semibold text-gray-900">
                            {task.title}
                          </h3>

                          <p className="mt-1 text-sm text-gray-500">
                            {task.date}
                          </p>
                        </div>

                        <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-500">
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
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Health Records
            </h2>

            <Link
              to="/health-records"
              className="text-sm font-semibold text-orange-500 hover:text-orange-600"
            >
              View records →
            </Link>
          </div>

          <div className="mt-3">
            {isLoading ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  Loading health records...
                </p>
              </div>
            ) : recentRecords.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-5">
                <p className="text-sm font-medium text-gray-700">
                  No health records yet
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Add health information for {currentPet.name}.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentRecords.map((record) => (
                  <div
                    key={record._id}
                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">
                          {record.title}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          {record.date}
                        </p>
                      </div>

                      <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-500">
                        {record.type}
                      </span>
                    </div>

                    {record.notes && (
                      <p className="mt-3 text-sm leading-6 text-gray-600">
                        {record.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Quick Actions
          </h2>

          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Link
              to="/health-check"
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-orange-300 hover:shadow-md"
            >
              <p className="text-sm font-semibold text-orange-500">
                AI Powered
              </p>

              <h3 className="mt-1 text-base font-semibold text-gray-900">
                Health Check
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Check symptoms and get a cautious AI health
                assessment.
              </p>
            </Link>

            <Link
              to="/planner"
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-orange-300 hover:shadow-md"
            >
              <p className="text-sm font-semibold text-orange-500">
                Daily Care
              </p>

              <h3 className="mt-1 text-base font-semibold text-gray-900">
                Care Planner
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Manage vaccinations, medicines and important
                care tasks.
              </p>
            </Link>

            <Link
              to="/health-records"
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-orange-300 hover:shadow-md"
            >
              <p className="text-sm font-semibold text-orange-500">
                Health History
              </p>

              <h3 className="mt-1 text-base font-semibold text-gray-900">
                Health Records
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                View and manage {currentPet.name}'s health
                history.
              </p>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;