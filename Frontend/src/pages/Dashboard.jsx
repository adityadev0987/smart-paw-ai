import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAppContext } from "../hooks/useAppContext";
import { getPets, getTasks } from "../services/api";

function Dashboard() {
  const { currentPet, isPetLoading } = useAppContext();

  const [pet, setPet] = useState(currentPet);
  const [taskCount, setTaskCount] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isTaskLoading, setIsTaskLoading] = useState(true);

  const [error, setError] = useState("");
  const [taskError, setTaskError] = useState("");

  useEffect(() => {
    const loadPet = async () => {
      try {
        setIsLoading(true);
        setError("");

        const pets = await getPets();

        if (pets.length > 0) {
          const mongoPet = pets[0];

          setPet({
            ...mongoPet,
            id: mongoPet._id || mongoPet.id,
          });
        }
      } catch (error) {
        console.error("Failed to load pet:", error);
        setError("Failed to load pet information.");
      } finally {
        setIsLoading(false);
      }
    };

    loadPet();
  }, []);

  useEffect(() => {
    if (isPetLoading) {
      return;
    }

    if (!currentPet?._id) {
      setTaskCount(0);
      setIsTaskLoading(false);
      return;
    }

    const loadTasks = async () => {
      try {
        setIsTaskLoading(true);
        setTaskError("");

        const tasks = await getTasks(currentPet._id);

        const pendingTasks = tasks.filter(
          (task) => !task.completed,
        );

        setTaskCount(pendingTasks.length);
      } catch (error) {
        console.error("Failed to load tasks:", error);
        setTaskError("Failed to load upcoming tasks.");
        setTaskCount(0);
      } finally {
        setIsTaskLoading(false);
      }
    };

    loadTasks();
  }, [currentPet?._id, isPetLoading]);

  return (
    <section className="px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-900">
          Pet Care Dashboard
        </h1>

        <p className="mt-2 text-gray-600">
          Keep track of your pet's health and daily care.
        </p>

        {isLoading ? (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Loading pet information...
            </p>
          </div>
        ) : error ? (
          <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-5">
            <p className="text-sm text-red-500">
              {error}
            </p>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              {pet?.name}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {pet?.breed} • {pet?.age} years old
            </p>
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">
              Upcoming Tasks
            </p>

            {isTaskLoading ? (
              <p className="mt-1 text-2xl font-bold text-gray-400">
                ...
              </p>
            ) : (
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {taskCount}
              </p>
            )}

            {taskError && (
              <p className="mt-1 text-xs text-red-500">
                {taskError}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">
              Health Status
            </p>

            <p className="mt-1 text-2xl font-bold text-green-600">
              Good
            </p>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Quick Actions
          </h2>

          <div className="mt-3 grid grid-cols-2 gap-4">
            <Link
              to="/health-check"
              className="rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm hover:border-orange-300"
            >
              Health Check
            </Link>

            <Link
              to="/planner"
              className="rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm hover:border-orange-300"
            >
              Care Planner
            </Link>

            <Link
              to="/health-records"
              className="rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm hover:border-orange-300"
            >
              Health Records
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;