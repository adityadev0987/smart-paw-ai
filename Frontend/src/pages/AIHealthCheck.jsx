import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
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
  const [answer, setAnswer] = useState("");
  const [assessment, setAssessment] = useState(null);

  const [loading, setLoading] = useState(false);
  const [answerLoading, setAnswerLoading] = useState(false);
  const [error, setError] = useState("");

  const chatRef = useRef(null);
  const composerRef = useRef(null);

  /* ==========================================
     PET SYNC
  ========================================== */

  useEffect(() => {
    if (currentPet) {
      setSelectedPetId(
        currentPet._id || currentPet.id || "",
      );
    }
  }, [currentPet]);

  /* ==========================================
     WORKSPACE STATE
  ========================================== */

  const hasStarted =
    loading ||
    conversation.length > 0 ||
    Boolean(assessment);

  /* ==========================================
     PREVENT OUTER PAGE SCROLL
  ========================================== */

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

  /* ==========================================
     AUTO SCROLL
  ========================================== */

  useEffect(() => {
    if (chatRef.current) {
      requestAnimationFrame(() => {
        chatRef.current.scrollTop =
          chatRef.current.scrollHeight;
      });
    }
  }, [
    conversation,
    assessment,
    answerLoading,
  ]);

  /* ==========================================
     SELECTED PET
  ========================================== */

  const selectedPet = useMemo(() => {
    return pets?.find(
      (pet) =>
        String(pet._id || pet.id) ===
        String(selectedPetId),
    );
  }, [pets, selectedPetId]);

  /* ==========================================
     HELPERS
  ========================================== */

  const getPetName = (pet) =>
    pet?.name || "Your Pet";

  const getPetMeta = (pet) => {
    if (!pet) return "Select a pet";

    const parts = [];

    if (pet.species) {
      parts.push(pet.species);
    }

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

    return (
      parts.join(" • ") ||
      "Pet profile"
    );
  };

  /* ==========================================
     SAVE FINAL RESULT
  ========================================== */

  const saveLatestHealthCheck = (data) => {
    if (!data || data.status !== "FINAL") {
      return;
    }

    const healthCheckData = {
      ...data,
      petId: selectedPetId,
      petName: getPetName(selectedPet),
      symptoms: symptoms.trim(),
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(
      "smartPawLatestHealthCheck",
      JSON.stringify(healthCheckData),
    );

    window.dispatchEvent(
      new CustomEvent(
        "smartPawHealthCheckUpdated",
        {
          detail: healthCheckData,
        },
      ),
    );
  };

  /* ==========================================
     NEW CHECKUP
  ========================================== */

  const resetCheck = () => {
    setSymptoms("");
    setConversation([]);
    setAnswer("");
    setAssessment(null);
    setError("");
    setLoading(false);
    setAnswerLoading(false);

    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  };

  /* ==========================================
     NEW QUERY
     Keeps SAME conversation/session
  ========================================== */

  const handleNewQuery = () => {
    setAnswer("");
    setError("");

    requestAnimationFrame(() => {
      composerRef.current?.focus();
    });
  };

  /* ==========================================
     INITIAL HEALTH CHECK
  ========================================== */

  const startHealthCheck = async (event) => {
    event?.preventDefault();

    if (hasStarted) {
      return;
    }

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
      setConversation([]);
      setAnswer("");

      const token =
        localStorage.getItem(
          "smartPawToken",
        );

      const response = await fetch(
        `${API_BASE_URL}/api/ai/health-check`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",

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

      const data =
        result.data || result;

      /* FOLLOW UP */

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

        setAssessment(null);
      }

      /* FINAL */

      else if (
        data.status === "FINAL"
      ) {
        setConversation([
          {
            role: "user",
            content: symptoms.trim(),
          },
        ]);

        setAssessment(data);

        saveLatestHealthCheck(data);
      }

      else {
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

  /* ==========================================
     CONTINUE SAME CHAT
  ========================================== */

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

    const currentAnswer =
      answer.trim();

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

      setConversation(
        updatedConversation,
      );

      setAnswer("");

      const token =
        localStorage.getItem(
          "smartPawToken",
        );

      const response = await fetch(
        `${API_BASE_URL}/api/ai/health-check`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",

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

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to process your message.",
        );
      }

      const data =
        result.data || result;

      /* FOLLOW UP */

      if (
        data.status === "FOLLOW_UP" &&
        data.question
      ) {
        setConversation(
          (previous) => [
            ...previous,
            {
              role: "assistant",
              content: data.question,
            },
          ],
        );

        setAssessment(null);
      }

      /* FINAL */

      else if (
        data.status === "FINAL"
      ) {
        setAssessment(data);

        saveLatestHealthCheck(data);
      }

      else {
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

  /* ==========================================
     ASSESSMENT
  ========================================== */

  const summary =
    assessment?.assessment || "";

  const nextSteps =
    Array.isArray(
      assessment?.nextSteps,
    )
      ? assessment.nextSteps
      : [];

  const urgent =
    assessment?.urgent === true;

  const severity = String(
    assessment?.severity ||
      (urgent
        ? "URGENT"
        : "ATTENTION"),
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

    GREEN: {
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

    YELLOW: {
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

    RED: {
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

  /* ==========================================
     RENDER
  ========================================== */

  return (
    <div className="relative h-[calc(100vh-80px)] w-full overflow-hidden bg-slate-50 text-slate-900 dark:bg-[#0b0f14] dark:text-slate-100">
      {/* Background */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-80 w-80 rounded-full bg-orange-500/10 blur-3xl" />

        <div className="absolute -right-40 top-48 h-96 w-96 rounded-full bg-orange-500/5 blur-3xl" />
      </div>

      <main className="relative mx-auto flex h-full w-full max-w-[1550px] flex-col overflow-hidden px-3 py-3 sm:px-5 lg:px-7">
        <section className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden lg:grid-cols-[300px_minmax(0,1fr)]">
            {/* ==================================
                LEFT SIDEBAR
            ================================== */}

            <aside className="flex min-h-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#111820]">
              {/* Sidebar Header */}

              <div className="flex shrink-0 items-center gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400">
                  <PawPrint size={18} />
                </div>

                <div>
                  <h2 className="text-sm font-bold">
                    Health Check AI
                  </h2>

                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Pet information
                  </p>
                </div>
              </div>

              {/* Sidebar Content */}

              <div className="min-h-0 flex-1 overflow-y-auto p-4">
                {selectedPet && (
                  <div className="mb-4 rounded-2xl border border-orange-200 bg-orange-50/60 p-3 dark:border-orange-500/15 dark:bg-orange-500/5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-orange-500 shadow-sm dark:bg-[#18212b]">
                        <PawPrint size={18} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-bold">
                          {getPetName(
                            selectedPet,
                          )}
                        </p>

                        <p className="mt-0.5 truncate text-[10px] text-slate-500 dark:text-slate-400">
                          {getPetMeta(
                            selectedPet,
                          )}
                        </p>
                      </div>

                      <CheckCircle2
                        size={16}
                        className="ml-auto shrink-0 text-orange-500"
                      />
                    </div>
                  </div>
                )}

                {/* Pet */}

                <div className="mb-4">
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
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
                      disabled={hasStarted || loading}
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium outline-none disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:bg-[#18212b] dark:text-slate-100"
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
                      size={15}
                      className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  </div>
                </div>

                {/* Symptoms */}

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Original Symptoms
                    </label>

                    <span className="text-[9px] text-slate-400">
                      {symptoms.length}/1000
                    </span>
                  </div>

                  <textarea
                    value={symptoms}
                    maxLength={1000}
                    onChange={(event) => setSymptoms(event.target.value)}
                    disabled={hasStarted || loading}
                    placeholder="Describe what you have noticed..."
                    className="h-32 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-xs leading-5 text-slate-600 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:opacity-80 dark:border-slate-700 dark:bg-[#18212b] dark:text-slate-300 dark:placeholder:text-slate-500"
                  />

                  {!hasStarted && (
                    <p className="mt-2 text-[10px] leading-4 text-slate-400 dark:text-slate-500">
                      Include when it started, severity, eating/drinking changes, or anything unusual.
                    </p>
                  )}
                </div>

                {/* Current assessment status */}

                {assessment && (
                  <div
                    className={`mt-4 rounded-2xl border p-3 ${currentSeverity.wrapper}`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${currentSeverity.iconWrapper}`}
                      >
                        <SeverityIcon
                          size={16}
                        />
                      </div>

                      <div>
                        <p
                          className={`text-xs font-bold ${currentSeverity.title}`}
                        >
                          {currentSeverity.label}
                        </p>

                        <p
                          className={`mt-0.5 text-[9px] leading-4 ${currentSeverity.text}`}
                        >
                          Assessment complete
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar Actions */}

              <div className="shrink-0 space-y-2 border-t border-slate-200 p-4 dark:border-slate-800">
                {!hasStarted ? (
                  <button
                    type="button"
                    onClick={startHealthCheck}
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Sparkles size={15} />
                    Analyze
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleNewQuery}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:border-orange-400 hover:text-orange-500 dark:border-slate-700 dark:bg-[#18212b] dark:text-slate-200 dark:hover:border-orange-500 dark:hover:text-orange-400"
                    >
                      <Send size={15} />
                      New Query
                    </button>

                    <button
                      type="button"
                      onClick={resetCheck}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600"
                    >
                      <RefreshCcw size={15} />
                      New Checkup
                    </button>
                  </>
                )}
              </div>
            </aside>

            {/* ==================================
                RIGHT CHAT
            ================================== */}

            <section className="flex min-h-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#111820]">
              {/* Chat Header */}

              <div className="flex shrink-0 items-center gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800 sm:px-5">
                <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white shadow-md shadow-orange-500/20">
                  <Bot size={19} />

                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 dark:border-[#111820]" />
                </div>

                <div className="min-w-0">
                  <h2 className="text-sm font-bold">
                    Smart Paw AI
                  </h2>

                  <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                    {loading
                      ? "Analyzing..."
                      : assessment
                        ? "Assessment completed • You can continue chatting"
                        : "AI health conversation"}
                  </p>
                </div>
              </div>

              {/* ==================================
                  LOADING
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
                      Smart Paw AI is analyzing the reported symptoms.
                    </p>
                  </div>
                </div>
              )}

              {/* ==================================
                  CHAT + ASSESSMENT
              ================================== */}

              {!loading && (
                <div className="flex min-h-0 flex-1 flex-col">
                  {/* Messages */}

                  <div
                    ref={chatRef}
                    className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-7"
                  >
                    <div className="mx-auto w-full max-w-3xl space-y-5">
                      {/* Empty conversation fallback */}

                      {conversation.length ===
                        0 &&
                        !assessment && (
                          <div className="flex min-h-[320px] items-center justify-center text-center">
                            <div>
                              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400">
                                <Sparkles
                                  size={25}
                                />
                              </div>

                              <h3 className="text-lg font-bold">
                                How can I help?
                              </h3>

                              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Ask Smart Paw AI about your pet's health.
                              </p>
                            </div>
                          </div>
                        )}

                      {/* Conversation */}

                      {conversation.map(
                        (
                          message,
                          index,
                        ) => {
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
                                  <Bot
                                    size={16}
                                  />
                                </div>
                              )}

                              <div
                                className={`max-w-[85%] text-sm leading-6 sm:max-w-[75%] ${
                                  isUser
                                    ? "rounded-2xl rounded-br-md bg-orange-500 px-4 py-3 text-white"
                                    : "rounded-2xl rounded-bl-md bg-slate-50 px-4 py-3 text-slate-700 dark:bg-[#18212b] dark:text-slate-200"
                                }`}
                              >
                                {message.content}
                              </div>

                              {isUser && (
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                  <User
                                    size={16}
                                  />
                                </div>
                              )}
                            </div>
                          );
                        },
                      )}

                      {/* Typing */}

                      {answerLoading && (
                        <div className="flex gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white">
                            <Bot size={16} />
                          </div>

                          <div className="rounded-2xl rounded-bl-md bg-slate-50 px-4 py-3 dark:bg-[#18212b]">
                            <div className="flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-500 [animation-delay:-0.3s]" />
                              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-500 [animation-delay:-0.15s]" />
                              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-500" />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ==================================
                          FINAL ASSESSMENT
                      ================================== */}

                      {assessment && (
                        <div className="pt-2">
                          <div
                            className={`rounded-2xl border p-4 ${currentSeverity.wrapper}`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${currentSeverity.iconWrapper}`}
                              >
                                <SeverityIcon
                                  size={19}
                                />
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
                          </div>

                          <div className="mt-4 rounded-2xl bg-slate-50 p-5 dark:bg-[#18212b]">
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

                          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-[#111820]">
                            <div className="mb-4 flex items-center gap-2">
                              <ArrowRight
                                size={18}
                                className="text-orange-500"
                              />

                              <h3 className="font-bold">
                                Recommended Next Steps
                              </h3>
                            </div>

                            {nextSteps.length >
                            0 ? (
                              <div className="space-y-3">
                                {nextSteps.map(
                                  (
                                    step,
                                    index,
                                  ) => (
                                    <div
                                      key={`${step}-${index}`}
                                      className="flex gap-3 rounded-xl bg-slate-50 p-3.5 dark:bg-[#18212b]"
                                    >
                                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                                        {index +
                                          1}
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
                                Continue monitoring your pet and seek veterinary guidance if symptoms persist or worsen.
                              </p>
                            )}
                          </div>

                          <div className="mt-4 flex gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-500/20 dark:bg-orange-500/5">
                            <ShieldCheck
                              size={18}
                              className="mt-0.5 shrink-0 text-orange-500"
                            />

                            <p className="text-xs leading-5 text-slate-600 dark:text-slate-400">
                              This AI assessment is for informational purposes only and should not be treated as a veterinary diagnosis. Consult a qualified veterinarian for diagnosis, treatment, or urgent concerns.
                            </p>
                          </div>

                          <div className="mt-5 flex items-center justify-center">
                            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-semibold text-slate-500 dark:bg-[#18212b] dark:text-slate-400">
                              You can continue asking questions about this assessment
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Error */}

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
                  </div>

                  {/* ==================================
                      COMPOSER
                  ================================== */}

                  <form
                    onSubmit={
                      submitFollowUpAnswer
                    }
                    className="shrink-0 border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-[#111820] sm:p-4"
                  >
                    <div className="mx-auto flex w-full max-w-3xl items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 transition focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-500/10 dark:border-slate-700 dark:bg-[#18212b]">
                      <textarea
                        ref={
                          composerRef
                        }
                        value={answer}
                        onChange={(e) =>
                          setAnswer(
                            e.target
                              .value,
                          )
                        }
                        onKeyDown={(
                          e,
                        ) => {
                          if (
                            e.key ===
                              "Enter" &&
                            !e.shiftKey
                          ) {
                            e.preventDefault();

                            if (
                              answer.trim() &&
                              !answerLoading
                            ) {
                              e.currentTarget.form?.requestSubmit();
                            }
                          }
                        }}
                        rows={1}
                        placeholder={
                          assessment
                            ? "Ask anything about this assessment..."
                            : "Answer the AI's question..."
                        }
                        disabled={
                          !hasStarted || answerLoading
                        }
                        className="max-h-32 min-h-[44px] flex-1 resize-none bg-transparent px-2.5 py-2.5 text-sm leading-6 outline-none placeholder:text-slate-400 disabled:opacity-60 dark:placeholder:text-slate-500"
                      />

                      <button
                        type="submit"
                        disabled={
                          !hasStarted ||
                          answerLoading ||
                          !answer.trim()
                        }
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Send message"
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

                    <p className="mx-auto mt-2 max-w-3xl text-center text-[9px] text-slate-400">
                      Enter to send • Shift + Enter for a new line
                    </p>
                  </form>
                </div>
              )}
            </section>
          </section>
      </main>
    </div>
  );
}

