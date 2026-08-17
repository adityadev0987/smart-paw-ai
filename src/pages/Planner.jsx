import { useEffect, useRef, useState } from "react";
import { useAppContext } from "../hooks/useAppContext";

const initialTasks = [
  {
    id: 1,
    petId: 1,
    title: "Vaccination",
    date: "20 Aug 2026",
    type: "Health",
    completed: false,
  },
  {
    id: 2,
    petId: 1,
    title: "Medicine",
    date: "22 Aug 2026",
    type: "Medicine",
    completed: false,
  },
  {
    id: 3,
    petId: 1,
    title: "Vet Checkup",
    date: "25 Aug 2026",
    type: "Checkup",
    completed: false,
  },
];

const taskTypes = ["Activity", "Health", "Medicine", "Checkup"];

function Planner() {
  const { currentPet } = useAppContext();

  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("smartPawTasks");

    if (!savedTasks) {
      return initialTasks;
    }

    const parsedTasks = JSON.parse(savedTasks);

    // Add pet ID to old tasks created before pet-based tasks
    // were introduced.
    return parsedTasks.map((task) => ({
      ...task,
      petId: task.petId ?? 1,
    }));
  });

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [taskError, setTaskError] = useState("");
  const [taskType, setTaskType] = useState("Activity");
  const [isTypeOpen, setIsTypeOpen] = useState(false);

  const typeDropdownRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("smartPawTasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        typeDropdownRef.current &&
        !typeDropdownRef.current.contains(event.target)
      ) {
        setIsTypeOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const currentPetTasks = tasks.filter(
    (task) => task.petId === currentPet.id,
  );

  const addTask = () => {
    if (!taskTitle.trim()) {
      setTaskError("Please enter a task name.");
      return;
    }

    const newTask = {
      id: Date.now(),
      petId: currentPet.id,
      title: taskTitle.trim(),
      date: taskDate || "Today",
      type: taskType,
      completed: false,
    };

    setTasks((currentTasks) => [...currentTasks, newTask]);

    setTaskTitle("");
    setTaskDate("");
    setTaskType("Activity");
    setIsTypeOpen(false);
    setTaskError("");
  };

  const completeTask = (taskId) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, completed: true } : task,
      ),
    );
  };

  const deleteTask = (taskId) => {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== taskId),
    );
  };

  return (
    <section className="px-4 py-8">
      <div className="mx-auto max-w-md">
        <p className="text-sm font-semibold uppercase tracking-wider text-orange-500">
          Smart Planning
        </p>

        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          Care Planner
        </h1>

        <p className="mt-3 text-base leading-7 text-gray-600">
          Organize {currentPet.name}'s upcoming care tasks in one simple place.
        </p>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Upcoming care
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            Keep track of vaccinations, medicines, checkups and other important
            care activities for {currentPet.name}.
          </p>

          <div className="mt-5">
            <label
              htmlFor="taskTitle"
              className="text-sm font-medium text-gray-700"
            >
              Task name
            </label>

            <input
              id="taskTitle"
              type="text"
              value={taskTitle}
              onChange={(event) => {
                setTaskTitle(event.target.value);
                setTaskError("");
              }}
              placeholder="e.g. Give medicine"
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />

            <input
              type="date"
              value={taskDate}
              onChange={(event) => setTaskDate(event.target.value)}
              className="mt-3 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />

            {taskError && (
              <p className="mt-2 text-xs font-medium text-red-500">
                {taskError}
              </p>
            )}
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium text-gray-700">
              Task type
            </label>

            <div ref={typeDropdownRef} className="relative mt-2">
              <button
                type="button"
                onClick={() => setIsTypeOpen(!isTypeOpen)}
                className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm text-gray-900 outline-none transition duration-200 hover:border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                aria-haspopup="listbox"
                aria-expanded={isTypeOpen}
              >
                <span>{taskType}</span>

                <span
                  className={`text-xs text-gray-400 transition-transform duration-200 ${
                    isTypeOpen ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </button>

              {isTypeOpen && (
                <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg">
                  {taskTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setTaskType(type);
                        setIsTypeOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm transition ${
                        taskType === type
                          ? "bg-orange-50 font-semibold text-orange-500"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span>{type}</span>

                      {taskType === type && (
                        <span className="font-bold">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-5">
            {currentPetTasks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5 text-center">
                <p className="text-sm font-medium text-gray-700">
                  No upcoming tasks
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Add a care task for {currentPet.name}.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {[...currentPetTasks]
                  .sort(
                    (a, b) =>
                      Number(a.completed) - Number(b.completed),
                  )
                  .map((task) => (
                    <div
                      key={task.id}
                      className={`rounded-xl border p-4 ${
                        task.completed
                          ? "border-green-100 bg-green-50"
                          : "border-gray-100 bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3
                            className={`text-sm font-semibold ${
                              task.completed
                                ? "text-gray-400 line-through"
                                : "text-gray-900"
                            }`}
                          >
                            {task.title}
                          </h3>

                          <p
                            className={`mt-1 text-xs ${
                              task.completed
                                ? "text-gray-400"
                                : "text-gray-500"
                            }`}
                          >
                            {task.date}
                          </p>
                        </div>

                        <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-500">
                          {task.type}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => completeTask(task.id)}
                        disabled={task.completed}
                        className={`mt-3 w-full rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                          task.completed
                            ? "cursor-default border-green-200 text-green-600"
                            : "border-gray-200 text-gray-600 hover:border-orange-500 hover:text-orange-500"
                        }`}
                      >
                        {task.completed
                          ? "Completed"
                          : "Mark as complete"}
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteTask(task.id)}
                        className="mt-2 w-full rounded-lg border border-red-100 px-3 py-2 text-xs font-semibold text-red-500 transition hover:border-red-300 hover:bg-red-50"
                      >
                        Delete task
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={addTask}
            className="mt-5 w-full rounded-xl bg-orange-500 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            Add care task
          </button>
        </div>
      </div>
    </section>
  );
}

export default Planner;