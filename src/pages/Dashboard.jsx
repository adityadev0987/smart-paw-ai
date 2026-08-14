import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { pets } from "../data/pets";

function Dashboard() {
  const pet = pets[0];
  const [taskCount, setTaskCount] = useState(0);

  useEffect(() => {
    const savedTasks = localStorage.getItem("smartPawTasks");

    if (savedTasks) {
      const tasks = JSON.parse(savedTasks);
      const pendingTasks = tasks.filter((task) => !task.completed);
      setTaskCount(pendingTasks.length);
    }
  }, []);

  return (
    <section className="px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-900">
          Pet Care Dashboard
        </h1>

        <p className="mt-2 text-gray-600">
          Keep track of your pet's health and daily care.
        </p>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            {pet.name}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {pet.breed} • {pet.age} years old
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Upcoming Tasks</p>

            <p className="mt-1 text-2xl font-bold text-gray-900">
              {taskCount}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Health Status</p>

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