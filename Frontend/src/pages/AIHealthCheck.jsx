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
  MessageCircle,
  PawPrint,
  RefreshCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Stethoscope,
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

  const conversationRef = useRef(null);

  useEffect(() => {
    if (currentPet) {
      setSelectedPetId(currentPet._id || currentPet.id || "");
    }
  }, [currentPet]);

  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop =
        conversationRef.current.scrollHeight;
    }
  }, [conversation]);

  const selectedPet = useMemo(() => {
    return pets?.find(
      (pet) => String(pet._id || pet.id) === String(selectedPetId),
    );
  }, [pets, selectedPetId]);

  const getPetName = (pet) => pet?.name || "Your Pet";

  const getPetMeta = (pet) => {
    if (!pet) return "Select a pet to continue";

    const parts = [];

    if (pet.breed) parts.push(pet.breed);
    if (pet.age !== undefined && pet.age !== null && pet.age !== "") {
      parts.push(`${pet.age} ${Number(pet.age) === 1 ? "year" : "years"}`);
    }
    if (pet.gender) parts.push(pet.gender);

    return parts.join(" • ") || "Pet profile";
  };

  const resetCheck = () => {
    setSymptoms("");
    setConversation([]);
    setFollowUpQuestion("");
    setAnswer("");
    setAssessment(null);
    setError("");
  };

  const startHealthCheck = async (event) => {
    event.preventDefault();

    if (!selectedPetId) {
      setError("Please select a pet first.");
      return;
    }

    if (!symptoms.trim()) {
      setError("Please describe your pet's symptoms.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setAssessment(null);
      setConversation([]);

      const token = localStorage.getItem("smartPawToken");

      const response = await fetch(`${API_BASE_URL}/api/ai/health-check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          petId: selectedPetId,
          symptoms: symptoms.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to complete the AI health check.",
        );
      }

      const data = result.data || result;

      if (data.followUpQuestion) {
        setConversation([
          {
            role: "user",
            content: symptoms.trim(),
          },
          {
            role: "assistant",
            content: data.followUpQuestion,
          },
        ]);

        setFollowUpQuestion(data.followUpQuestion);
      } else {
        setAssessment(data.assessment || data);
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const submitFollowUpAnswer = async (event) => {
    event.preventDefault();

    if (!answer.trim()) return;

    try {
      setAnswerLoading(true);
      setError("");

      const currentAnswer = answer.trim();

      setConversation((previous) => [
        ...previous,
        {
          role: "user",
          content: currentAnswer,
        },
      ]);

      setAnswer("");

      const token = localStorage.getItem("smartPawToken");

      const response = await fetch(`${API_BASE_URL}/api/ai/health-check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          petId: selectedPetId,
          symptoms: symptoms.trim(),
          conversation: [
            ...conversation,
            {
              role: "user",
              content: currentAnswer,
            },
          ],
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to process your answer.",
        );
      }

      const data = result.data || result;

      if (data.followUpQuestion) {
        setConversation((previous) => [
          ...previous,
          {
            role: "assistant",
            content: data.followUpQuestion,
          },
        ]);

        setFollowUpQuestion(data.followUpQuestion);
      } else {
        setFollowUpQuestion("");
        setAssessment(data.assessment || data);
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setAnswerLoading(false);
    }
  };

  const getAssessmentValue = (keys, fallback = "") => {
    if (!assessment) return fallback;

    for (const key of keys) {
      if (
        assessment[key] !== undefined &&
        assessment[key] !== null &&
        assessment[key] !== ""
      ) {
        return assessment[key];
      }
    }

    return fallback;
  };

  const summary = getAssessmentValue(
    ["summary", "assessment", "overview", "result"],
    "",
  );

  const nextSteps = getAssessmentValue(
    ["nextSteps", "next_steps", "recommendations", "recommendedActions"],
    [],
  );

  const urgent =
    assessment?.urgent === true ||
    assessment?.isUrgent === true ||
    assessment?.urgentFlag === true ||
    assessment?.severity === "urgent";

  const normalizeList = (value) => {
    if (!value) return [];

    if (Array.isArray(value)) return value;

    if (typeof value === "string") {
      return value
        .split(/\n|•|;/)
        .map((item) => item.replace(/^[-*]\s*/, "").trim())
        .filter(Boolean);
    }

    return [];
  };

  const nextStepList = normalizeList(nextSteps);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#0b0f14] dark:text-slate-100">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-24 h-72 w-72 rounded-full bg-orange-400/10 blur-3xl dark:bg-orange-500/10" />
        <div className="absolute -right-32 top-80 h-80 w-80 rounded-full bg-orange-300/10 blur-3xl dark:bg-orange-500/5" />
      </div>

      <main className="relative mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero */}
        <section className="mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-600 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-400">
            <Sparkles size={14} />
            AI-POWERED PET HEALTH
          </div>

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                AI Health Check
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base dark:text-slate-400">
                Describe what your pet is experiencing and get structured
                AI-guided health information with practical next steps.
              </p>
            </div>

            {(conversation.length > 0 || assessment) && (
              <button
                type="button"
                onClick={resetCheck}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-orange-300 hover:text-orange-600 dark:border-slate-700 dark:bg-[#111820] dark:text-slate-200 dark:hover:border-orange-500/50 dark:hover:text-orange-400"
              >
                <RefreshCcw size={16} />
                New Check
              </button>
            )}
          </div>
        </section>

        {/* Trust cards */}
        <section className="mb-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#111820]">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400">
              <Bot size={19} />
            </div>
            <p className="text-sm font-semibold">AI Guidance</p>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
              Structured health information based on the details you provide.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#111820]">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400">
              <MessageCircle size={19} />
            </div>
            <p className="text-sm font-semibold">Interactive Questions</p>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
              AI may ask follow-up questions to understand the situation.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#111820]">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400">
              <ShieldCheck size={19} />
            </div>
            <p className="text-sm font-semibold">Safety First</p>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
              Urgent situations are highlighted so you know when to seek help.
            </p>
          </div>
        </section>

        {/* Main layout */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          {/* Left panel */}
          <section className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-[#111820]">
            <div className="mb-6 flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400">
                <HeartPulse size={22} />
              </div>

              <div>
                <h2 className="text-lg font-bold">Start a health check</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Select your pet and describe the concern.
                </p>
              </div>
            </div>

            <form onSubmit={startHealthCheck} className="space-y-5">
              {/* Pet selector */}
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Select Pet
                </label>

                <div className="relative">
                  <PawPrint
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-orange-500"
                  />

                  <select
                    value={selectedPetId}
                    onChange={(e) => setSelectedPetId(e.target.value)}
                    className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-11 text-sm font-medium outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 dark:border-slate-700 dark:bg-[#18212b] dark:text-slate-100 dark:focus:border-orange-500"
                  >
                    <option value="">Choose a pet</option>

                    {(pets || []).map((pet) => (
                      <option
                        key={pet._id || pet.id}
                        value={pet._id || pet.id}
                      >
                        {getPetName(pet)}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={18}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>

              {/* Selected pet preview */}
              {selectedPet && (
                <div className="rounded-2xl border border-orange-100 bg-orange-50/70 p-4 dark:border-orange-500/15 dark:bg-orange-500/5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-orange-500 shadow-sm dark:bg-[#18212b] dark:text-orange-400">
                      <PawPrint size={23} />
                    </div>

                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white">
                        {getPetName(selectedPet)}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                        {getPetMeta(selectedPet)}
                      </p>
                    </div>

                    <CheckCircle2
                      size={20}
                      className="ml-auto shrink-0 text-orange-500"
                    />
                  </div>
                </div>
              )}

              {/* Symptoms */}
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
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
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Example: My dog has been vomiting twice since this morning and seems less active than usual..."
                  rows={7}
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 dark:border-slate-700 dark:bg-[#18212b] dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-orange-500"
                />

                <p className="mt-2 text-xs leading-5 text-slate-400 dark:text-slate-500">
                  Include when it started, symptoms you noticed, changes in
                  eating/drinking, behaviour, or anything unusual.
                </p>
              </div>

              {error && (
                <div className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                  <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
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
          </section>

          {/* Right panel */}
          <section className="flex min-h-[600px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#111820]">
            {/* Chat header */}
            <div className="border-b border-slate-200 bg-gradient-to-r from-orange-50 to-white px-5 py-4 dark:border-slate-800 dark:from-orange-500/10 dark:to-[#111820] sm:px-6">
              <div className="flex items-center gap-3">
                <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/20">
                  <Bot size={23} />
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-[#111820]" />
                </div>

                <div className="min-w-0">
                  <h2 className="font-bold">Smart Paw AI</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {assessment
                      ? "Health assessment completed"
                      : conversation.length
                        ? "Reviewing your pet's symptoms"
                        : "Ready to help with your pet"}
                  </p>
                </div>

                <div className="ml-auto hidden rounded-full border border-orange-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-orange-600 sm:block dark:border-orange-500/20 dark:bg-[#18212b] dark:text-orange-400">
                  AI Assistant
                </div>
              </div>
            </div>

            {/* Empty state */}
            {conversation.length === 0 && !assessment && (
              <div className="flex flex-1 items-center justify-center p-8">
                <div className="max-w-sm text-center">
                  <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-50 text-orange-500 shadow-inner dark:bg-orange-500/10 dark:text-orange-400">
                    <Stethoscope size={35} />
                  </div>

                  <h3 className="text-xl font-bold">
                    Your AI health assistant is ready
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Select a pet and tell us what you have noticed. Your AI
                    conversation will appear here.
                  </p>

                  <div className="mt-6 grid gap-2 text-left">
                    {[
                      "Describe symptoms clearly",
                      "Mention when they started",
                      "Share unusual behaviour",
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-600 dark:bg-[#18212b] dark:text-slate-300"
                      >
                        <CheckCircle2
                          size={15}
                          className="shrink-0 text-orange-500"
                        />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Conversation */}
            {conversation.length > 0 && !assessment && (
              <>
                <div
                  ref={conversationRef}
                  className="flex-1 space-y-4 overflow-y-auto p-5 sm:p-6"
                >
                  {conversation.map((message, index) => {
                    const isUser = message.role === "user";

                    return (
                      <div
                        key={`${message.role}-${index}`}
                        className={`flex gap-3 ${
                          isUser ? "justify-end" : "justify-start"
                        }`}
                      >
                        {!isUser && (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white">
                            <Bot size={16} />
                          </div>
                        )}

                        <div
                          className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                            isUser
                              ? "rounded-br-md bg-orange-500 text-white shadow-md shadow-orange-500/10"
                              : "rounded-bl-md border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-[#18212b] dark:text-slate-200"
                          }`}
                        >
                          {message.content}
                        </div>

                        {isUser && (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                            <User size={16} />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {answerLoading && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500 text-white">
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
                </div>

                {followUpQuestion && (
                  <form
                    onSubmit={submitFollowUpAnswer}
                    className="border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#111820]"
                  >
                    <p className="mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Your answer
                    </p>

                    <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-500/10 dark:border-slate-700 dark:bg-[#18212b]">
                      <textarea
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        rows={2}
                        placeholder="Type your answer..."
                        className="min-h-[48px] flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      />

                      <button
                        type="submit"
                        disabled={answerLoading || !answer.trim()}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Send answer"
                      >
                        {answerLoading ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Send size={18} />
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}

            {/* Assessment */}
            {assessment && (
              <div
                ref={conversationRef}
                className="flex-1 overflow-y-auto p-5 sm:p-6"
              >
                <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white">
                    <CheckCircle2 size={21} />
                  </div>

                  <div>
                    <p className="font-bold text-emerald-800 dark:text-emerald-300">
                      Assessment Complete
                    </p>
                    <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80">
                      AI has reviewed the information provided.
                    </p>
                  </div>
                </div>

                {urgent && (
                  <div className="mb-5 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-500/10">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500 text-white">
                      <AlertTriangle size={20} />
                    </div>

                    <div>
                      <p className="font-bold text-red-800 dark:text-red-300">
                        Urgent Veterinary Attention
                      </p>
                      <p className="mt-1 text-xs leading-5 text-red-700 dark:text-red-400">
                        The assessment indicates that professional veterinary
                        attention may be needed promptly.
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-5">
                  {/* Summary */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-[#18212b]">
                    <div className="mb-3 flex items-center gap-2">
                      <ClipboardList
                        size={18}
                        className="text-orange-500"
                      />
                      <h3 className="font-bold">AI Assessment</h3>
                    </div>

                    <p className="whitespace-pre-line text-sm leading-7 text-slate-600 dark:text-slate-300">
                      {summary || "Assessment details are available above."}
                    </p>
                  </div>

                  {/* Next steps */}
                  {nextStepList.length > 0 && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-[#111820]">
                      <div className="mb-4 flex items-center gap-2">
                        <ArrowRight
                          size={18}
                          className="text-orange-500"
                        />
                        <h3 className="font-bold">Recommended Next Steps</h3>
                      </div>

                      <div className="space-y-3">
                        {nextStepList.map((step, index) => (
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
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Raw assessment fallback */}
                  {!summary &&
                    !nextStepList.length &&
                    typeof assessment === "object" && (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-[#18212b]">
                        <pre className="whitespace-pre-wrap text-xs leading-6 text-slate-600 dark:text-slate-300">
                          {JSON.stringify(assessment, null, 2)}
                        </pre>
                      </div>
                    )}

                  {/* Disclaimer */}
                  <div className="flex gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-500/20 dark:bg-orange-500/5">
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
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}