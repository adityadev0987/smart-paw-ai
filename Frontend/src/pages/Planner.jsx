import { useEffect, useRef, useState } from "react";
import { useAppContext } from "../hooks/useAppContext";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../services/api";

const taskTypes = [
  "Activity",
  "Health",
  "Medicine",
  "Checkup",
];

function Planner() {
  const { currentPet, isPetLoading } = useAppContext();

  const [tasks, setTasks] = useState([]);

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [taskType, setTaskType] = useState("Activity");
  const [taskError, setTaskError] = useState("");

  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const typeDropdownRef = useRef(null);

  useEffect(() => {
    if (isPetLoading) {
      return;
    }

    if (!currentPet?._id) {
      setIsLoading(false);
      setTaskError("Pet information is not available.");
      return;
    }

    const loadTasks = async () => {
      try {
        setIsLoading(true);
        setTaskError("");

        const data = await getTasks(currentPet._id);

        setTasks(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load tasks:", error);
        setTaskError("Failed to load tasks.");
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, [currentPet?._id, isPetLoading]);

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

  const addTask = async () => {
    if (!taskTitle.trim()) {
      setTaskError("Please enter a task title.");
      return;
    }

    if (!taskDate) {
      setTaskError("Please select a date.");
      return;
    }

    if (!currentPet?._id) {
      setTaskError("Pet information is not ready yet.");
      return;
    }

    try {
      setIsSaving(true);
      setTaskError("");

      const newTask = await createTask({
        petId: currentPet._id,
        title: taskTitle.trim(),
        date: taskDate,
        type: taskType,
        completed: false,
      });

      setTasks((currentTasks) => [
        ...currentTasks,
        newTask,
      ]);

      setTaskTitle("");
      setTaskDate("");
      setTaskType("Activity");
      setIsTypeOpen(false);
    } catch (error) {
      console.error("Failed to create task:", error);
      setTaskError("Failed to save task.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleTask = async (task) => {
    try {
      setTaskError("");

      const updatedTask = await updateTask(task._id, {
        title: task.title,
        date: task.date,
        type: task.type,
        completed: !task.completed,
      });

      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask._id === task._id
            ? updatedTask
            : currentTask,
        ),
      );
    } catch (error) {
      console.error("Failed to update task:", error);
      setTaskError("Failed to update task.");
    }
  };

  const removeTask = async (taskId) => {
    try {
      setTaskError("");

      await deleteTask(taskId);

      setTasks((currentTasks) =>
        currentTasks.filter(
          (task) => task._id !== taskId,
        ),
      );
    } catch (error) {
      console.error("Failed to delete task:", error);
      setTaskError("Failed to delete task.");
    }
  };

  const pendingTasks = tasks.filter(
    (task) => !task.completed,
  );

  const completedTasks = tasks.filter(
    (task) => task.completed,
  );

  return (
    <section className="px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-orange-500">
          Care Planner
        </p>

        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          {currentPet?.name || "Pet"}'s Planner
        </h1>

        <p className="mt-3 text-base leading-7 text-gray-600">
          Plan and manage important care tasks for{" "}
          {currentPet?.name || "your pet"}.
        </p>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Add task
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Create a new care task for{" "}
            {currentPet?.name || "your pet"}.
          </p>

          <div className="mt-5">
            <label
              htmlFor="taskTitle"
              className="text-sm font-medium text-gray-700"
            >
              Task title
            </label>

            <input
              id="taskTitle"
              type="text"
              value={taskTitle}
              onChange={(event) => {
                setTaskTitle(event.target.value);
                setTaskError("");
              }}
              placeholder="e.g. Give vaccination"
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div className="mt-4">
            <label
              htmlFor="taskDate"
              className="text-sm font-medium text-gray-700"
            >
              Date
            </label>

            <input
              id="taskDate"
              type="date"
              value={taskDate}
              onChange={(event) => {
                setTaskDate(event.target.value);
                setTaskError("");
              }}
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium text-gray-700">
              Task type
            </label>

            <div
              ref={typeDropdownRef}
              className="relative mt-2"
            >
              <button
                type="button"
                onClick={() => setIsTypeOpen(!isTypeOpen)}
                className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm text-gray-900 outline-none transition hover:border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
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
                        <span className="font-bold">
                          ✓
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {taskError && (
            <p className="mt-3 text-xs font-medium text-red-500">
              {taskError}
            </p>
          )}

          <button
            type="button"
            onClick={addTask}
            disabled={
              isSaving ||
              isPetLoading ||
              !currentPet?._id
            }
            className="mt-5 w-full rounded-xl bg-orange-500 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Add task"}
          </button>
        </div>

        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Upcoming Tasks
            </h2>

            <span className="text-sm text-gray-500">
              {pendingTasks.length}{" "}
              {pendingTasks.length === 1
                ? "task"
                : "tasks"}
            </span>
          </div>

          {isPetLoading || isLoading ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
              <p className="text-sm text-gray-500">
                Loading tasks...
              </p>
            </div>
          ) : pendingTasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
              <p className="text-sm font-medium text-gray-700">
                No upcoming tasks
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Add a task to start planning care.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingTasks.map((task) => (
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

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => toggleTask(task)}
                      className="flex-1 rounded-lg border border-green-100 px-3 py-2 text-xs font-semibold text-green-600 transition hover:border-green-300 hover:bg-green-50"
                    >
                      Mark Complete
                    </button>

                    <button
                      type="button"
                      onClick={() => removeTask(task._id)}
                      className="rounded-lg border border-red-100 px-3 py-2 text-xs font-semibold text-red-500 transition hover:border-red-300 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {completedTasks.length > 0 && (
          <div className="mt-6">
            <div className="mb-3">
              <h2 className="text-lg font-semibold text-gray-900">
                Completed Tasks
              </h2>
            </div>

            <div className="space-y-3">
              {completedTasks.map((task) => (
                <div
                  key={task._id}
                  className="rounded-2xl border border-gray-200 bg-gray-50 p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-gray-700 line-through">
                        {task.title}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {task.date}
                      </p>
                    </div>

                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600">
                      Completed
                    </span>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => toggleTask(task)}
                      className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-white"
                    >
                      Mark Pending
                    </button>

                    <button
                      type="button"
                      onClick={() => removeTask(task._id)}
                      className="rounded-lg border border-red-100 px-3 py-2 text-xs font-semibold text-red-500 transition hover:border-red-300 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default Planner;