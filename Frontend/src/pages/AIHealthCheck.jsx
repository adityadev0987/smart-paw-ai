import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  History,
  Loader2,
  PawPrint,
  RefreshCcw,
  Send,
  ShieldCheck,
  Sparkles,
  User,
  Trash2,
} from "lucide-react";
import { useAppContext } from "../hooks/useAppContext";

const API_BASE_URL = "http://localhost:5000";
const HEALTH_CHECK_HISTORY_KEY = "smartPawHealthCheckHistory";
const LATEST_HEALTH_CHECK_KEY = "smartPawLatestHealthCheck";

function getUserStorageKey(baseKey, userId) {
  return userId ? `${baseKey}:${userId}` : null;
}

function loadHealthCheckHistory(userId) {
  const storageKey = getUserStorageKey(
    HEALTH_CHECK_HISTORY_KEY,
    userId,
  );

  if (!storageKey) return [];

  try {
    const stored = JSON.parse(
      localStorage.getItem(storageKey) || "[]",
    );

    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function getInitialHealthSession(userId) {
  const history = loadHealthCheckHistory(userId);

  return history[0] || null;
}

export default function AIHealthCheck() {
  const { pets, currentPet, currentUser } = useAppContext();
  const currentUserId = currentUser?._id || currentUser?.id || "";
  const initialSession = useMemo(
    () => getInitialHealthSession(currentUserId),
    [currentUserId],
  );

  const [selectedPetId, setSelectedPetId] = useState(
    initialSession?.petId || currentPet?._id || currentPet?.id || "",
  );

  const [symptoms, setSymptoms] = useState(
    initialSession?.symptoms || "",
  );
  const [conversation, setConversation] = useState(
    initialSession?.conversation || [],
  );
  const [answer, setAnswer] = useState("");
  const [assessment, setAssessment] = useState(
    initialSession?.assessment || null,
  );
  const [healthHistory, setHealthHistory] = useState(
    () => loadHealthCheckHistory(currentUserId),
  );
  const [activeSessionId, setActiveSessionId] = useState(
    initialSession?.id || null,
  );

  const [loading, setLoading] = useState(false);
  const [answerLoading, setAnswerLoading] = useState(false);
  const [error, setError] = useState("");
  const [processingStep, setProcessingStep] = useState(0);

  const chatRef = useRef(null);
  const composerRef = useRef(null);

  /* ==========================================
     PET SYNC
  ========================================== */

  useEffect(() => {
    if (currentPet && !initialSession) {
      setSelectedPetId(
        currentPet._id || currentPet.id || "",
      );
    }
  }, [currentPet, initialSession]);

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
     PROCESSING STEPS
  ========================================== */

  const processingSteps = [
    {
      id: "pet_profile",
      label: "Checking pet profile",
      description:
        "Reviewing your pet's basic information",
      icon: PawPrint,
    },
    {
      id: "medical_records",
      label: "Reviewing medical records",
      description:
        "Checking previous treatments, medicines and records",
      icon: ClipboardList,
    },
    {
      id: "health_history",
      label: "Reviewing health history",
      description:
        "Looking at previous illnesses and known conditions",
      icon: ShieldCheck,
    },
    {
      id: "safety_check",
      label: "Checking health safety signals",
      description:
        "Checking for symptoms that may need urgent attention",
      icon: ShieldCheck,
    },
    {
      id: "veterinary_knowledge",
      label: "Reviewing pet health information",
      description:
        "Comparing the concern with relevant health information",
      icon: Sparkles,
    },
    {
      id: "analysis",
      label: "Analyzing the current concern",
      description:
        "Putting everything together for your pet",
      icon: Bot,
    },
  ];

  /* ==========================================
     PROCESSING ANIMATION
  ========================================== */

  useEffect(() => {
    if (!loading) {
      setProcessingStep(0);
      return;
    }

    setProcessingStep(0);

    const timers =
      processingSteps
        .slice(1)
        .map((_, index) =>
          setTimeout(
            () => {
              setProcessingStep(
                index + 1,
              );
            },
            (index + 1) * 850,
          ),
        );

    return () =>
      timers.forEach(
        clearTimeout,
      );
  }, [loading]);

  /* ==========================================
     SAVE FINAL RESULT
  ========================================== */

  const saveLatestHealthCheck = (
    data,
  ) => {
    if (
      !data ||
      data.status !== "FINAL"
    ) {
      return;
    }

    const healthCheckData = {
      ...data,
      petId: selectedPetId,
      petName: getPetName(
        selectedPet,
      ),
      symptoms: symptoms.trim(),
      createdAt:
        new Date().toISOString(),
    };

    localStorage.setItem(
      getUserStorageKey(LATEST_HEALTH_CHECK_KEY, currentUserId),
      JSON.stringify(
        healthCheckData,
      ),
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

  const persistHealthSession = ({
    id,
    petId,
    petName,
    sessionSymptoms,
    sessionConversation,
    sessionAssessment,
    notify = false,
  }) => {
    if (!id || !petId || !sessionSymptoms?.trim()) {
      return;
    }

    const session = {
      id,
      petId,
      petName: petName || "Your Pet",
      symptoms: sessionSymptoms.trim(),
      conversation: sessionConversation || [],
      assessment: sessionAssessment || null,
      updatedAt: new Date().toISOString(),
    };

    const nextHistory = [
      session,
      ...loadHealthCheckHistory(currentUserId).filter(
        (item) => item.id !== id,
      ),
    ].slice(0, 20);

    localStorage.setItem(
      getUserStorageKey(HEALTH_CHECK_HISTORY_KEY, currentUserId),
      JSON.stringify(nextHistory),
    );
    setHealthHistory(nextHistory);

    if (notify) {
      window.dispatchEvent(
        new CustomEvent("smartPawHealthCheckReady", {
          detail: {
            sessionId: id,
            petName: session.petName,
            status: sessionAssessment ? "FINAL" : "FOLLOW_UP",
          },
        }),
      );
    }
  };

  const createHealthSessionId = () =>
    `health-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const restoreHealthSession = (session) => {
    setActiveSessionId(session.id);
    setSelectedPetId(session.petId || "");
    setSymptoms(session.symptoms || "");
    setConversation(session.conversation || []);
    setAssessment(session.assessment || null);
    setAnswer("");
    setError("");
  };

  useEffect(() => {
    const handleHealthCheckReady = (event) => {
      const sessionId = event.detail?.sessionId;

      if (!sessionId || (activeSessionId && activeSessionId !== sessionId)) {
        return;
      }

      const session = loadHealthCheckHistory(currentUserId).find(
        (item) => item.id === sessionId,
      );

      if (session) {
        restoreHealthSession(session);
        setLoading(false);
        setAnswerLoading(false);
      }
    };

    window.addEventListener(
      "smartPawHealthCheckReady",
      handleHealthCheckReady,
    );

    return () => {
      window.removeEventListener(
        "smartPawHealthCheckReady",
        handleHealthCheckReady,
      );
    };
  }, [activeSessionId, currentUserId]);

  const deleteHealthSession = (sessionId) => {
    const nextHistory = loadHealthCheckHistory(currentUserId).filter(
      (session) => session.id !== sessionId,
    );

    localStorage.setItem(
      getUserStorageKey(HEALTH_CHECK_HISTORY_KEY, currentUserId),
      JSON.stringify(nextHistory),
    );
    setHealthHistory(nextHistory);

    if (activeSessionId === sessionId) {
      resetCheck();
    }
  };

  /* ==========================================
     NEW CHECKUP
  ========================================== */

  const resetCheck = () => {
    setActiveSessionId(null);
    setSymptoms("");
    setConversation([]);
    setAnswer("");
    setAssessment(null);
    setError("");
    setLoading(false);
    setAnswerLoading(false);
    setProcessingStep(0);

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

  const startHealthCheck = async (
    event,
  ) => {
    event?.preventDefault();

    if (hasStarted) {
      return;
    }

    if (!selectedPetId) {
      setError(
        "Please select a pet first.",
      );
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
      setProcessingStep(0);

      const sessionId = createHealthSessionId();
      const initialConversation = [
        {
          role: "user",
          content: symptoms.trim(),
        },
      ];

      setActiveSessionId(sessionId);
      setConversation(initialConversation);
      persistHealthSession({
        id: sessionId,
        petId: selectedPetId,
        petName: getPetName(selectedPet),
        sessionSymptoms: symptoms,
        sessionConversation: initialConversation,
        sessionAssessment: null,
      });

      const token =
        localStorage.getItem(
          "smartPawToken",
        );

      const response =
        await fetch(
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
              symptoms:
                symptoms.trim(),
            }),
          },
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to complete the AI health check.",
        );
      }

      const data =
        result.data || result;

      /*
       * Let the visual processing state
       * reach the final step before showing
       * the result.
       */

      setProcessingStep(
        processingSteps.length - 1,
      );

      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            350,
          ),
      );

      /* FOLLOW UP */

      if (
        data.status ===
          "FOLLOW_UP" &&
        data.question
      ) {
        const nextConversation = [
          ...initialConversation,
          {
            role: "assistant",
            content:
              data.question,
          },
        ];

        setConversation(nextConversation);
        persistHealthSession({
          id: sessionId,
          petId: selectedPetId,
          petName: getPetName(selectedPet),
          sessionSymptoms: symptoms,
          sessionConversation: nextConversation,
          sessionAssessment: null,
          notify: true,
        });

        setAssessment(null);
      }

      /* FINAL */

      else if (
        data.status === "FINAL"
      ) {
        setConversation(initialConversation);

        setAssessment(data);

        persistHealthSession({
          id: sessionId,
          petId: selectedPetId,
          petName: getPetName(selectedPet),
          sessionSymptoms: symptoms,
          sessionConversation: initialConversation,
          sessionAssessment: data,
          notify: true,
        });

        saveLatestHealthCheck(
          data,
        );
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

  const submitFollowUpAnswer =
    async (event) => {
      event.preventDefault();

      if (
        !answer.trim() ||
        answerLoading
      ) {
        return;
      }

      const currentAnswer =
        answer.trim();

      const updatedConversation =
        [
          ...conversation,

          {
            role: "user",
            content:
              currentAnswer,
          },
        ];
      const sessionId =
        activeSessionId || createHealthSessionId();

      if (!activeSessionId) {
        setActiveSessionId(sessionId);
      }

      try {
        setAnswerLoading(true);
        setError("");

        setConversation(
          updatedConversation,
        );

        persistHealthSession({
          id: sessionId,
          petId: selectedPetId,
          petName: getPetName(selectedPet),
          sessionSymptoms: symptoms,
          sessionConversation: updatedConversation,
          sessionAssessment: assessment,
        });

        setAnswer("");

        const token =
          localStorage.getItem(
            "smartPawToken",
          );

        const response =
          await fetch(
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
                petId:
                  selectedPetId,

                symptoms:
                  symptoms.trim(),

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
          data.status ===
            "FOLLOW_UP" &&
          data.question
        ) {
          const nextConversation = [
            ...updatedConversation,
            {
              role: "assistant",
              content: data.question,
            },
          ];

          setConversation(nextConversation);
          persistHealthSession({
            id: sessionId,
            petId: selectedPetId,
            petName: getPetName(selectedPet),
            sessionSymptoms: symptoms,
            sessionConversation: nextConversation,
            sessionAssessment: null,
            notify: true,
          });

          setAssessment(null);
        }

        /* FINAL */

        else if (
          data.status === "FINAL"
        ) {
          setAssessment(data);

          persistHealthSession({
            id: sessionId,
            petId: selectedPetId,
            petName: getPetName(selectedPet),
            sessionSymptoms: symptoms,
            sessionConversation: updatedConversation,
            sessionAssessment: data,
            notify: true,
          });

          saveLatestHealthCheck(
            data,
          );
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

  const severity =
    String(
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
      label:
        "Urgent Veterinary Attention",

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
      label:
        "Urgent Veterinary Attention",

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
                      <p className="truncate text-sm font-bold">
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
                  </div>
                </div>
              )}

              {healthHistory.length > 0 && (
                <div className="mb-5 border-b border-slate-200 pb-4 dark:border-slate-800">
                  <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <History size={13} />
                    Saved conversations
                  </div>

                  <div className="space-y-1.5">
                    {healthHistory.map((session) => (
                      <div
                        key={session.id}
                        className={`flex items-center gap-2 rounded-xl px-2.5 py-2 transition ${
                          session.id === activeSessionId
                            ? "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300"
                            : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-[#18212b]"
                        }`}
                      >
                        <button
                          type="button"
                          disabled={loading || answerLoading}
                          onClick={() => restoreHealthSession(session)}
                          className="min-w-0 flex-1 text-left disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <span className="block truncate text-xs font-semibold">
                            {session.symptoms}
                          </span>
                          <span className="mt-0.5 block text-[9px] text-slate-400">
                            {session.petName} · {new Date(session.updatedAt).toLocaleDateString()}
                          </span>
                        </button>

                        <button
                          type="button"
                          title="Delete saved conversation"
                          aria-label="Delete saved conversation"
                          onClick={() => deleteHealthSession(session.id)}
                          className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pet selector */}

              <div className="mb-4">

                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Select Pet
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
                    disabled={
                      hasStarted
                    }
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-9 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-[#18212b]"
                  >
                    <option value="">
                      Select a pet
                    </option>

                    {pets?.map(
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
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>

              {/* Symptoms */}

              {!hasStarted && (
                <form
                  onSubmit={
                    startHealthCheck
                  }
                >

                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    What's happening?
                  </label>

                  <textarea
                    value={symptoms}
                    onChange={(e) =>
                      setSymptoms(
                        e.target.value,
                      )
                    }
                    rows={7}
                    placeholder="Describe what you have noticed about your pet..."
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-white p-3 text-sm leading-6 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 dark:border-slate-700 dark:bg-[#18212b] dark:placeholder:text-slate-500"
                  />

                  <button
                    type="submit"
                    disabled={
                      !selectedPetId ||
                      !symptoms.trim()
                    }
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Sparkles
                      size={16}
                    />

                    Analyze
                  </button>

                </form>
              )}

              {/* Started controls */}

              {hasStarted && (
                <div className="space-y-2">

                  <button
                    type="button"
                    onClick={
                      handleNewQuery
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-orange-300 hover:text-orange-600 dark:border-slate-700 dark:bg-[#18212b] dark:text-slate-200 dark:hover:border-orange-500/40 dark:hover:text-orange-400"
                  >
                    <Send size={15} />
                    New Query
                  </button>

                  <button
                    type="button"
                    onClick={
                      resetCheck
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
                  >
                    <RefreshCcw
                      size={15}
                    />
                    New Checkup
                  </button>

                </div>
              )}

              {/* Sidebar disclaimer */}

              <div className="mt-5 rounded-2xl bg-slate-50 p-3 dark:bg-[#18212b]">
                <div className="flex gap-2">

                  <ShieldCheck
                    size={15}
                    className="mt-0.5 shrink-0 text-orange-500"
                  />

                  <p className="text-[10px] leading-5 text-slate-500 dark:text-slate-400">
                    Smart Paw AI provides
                    informational guidance
                    and does not replace a
                    qualified veterinarian.
                  </p>

                </div>
              </div>

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
                LOADING / PROCESSING
            ================================== */}

            {loading && (
              <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto p-5 sm:p-8">

                <div className="w-full max-w-lg">

                  <div className="mb-6 text-center">

                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400">
                      <Loader2
                        size={27}
                        className="animate-spin"
                      />
                    </div>

                    <h3 className="font-bold">
                      Reviewing{" "}
                      {getPetName(
                        selectedPet,
                      )}
                      's health
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      Smart Paw AI is
                      reviewing the
                      available
                      information before
                      responding.
                    </p>

                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-[#18212b]">

                    <div className="space-y-2">

                      {processingSteps.map(
                        (
                          step,
                          index,
                        ) => {
                          const StepIcon =
                            step.icon;

                          const completed =
                            index <
                            processingStep;

                          const active =
                            index ===
                            processingStep;

                          return (
                            <div
                              key={
                                step.id
                              }
                              className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-300 ${
                                active
                                  ? "bg-white text-orange-600 shadow-sm dark:bg-[#111820] dark:text-orange-400"
                                  : completed
                                    ? "bg-white/60 text-slate-700 dark:bg-[#111820]/60 dark:text-slate-300"
                                    : "text-slate-400 dark:text-slate-500"
                              }`}
                            >

                              <div
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all ${
                                  completed
                                    ? "bg-emerald-500 text-white"
                                    : active
                                      ? "bg-orange-500 text-white"
                                      : "bg-slate-200 text-slate-400 dark:bg-slate-700"
                                }`}
                              >

                                {completed ? (
                                  <CheckCircle2
                                    size={
                                      16
                                    }
                                  />
                                ) : active ? (
                                  <Loader2
                                    size={
                                      16
                                    }
                                    className="animate-spin"
                                  />
                                ) : (
                                  <StepIcon
                                    size={
                                      16
                                    }
                                  />
                                )}

                              </div>

                              <div className="min-w-0 flex-1">

                                <p
                                  className={`text-xs ${
                                    active
                                      ? "font-semibold"
                                      : "font-medium"
                                  }`}
                                >
                                  {
                                    step.label
                                  }
                                </p>

                                <p className="mt-0.5 text-[10px] leading-4 text-slate-400 dark:text-slate-500">
                                  {
                                    step.description
                                  }
                                </p>

                              </div>

                              {completed && (
                                <span className="text-[9px] font-semibold text-emerald-500">
                                  Done
                                </span>
                              )}

                              {active && (
                                <span className="text-[9px] font-semibold text-orange-500">
                                  Working
                                </span>
                              )}

                            </div>
                          );
                        },
                      )}

                    </div>
                  </div>

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

                    {/* Empty conversation */}

                    {conversation.length ===
                      0 &&
                      !assessment && (
                        <div className="flex min-h-[320px] items-center justify-center text-center">

                          <div>

                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400">
                              <Sparkles
                                size={
                                  25
                                }
                              />
                            </div>

                            <h3 className="text-lg font-bold">
                              How can I help?
                            </h3>

                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                              Ask Smart Paw AI
                              about your
                              pet's health.
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
                                  size={
                                    16
                                  }
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
                              {
                                message.content
                              }
                            </div>

                            {isUser && (
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                <User
                                  size={
                                    16
                                  }
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
                                size={
                                  19
                                }
                              />
                            </div>

                            <div className="min-w-0">

                              <p
                                className={`font-bold ${currentSeverity.title}`}
                              >
                                {
                                  currentSeverity.label
                                }
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

                        {/* AI Assessment */}

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

                        {/* Next Steps */}

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
                              Continue monitoring
                              your pet and
                              seek veterinary
                              guidance if
                              symptoms persist
                              or worsen.
                            </p>
                          )}

                        </div>

                        {/* Disclaimer */}

                        <div className="mt-4 flex gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-500/20 dark:bg-orange-500/5">

                          <ShieldCheck
                            size={18}
                            className="mt-0.5 shrink-0 text-orange-500"
                          />

                          <p className="text-xs leading-5 text-slate-600 dark:text-slate-400">
                            This AI assessment is
                            for informational
                            purposes only and
                            should not be treated
                            as a veterinary
                            diagnosis. Consult a
                            qualified veterinarian
                            for diagnosis,
                            treatment, or urgent
                            concerns.
                          </p>

                        </div>

                        {/* Continue chat hint */}

                        <div className="mt-5 flex items-center justify-center">

                          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-semibold text-slate-500 dark:bg-[#18212b] dark:text-slate-400">
                            You can continue asking
                            questions about this
                            assessment
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
                          e.target.value,
                        )
                      }
                      onKeyDown={(e) => {
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
                        !hasStarted ||
                        answerLoading
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
                    Enter to send • Shift + Enter
                    for a new line
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