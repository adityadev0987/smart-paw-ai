import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardList,
  FileText,
  HeartPulse,
  Loader2,
  Pencil,
  PawPrint,
  Plus,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { useAppContext } from "../hooks/useAppContext";
import {
  getHealthRecords,
  createHealthRecord,
  updateHealthRecord,
  deleteHealthRecord,
} from "../services/api";

const recordTypes = [
  "Vaccination",
  "Checkup",
  "Medicine",
  "Treatment",
  "Other",
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

  const clearDate = () => {
    onChange("");
    setIsOpen(false);
  };

  const getCalendarDays = () => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];

    for (let i = 0; i < firstDay.getDay(); i += 1) {
      days.push(null);
    }

    for (let day = 1; day <= lastDay.getDate(); day += 1) {
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
    <div ref={datePickerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-left text-sm outline-none transition hover:border-slate-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 dark:border-slate-700 dark:bg-[#18212b] dark:text-slate-100 dark:hover:border-slate-600"
      >
        <div className="flex items-center gap-3">
          <CalendarDays size={18} className="text-orange-500" />

          <span
            className={
              value
                ? "font-medium text-slate-900 dark:text-slate-100"
                : "text-slate-400"
            }
          >
            {value ? formatDateForDisplay(value) : "Select a date"}
          </span>
        </div>

        <ChevronDown
          size={17}
          className={`text-slate-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-700 dark:bg-[#111820]">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={goToPreviousMonth}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-lg text-slate-500 transition hover:bg-slate-100 hover:text-orange-500 dark:hover:bg-[#18212b]"
            >
              ‹
            </button>

            <div className="text-center">
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {monthNames[visibleMonth.getMonth()]}
              </p>
              <p className="text-xs text-slate-400">
                {visibleMonth.getFullYear()}
              </p>
            </div>

            <button
              type="button"
              onClick={goToNextMonth}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-lg text-slate-500 transition hover:bg-slate-100 hover:text-orange-500 dark:hover:bg-[#18212b]"
            >
              ›
            </button>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
              (day) => (
                <div
                  key={day}
                  className="py-2 text-center text-[10px] font-bold uppercase tracking-wide text-slate-400"
                >
                  {day}
                </div>
              ),
            )}

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
                      ? "bg-orange-500 font-bold text-white shadow-md shadow-orange-500/20"
                      : todayDate
                        ? "border border-orange-300 font-semibold text-orange-500 hover:bg-orange-50 dark:border-orange-500/40 dark:hover:bg-orange-500/10"
                        : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-[#18212b]"
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-700">
            <button
              type="button"
              onClick={clearDate}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Clear
            </button>

            <button
              type="button"
              onClick={() => {
                const year = today.getFullYear();
                const month = String(today.getMonth() + 1).padStart(2, "0");
                const day = String(today.getDate()).padStart(2, "0");

                selectDate(
                  new Date(
                    Number(year),
                    Number(month) - 1,
                    Number(day),
                  ),
                );
              }}
              className="rounded-lg bg-orange-50 px-3 py-2 text-xs font-bold text-orange-600 transition hover:bg-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:hover:bg-orange-500/20"
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
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition hover:border-slate-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 dark:border-slate-700 dark:bg-[#18212b]"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400">
            <PawPrint size={19} />
          </div>

          <div className="min-w-0 text-left">
            <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
              {currentPet.name}
            </p>

            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {currentPet.breed || "Pet profile"}
            </p>
          </div>
        </div>

        <ChevronDown
          size={17}
          className={`ml-3 shrink-0 text-slate-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl dark:border-slate-700 dark:bg-[#111820]">
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
                className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition ${
                  isSelected
                    ? "bg-orange-50 dark:bg-orange-500/10"
                    : "hover:bg-slate-50 dark:hover:bg-[#18212b]"
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm dark:bg-slate-700">
                    <PawPrint
                      size={16}
                      className={
                        isSelected
                          ? "text-orange-500"
                          : "text-slate-400"
                      }
                    />
                  </div>

                  <div className="min-w-0">
                    <p
                      className={`truncate text-sm ${
                        isSelected
                          ? "font-bold text-orange-500"
                          : "font-medium text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      {pet.name}
                    </p>

                    <p className="truncate text-xs text-slate-400">
                      {pet.breed || "Unknown breed"}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <Check
                    size={17}
                    className="text-orange-500"
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

function getRecordIcon(type) {
  switch (type) {
    case "Vaccination":
      return <ShieldCheck size={19} />;
    case "Checkup":
      return <HeartPulse size={19} />;
    case "Medicine":
      return <ClipboardList size={19} />;
    case "Treatment":
      return <HeartPulse size={19} />;
    default:
      return <FileText size={19} />;
  }
}

function getRecordColor(type) {
  switch (type) {
    case "Vaccination":
      return "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400";
    case "Checkup":
      return "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400";
    case "Medicine":
      return "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400";
    case "Treatment":
      return "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400";
    default:
      return "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300";
  }
}

function HealthRecords() {
  const {
    pets = [],
    currentPet,
    setCurrentPet,
    isPetLoading,
  } = useAppContext();

  const [records, setRecords] = useState([]);
  const [recordTitle, setRecordTitle] = useState("");
  const [recordDate, setRecordDate] = useState("");
  const [recordType, setRecordType] = useState("Vaccination");
  const [recordNotes, setRecordNotes] = useState("");
  const [recordError, setRecordError] = useState("");
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState(null);

  const typeDropdownRef = useRef(null);

  useEffect(() => {
    if (isPetLoading) return;

    if (!currentPet?._id) {
      setRecords([]);
      setIsLoading(false);
      setRecordError("Pet information is not available.");
      return;
    }

    const loadRecords = async () => {
      try {
        setIsLoading(true);
        setRecordError("");

        const data = await getHealthRecords(currentPet._id);

        setRecords(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load health records:", error);
        setRecords([]);
        setRecordError("Failed to load health records.");
      } finally {
        setIsLoading(false);
      }
    };

    loadRecords();
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

  const resetForm = () => {
    setRecordTitle("");
    setRecordDate("");
    setRecordType("Vaccination");
    setRecordNotes("");
    setEditingRecordId(null);
    setRecordError("");
    setIsTypeOpen(false);
  };

  const handlePetChange = (selectedPet) => {
    setCurrentPet(selectedPet);
    setRecords([]);
    setEditingRecordId(null);
    setRecordTitle("");
    setRecordDate("");
    setRecordType("Vaccination");
    setRecordNotes("");
    setRecordError("");
    setIsTypeOpen(false);
  };

  const addRecord = async () => {
    if (!recordTitle.trim()) {
      setRecordError("Please enter a record title.");
      return;
    }

    if (!currentPet?._id) {
      setRecordError("Pet information is not ready yet.");
      return;
    }

    try {
      setIsSaving(true);
      setRecordError("");

      const newRecord = await createHealthRecord({
        petId: currentPet._id,
        title: recordTitle.trim(),
        date: recordDate || "Today",
        type: recordType,
        notes: recordNotes.trim(),
      });

      setRecords((currentRecords) => [
        newRecord,
        ...currentRecords,
      ]);

      resetForm();
    } catch (error) {
      console.error("Failed to create health record:", error);
      setRecordError("Failed to save health record.");
    } finally {
      setIsSaving(false);
    }
  };

  const startEditing = (record) => {
    setEditingRecordId(record._id);
    setRecordTitle(record.title);
    setRecordDate(record.date === "Today" ? "" : record.date);
    setRecordType(record.type);
    setRecordNotes(record.notes || "");
    setRecordError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const saveEditedRecord = async () => {
    if (!recordTitle.trim()) {
      setRecordError("Please enter a record title.");
      return;
    }

    if (!editingRecordId) return;

    try {
      setIsSaving(true);
      setRecordError("");

      const updatedRecord = await updateHealthRecord(
        editingRecordId,
        {
          title: recordTitle.trim(),
          date: recordDate || "Today",
          type: recordType,
          notes: recordNotes.trim(),
        },
      );

      setRecords((currentRecords) =>
        currentRecords.map((record) =>
          record._id === editingRecordId
            ? updatedRecord
            : record,
        ),
      );

      resetForm();
    } catch (error) {
      console.error("Failed to update health record:", error);
      setRecordError("Failed to update health record.");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteRecord = async (recordId) => {
    try {
      setRecordError("");

      await deleteHealthRecord(recordId);

      setRecords((currentRecords) =>
        currentRecords.filter(
          (record) => record._id !== recordId,
        ),
      );

      if (editingRecordId === recordId) {
        resetForm();
      }
    } catch (error) {
      console.error("Failed to delete health record:", error);
      setRecordError("Failed to delete health record.");
    }
  };

  if (isPetLoading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10 dark:bg-[#0b0f14]">
        <div className="mx-auto max-w-5xl">
          <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#111820]">
            <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              <Loader2
                size={18}
                className="animate-spin text-orange-500"
              />
              Loading pet information...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentPet) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10 dark:bg-[#0b0f14]">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 dark:border-red-500/20 dark:bg-red-500/10">
            <p className="text-sm font-medium text-red-600 dark:text-red-300">
              Pet information is not available. Please add a pet before
              managing health records.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#0b0f14] dark:text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-24 h-72 w-72 rounded-full bg-orange-400/10 blur-3xl dark:bg-orange-500/10" />
        <div className="absolute -right-32 top-96 h-80 w-80 rounded-full bg-orange-300/10 blur-3xl dark:bg-orange-500/5" />
      </div>

      <main className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <section className="mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-600 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-400">
            <HeartPulse size={14} />
            PET HEALTH
          </div>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Health Records
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base dark:text-slate-400">
                Keep {currentPet.name}'s vaccinations, checkups, medicines,
                and treatments organized in one place.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-[#111820]">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400">
                <PawPrint size={18} />
              </div>

              <div>
                <p className="text-xs text-slate-400">Managing records for</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {currentPet.name}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pet switcher */}
        {pets.length > 1 && (
          <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#111820]">
            <div className="mb-3 flex items-center gap-2">
              <PawPrint size={17} className="text-orange-500" />
              <label className="text-sm font-bold">
                Select pet
              </label>
            </div>

            <PetSelector
              pets={pets}
              currentPet={currentPet}
              onChange={handlePetChange}
            />
          </section>
        )}

        <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
          {/* Add/Edit form */}
          <section className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-[#111820]">
            <div className="mb-6 flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400">
                {editingRecordId ? (
                  <Pencil size={20} />
                ) : (
                  <Plus size={21} />
                )}
              </div>

              <div>
                <h2 className="text-lg font-bold">
                  {editingRecordId
                    ? "Edit health record"
                    : "Add health record"}
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  {editingRecordId
                    ? "Update the selected health record."
                    : `Create a new record for ${currentPet.name}.`}
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="recordTitle"
                  className="text-sm font-semibold"
                >
                  Record title
                </label>

                <input
                  id="recordTitle"
                  type="text"
                  value={recordTitle}
                  onChange={(event) => {
                    setRecordTitle(event.target.value);
                    setRecordError("");
                  }}
                  placeholder="e.g. Rabies vaccination"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 dark:border-slate-700 dark:bg-[#18212b] dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="text-sm font-semibold">
                  Date
                </label>

                <div className="mt-2">
                  <CustomDatePicker
                    value={recordDate}
                    onChange={setRecordDate}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold">
                  Record type
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
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-left text-sm outline-none transition hover:border-slate-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 dark:border-slate-700 dark:bg-[#18212b]"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${getRecordColor(recordType)}`}
                      >
                        {getRecordIcon(recordType)}
                      </div>

                      <span className="font-medium text-slate-800 dark:text-slate-100">
                        {recordType}
                      </span>
                    </div>

                    <ChevronDown
                      size={17}
                      className={`text-slate-400 transition-transform ${
                        isTypeOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isTypeOpen && (
                    <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl dark:border-slate-700 dark:bg-[#111820]">
                      {recordTypes.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            setRecordType(type);
                            setIsTypeOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition ${
                            recordType === type
                              ? "bg-orange-50 dark:bg-orange-500/10"
                              : "hover:bg-slate-50 dark:hover:bg-[#18212b]"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-lg ${getRecordColor(type)}`}
                            >
                              {getRecordIcon(type)}
                            </div>

                            <span
                              className={`text-sm ${
                                recordType === type
                                  ? "font-bold text-orange-500"
                                  : "font-medium text-slate-700 dark:text-slate-200"
                              }`}
                            >
                              {type}
                            </span>
                          </div>

                          {recordType === type && (
                            <Check
                              size={17}
                              className="text-orange-500"
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="recordNotes"
                  className="text-sm font-semibold"
                >
                  Notes
                </label>

                <textarea
                  id="recordNotes"
                  value={recordNotes}
                  onChange={(event) =>
                    setRecordNotes(event.target.value)
                  }
                  placeholder="Add useful health information..."
                  rows={4}
                  className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 dark:border-slate-700 dark:bg-[#18212b] dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </div>

              {recordError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-xs font-medium text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                  {recordError}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={
                    editingRecordId
                      ? saveEditedRecord
                      : addRecord
                  }
                  disabled={isSaving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  ) : editingRecordId ? (
                    <Check size={17} />
                  ) : (
                    <Plus size={17} />
                  )}

                  {isSaving
                    ? "Saving..."
                    : editingRecordId
                      ? "Save changes"
                      : "Add record"}
                </button>

                {editingRecordId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={isSaving}
                    className="flex items-center justify-center rounded-xl border border-slate-200 px-4 text-slate-500 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-[#18212b]"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>

            <div className="mt-5 flex gap-2 rounded-2xl border border-orange-100 bg-orange-50/60 p-3.5 dark:border-orange-500/15 dark:bg-orange-500/5">
              <ShieldCheck
                size={17}
                className="mt-0.5 shrink-0 text-orange-500"
              />

              <p className="text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                Keep records updated to maintain a clear health history for
                your pet.
              </p>
            </div>
          </section>

          {/* Records */}
          <section>
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">
                  {currentPet.name}'s Records
                </h2>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Complete health history
                </p>
              </div>

              <div className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 dark:border-slate-700 dark:bg-[#111820] dark:text-slate-300">
                {records.length}{" "}
                {records.length === 1 ? "record" : "records"}
              </div>
            </div>

            {isLoading ? (
              <div className="flex min-h-[280px] items-center justify-center rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#111820]">
                <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                  <Loader2
                    size={18}
                    className="animate-spin text-orange-500"
                  />
                  Loading health records...
                </div>
              </div>
            ) : records.length === 0 ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-[#111820]">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400">
                  <ClipboardList size={28} />
                </div>

                <h3 className="mt-5 text-lg font-bold">
                  No health records yet
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Start building {currentPet.name}'s health history by adding
                  a vaccination, checkup, medicine, or treatment record.
                </p>

                <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-2.5 text-xs font-bold text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
                  <Plus size={15} />
                  Add your first record
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {records.map((record) => (
                  <article
                    key={record._id}
                    className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md dark:border-slate-800 dark:bg-[#111820] dark:hover:border-orange-500/20"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${getRecordColor(record.type)}`}
                      >
                        {getRecordIcon(record.type)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <h3 className="truncate text-base font-bold text-slate-900 dark:text-white">
                              {record.title}
                            </h3>

                            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                              <CalendarDays size={13} />
                              {record.date === "Today"
                                ? "Today"
                                : formatDateForDisplay(record.date)}
                            </div>
                          </div>

                          <span
                            className={`w-fit rounded-full px-3 py-1 text-[11px] font-bold ${getRecordColor(record.type)}`}
                          >
                            {record.type}
                          </span>
                        </div>

                        {record.notes && (
                          <div className="mt-4 rounded-xl bg-slate-50 px-3.5 py-3 dark:bg-[#18212b]">
                            <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                              {record.notes}
                            </p>
                          </div>
                        )}

                        <div className="mt-4 flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEditing(record)}
                            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-orange-300 hover:text-orange-500 dark:border-slate-700 dark:text-slate-300 dark:hover:border-orange-500/40 dark:hover:text-orange-400"
                          >
                            <Pencil size={14} />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteRecord(record._id)}
                            className="flex items-center gap-1.5 rounded-lg border border-red-100 px-3 py-2 text-xs font-bold text-red-500 transition hover:bg-red-50 dark:border-red-500/20 dark:hover:bg-red-500/10"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default HealthRecords;