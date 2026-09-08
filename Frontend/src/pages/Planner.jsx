import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Dumbbell,
  HeartPulse,
  PawPrint,
  Pill,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useAppContext } from "../hooks/useAppContext";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../services/api";

const taskTypes = [
  {
    name: "Activity",
    icon: Dumbbell,
  },
  {
    name: "Health",
    icon: HeartPulse,
  },
  {
    name: "Medicine",
    icon: Pill,
  },
  {
    name: "Checkup",
    icon: CalendarDays,
  },
];

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatDateForDisplay(dateValue) {
  if (!dateValue) return "";

  const [year, month, day] = dateValue.split("-");

  if (!year || !month || !day) return dateValue;

  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
  );

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function parseDateValue(dateValue) {
  if (!dateValue) return null;

  const [year, month, day] = dateValue.split("-").map(Number);

  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
}

function CustomDatePicker({ value, onChange }) {
  const datePickerRef = useRef(null);
  const today = new Date();
  const selectedDate = parseDateValue(value);

  const [isOpen, setIsOpen] = useState(false);

  const [visibleMonth, setVisibleMonth] = useState(
    selectedDate || today,
  );

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    if (selectedDate) {
      setVisibleMonth(selectedDate);
    }
  }, [value]);

  const goToPreviousMonth = () => {
    setVisibleMonth(
      new Date(
        visibleMonth.getFullYear(),
        visibleMonth.getMonth() - 1,
        1,
      ),
    );
  };

  const goToNextMonth = () => {
    setVisibleMonth(
      new Date(
        visibleMonth.getFullYear(),
        visibleMonth.getMonth() + 1,
        1,
      ),
    );
  };

  const selectDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    onChange(`${year}-${month}-${day}`);
    setIsOpen(false);
  };

  const selectToday = () => {
    selectDate(today);
  };

  const clearDate = () => {
    onChange("");
    setIsOpen(false);
  };

  const getCalendarDays = () => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const firstWeekday = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days = [];

    for (let index = 0; index < firstWeekday; index += 1) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const isSameDay = (firstDate, secondDate) => {
    if (!firstDate || !secondDate) return false;

    return (
      firstDate.getFullYear() === secondDate.getFullYear() &&
      firstDate.getMonth() === secondDate.getMonth() &&
      firstDate.getDate() === secondDate.getDate()
    );
  };

  const calendarDays = getCalendarDays();

  return (
    <div ref={datePickerRef} className="relative mt-2">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-left text-sm outline-none transition hover:border-gray-300 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 dark:border-gray-700 dark:bg-[#18212B] dark:text-gray-100 dark:hover:border-gray-600 dark:focus:bg-[#18212B]"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
            <CalendarDays size={17} />
          </div>

          <span
            className={
              value
                ? "font-medium text-gray-900 dark:text-gray-100"
                : "text-gray-400"
            }
          >
            {value ? formatDateForDisplay(value) : "Select a date"}
          </span>
        </div>

        <ChevronDown
          size={17}
          className={`text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-[#111820]">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={goToPreviousMonth}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
            >
              ‹
            </button>

            <div className="text-center">
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                {monthNames[visibleMonth.getMonth()]}
              </p>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                {visibleMonth.getFullYear()}
              </p>
            </div>

            <button
              type="button"
              onClick={goToNextMonth}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
            >
              ›
            </button>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1">
            {[
              "Sun",
              "Mon",
              "Tue",
              "Wed",
              "Thu",
              "Fri",
              "Sat",
            ].map((day) => (
              <div
                key={day}
                className="py-2 text-center text-[10px] font-bold uppercase tracking-wide text-gray-400"
              >
                {day}
              </div>
            ))}

            {calendarDays.map((date, index) => {
              if (!date) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="h-9"
                  />
                );
              }

              const selected = isSameDay(date, selectedDate);
              const todayDate = isSameDay(date, today);

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => selectDate(date)}
                  className={`flex h-9 items-center justify-center rounded-lg text-sm transition ${
                    selected
                      ? "bg-orange-500 font-bold text-white shadow-sm"
                      : todayDate
                        ? "border border-orange-300 font-semibold text-orange-500 hover:bg-orange-50 dark:border-orange-700 dark:hover:bg-orange-950"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
            <button
              type="button"
              onClick={clearDate}
              className="text-xs font-semibold text-gray-500 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Clear
            </button>

            <button
              type="button"
              onClick={selectToday}
              className="rounded-lg bg-orange-50 px-3 py-2 text-xs font-bold text-orange-500 transition hover:bg-orange-100 dark:bg-orange-950 dark:hover:bg-orange-900"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PetSelector({ pets, currentPet, onChange }) {
  const dropdownRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative mt-2">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-left outline-none transition hover:border-gray-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 dark:border-gray-700 dark:bg-[#18212B] dark:hover:border-gray-600"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
            <PawPrint size={18} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
              {currentPet.name}
            </p>

            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
              {currentPet.breed}
            </p>
          </div>
        </div>

        <ChevronDown
          size={17}
          className={`ml-3 shrink-0 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl dark:border-gray-700 dark:bg-[#111820]">
          {pets.map((pet) => {
            const isSelected = pet._id === currentPet._id;

            return (
              <button
                key={pet._id}
                type="button"
                onClick={() => {
                  onChange(pet);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-left transition ${
                  isSelected
                    ? "bg-orange-50 dark:bg-orange-950"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      isSelected
                        ? "bg-orange-100 text-orange-500 dark:bg-orange-900"
                        : "bg-gray-100 text-gray-400 dark:bg-gray-800"
                    }`}
                  >
                    <PawPrint size={16} />
                  </div>

                  <div className="min-w-0">
                    <p
                      className={`truncate text-sm ${
                        isSelected
                          ? "font-semibold text-orange-500"
                          : "font-medium text-gray-800 dark:text-gray-200"
                      }`}
                    >
                      {pet.name}
                    </p>

                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                      {pet.breed} • {pet.age} years
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <Check
                    size={16}
                    className="ml-2 shrink-0 text-orange-500"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Planner() {
  const {
    pets = [],
    currentPet,
    setCurrentPet,
    isPetLoading,
  } = useAppContext();

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
    if (isPetLoading) return;

    if (!currentPet?._id) {
      setTasks([]);
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
        setTasks([]);
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

  const resetTaskForm = () => {
    setTaskTitle("");
    setTaskDate("");
    setTaskType("Activity");
    setTaskError("");
    setIsTypeOpen(false);
  };

  const handlePetChange = (selectedPet) => {
    setCurrentPet(selectedPet);
    setTasks([]);
    resetTaskForm();
  };

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

      resetTaskForm();
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

  const getTaskIcon = (type) => {
    const matchedType = taskTypes.find(
      (item) => item.name === type,
    );

    return matchedType?.icon || Clock3;
  };

  if (isPetLoading) {
    return (
      <section className="min-h-[calc(100vh-4rem)] bg-white px-4 py-8 dark:bg-[#0B0F14] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />

          <div className="mt-3 h-10 w-64 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />

          <div className="mt-3 h-5 w-96 max-w-full animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
        </div>
      </section>
    );
  }

  if (!currentPet) {
    return (
      <section className="min-h-[calc(100vh-4rem)] bg-white px-4 py-8 dark:bg-[#0B0F14] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-600 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-400">
            <PawPrint size={14} />
            Care Planner
          </div>

          <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
            Planner
          </h1>

          <div className="mt-6 rounded-2xl border border-orange-100 bg-orange-50 p-6 dark:border-orange-500/20 dark:bg-orange-500/10">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Pet information is not available. Please add a pet
              before managing care tasks.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-white px-4 py-8 transition-colors duration-300 dark:bg-[#0B0F14] sm:px-6 sm:py-10 lg:px-8">
      {/* Background Glow */}
      <div className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-orange-500/10 blur-3xl dark:bg-orange-500/5" />

      <div className="pointer-events-none absolute -right-40 top-96 h-96 w-96 rounded-full bg-orange-500/5 blur-3xl" />

      <div className="relative mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-600 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-400">
            <PawPrint size={14} />
            Care Planner
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
                {currentPet.name}'s Planner
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base dark:text-gray-400">
                Plan and manage important care tasks for{" "}
                {currentPet.name}.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm dark:border-gray-800 dark:bg-[#111820] dark:text-gray-300">
              <CheckCircle2 size={15} className="text-orange-500" />
              {pendingTasks.length} pending
            </div>
          </div>
        </div>

        {/* Pet Selector */}
        {pets.length > 1 && (
          <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#111820]">
            <div className="flex items-center gap-2">
              <PawPrint size={17} className="text-orange-500" />

              <label className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Select pet
              </label>
            </div>

            <PetSelector
              pets={pets}
              currentPet={currentPet}
              onChange={handlePetChange}
            />

            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Select the pet whose care tasks you want to manage.
            </p>
          </div>
        )}

        {/* Add Task */}
        <div className="overflow-hidden rounded-2xl border border-orange-200/70 bg-white shadow-sm dark:border-orange-500/20 dark:bg-[#111820]">
          <div className="border-b border-gray-100 bg-gradient-to-r from-orange-50/80 to-white p-5 dark:border-gray-800 dark:from-orange-500/5 dark:to-[#111820] sm:p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 text-white shadow-lg shadow-orange-500/20">
                <Plus size={23} />
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-orange-500">
                  Care Task
                </p>

                <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                  Add a new task
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Keep your pet's care routine organized.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="grid gap-5 sm:grid-cols-2">
              {/* Title */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="taskTitle"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300"
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
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 dark:border-gray-700 dark:bg-[#18212B] dark:text-gray-100 dark:placeholder:text-gray-500 dark:hover:border-gray-600 dark:focus:bg-[#18212B]"
                />
              </div>

              {/* Date */}
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Date
                </label>

                <CustomDatePicker
                  value={taskDate}
                  onChange={(value) => {
                    setTaskDate(value);
                    setTaskError("");
                  }}
                />
              </div>

              {/* Type */}
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Task type
                </label>

                <div
                  ref={typeDropdownRef}
                  className="relative mt-2"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setIsTypeOpen((current) => !current)
                    }
                    className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-left text-sm text-gray-900 outline-none transition hover:border-gray-300 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 dark:border-gray-700 dark:bg-[#18212B] dark:text-gray-100 dark:hover:border-gray-600 dark:focus:bg-[#18212B]"
                  >
                    <div className="flex items-center gap-3">
                      {(() => {
                        const selectedType = taskTypes.find(
                          (item) => item.name === taskType,
                        );

                        const Icon =
                          selectedType?.icon || Clock3;

                        return (
                          <>
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                              <Icon size={17} />
                            </div>

                            <span className="font-medium">
                              {taskType}
                            </span>
                          </>
                        );
                      })()}
                    </div>

                    <ChevronDown
                      size={17}
                      className={`text-gray-400 transition-transform ${
                        isTypeOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isTypeOpen && (
                    <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl dark:border-gray-700 dark:bg-[#111820]">
                      {taskTypes.map((type) => {
                        const Icon = type.icon;
                        const isSelected =
                          taskType === type.name;

                        return (
                          <button
                            key={type.name}
                            type="button"
                            onClick={() => {
                              setTaskType(type.name);
                              setIsTypeOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm transition ${
                              isSelected
                                ? "bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400"
                                : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Icon size={16} />

                              <span
                                className={
                                  isSelected
                                    ? "font-semibold"
                                    : ""
                                }
                              >
                                {type.name}
                              </span>
                            </div>

                            {isSelected && (
                              <Check size={16} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {taskError && (
              <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 dark:border-red-500/20 dark:bg-red-500/10">
                <p className="text-xs font-medium text-red-600 dark:text-red-400">
                  {taskError}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={addTask}
              disabled={isSaving || !currentPet?._id}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/15 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus size={17} />
              {isSaving ? "Saving Task..." : "Add Task"}
            </button>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-orange-500">
                To Do
              </p>

              <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">
                Upcoming Tasks
              </h2>
            </div>

            <span className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-500 dark:bg-orange-950">
              {pendingTasks.length}
            </span>
          </div>

          {isLoading ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-800 dark:bg-[#111820]">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Loading tasks...
              </p>
            </div>
          ) : pendingTasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-[#111820]">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400">
                <CheckCircle2 size={23} />
              </div>

              <h3 className="mt-4 text-sm font-bold text-gray-800 dark:text-gray-200">
                No upcoming tasks
              </h3>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                You're all caught up. Add a task when needed.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingTasks.map((task) => {
                const TaskIcon = getTaskIcon(task.type);

                return (
                  <div
                    key={task._id}
                    className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md dark:border-gray-800 dark:bg-[#111820] dark:hover:border-orange-500/20"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400">
                        <TaskIcon size={20} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                              {task.title}
                            </h3>

                            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                              <CalendarDays size={13} />
                              {formatDateForDisplay(task.date)}
                            </div>
                          </div>

                          <span className="w-fit rounded-full bg-orange-50 px-3 py-1.5 text-[11px] font-bold text-orange-500 dark:bg-orange-950 dark:text-orange-400">
                            {task.type}
                          </span>
                        </div>

                        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                          <button
                            type="button"
                            onClick={() => toggleTask(task)}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-green-100 px-3 py-2.5 text-xs font-semibold text-green-600 transition hover:bg-green-50 dark:border-green-900/60 dark:hover:bg-green-950"
                          >
                            <Check size={15} />
                            Mark Complete
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              removeTask(task._id)
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-100 px-4 py-2.5 text-xs font-semibold text-red-500 transition hover:bg-red-50 dark:border-red-900/60 dark:hover:bg-red-950"
                          >
                            <Trash2 size={15} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div className="mt-8">
            <div className="mb-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-green-500">
                Done
              </p>

              <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">
                Completed Tasks
              </h2>
            </div>

            <div className="space-y-3">
              {completedTasks.map((task) => {
                const TaskIcon = getTaskIcon(task.type);

                return (
                  <div
                    key={task._id}
                    className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-[#111820]"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400">
                        <TaskIcon size={20} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h3 className="text-base font-semibold text-gray-500 line-through dark:text-gray-400">
                              {task.title}
                            </h3>

                            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                              <CalendarDays size={13} />
                              {formatDateForDisplay(task.date)}
                            </div>
                          </div>

                          <span className="w-fit rounded-full bg-green-50 px-3 py-1.5 text-[11px] font-bold text-green-600 dark:bg-green-950 dark:text-green-400">
                            Completed
                          </span>
                        </div>

                        <div className="mt-4 flex gap-2">
                          <button
                            type="button"
                            onClick={() => toggleTask(task)}
                            className="flex-1 rounded-lg border border-gray-200 px-3 py-2.5 text-xs font-semibold text-gray-600 transition hover:bg-white dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                          >
                            Mark Pending
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              removeTask(task._id)
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-red-100 px-4 py-2.5 text-xs font-semibold text-red-500 transition hover:bg-red-50 dark:border-red-900/60 dark:hover:bg-red-950"
                          >
                            <Trash2 size={15} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Note */}
        <div className="mt-8 flex gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-[#111820]">
          <Clock3
            size={17}
            className="mt-0.5 shrink-0 text-gray-400"
          />

          <p className="text-xs leading-5 text-gray-500 dark:text-gray-400">
            Stay consistent with your pet's daily care routine.
            Complete tasks as you go to keep the planner up to date.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Planner;