import { useEffect, useRef, useState } from "react";
import { useAppContext } from "../hooks/useAppContext";

const initialRecords = [
  {
    id: 1,
    petId: 1,
    title: "Annual Vaccination",
    date: "15 Aug 2026",
    type: "Vaccination",
    notes: "Annual vaccination completed.",
  },
  {
    id: 2,
    petId: 1,
    title: "General Checkup",
    date: "10 Aug 2026",
    type: "Checkup",
    notes: "Routine health checkup completed.",
  },
];

const recordTypes = [
  "Vaccination",
  "Checkup",
  "Medicine",
  "Treatment",
  "Other",
];

function HealthRecords() {
  const { currentPet } = useAppContext();

  const [records, setRecords] = useState(() => {
    const savedRecords = localStorage.getItem("smartPawHealthRecords");

    if (!savedRecords) {
      return initialRecords;
    }

    const parsedRecords = JSON.parse(savedRecords);

    // Add current pet ID to old records created before pet-based records
    // were introduced.
    return parsedRecords.map((record) => ({
      ...record,
      petId: record.petId ?? 1,
    }));
  });

  const [recordTitle, setRecordTitle] = useState("");
  const [recordDate, setRecordDate] = useState("");
  const [recordType, setRecordType] = useState("Vaccination");
  const [recordNotes, setRecordNotes] = useState("");
  const [recordError, setRecordError] = useState("");
  const [isTypeOpen, setIsTypeOpen] = useState(false);

  const typeDropdownRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(
      "smartPawHealthRecords",
      JSON.stringify(records),
    );
  }, [records]);

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

  const currentPetRecords = records.filter(
    (record) => record.petId === currentPet.id,
  );

  const addRecord = () => {
    if (!recordTitle.trim()) {
      setRecordError("Please enter a record title.");
      return;
    }

    const newRecord = {
      id: Date.now(),
      petId: currentPet.id,
      title: recordTitle.trim(),
      date: recordDate || "Today",
      type: recordType,
      notes: recordNotes.trim(),
    };

    setRecords((currentRecords) => [...currentRecords, newRecord]);

    setRecordTitle("");
    setRecordDate("");
    setRecordType("Vaccination");
    setRecordNotes("");
    setRecordError("");
    setIsTypeOpen(false);
  };

  const deleteRecord = (recordId) => {
    setRecords((currentRecords) =>
      currentRecords.filter((record) => record.id !== recordId),
    );
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
          Keep {currentPet.name}'s important health information organized in
          one place.
        </p>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Add health record
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Record for {currentPet.name}
              </p>
            </div>
          </div>

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

            {recordError && (
              <p className="mt-2 text-xs font-medium text-red-500">
                {recordError}
              </p>
            )}
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
              onChange={(event) => setRecordDate(event.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium text-gray-700">
              Record type
            </label>

            <div ref={typeDropdownRef} className="relative mt-2">
              <button
                type="button"
                onClick={() => setIsTypeOpen(!isTypeOpen)}
                className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm text-gray-900 outline-none transition hover:border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                aria-haspopup="listbox"
                aria-expanded={isTypeOpen}
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
                        <span className="font-bold">✓</span>
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
              onChange={(event) => setRecordNotes(event.target.value)}
              placeholder="Add any useful health information..."
              rows="3"
              className="mt-2 w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <button
            type="button"
            onClick={addRecord}
            className="mt-5 w-full rounded-xl bg-orange-500 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            Add health record
          </button>
        </div>

        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {currentPet.name}'s Records
            </h2>

            <span className="text-sm text-gray-500">
              {currentPetRecords.length}{" "}
              {currentPetRecords.length === 1 ? "record" : "records"}
            </span>
          </div>

          {currentPetRecords.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
              <p className="text-sm font-medium text-gray-700">
                No health records yet
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Add the first health record for {currentPet.name}.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {currentPetRecords.map((record) => (
                <div
                  key={record.id}
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

                  <button
                    type="button"
                    onClick={() => deleteRecord(record.id)}
                    className="mt-4 w-full rounded-lg border border-red-100 px-3 py-2 text-xs font-semibold text-red-500 transition hover:border-red-300 hover:bg-red-50"
                  >
                    Delete record
                  </button>
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