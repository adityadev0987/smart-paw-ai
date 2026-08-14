import { useEffect, useState } from "react";

const initialRecords = [
  {
    id: 1,
    title: "Annual Vaccination",
    date: "15 Aug 2026",
    type: "Vaccination",
    notes: "Annual vaccination completed.",
  },
  {
    id: 2,
    title: "General Checkup",
    date: "10 Aug 2026",
    type: "Checkup",
    notes: "Routine health checkup completed.",
  },
];

function HealthRecords() {
  const [records, setRecords] = useState(() => {
    const savedRecords = localStorage.getItem("smartPawHealthRecords");

    return savedRecords ? JSON.parse(savedRecords) : initialRecords;
  });

  const [recordTitle, setRecordTitle] = useState("");
  const [recordDate, setRecordDate] = useState("");
  const [recordType, setRecordType] = useState("Vaccination");
  const [recordNotes, setRecordNotes] = useState("");
  const [recordError, setRecordError] = useState("");

  useEffect(() => {
    localStorage.setItem(
      "smartPawHealthRecords",
      JSON.stringify(records),
    );
  }, [records]);

  const addRecord = () => {
    if (!recordTitle.trim()) {
      setRecordError("Please enter a record title.");
      return;
    }

    const newRecord = {
      id: Date.now(),
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
          Keep your pet's important health information organized in one place.
        </p>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Add health record
          </h2>

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
            <label
              htmlFor="recordType"
              className="text-sm font-medium text-gray-700"
            >
              Record type
            </label>

            <select
              id="recordType"
              value={recordType}
              onChange={(event) => setRecordType(event.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            >
              <option value="Vaccination">Vaccination</option>
              <option value="Checkup">Checkup</option>
              <option value="Medicine">Medicine</option>
              <option value="Treatment">Treatment</option>
              <option value="Other">Other</option>
            </select>
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

        <div className="mt-6 space-y-3">
          {records.map((record) => (
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
      </div>
    </section>
  );
}

export default HealthRecords;