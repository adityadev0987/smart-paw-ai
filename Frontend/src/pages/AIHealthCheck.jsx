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
        setNextSteps(Array.isArray(result.nextSteps) ? result.nextSteps : []);
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

    const initialConversation = [];

    setIsStarted(true);
    setConversation(initialConversation);
    setAnswer("");
    setQuestion("");
    setAssessment("");
    setNextSteps([]);
    setIsFinished(false);
    setUrgent(false);
    setError("");

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

  if (!currentPet) {
    return (
      <section className="px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-orange-500">
            AI Powered
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            AI Health Check
          </h1>

          <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Loading pet information...
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-orange-500">
            AI Powered
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            AI Health Check
          </h1>

          <p className="mt-3 max-w-xl text-base leading-7 text-gray-600">
            Describe what you have noticed about your pet and Smart Paw AI
            will ask relevant follow-up questions before providing a cautious
            health assessment.
          </p>
        </div>

        {!isStarted ? (
          /* START SCREEN */
          <div className="mt-6 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 bg-orange-50 p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-orange-500">
                Health check for
              </p>

              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                {currentPet.name}
              </h2>

              <p className="mt-1 text-sm text-gray-600">
                {currentPet.breed} • {currentPet.age} years old •{" "}
                {currentPet.gender}
              </p>
            </div>

            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900">
                What have you noticed?
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Describe the symptoms, behavior changes, or anything unusual
                you have noticed.
              </p>

              <textarea
                value={symptom}
                onChange={(event) => {
                  setSymptom(event.target.value);
                  setError("");
                }}
                placeholder="Example: Bruno is eating less than usual and seems a little tired."
                rows={5}
                className="mt-5 w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
              />

              {error && (
                <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3">
                  <p className="text-sm leading-5 text-red-600">{error}</p>
                </div>
              )}

              <button
                type="button"
                onClick={startHealthCheck}
                disabled={isLoading}
                className="mt-5 w-full rounded-2xl bg-orange-500 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Starting Health Check..." : "Start Health Check"}
              </button>

              <p className="mt-3 text-center text-xs leading-5 text-gray-400">
                Smart Paw AI provides informational guidance and does not
                replace professional veterinary care.
              </p>
            </div>
          </div>
        ) : (
          /* CHAT SCREEN */
          <div className="mt-6 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
            {/* Chat header */}
            <div className="flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {currentPet.name}'s Health Check
                </p>

                <p className="mt-0.5 text-xs text-gray-500">
                  {currentPet.breed} • {currentPet.age} years old
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100">
                <span className="text-sm font-bold text-orange-500">
                  AI
                </span>
              </div>
            </div>

            {/* Conversation */}
            <div className="max-h-[520px] space-y-4 overflow-y-auto bg-gray-50 p-5">
              {/* Initial user message */}
              {symptom && (
                <div className="flex justify-end">
                  <div className="max-w-[82%]">
                    <p className="mb-1 text-right text-[11px] font-medium text-gray-400">
                      You
                    </p>

                    <div className="rounded-2xl rounded-br-md bg-orange-500 px-4 py-3 text-sm leading-6 text-white shadow-sm">
                      {symptom}
                    </div>
                  </div>
                </div>
              )}

              {/* Previous conversation */}
              {conversation.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={
                    message.role === "assistant"
                      ? "flex justify-start"
                      : "flex justify-end"
                  }
                >
                  <div className="max-w-[82%]">
                    <p
                      className={`mb-1 text-[11px] font-medium text-gray-400 ${
                        message.role === "user" ? "text-right" : "text-left"
                      }`}
                    >
                      {message.role === "assistant" ? "Smart Paw AI" : "You"}
                    </p>

                    <div
                      className={
                        message.role === "assistant"
                          ? "rounded-2xl rounded-bl-md border border-gray-200 bg-white px-4 py-3 text-sm leading-6 text-gray-700 shadow-sm"
                          : "rounded-2xl rounded-br-md bg-orange-500 px-4 py-3 text-sm leading-6 text-white shadow-sm"
                      }
                    >
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}

              {/* Current AI question */}
              {question && !isFinished && (
                <div className="flex justify-start">
                  <div className="max-w-[82%]">
                    <p className="mb-1 text-[11px] font-medium text-gray-400">
                      Smart Paw AI
                    </p>

                    <div className="rounded-2xl rounded-bl-md border border-gray-200 bg-white px-4 py-3 text-sm leading-6 text-gray-700 shadow-sm">
                      {question}
                    </div>
                  </div>
                </div>
              )}

              {/* Loading */}
              {isLoading && (
                <div className="flex justify-start">
                  <div>
                    <p className="mb-1 text-[11px] font-medium text-gray-400">
                      Smart Paw AI
                    </p>

                    <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-gray-200 bg-white px-4 py-3 shadow-sm">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-gray-400" />
                      <span className="h-2 w-2 animate-pulse rounded-full bg-gray-400 [animation-delay:150ms]" />
                      <span className="h-2 w-2 animate-pulse rounded-full bg-gray-400 [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Answer area */}
            {!isFinished && (
              <div className="border-t border-gray-100 bg-white p-4">
                {error && (
                  <div className="mb-3 rounded-xl border border-red-100 bg-red-50 p-3">
                    <p className="text-sm leading-5 text-red-600">{error}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <textarea
                    value={answer}
                    onChange={(event) => {
                      setAnswer(event.target.value);
                      setError("");
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();

                        if (!isLoading && answer.trim()) {
                          submitAnswer();
                        }
                      }
                    }}
                    disabled={isLoading || !question}
                    placeholder={
                      question
                        ? "Type your answer..."
                        : "Smart Paw AI is preparing your health check..."
                    }
                    rows={2}
                    className="min-w-0 flex-1 resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-50"
                  />

                  <button
                    type="button"
                    onClick={submitAnswer}
                    disabled={isLoading || !answer.trim() || !question}
                    aria-label="Send answer"
                    className="self-end rounded-2xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>

                <p className="mt-2 text-[11px] text-gray-400">
                  Press Enter to send • Shift + Enter for a new line
                </p>
              </div>
            )}

            {/* Final assessment */}
            {isFinished && assessment && (
              <div className="border-t border-gray-100 bg-white p-5">
                <div
                  className={`rounded-2xl border p-5 ${
                    urgent
                      ? "border-red-200 bg-red-50"
                      : "border-orange-100 bg-orange-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p
                      className={`text-xs font-semibold uppercase tracking-wider ${
                        urgent ? "text-red-600" : "text-orange-500"
                      }`}
                    >
                      AI Health Assessment
                    </p>

                    {urgent && (
                      <span className="rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-semibold text-red-600">
                        Attention Needed
                      </span>
                    )}
                  </div>

                  <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-700">
                    {assessment}
                  </p>

                  {nextSteps.length > 0 && (
                    <div className="mt-5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Recommended Next Steps
                      </p>

                      <ul className="mt-2 space-y-2">
                        {nextSteps.map((step, index) => (
                          <li
                            key={index}
                            className="flex gap-2 text-sm leading-6 text-gray-700"
                          >
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {urgent && (
                    <div className="mt-5 rounded-xl border border-red-200 bg-white p-3">
                      <p className="text-sm font-semibold text-red-600">
                        Contact a qualified veterinarian promptly if you are
                        concerned about your pet's condition.
                      </p>
                    </div>
                  )}

                  <p className="mt-5 border-t border-gray-200/70 pt-3 text-xs leading-5 text-gray-500">
                    This is informational guidance, not a medical diagnosis.
                    Consult a qualified veterinarian for professional advice.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={resetCheck}
                  className="mt-4 w-full rounded-2xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:border-orange-300 hover:text-orange-500"
                >
                  Start New Health Check
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default AIHealthCheck;