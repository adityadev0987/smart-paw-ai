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

function HealthRecords() {
  const { currentPet, isPetLoading } = useAppContext();

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
    if (isPetLoading) {
      return;
    }

    if (!currentPet?._id) {
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

    if (!editingRecordId) {
      return;
    }

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
          Keep {currentPet?.name || "your pet"}'s important health
          information organized in one place.
        </p>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            {editingRecordId
              ? "Edit health record"
              : "Add health record"}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Record for {currentPet?.name || "your pet"}
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
                setRecordTitle(event.target.value);
                setRecordError("");
              }}
              placeholder="e.g. Rabies vaccination"
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div className="mt-4">
            <label
              htmlFor="recordDate"
              className="text-sm font-medium text-gray-700"
            >
              Date
            </label>

            <input
              id="recordDate"
              type="date"
              value={recordDate}
              onChange={(event) =>
                setRecordDate(event.target.value)
              }
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
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
                  setIsTypeOpen(!isTypeOpen)
                }
                className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm text-gray-900 outline-none transition hover:border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              >
                <span>{recordType}</span>

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
                  {recordTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setRecordType(type);
                        setIsTypeOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm transition ${
                        recordType === type
                          ? "bg-orange-50 font-semibold text-orange-500"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span>{type}</span>

                      {recordType === type && (
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
                setRecordNotes(event.target.value)
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
                isPetLoading ||
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
              {currentPet?.name || "Pet"}'s Records
            </h2>

            <span className="text-sm text-gray-500">
              {records.length}{" "}
              {records.length === 1
                ? "record"
                : "records"}
            </span>
          </div>

          {isPetLoading || isLoading ? (
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
                Add the first health record for{" "}
                {currentPet?.name || "your pet"}.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {records.map((record) => (
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
                        startEditing(record)
                      }
                      className="flex-1 rounded-lg border border-orange-100 px-3 py-2 text-xs font-semibold text-orange-500 transition hover:border-orange-300 hover:bg-orange-50"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deleteRecord(record._id)
                      }
                      className="flex-1 rounded-lg border border-red-100 px-3 py-2 text-xs font-semibold text-red-500 transition hover:border-red-300 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default HealthRecords;