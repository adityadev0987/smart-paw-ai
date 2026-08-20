import { useEffect, useRef, useState } from "react";
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
  if (!dateValue) {
    return "";
  }

  const [year, month, day] = dateValue.split("-");

  if (!year || !month || !day) {
    return dateValue;
  }

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

function getTodayString() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(
    today.getMonth() + 1,
  ).padStart(2, "0");
  const day = String(
    today.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDateValue(dateValue) {
  if (!dateValue) {
    return null;
  }

  const [year, month, day] = dateValue
    .split("-")
    .map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function CustomDatePicker({
  value,
  onChange,
}) {
  const datePickerRef = useRef(null);

  const today = new Date();

  const selectedDate = parseDateValue(value);

  const [isOpen, setIsOpen] = useState(false);

  const [visibleMonth, setVisibleMonth] =
    useState(
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

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );
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

    const month = String(
      date.getMonth() + 1,
    ).padStart(2, "0");

    const day = String(
      date.getDate(),
    ).padStart(2, "0");

    onChange(
      `${year}-${month}-${day}`,
    );

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
    const year =
      visibleMonth.getFullYear();

    const month =
      visibleMonth.getMonth();

    const firstDay = new Date(
      year,
      month,
      1,
    );

    const lastDay = new Date(
      year,
      month + 1,
      0,
    );

    const firstWeekday =
      firstDay.getDay();

    const daysInMonth =
      lastDay.getDate();

    const days = [];

    for (
      let index = 0;
      index < firstWeekday;
      index += 1
    ) {
      days.push(null);
    }

    for (
      let day = 1;
      day <= daysInMonth;
      day += 1
    ) {
      days.push(
        new Date(year, month, day),
      );
    }

    return days;
  };

  const isSameDay = (
    firstDate,
    secondDate,
  ) => {
    if (!firstDate || !secondDate) {
      return false;
    }

    return (
      firstDate.getFullYear() ===
        secondDate.getFullYear() &&
      firstDate.getMonth() ===
        secondDate.getMonth() &&
      firstDate.getDate() ===
        secondDate.getDate()
    );
  };

  const calendarDays =
    getCalendarDays();

  return (
    <div
      ref={datePickerRef}
      className="relative mt-2"
    >
      <button
        type="button"
        onClick={() =>
          setIsOpen((current) => !current)
        }
        className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm text-gray-900 outline-none transition hover:border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
      >
        <span
          className={
            value
              ? "text-gray-900"
              : "text-gray-400"
          }
        >
          {value
            ? formatDateForDisplay(value)
            : "Select a date"}
        </span>

        <span
          className={`text-xs text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={goToPreviousMonth}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
            >
              ‹
            </button>

            <div className="text-center">
              <p className="text-sm font-semibold text-gray-900">
                {
                  monthNames[
                    visibleMonth.getMonth()
                  ]
                }
              </p>

              <p className="text-xs text-gray-500">
                {visibleMonth.getFullYear()}
              </p>
            </div>

            <button
              type="button"
              onClick={goToNextMonth}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
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
                className="py-2 text-center text-[10px] font-semibold uppercase text-gray-400"
              >
                {day}
              </div>
            ))}

            {calendarDays.map(
              (date, index) => {
                if (!date) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="h-9"
                    />
                  );
                }

                const selected =
                  isSameDay(
                    date,
                    selectedDate,
                  );

                const todayDate =
                  isSameDay(
                    date,
                    today,
                  );

                return (
                  <button
                    key={date.toISOString()}
                    type="button"
                    onClick={() =>
                      selectDate(date)
                    }
                    className={`flex h-9 items-center justify-center rounded-lg text-sm transition ${
                      selected
                        ? "bg-orange-500 font-semibold text-white"
                        : todayDate
                          ? "border border-orange-300 font-semibold text-orange-500 hover:bg-orange-50"
                          : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {date.getDate()}
                  </button>
                );
              },
            )}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
            <button
              type="button"
              onClick={clearDate}
              className="text-xs font-semibold text-gray-500 transition hover:text-gray-800"
            >
              Clear
            </button>

            <button
              type="button"
              onClick={selectToday}
              className="rounded-lg bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-500 transition hover:bg-orange-100"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PetSelector({
  pets,
  currentPet,
  onChange,
}) {
  const dropdownRef = useRef(null);

  const [isOpen, setIsOpen] =
    useState(false);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );
    };
  }, []);

  return (
    <div
      ref={dropdownRef}
      className="relative mt-2"
    >
      <button
        type="button"
        onClick={() =>
          setIsOpen((current) => !current)
        }
        className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-left outline-none transition hover:border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-50 text-sm">
            🐾
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">
              {currentPet.name}
            </p>

            <p className="truncate text-xs text-gray-500">
              {currentPet.breed}
            </p>
          </div>
        </div>

        <span
          className={`ml-3 shrink-0 text-xs text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg">
          {pets.map((pet) => {
            const isSelected =
              pet._id === currentPet._id;

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
                    ? "bg-orange-50"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm ${
                      isSelected
                        ? "bg-orange-100"
                        : "bg-gray-100"
                    }`}
                  >
                    🐾
                  </div>

                  <div className="min-w-0">
                    <p
                      className={`truncate text-sm ${
                        isSelected
                          ? "font-semibold text-orange-500"
                          : "font-medium text-gray-800"
                      }`}
                    >
                      {pet.name}
                    </p>

                    <p className="truncate text-xs text-gray-500">
                      {pet.breed} • {pet.age} years
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <span className="ml-2 text-sm font-bold text-orange-500">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function HealthRecords() {
  const {
    pets = [],
    currentPet,
    setCurrentPet,
    isPetLoading,
  } = useAppContext();

  const [records, setRecords] =
    useState([]);

  const [recordTitle, setRecordTitle] =
    useState("");

  const [recordDate, setRecordDate] =
    useState("");

  const [recordType, setRecordType] =
    useState("Vaccination");

  const [recordNotes, setRecordNotes] =
    useState("");

  const [recordError, setRecordError] =
    useState("");

  const [isTypeOpen, setIsTypeOpen] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [editingRecordId, setEditingRecordId] =
    useState(null);

  const typeDropdownRef =
    useRef(null);

  useEffect(() => {
    if (isPetLoading) {
      return;
    }

    if (!currentPet?._id) {
      setRecords([]);
      setIsLoading(false);
      setRecordError(
        "Pet information is not available.",
      );
      return;
    }

    const loadRecords = async () => {
      try {
        setIsLoading(true);
        setRecordError("");

        const data =
          await getHealthRecords(
            currentPet._id,
          );

        setRecords(
          Array.isArray(data)
            ? data
            : [],
        );
      } catch (error) {
        console.error(
          "Failed to load health records:",
          error,
        );

        setRecords([]);
        setRecordError(
          "Failed to load health records.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadRecords();
  }, [
    currentPet?._id,
    isPetLoading,
  ]);

  useEffect(() => {
    const handleOutsideClick = (
      event,
    ) => {
      if (
        typeDropdownRef.current &&
        !typeDropdownRef.current.contains(
          event.target,
        )
      ) {
        setIsTypeOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );
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

  const handlePetChange = (
    selectedPet,
  ) => {
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
      setRecordError(
        "Please enter a record title.",
      );
      return;
    }

    if (!currentPet?._id) {
      setRecordError(
        "Pet information is not ready yet.",
      );
      return;
    }

    try {
      setIsSaving(true);
      setRecordError("");

      const newRecord =
        await createHealthRecord({
          petId: currentPet._id,
          title: recordTitle.trim(),
          date:
            recordDate || "Today",
          type: recordType,
          notes: recordNotes.trim(),
        });

      setRecords(
        (currentRecords) => [
          newRecord,
          ...currentRecords,
        ],
      );

      resetForm();
    } catch (error) {
      console.error(
        "Failed to create health record:",
        error,
      );

      setRecordError(
        "Failed to save health record.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const startEditing = (
    record,
  ) => {
    setEditingRecordId(
      record._id,
    );

    setRecordTitle(
      record.title,
    );

    setRecordDate(
      record.date === "Today"
        ? ""
        : record.date,
    );

    setRecordType(
      record.type,
    );

    setRecordNotes(
      record.notes || "",
    );

    setRecordError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const saveEditedRecord =
    async () => {
      if (!recordTitle.trim()) {
        setRecordError(
          "Please enter a record title.",
        );
        return;
      }

      if (!editingRecordId) {
        return;
      }

      try {
        setIsSaving(true);
        setRecordError("");

        const updatedRecord =
          await updateHealthRecord(
            editingRecordId,
            {
              title:
                recordTitle.trim(),
              date:
                recordDate || "Today",
              type: recordType,
              notes:
                recordNotes.trim(),
            },
          );

        setRecords(
          (currentRecords) =>
            currentRecords.map(
              (record) =>
                record._id ===
                editingRecordId
                  ? updatedRecord
                  : record,
            ),
        );

        resetForm();
      } catch (error) {
        console.error(
          "Failed to update health record:",
          error,
        );

        setRecordError(
          "Failed to update health record.",
        );
      } finally {
        setIsSaving(false);
      }
    };

  const deleteRecord = async (
    recordId,
  ) => {
    try {
      setRecordError("");

      await deleteHealthRecord(
        recordId,
      );

      setRecords(
        (currentRecords) =>
          currentRecords.filter(
            (record) =>
              record._id !==
              recordId,
          ),
      );

      if (
        editingRecordId ===
        recordId
      ) {
        resetForm();
      }
    } catch (error) {
      console.error(
        "Failed to delete health record:",
        error,
      );

      setRecordError(
        "Failed to delete health record.",
      );
    }
  };

  if (isPetLoading) {
    return (
      <section className="px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-orange-500">
            Pet Health
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Health Records
          </h1>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
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
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-orange-500">
            Pet Health
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Health Records
          </h1>

          <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-6">
            <p className="text-sm text-red-600">
              Pet information is not available.
              Please add a pet before
              managing health records.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-orange-500">
          Pet Health
        </p>

        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          Health Records
        </h1>

        <p className="mt-3 text-base leading-7 text-gray-600">
          Keep {currentPet.name}'s
          important health information
          organized in one place.
        </p>

        {pets.length > 1 && (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <label className="text-sm font-semibold text-gray-700">
              Select pet
            </label>

            <PetSelector
              pets={pets}
              currentPet={currentPet}
              onChange={handlePetChange}
            />

            <p className="mt-2 text-xs text-gray-500">
              Select the pet whose health
              records you want to manage.
            </p>
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            {editingRecordId
              ? "Edit health record"
              : "Add health record"}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Record for {currentPet.name}
          </p>

          <div className="mt-5">
            <label
              htmlFor="recordTitle"
              className="text-sm font-medium text-gray-700"
            >
              Record title
            </label>

            <input
              id="recordTitle"
              type="text"
              value={recordTitle}
              onChange={(event) => {
                setRecordTitle(
                  event.target.value,
                );
                setRecordError("");
              }}
              placeholder="e.g. Rabies vaccination"
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium text-gray-700">
              Date
            </label>

            <CustomDatePicker
              value={recordDate}
              onChange={setRecordDate}
            />
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium text-gray-700">
              Record type
            </label>

            <div
              ref={typeDropdownRef}
              className="relative mt-2"
            >
              <button
                type="button"
                onClick={() =>
                  setIsTypeOpen(
                    !isTypeOpen,
                  )
                }
                className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm text-gray-900 outline-none transition hover:border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              >
                <span>
                  {recordType}
                </span>

                <span
                  className={`text-xs text-gray-400 transition-transform duration-200 ${
                    isTypeOpen
                      ? "rotate-180"
                      : ""
                  }`}
                >
                  ▼
                </span>
              </button>

              {isTypeOpen && (
                <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg">
                  {recordTypes.map(
                    (type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setRecordType(
                            type,
                          );
                          setIsTypeOpen(
                            false,
                          );
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm transition ${
                          recordType ===
                          type
                            ? "bg-orange-50 font-semibold text-orange-500"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <span>
                          {type}
                        </span>

                        {recordType ===
                          type && (
                          <span className="font-bold">
                            ✓
                          </span>
                        )}
                      </button>
                    ),
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label
              htmlFor="recordNotes"
              className="text-sm font-medium text-gray-700"
            >
              Notes
            </label>

            <textarea
              id="recordNotes"
              value={recordNotes}
              onChange={(event) =>
                setRecordNotes(
                  event.target.value,
                )
              }
              placeholder="Add any useful health information..."
              rows="3"
              className="mt-2 w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          {recordError && (
            <p className="mt-3 text-xs font-medium text-red-500">
              {recordError}
            </p>
          )}

          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={
                editingRecordId
                  ? saveEditedRecord
                  : addRecord
              }
              disabled={
                isSaving ||
                !currentPet?._id
              }
              className="flex-1 rounded-xl bg-orange-500 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving
                ? "Saving..."
                : editingRecordId
                  ? "Save changes"
                  : "Add health record"}
            </button>

            {editingRecordId && (
              <button
                type="button"
                onClick={resetForm}
                disabled={isSaving}
                className="rounded-xl border border-gray-200 px-5 py-3.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {currentPet.name}'s Records
            </h2>

            <span className="text-sm text-gray-500">
              {records.length}{" "}
              {records.length === 1
                ? "record"
                : "records"}
            </span>
          </div>

          {isLoading ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
              <p className="text-sm text-gray-500">
                Loading health records...
              </p>
            </div>
          ) : records.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
              <p className="text-sm font-medium text-gray-700">
                No health records yet
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Add the first health record
                for {currentPet.name}.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {records.map(
                (record) => (
                  <div
                    key={record._id}
                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-base font-semibold text-gray-900">
                          {record.title}
                        </h2>

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

                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          startEditing(
                            record,
                          )
                        }
                        className="flex-1 rounded-lg border border-orange-100 px-3 py-2 text-xs font-semibold text-orange-500 transition hover:border-orange-300 hover:bg-orange-50"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteRecord(
                            record._id,
                          )
                        }
                        className="flex-1 rounded-lg border border-red-100 px-3 py-2 text-xs font-semibold text-red-500 transition hover:border-red-300 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default HealthRecords;