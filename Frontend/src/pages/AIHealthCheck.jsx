import { useState } from "react";
import { useAppContext } from "../hooks/useAppContext";

const API_BASE_URL = "http://localhost:5000";

function AIHealthCheck() {
  const { currentPet } = useAppContext();

  const [isStarted, setIsStarted] = useState(false);
  const [symptom, setSymptom] = useState("");
  const [answer, setAnswer] = useState("");
  const [conversation, setConversation] = useState([]);
  const [question, setQuestion] = useState("");
  const [assessment, setAssessment] = useState("");
  const [nextSteps, setNextSteps] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [urgent, setUrgent] = useState(false);

  const runHealthCheck = async ({
    currentSymptoms,
    currentConversation,
  }) => {
    if (!currentPet?._id) {
      setError("Pet information is not available.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/ai/health-check`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            petId: currentPet._id,
            symptoms: currentSymptoms,
            conversation: currentConversation,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to generate health insight.",
        );
      }

      const result = data.data;

      if (result.status === "FOLLOW_UP") {
        setQuestion(result.question || "");
        setAssessment("");
        setNextSteps([]);
        setIsFinished(false);
        setUrgent(Boolean(result.urgent));
      } else {
        setQuestion("");
        setAssessment(result.assessment || "");
        setNextSteps(result.nextSteps || []);
        setIsFinished(true);
        setUrgent(Boolean(result.urgent));
      }
    } catch (error) {
      console.error("Health check failed:", error);

      setError(
        error.message || "Something went wrong while checking your pet.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const startHealthCheck = async () => {
    if (!symptom.trim()) {
      setError("Please describe your pet's symptoms first.");
      return;
    }

    setError("");

    const initialConversation = [];

    setConversation(initialConversation);
    setAnswer("");
    setQuestion("");
    setAssessment("");
    setNextSteps([]);
    setIsFinished(false);

    await runHealthCheck({
      currentSymptoms: symptom.trim(),
      currentConversation: initialConversation,
    });
  };

  const submitAnswer = async () => {
    if (!answer.trim()) {
      setError("Please provide an answer first.");
      return;
    }

    const updatedConversation = [
      ...conversation,
      {
        role: "assistant",
        content: question,
      },
      {
        role: "user",
        content: answer.trim(),
      },
    ];

    setConversation(updatedConversation);
    setAnswer("");
    setError("");

    await runHealthCheck({
      currentSymptoms: symptom.trim(),
      currentConversation: updatedConversation,
    });
  };

  const resetCheck = () => {
    setSymptom("");
    setAnswer("");
    setConversation([]);
    setQuestion("");
    setAssessment("");
    setNextSteps([]);
    setIsFinished(false);
    setIsLoading(false);
    setError("");
    setUrgent(false);
    setIsStarted(false);
  };

  /*
   * currentPet is loaded asynchronously by AppContext.
   * During a browser refresh it can temporarily be null.
   * Do not access currentPet.name/breed/etc. until it exists.
   */
  if (!currentPet) {
    return (
      <section className="px-4 py-8">
        <div className="mx-auto max-w-md">
          <p className="text-sm font-semibold uppercase tracking-wider text-orange-500">
            AI Powered
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            AI Health Check
          </h1>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                Loading pet information...
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

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
              Describe what you have noticed about {currentPet.name}'s health
              or behavior.
            </p>

            <textarea
              value={symptom}
              onChange={(event) => {
                setSymptom(event.target.value);
                setError("");
              }}
              placeholder="e.g. My dog is not eating and seems tired..."
              rows="5"
              className="mt-5 w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />

            {error && (
              <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="button"
              onClick={async () => {
                setIsStarted(true);
                await startHealthCheck();
              }}
              disabled={isLoading}
              className="mt-5 w-full rounded-xl bg-orange-500 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Starting Health Check..." : "Start Health Check"}
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

            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Reported Symptoms
              </p>

              <p className="mt-2 rounded-xl bg-gray-50 p-3 text-sm leading-6 text-gray-700">
                {symptom}
              </p>
            </div>

            {question && !isFinished && (
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-orange-500">
                  AI Follow-up Question
                </p>

                <div className="mt-2 rounded-xl border border-orange-100 bg-orange-50 p-4">
                  <p className="text-sm leading-6 text-gray-800">
                    {question}
                  </p>
                </div>

                <textarea
                  value={answer}
                  onChange={(event) => {
                    setAnswer(event.target.value);
                    setError("");
                  }}
                  placeholder="Type your answer..."
                  rows="4"
                  className="mt-4 w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />

                {error && (
                  <div className="mt-3 rounded-xl border border-red-100 bg-red-50 p-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={submitAnswer}
                  disabled={isLoading}
                  className="mt-4 w-full rounded-xl bg-orange-500 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? "Thinking..." : "Continue"}
                </button>
              </div>
            )}

            {isLoading && !question && !isFinished && (
              <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm text-gray-500">
                  Smart Paw AI is analyzing the information...
                </p>
              </div>
            )}

            {isFinished && assessment && (
              <div
                className={`mt-5 rounded-xl border p-4 ${
                  urgent
                    ? "border-red-200 bg-red-50"
                    : "border-orange-100 bg-orange-50"
                }`}
              >
                <p
                  className={`text-xs font-semibold uppercase tracking-wide ${
                    urgent ? "text-red-600" : "text-orange-500"
                  }`}
                >
                  AI Health Assessment
                </p>

                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-700">
                  {assessment}
                </p>

                {nextSteps.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Recommended Next Steps
                    </p>

                    <ul className="mt-2 space-y-2">
                      {nextSteps.map((step, index) => (
                        <li
                          key={index}
                          className="text-sm leading-6 text-gray-700"
                        >
                          • {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {urgent && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-white p-3">
                    <p className="text-sm font-semibold text-red-600">
                      Veterinary attention may be needed promptly.
                    </p>
                  </div>
                )}

                <p className="mt-4 text-xs leading-5 text-gray-500">
                  This is an informational result and not a medical diagnosis.
                  Consult a qualified veterinarian for professional advice.
                </p>
              </div>
            )}

            {error && !question && !isFinished && (
              <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="button"
              onClick={resetCheck}
              disabled={isLoading}
              className="mt-5 w-full rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:border-orange-300 hover:text-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
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