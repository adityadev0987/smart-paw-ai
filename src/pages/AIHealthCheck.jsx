import { useState } from "react";
import { useAppContext } from "../hooks/useAppContext";

function AIHealthCheck() {
  const { currentPet } = useAppContext();

  const [isStarted, setIsStarted] = useState(false);
  const [symptom, setSymptom] = useState("");
  const [result, setResult] = useState("");

  const checkHealth = () => {
    if (!symptom.trim()) {
      setResult("Please describe your pet's symptoms first.");
      return;
    }

    setResult(
      `Health information received for ${currentPet.name}. Based on the information provided, your pet may need attention. Please consult a qualified veterinarian for proper diagnosis and treatment.`,
    );
  };

  const resetCheck = () => {
    setSymptom("");
    setResult("");
    setIsStarted(false);
  };

  return (
    <section className="px-4 py-8">
      <div className="mx-auto max-w-md">
        <p className="text-sm font-semibold uppercase tracking-wider text-orange-500">
          AI Powered
        </p>

        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          AI Health Check
        </h1>

        <p className="mt-3 text-base leading-7 text-gray-600">
          Get helpful health insights by telling us about your pet.
        </p>

        {!isStarted ? (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="rounded-xl bg-orange-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-orange-500">
                Checking pet
              </p>

              <h2 className="mt-1 text-lg font-semibold text-gray-900">
                {currentPet.name}
              </h2>

              <p className="mt-1 text-sm text-gray-600">
                {currentPet.breed} • {currentPet.age} years old •{" "}
                {currentPet.gender}
              </p>
            </div>

            <h2 className="mt-5 text-lg font-semibold text-gray-900">
              Start a health check
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Answer a few questions about {currentPet.name}'s symptoms and
              recent behavior.
            </p>

            <button
              type="button"
              onClick={() => setIsStarted(true)}
              className="mt-5 w-full rounded-xl bg-orange-500 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              Start Health Check
            </button>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Pet
              </p>

              <p className="mt-1 text-sm font-semibold text-gray-900">
                {currentPet.name}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                {currentPet.breed} • {currentPet.age} years old
              </p>
            </div>

            <h2 className="mt-5 text-lg font-semibold text-gray-900">
              Describe the symptoms
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Tell us what you have noticed about {currentPet.name}'s health
              or behavior.
            </p>

            <textarea
              value={symptom}
              onChange={(event) => {
                setSymptom(event.target.value);
                setResult("");
              }}
              placeholder="e.g. My dog is not eating and seems tired..."
              rows="5"
              className="mt-5 w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />

            <button
              type="button"
              onClick={checkHealth}
              className="mt-4 w-full rounded-xl bg-orange-500 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              Check Health
            </button>

            {result && (
              <div className="mt-5 rounded-xl border border-orange-100 bg-orange-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-orange-500">
                  Health Check Result
                </p>

                <p className="mt-2 text-sm leading-6 text-gray-700">
                  {result}
                </p>

                <p className="mt-3 text-xs leading-5 text-gray-500">
                  This is an informational result and not a medical diagnosis.
                  Consult a qualified veterinarian for professional advice.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={resetCheck}
              className="mt-3 w-full rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:border-orange-300 hover:text-orange-500"
            >
              Start Over
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default AIHealthCheck;