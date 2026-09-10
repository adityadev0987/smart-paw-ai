import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  HeartPulse,
  Loader2,
  PawPrint,
  RefreshCcw,
  Send,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { useAppContext } from "../hooks/useAppContext";

const API_BASE_URL = "http://localhost:5000";

export default function AIHealthCheck() {
  const { pets, currentPet } = useAppContext();

  const [selectedPetId, setSelectedPetId] = useState(
    currentPet?._id || currentPet?.id || "",
  );

  const [symptoms, setSymptoms] = useState("");
  const [conversation, setConversation] = useState([]);
  const [followUpQuestion, setFollowUpQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [assessment, setAssessment] = useState(null);

  const [loading, setLoading] = useState(false);
  const [answerLoading, setAnswerLoading] = useState(false);
  const [error, setError] = useState("");

  const chatRef = useRef(null);

  /* ----------------------------------------
     Sync selected pet with global current pet
  ---------------------------------------- */
  useEffect(() => {
    if (currentPet) {
      setSelectedPetId(
        currentPet._id || currentPet.id || "",
      );
    }
  }, [currentPet]);

  /* ----------------------------------------
     Prevent outer page scrolling only
     when health check workspace is active
  ---------------------------------------- */
  const hasStarted =
    loading ||
    conversation.length > 0 ||
    Boolean(assessment);

  useEffect(() => {
    if (hasStarted) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [hasStarted]);

  /* ----------------------------------------
     Auto scroll chat to latest message
  ---------------------------------------- */
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop =
        chatRef.current.scrollHeight;
    }
  }, [
    conversation,
    assessment,
    answerLoading,
  ]);

  /* ----------------------------------------
     Selected pet
  ---------------------------------------- */
  const selectedPet = useMemo(() => {
    return pets?.find(
      (pet) =>
        String(pet._id || pet.id) ===
        String(selectedPetId),
    );
  }, [pets, selectedPetId]);

  /* ----------------------------------------
     Helpers
  ---------------------------------------- */
  const getPetName = (pet) =>
    pet?.name || "Your Pet";

  const getPetMeta = (pet) => {
    if (!pet) return "Select a pet";

    const parts = [];

    if (pet.breed) {
      parts.push(pet.breed);
    }

    if (
      pet.age !== undefined &&
      pet.age !== null &&
      pet.age !== ""
    ) {
      parts.push(
        `${pet.age} ${
          Number(pet.age) === 1
            ? "year"
            : "years"
        }`,
      );
    }

    if (pet.gender) {
      parts.push(pet.gender);
    }

    return parts.join(" • ") || "Pet profile";
  };

  /* ----------------------------------------
     Reset / New Check
  ---------------------------------------- */
  const resetCheck = () => {
    setSymptoms("");
    setConversation([]);
    setFollowUpQuestion("");
    setAnswer("");
    setAssessment(null);
    setError("");
    setLoading(false);
    setAnswerLoading(false);
  };

  /* ----------------------------------------
     Initial AI Health Check
  ---------------------------------------- */
  const startHealthCheck = async (event) => {
    event?.preventDefault();

    if (!selectedPetId) {
      setError("Please select a pet first.");
      return;
    }

    if (!symptoms.trim()) {
      setError(
        "Please describe your pet's symptoms.",
      );
      return;
    }

    try {
      setLoading(true);
      setError("");
      setAssessment(null);
      setFollowUpQuestion("");
      setConversation([]);

      const token =
        localStorage.getItem("smartPawToken");

      const response = await fetch(
        `${API_BASE_URL}/api/ai/health-check`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
          body: JSON.stringify({
            petId: selectedPetId,
            symptoms: symptoms.trim(),
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to complete the AI health check.",
        );
      }

      const data = result.data || result;

      if (
        data.status === "FOLLOW_UP" &&
        data.question
      ) {
        setConversation([
          {
            role: "user",
            content: symptoms.trim(),
          },
          {
            role: "assistant",
            content: data.question,
          },
        ]);

        setFollowUpQuestion(data.question);
        setAssessment(null);
      } else if (data.status === "FINAL") {
        setFollowUpQuestion("");
        setAssessment(data);
      } else {
        setError(
          "The AI returned an unexpected response. Please try again.",
        );
      }
    } catch (err) {
      console.error(
        "Health check error:",
        err,
      );

      setError(
        err.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------------------
     Follow-up answer
  ---------------------------------------- */
  const submitFollowUpAnswer = async (
    event,
  ) => {
    event.preventDefault();

    if (
      !answer.trim() ||
      answerLoading
    ) {
      return;
    }

    const currentAnswer = answer.trim();

    const updatedConversation = [
      ...conversation,
      {
        role: "user",
        content: currentAnswer,
      },
    ];

    try {
      setAnswerLoading(true);
      setError("");

      setConversation(updatedConversation);
      setAnswer("");

      const token =
        localStorage.getItem("smartPawToken");

      const response = await fetch(
        `${API_BASE_URL}/api/ai/health-check`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
          body: JSON.stringify({
            petId: selectedPetId,
            symptoms: symptoms.trim(),
            conversation:
              updatedConversation,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to process your answer.",
        );
      }

      const data = result.data || result;

      if (
        data.status === "FOLLOW_UP" &&
        data.question
      ) {
        setConversation((previous) => [
          ...previous,
          {
            role: "assistant",
            content: data.question,
          },
        ]);

        setFollowUpQuestion(data.question);
        setAssessment(null);
      } else if (data.status === "FINAL") {
        setFollowUpQuestion("");
        setAssessment(data);
      } else {
        setError(
          "The AI returned an unexpected response. Please try again.",
        );
      }
    } catch (err) {
      console.error(
        "Follow-up health check error:",
        err,
      );

      setError(
        err.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setAnswerLoading(false);
    }
  };

  /* ----------------------------------------
     Assessment data
  ---------------------------------------- */
  const summary =
    assessment?.assessment || "";

  const nextSteps = Array.isArray(
    assessment?.nextSteps,
  )
    ? assessment.nextSteps
    : [];

  const urgent =
    assessment?.urgent === true;

  const severity = String(
    assessment?.severity ||
      (urgent ? "URGENT" : "ATTENTION"),
  ).toUpperCase();

  const severityConfig = {
    LOW: {
      label: "Low Concern",
      description:
        "The current information does not indicate an urgent concern.",
      wrapper:
        "border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10",
      iconWrapper:
        "bg-emerald-500 text-white",
      title:
        "text-emerald-800 dark:text-emerald-300",
      text:
        "text-emerald-700 dark:text-emerald-400",
      icon: CheckCircle2,
    },

    ATTENTION: {
      label: "Needs Attention",
      description:
        "The reported symptoms should be monitored and veterinary guidance may be appropriate.",
      wrapper:
        "border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10",
      iconWrapper:
        "bg-amber-500 text-white",
      title:
        "text-amber-800 dark:text-amber-300",
      text:
        "text-amber-700 dark:text-amber-400",
      icon: AlertTriangle,
    },

    URGENT: {
      label: "Urgent Veterinary Attention",
      description:
        "The assessment indicates that professional veterinary attention may be needed promptly.",
      wrapper:
        "border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/10",
      iconWrapper:
        "bg-red-500 text-white",
      title:
        "text-red-800 dark:text-red-300",
      text:
        "text-red-700 dark:text-red-400",
      icon: AlertTriangle,
    },
  };

  const currentSeverity =
    severityConfig[severity] ||
    severityConfig.ATTENTION;

  const SeverityIcon =
    currentSeverity.icon;

  return (
    <div className="relative h-[calc(100vh-80px)] w-full overflow-hidden bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#0b0f14] dark:text-slate-100">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-80 w-80 rounded-full bg-orange-500/10 blur-3xl" />

        <div className="absolute -right-40 top-48 h-96 w-96 rounded-full bg-orange-500/5 blur-3xl" />
      </div>

      <main className="relative mx-auto flex h-full w-full max-w-[1550px] flex-col overflow-hidden px-4 py-4 sm:px-6 lg:px-8">
        {/* ======================================
            FIXED AI HEALTH CHECK HEADER
        ====================================== */}
        <header className="shrink-0 pb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="mb-1 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500 text-white shadow-md shadow-orange-500/20">
                  <HeartPulse size={15} />
                </div>

                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-orange-500">
                  Smart Paw AI
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                AI Health Check
              </h1>

              <p className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
                Understand your pet's symptoms with AI-guided health information.
              </p>
            </div>

            {hasStarted && (
              <button
                type="button"
                onClick={resetCheck}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-orange-300 hover:text-orange-600 dark:border-slate-700 dark:bg-[#111820] dark:text-slate-200 dark:hover:border-orange-500/50 dark:hover:text-orange-400"
              >
                <RefreshCcw size={16} />

                <span className="hidden sm:inline">
                  New Check
                </span>
              </button>
            )}
          </div>
        </header>

        {/* ======================================
            INITIAL STATE
        ====================================== */}
        {!hasStarted && (
          <div className="min-h-0 flex-1 overflow-y-auto py-2">
            <div className="flex min-h-full items-center justify-center">
              <section className="w-full max-w-3xl">
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#111820] sm:p-7">
                  <div className="mb-6 flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400">
                      <Sparkles size={23} />
                    </div>

                    <div>
                      <h2 className="text-xl font-bold">
                        Start a health check
                      </h2>

                      <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        Select your pet and describe what you have noticed.
                      </p>
                    </div>
                  </div>

                  <HealthInputForm
                    selectedPetId={
                      selectedPetId
                    }
                    setSelectedPetId={
                      setSelectedPetId
                    }
                    pets={pets}
                    selectedPet={selectedPet}
                    getPetName={
                      getPetName
                    }
                    getPetMeta={
                      getPetMeta
                    }
                    symptoms={symptoms}
                    setSymptoms={
                      setSymptoms
                    }
                    error={error}
                    loading={loading}
                    onSubmit={
                      startHealthCheck
                    }
                  />

                  <Disclaimer />
                </div>
              </section>
            </div>
          </div>
        )}

        {/* ======================================
            ACTIVE FULL SCREEN WORKSPACE
        ====================================== */}
        {hasStarted && (
          <section className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-[35%_65%]">
            {/* ==================================
                LEFT — PET & SYMPTOMS
            ================================== */}
            <div className="flex min-h-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#111820]">
              {/* Left header */}
              <div className="flex shrink-0 items-center gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400">
                  <PawPrint size={18} />
                </div>

                <div>
                  <h2 className="text-sm font-bold">
                    Pet & Symptoms
                  </h2>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Health check details
                  </p>
                </div>
              </div>

              {/* Left content */}
              <div className="min-h-0 flex-1 overflow-hidden p-5">
                <div className="flex h-full min-h-0 flex-col">
                  {/* Selected pet */}
                  {selectedPet && (
                    <div className="mb-4 shrink-0 rounded-2xl border border-orange-200 bg-orange-50/60 p-3.5 dark:border-orange-500/15 dark:bg-orange-500/5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-orange-500 shadow-sm dark:bg-[#18212b]">
                          <PawPrint size={19} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-bold">
                            {getPetName(
                              selectedPet,
                            )}
                          </p>

                          <p className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-slate-400">
                            {getPetMeta(
                              selectedPet,
                            )}
                          </p>
                        </div>

                        <CheckCircle2
                          size={17}
                          className="ml-auto shrink-0 text-orange-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Pet selector */}
                  <div className="mb-4 shrink-0">
                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Pet
                    </label>

                    <div className="relative">
                      <select
                        value={
                          selectedPetId
                        }
                        onChange={(e) =>
                          setSelectedPetId(
                            e.target.value,
                          )
                        }
                        disabled={loading}
                        className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 disabled:opacity-60 dark:border-slate-700 dark:bg-[#18212b] dark:text-slate-100"
                      >
                        <option value="">
                          Choose a pet
                        </option>

                        {(pets || []).map(
                          (pet) => (
                            <option
                              key={
                                pet._id ||
                                pet.id
                              }
                              value={
                                pet._id ||
                                pet.id
                              }
                            >
                              {getPetName(
                                pet,
                              )}
                            </option>
                          ),
                        )}
                      </select>

                      <ChevronDown
                        size={16}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Symptoms */}
                  <div className="shrink-0">
                    <div className="mb-1.5 flex items-center justify-between">
                      <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Symptoms
                      </label>

                      <span className="text-[10px] text-slate-400">
                        {symptoms.length}/1000
                      </span>
                    </div>

                    <textarea
                      value={symptoms}
                      maxLength={1000}
                      onChange={(e) =>
                        setSymptoms(
                          e.target.value,
                        )
                      }
                      disabled={loading}
                      placeholder="Describe what you have noticed..."
                      className="h-[150px] w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 disabled:opacity-60 dark:border-slate-700 dark:bg-[#18212b] dark:text-slate-100 dark:placeholder:text-slate-500"
                    />

                    <p className="mt-1.5 text-[10px] leading-4 text-slate-400 dark:text-slate-500">
                      Include when it started, severity, eating/drinking changes,
                      behaviour changes, or anything unusual.
                    </p>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="mt-3 shrink-0 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                      <AlertTriangle
                        size={15}
                        className="mt-0.5 shrink-0"
                      />

                      <span>{error}</span>
                    </div>
                  )}

                  {/* Spacer */}
                  <div className="min-h-0 flex-1" />

                  {/* Action */}
                  <div className="shrink-0 pt-3">
                    <button
                      type="button"
                      onClick={
                        startHealthCheck
                      }
                      disabled={loading}
                      className="group flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <Loader2
                            size={17}
                            className="animate-spin"
                          />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles size={17} />
                          Analyze Symptoms
                          <ArrowRight
                            size={16}
                            className="transition-transform group-hover:translate-x-0.5"
                          />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ==================================
                RIGHT — AI CHAT
            ================================== */}
            <div className="flex min-h-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#111820]">
              {/* AI Header */}
              <div className="flex shrink-0 items-center gap-3 border-b border-slate-200 bg-gradient-to-r from-orange-50 to-white px-5 py-4 dark:border-slate-800 dark:from-orange-500/10 dark:to-[#111820]">
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white shadow-md shadow-orange-500/20">
                  <Bot size={21} />

                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-[#111820]" />
                </div>

                <div className="min-w-0">
                  <h2 className="text-sm font-bold">
                    Smart Paw AI
                  </h2>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {loading
                      ? "Analyzing symptoms..."
                      : assessment
                        ? "Assessment completed"
                        : "AI health conversation"}
                  </p>
                </div>

                <div className="ml-auto hidden items-center gap-2 rounded-full border border-orange-200 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-orange-600 sm:flex dark:border-orange-500/20 dark:bg-[#18212b] dark:text-orange-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  AI Assistant
                </div>
              </div>

              {/* ==================================
                  AI LOADING
              ================================== */}
              {loading && (
                <div className="flex min-h-0 flex-1 items-center justify-center p-8">
                  <div className="max-w-sm text-center">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400">
                      <Loader2
                        size={30}
                        className="animate-spin"
                      />
                    </div>

                    <h3 className="font-bold">
                      Reviewing{" "}
                      {getPetName(
                        selectedPet,
                      )}
                      's symptoms
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      Smart Paw AI is analyzing the pet profile and reported
                      symptoms.
                    </p>
                  </div>
                </div>
              )}

              {/* ==================================
                  CHAT MODE
              ================================== */}
              {!loading &&
                conversation.length > 0 &&
                !assessment && (
                  <div className="flex min-h-0 flex-1 flex-col">
                    {/* ONLY THIS AREA SCROLLS */}
                    <div
                      ref={chatRef}
                      className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6"
                    >
                      {conversation.map(
                        (message, index) => {
                          const isUser =
                            message.role ===
                            "user";

                          return (
                            <div
                              key={`${message.role}-${index}`}
                              className={`flex gap-3 ${
                                isUser
                                  ? "justify-end"
                                  : "justify-start"
                              }`}
                            >
                              {!isUser && (
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white">
                                  <Bot size={16} />
                                </div>
                              )}

                              <div
                                className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                                  isUser
                                    ? "rounded-br-md bg-orange-500 text-white"
                                    : "rounded-bl-md border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-[#18212b] dark:text-slate-200"
                                }`}
                              >
                                {
                                  message.content
                                }
                              </div>

                              {isUser && (
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                  <User size={16} />
                                </div>
                              )}
                            </div>
                          );
                        },
                      )}

                      {/* AI typing */}
                      {answerLoading && (
                        <div className="flex gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white">
                            <Bot size={16} />
                          </div>

                          <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-[#18212b]">
                            <div className="flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-500 [animation-delay:-0.3s]" />

                              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-500 [animation-delay:-0.15s]" />

                              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-500" />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Error inside chat */}
                      {error && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-500/10">
                          <div className="flex gap-3">
                            <AlertTriangle
                              size={18}
                              className="mt-0.5 shrink-0 text-red-500"
                            />

                            <div>
                              <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                                Unable to continue
                              </p>

                              <p className="mt-1 text-xs leading-5 text-red-600 dark:text-red-400">
                                {error}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ==================================
                        FIXED CHAT COMPOSER
                    ================================== */}
                    {followUpQuestion && (
                      <form
                        onSubmit={
                          submitFollowUpAnswer
                        }
                        className="shrink-0 border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#111820]"
                      >
                        <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 transition focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-500/10 dark:border-slate-700 dark:bg-[#18212b]">
                          <textarea
                            value={answer}
                            onChange={(e) =>
                              setAnswer(
                                e.target.value,
                              )
                            }
                            rows={2}
                            placeholder="Type your answer..."
                            disabled={
                              answerLoading
                            }
                            className="min-h-[48px] flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-6 outline-none placeholder:text-slate-400 disabled:opacity-60 dark:placeholder:text-slate-500"
                          />

                          <button
                            type="submit"
                            disabled={
                              answerLoading ||
                              !answer.trim()
                            }
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Send answer"
                          >
                            {answerLoading ? (
                              <Loader2
                                size={18}
                                className="animate-spin"
                              />
                            ) : (
                              <Send size={18} />
                            )}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

              {/* ==================================
                  FINAL ASSESSMENT
              ================================== */}
              {!loading && assessment && (
                <div
                  ref={chatRef}
                  className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6"
                >
                  {/* Severity */}
                  <div
                    className={`mb-5 flex items-center gap-3 rounded-2xl border p-4 ${currentSeverity.wrapper}`}
                  >
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${currentSeverity.iconWrapper}`}
                    >
                      <SeverityIcon size={21} />
                    </div>

                    <div className="min-w-0">
                      <p
                        className={`font-bold ${currentSeverity.title}`}
                      >
                        {currentSeverity.label}
                      </p>

                      <p
                        className={`mt-1 text-xs leading-5 ${currentSeverity.text}`}
                      >
                        {
                          currentSeverity.description
                        }
                      </p>
                    </div>
                  </div>

                  {/* Assessment */}
                  <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-[#18212b]">
                    <div className="mb-3 flex items-center gap-2">
                      <ClipboardList
                        size={18}
                        className="text-orange-500"
                      />

                      <h3 className="font-bold">
                        AI Assessment
                      </h3>
                    </div>

                    <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                      {summary ||
                        "No assessment details were returned."}
                    </p>
                  </div>

                  {/* Next steps */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-[#111820]">
                    <div className="mb-4 flex items-center gap-2">
                      <ArrowRight
                        size={18}
                        className="text-orange-500"
                      />

                      <h3 className="font-bold">
                        Recommended Next Steps
                      </h3>
                    </div>

                    {nextSteps.length > 0 ? (
                      <div className="space-y-3">
                        {nextSteps.map(
                          (step, index) => (
                            <div
                              key={`${step}-${index}`}
                              className="flex gap-3 rounded-xl bg-slate-50 p-3.5 dark:bg-[#18212b]"
                            >
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                                {index + 1}
                              </span>

                              <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                                {step}
                              </p>
                            </div>
                          ),
                        )}
                      </div>
                    ) : (
                      <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                        Continue monitoring your pet and seek veterinary
                        guidance if symptoms persist or worsen.
                      </p>
                    )}
                  </div>

                  {/* Disclaimer */}
                  <div className="mt-5 flex gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-500/20 dark:bg-orange-500/5">
                    <ShieldCheck
                      size={18}
                      className="mt-0.5 shrink-0 text-orange-500"
                    />

                    <p className="text-xs leading-5 text-slate-600 dark:text-slate-400">
                      This AI assessment is for informational purposes only
                      and should not be treated as a veterinary diagnosis.
                      Consult a qualified veterinarian for diagnosis,
                      treatment, or urgent concerns.
                    </p>
                  </div>
                </div>
              )}

              {/* ==================================
                  ERROR / EMPTY AI PANEL
              ================================== */}
              {!loading &&
                error &&
                conversation.length === 0 &&
                !assessment && (
                  <div className="flex min-h-0 flex-1 items-center justify-center p-8">
                    <div className="max-w-sm text-center">
                      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400">
                        <AlertTriangle size={26} />
                      </div>

                      <h3 className="font-bold">
                        Health check could not be completed
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {error}
                      </p>
                    </div>
                  </div>
                )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

/* ==========================================
   INITIAL HEALTH INPUT FORM
========================================== */

function HealthInputForm({
  selectedPetId,
  setSelectedPetId,
  pets,
  selectedPet,
  getPetName,
  getPetMeta,
  symptoms,
  setSymptoms,
  error,
  loading,
  onSubmit,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5"
    >
      {/* Pet */}
      <div>
        <label className="mb-2 block text-sm font-semibold">
          Select Pet
        </label>

        <div className="relative">
          <PawPrint
            size={17}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-orange-500"
          />

          <select
            value={selectedPetId}
            onChange={(e) =>
              setSelectedPetId(
                e.target.value,
              )
            }
            disabled={loading}
            className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-11 text-sm font-medium outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 disabled:opacity-60 dark:border-slate-700 dark:bg-[#18212b] dark:text-slate-100"
          >
            <option value="">
              Choose a pet
            </option>

            {(pets || []).map((pet) => (
              <option
                key={
                  pet._id || pet.id
                }
                value={
                  pet._id || pet.id
                }
              >
                {getPetName(pet)}
              </option>
            ))}
          </select>

          <ChevronDown
            size={17}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>
      </div>

      {/* Pet preview */}
      {selectedPet && (
        <div className="rounded-2xl border border-orange-200 bg-orange-50/70 p-4 dark:border-orange-500/15 dark:bg-orange-500/5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-orange-500 shadow-sm dark:bg-[#18212b]">
              <PawPrint size={21} />
            </div>

            <div className="min-w-0">
              <p className="font-bold">
                {getPetName(
                  selectedPet,
                )}
              </p>

              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {getPetMeta(
                  selectedPet,
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Symptoms */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-semibold">
            What is happening?
          </label>

          <span className="text-xs text-slate-400">
            {symptoms.length}/1000
          </span>
        </div>

        <textarea
          value={symptoms}
          maxLength={1000}
          onChange={(e) =>
            setSymptoms(
              e.target.value,
            )
          }
          disabled={loading}
          placeholder="Example: My cat has been vomiting twice since this morning..."
          rows={6}
          className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 disabled:opacity-60 dark:border-slate-700 dark:bg-[#18212b] dark:text-slate-100 dark:placeholder:text-slate-500"
        />

        <p className="mt-2 text-xs leading-5 text-slate-400 dark:text-slate-500">
          Include when it started, severity, eating/drinking changes,
          behaviour changes, or anything unusual.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          <AlertTriangle
            size={16}
            className="mt-0.5 shrink-0"
          />

          <span>{error}</span>
        </div>
      )}

      {/* Start */}
      <button
        type="submit"
        disabled={loading}
        className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2
              size={18}
              className="animate-spin"
            />
            Analyzing...
          </>
        ) : (
          <>
            <Sparkles size={18} />
            Start AI Health Check
            <ArrowRight
              size={17}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </>
        )}
      </button>
    </form>
  );
}

/* ==========================================
   DISCLAIMER
========================================== */

function Disclaimer() {
  return (
    <div className="mt-5 flex gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-700 dark:bg-[#18212b]">
      <ShieldCheck
        size={17}
        className="mt-0.5 shrink-0 text-orange-500"
      />

      <p className="text-[11px] leading-5 text-slate-500 dark:text-slate-400">
        AI health guidance is informational and does not replace
        professional veterinary diagnosis or treatment.
      </p>
    </div>
  );
}